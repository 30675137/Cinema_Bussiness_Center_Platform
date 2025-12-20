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

        // Assert: At least one should succeed, others should fail due to version conflict
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
}
