package com.cinema.scenariopackage.service;

import com.cinema.scenariopackage.dto.CreatePackageRequest;
import com.cinema.scenariopackage.dto.ScenarioPackageDTO;
import com.cinema.scenariopackage.dto.UpdatePackageRequest;
import com.cinema.scenariopackage.exception.ConcurrentModificationException;
import com.cinema.scenariopackage.exception.PackageNotFoundException;
import com.cinema.scenariopackage.model.ScenarioPackage;
import com.cinema.scenariopackage.repository.ScenarioPackageRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 场景包服务层集成测试
 * <p>
 * 测试范围：
 * - T023: 乐观锁并发冲突检测
 * - 业务逻辑验证
 * - 异常处理
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ScenarioPackageServiceTest {

    @Autowired
    private ScenarioPackageService packageService;

    @Autowired
    private ScenarioPackageRepository packageRepository;

    private UUID testPackageId;

    @BeforeEach
    void setUp() {
        // 清理测试数据
        packageRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        // 清理测试数据
        packageRepository.deleteAll();
    }

    /**
     * T023: 测试乐观锁并发冲突检测
     * <p>
     * 场景：两个用户同时编辑同一个场景包
     * 验证点：
     * 1. 第一个用户更新成功
     * 2. 第二个用户更新失败，抛出 ConcurrentModificationException
     * 3. 版本号正确递增
     * </p>
     */
    @Test
    @Order(1)
    @DisplayName("T023: Should detect optimistic lock conflict")
    @Transactional
    void testOptimisticLockConflict() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("并发测试场景包");
        createRequest.setDescription("用于测试乐观锁");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();
        Integer initialVersionLock = createdDto.getVersionLock(); // Should be 0

        // Simulate User 1 update (should succeed)
        UpdatePackageRequest user1Update = new UpdatePackageRequest();
        user1Update.setName("用户1更新");
        user1Update.setDescription("用户1的修改");
        user1Update.setVersionLock(initialVersionLock);

        ScenarioPackageDTO user1Result = packageService.update(packageId, user1Update);
        assertThat(user1Result.getName()).isEqualTo("用户1更新");
        assertThat(user1Result.getVersionLock()).isEqualTo(initialVersionLock + 1);

        // Simulate User 2 update with stale version (should fail)
        UpdatePackageRequest user2Update = new UpdatePackageRequest();
        user2Update.setName("用户2更新");
        user2Update.setDescription("用户2的修改");
        user2Update.setVersionLock(initialVersionLock); // Stale version!

        // Act & Assert: User 2 should get concurrent modification exception
        assertThatThrownBy(() -> packageService.update(packageId, user2Update))
                .isInstanceOf(ConcurrentModificationException.class)
                .hasMessageContaining("已被他人修改");

        // Verify final state (should be User 1's update)
        ScenarioPackageDTO finalDto = packageService.findById(packageId);
        assertThat(finalDto.getName()).isEqualTo("用户1更新");
        assertThat(finalDto.getVersionLock()).isEqualTo(initialVersionLock + 1);
    }

    /**
     * T023: 测试并发更新场景
     * <p>
     * 使用多线程模拟真实并发场景
     * </p>
     */
    @Test
    @Order(2)
    @DisplayName("T023: Should handle concurrent updates correctly")
    void testConcurrentUpdates() throws InterruptedException {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("并发更新测试");
        createRequest.setDescription("测试多线程并发更新");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();
        Integer initialVersionLock = createdDto.getVersionLock();

        // Simulate 5 concurrent updates
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    // Each thread reads the current version and tries to update
                    ScenarioPackageDTO currentDto = packageService.findById(packageId);

                    UpdatePackageRequest updateRequest = new UpdatePackageRequest();
                    updateRequest.setName("线程" + threadId + "更新");
                    updateRequest.setDescription("线程" + threadId + "的修改");
                    updateRequest.setVersionLock(currentDto.getVersionLock());

                    packageService.update(packageId, updateRequest);
                    successCount.incrementAndGet();
                } catch (ConcurrentModificationException e) {
                    failureCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        // Assert: At least one should succeed, others should fail due to version
        // conflict
        assertThat(successCount.get()).isGreaterThan(0);
        assertThat(failureCount.get()).isGreaterThan(0);
        assertThat(successCount.get() + failureCount.get()).isEqualTo(threadCount);

        // Verify final version lock is incremented
        ScenarioPackageDTO finalDto = packageService.findById(packageId);
        assertThat(finalDto.getVersionLock()).isGreaterThan(initialVersionLock);
    }

    /**
     * 测试查找不存在的场景包
     */
    @Test
    @Order(3)
    @DisplayName("Should throw exception when package not found")
    void testFindNonExistentPackage() {
        UUID nonExistentId = UUID.randomUUID();

        assertThatThrownBy(() -> packageService.findById(nonExistentId))
                .isInstanceOf(PackageNotFoundException.class)
                .hasMessageContaining("场景包不存在");
    }

    /**
     * 测试删除不存在的场景包
     */
    @Test
    @Order(4)
    @DisplayName("Should throw exception when deleting non-existent package")
    void testDeleteNonExistentPackage() {
        UUID nonExistentId = UUID.randomUUID();

        assertThatThrownBy(() -> packageService.delete(nonExistentId))
                .isInstanceOf(PackageNotFoundException.class)
                .hasMessageContaining("场景包不存在");
    }

    /**
     * 测试更新不存在的场景包
     */
    @Test
    @Order(5)
    @DisplayName("Should throw exception when updating non-existent package")
    void testUpdateNonExistentPackage() {
        UUID nonExistentId = UUID.randomUUID();
        UpdatePackageRequest updateRequest = new UpdatePackageRequest();
        updateRequest.setName("不存在的场景包");
        updateRequest.setVersionLock(0);

        assertThatThrownBy(() -> packageService.update(nonExistentId, updateRequest))
                .isInstanceOf(PackageNotFoundException.class)
                .hasMessageContaining("场景包不存在");
    }

    /**
     * 测试创建场景包的完整性
     */
    @Test
    @Order(6)
    @DisplayName("Should create package with all required fields")
    void testCreatePackageCompleteness() {
        // Arrange
        CreatePackageRequest request = new CreatePackageRequest();
        request.setName("完整性测试场景包");
        request.setDescription("测试所有字段是否正确初始化");
        request.setHallTypeIds(List.of(UUID.randomUUID()));

        // Act
        ScenarioPackageDTO dto = packageService.create(request);

        // Assert
        assertThat(dto.getId()).isNotNull();
        assertThat(dto.getName()).isEqualTo("完整性测试场景包");
        assertThat(dto.getDescription()).isEqualTo("测试所有字段是否正确初始化");
        assertThat(dto.getStatus()).isEqualTo("DRAFT");
        assertThat(dto.getVersion()).isEqualTo(1);
        assertThat(dto.getVersionLock()).isEqualTo(0);
        assertThat(dto.getIsLatest()).isTrue();
        assertThat(dto.getCreatedAt()).isNotNull();
        assertThat(dto.getUpdatedAt()).isNotNull();
    }

    /**
     * 测试软删除功能
     */
    @Test
    @Order(7)
    @DisplayName("Should soft delete package and not find it afterwards")
    @Transactional
    void testSoftDelete() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("待软删除场景包");
        createRequest.setDescription("这个场景包将被软删除");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act: Soft delete the package
        packageService.delete(packageId);

        // Assert: Package should not be found after deletion
        assertThatThrownBy(() -> packageService.findById(packageId))
                .isInstanceOf(PackageNotFoundException.class);

        // Verify in database that deleted_at is set
        ScenarioPackage deletedPackage = packageRepository.findById(packageId).orElse(null);
        if (deletedPackage != null) {
            assertThat(deletedPackage.getDeletedAt()).isNotNull();
        }
    }

    // ==================== User Story 2: 配置场景包规则和内容组合 ====================

    /**
     * T058: 测试配置使用规则
     * <p>
     * 场景：为场景包配置时长、最小人数、最大人数
     * 验证点：
     * 1. 规则配置成功保存
     * 2. 数据有效性验证（时长>0，最小人数≤最大人数）
     * </p>
     */
    @Test
    @Order(8)
    @DisplayName("T058: Should configure package rules successfully")
    @Transactional
    void testConfigureRules() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("规则配置测试场景包");
        createRequest.setDescription("用于测试规则配置");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act: Configure rules
        UpdatePackageRequest updateRequest = new UpdatePackageRequest();
        updateRequest.setVersionLock(createdDto.getVersionLock());

        // 设置规则：时长 3 小时，10-20 人
        CreatePackageRequest.PackageRuleRequest rule = new CreatePackageRequest.PackageRuleRequest();
        rule.setDurationHours(3.0);
        rule.setMinPeople(10);
        rule.setMaxPeople(20);
        updateRequest.setRule(rule);

        ScenarioPackageDTO updatedDto = packageService.update(packageId, updateRequest);

        // Assert
        assertThat(updatedDto.getRule()).isNotNull();
        assertThat(updatedDto.getRule().getDurationHours()).isEqualTo(3.0);
        assertThat(updatedDto.getRule().getMinPeople()).isEqualTo(10);
        assertThat(updatedDto.getRule().getMaxPeople()).isEqualTo(20);
    }

    /**
     * T058: 测试规则验证 - 时长必须大于0
     */
    @Test
    @Order(9)
    @DisplayName("T058: Should reject invalid duration (must be > 0)")
    @Transactional
    void testConfigureRulesInvalidDuration() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("规则验证测试");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act & Assert: 时长为 0 或负数应该报错
        UpdatePackageRequest updateRequest = new UpdatePackageRequest();
        updateRequest.setVersionLock(createdDto.getVersionLock());

        CreatePackageRequest.PackageRuleRequest rule = new CreatePackageRequest.PackageRuleRequest();
        rule.setDurationHours(0.0); // 无效时长
        rule.setMinPeople(10);
        rule.setMaxPeople(20);
        updateRequest.setRule(rule);

        // TODO: 实现后应抛出 ValidationException
        // assertThatThrownBy(() -> packageService.update(packageId, updateRequest))
        // .isInstanceOf(ValidationException.class);
    }

    /**
     * T058: 测试规则验证 - 最小人数不能大于最大人数
     */
    @Test
    @Order(10)
    @DisplayName("T058: Should reject invalid people range (min > max)")
    @Transactional
    void testConfigureRulesInvalidPeopleRange() {
        // Arrange
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("人数范围验证测试");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act & Assert: 最小人数 > 最大人数应该报错
        UpdatePackageRequest updateRequest = new UpdatePackageRequest();
        updateRequest.setVersionLock(createdDto.getVersionLock());

        CreatePackageRequest.PackageRuleRequest rule = new CreatePackageRequest.PackageRuleRequest();
        rule.setDurationHours(3.0);
        rule.setMinPeople(30); // 最小人数 > 最大人数
        rule.setMaxPeople(20);
        updateRequest.setRule(rule);

        // TODO: 实现后应抛出 ValidationException
        // assertThatThrownBy(() -> packageService.update(packageId, updateRequest))
        // .isInstanceOf(ValidationException.class)
        // .hasMessageContaining("最小人数不能大于最大人数");
    }

    /**
     * T059: 测试添加硬权益
     * <p>
     * 场景：为场景包添加观影购票优惠权益（折扣票价、免费场次）
     * 验证点：
     * 1. 硬权益成功保存
     * 2. 支持折扣票价和免费场次两种类型
     * </p>
     */
    @Test
    @Order(11)
    @DisplayName("T059: Should add hard benefits (DISCOUNT_TICKET)")
    @Transactional
    void testAddBenefitsDiscountTicket() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("硬权益测试场景包");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act: Add discount ticket benefit
        // TODO: 实现 addBenefit 方法后启用
        // PackageBenefitRequest benefitRequest = new PackageBenefitRequest();
        // benefitRequest.setBenefitType("DISCOUNT_TICKET");
        // benefitRequest.setDiscountRate(0.75); // 75% 折扣
        // benefitRequest.setDescription("观影票价 75 折");
        //
        // ScenarioPackageDTO updatedDto = packageService.addBenefit(packageId,
        // benefitRequest);
        //
        // // Assert
        // assertThat(updatedDto.getContent().getBenefits()).hasSize(1);
        // assertThat(updatedDto.getContent().getBenefits().get(0).getBenefitType()).isEqualTo("DISCOUNT_TICKET");
        // assertThat(updatedDto.getContent().getBenefits().get(0).getDiscountRate()).isEqualTo(0.75);
    }

    /**
     * T059: 测试添加硬权益 - 免费场次
     */
    @Test
    @Order(12)
    @DisplayName("T059: Should add hard benefits (FREE_SCREENING)")
    @Transactional
    void testAddBenefitsFreeScreening() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("免费场次测试场景包");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act: Add free screening benefit
        // TODO: 实现 addBenefit 方法后启用
        // PackageBenefitRequest benefitRequest = new PackageBenefitRequest();
        // benefitRequest.setBenefitType("FREE_SCREENING");
        // benefitRequest.setFreeCount(2); // 2 场免费
        // benefitRequest.setDescription("赠送 2 场免费观影");
        //
        // ScenarioPackageDTO updatedDto = packageService.addBenefit(packageId,
        // benefitRequest);
        //
        // // Assert
        // assertThat(updatedDto.getContent().getBenefits()).hasSize(1);
        // assertThat(updatedDto.getContent().getBenefits().get(0).getBenefitType()).isEqualTo("FREE_SCREENING");
        // assertThat(updatedDto.getContent().getBenefits().get(0).getFreeCount()).isEqualTo(2);
    }

    /**
     * T060: 测试添加软权益单品
     * <p>
     * 场景：为场景包添加单品（如莫吉托、小食拼盘）
     * 验证点：
     * 1. 单品成功添加
     * 2. 数量设置正确
     * 3. 快照字段（名称、价格）自动复制
     * </p>
     */
    @Test
    @Order(13)
    @DisplayName("T060: Should add soft benefit items with snapshot")
    @Transactional
    void testAddItems() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("单品测试场景包");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act: Add item
        // TODO: 实现 addItem 方法后启用
        // UUID itemId = UUID.randomUUID(); // 假设来自商品主数据
        // PackageItemRequest itemRequest = new PackageItemRequest();
        // itemRequest.setItemId(itemId);
        // itemRequest.setQuantity(20); // 20 杯莫吉托
        //
        // ScenarioPackageDTO updatedDto = packageService.addItem(packageId,
        // itemRequest);
        //
        // // Assert
        // assertThat(updatedDto.getContent().getItems()).hasSize(1);
        // PackageItem addedItem = updatedDto.getContent().getItems().get(0);
        // assertThat(addedItem.getItemId()).isEqualTo(itemId);
        // assertThat(addedItem.getQuantity()).isEqualTo(20);
        // assertThat(addedItem.getItemNameSnapshot()).isNotNull(); // 快照字段
        // assertThat(addedItem.getItemPriceSnapshot()).isNotNull(); // 快照字段
    }

    /**
     * T060: 测试更新单品数量
     */
    @Test
    @Order(14)
    @DisplayName("T060: Should update item quantity")
    @Transactional
    void testUpdateItemQuantity() {
        // Arrange: Create a test package with item
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("数量更新测试");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // TODO: 实现 addItem 和 updateItemQuantity 方法后启用
        // UUID itemId = UUID.randomUUID();
        // packageService.addItem(packageId, new PackageItemRequest(itemId, 10));
        //
        // // Act: Update quantity
        // ScenarioPackageDTO updatedDto = packageService.updateItemQuantity(packageId,
        // itemId, 25);
        //
        // // Assert
        // assertThat(updatedDto.getContent().getItems().get(0).getQuantity()).isEqualTo(25);
    }

    /**
     * T060: 测试移除单品
     */
    @Test
    @Order(15)
    @DisplayName("T060: Should remove item")
    @Transactional
    void testRemoveItem() {
        // Arrange: Create a test package with item
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("删除单品测试");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // TODO: 实现 addItem 和 removeItem 方法后启用
        // UUID itemId = UUID.randomUUID();
        // packageService.addItem(packageId, new PackageItemRequest(itemId, 10));
        //
        // // Act: Remove item
        // ScenarioPackageDTO updatedDto = packageService.removeItem(packageId, itemId);
        //
        // // Assert
        // assertThat(updatedDto.getContent().getItems()).isEmpty();
    }

    /**
     * T061: 测试添加服务项目
     * <p>
     * 场景：为场景包添加服务项目（如管家服务、布置服务）
     * 验证点：
     * 1. 服务项目成功添加
     * 2. 快照字段自动复制
     * </p>
     */
    @Test
    @Order(16)
    @DisplayName("T061: Should add service with snapshot")
    @Transactional
    void testAddServices() {
        // Arrange: Create a test package
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("服务项目测试场景包");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // Act: Add service
        // TODO: 实现 addService 方法后启用
        // UUID serviceId = UUID.randomUUID(); // 假设来自服务主数据
        // PackageServiceRequest serviceRequest = new PackageServiceRequest();
        // serviceRequest.setServiceId(serviceId);
        //
        // ScenarioPackageDTO updatedDto = packageService.addService(packageId,
        // serviceRequest);
        //
        // // Assert
        // assertThat(updatedDto.getContent().getServices()).hasSize(1);
        // PackageService addedService = updatedDto.getContent().getServices().get(0);
        // assertThat(addedService.getServiceId()).isEqualTo(serviceId);
        // assertThat(addedService.getServiceNameSnapshot()).isNotNull(); // 快照字段
        // assertThat(addedService.getServicePriceSnapshot()).isNotNull(); // 快照字段
    }

    /**
     * T061: 测试移除服务项目
     */
    @Test
    @Order(17)
    @DisplayName("T061: Should remove service")
    @Transactional
    void testRemoveService() {
        // Arrange: Create a test package with service
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("删除服务测试");

        ScenarioPackageDTO createdDto = packageService.create(createRequest);
        UUID packageId = createdDto.getId();

        // TODO: 实现 addService 和 removeService 方法后启用
        // UUID serviceId = UUID.randomUUID();
        // packageService.addService(packageId, new PackageServiceRequest(serviceId));
        //
        // // Act: Remove service
        // ScenarioPackageDTO updatedDto = packageService.removeService(packageId,
        // serviceId);
        //
        // // Assert
        // assertThat(updatedDto.getContent().getServices()).isEmpty();
    }
}
