package com.cinema.scenariopackage;

import com.cinema.scenariopackage.dto.CreatePackageRequest;
import com.cinema.scenariopackage.dto.ScenarioPackageDTO;
import com.cinema.scenariopackage.dto.UpdatePackageRequest;
import com.cinema.scenariopackage.model.ScenarioPackage;
import com.cinema.scenariopackage.model.ScenarioPackageStoreAssociation;
import com.cinema.scenariopackage.repository.ScenarioPackageRepository;
import com.cinema.scenariopackage.repository.StoreAssociationRepository;
import com.cinema.scenariopackage.service.ScenarioPackageService;
import com.cinema.hallstore.service.StoreService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * 场景包门店关联集成测试
 * <p>
 * T013: 测试门店关联 CRUD 操作
 * <p>
 * 测试范围：
 * - 门店关联创建
 * - 门店关联更新（全量替换）
 * - 门店关联查询
 * - 门店存在性验证
 * - 门店激活状态验证
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class StoreAssociationIntegrationTest {

    @Autowired
    private ScenarioPackageService packageService;

    @Autowired
    private ScenarioPackageRepository packageRepository;

    @Autowired
    private StoreAssociationRepository storeAssociationRepository;

    @MockBean
    private StoreService storeService;

    private UUID testPackageId;

    @BeforeEach
    void setUp() {
        // Mock StoreService to return active stores
        when(storeService.isStoreActive(any(UUID.class))).thenReturn(true);
    }

    @AfterEach
    void tearDown() {
        // 清理测试数据
        storeAssociationRepository.deleteAll();
        packageRepository.deleteAll();
    }

    /**
     * 创建测试场景包
     */
    private UUID createTestPackage() {
        CreatePackageRequest createRequest = new CreatePackageRequest();
        createRequest.setName("门店关联测试场景包");
        createRequest.setDescription("用于测试门店关联功能");

        ScenarioPackageDTO created = packageService.create(createRequest);
        return created.getId();
    }

    /**
     * T013-1: 测试门店关联创建
     */
    @Test
    @Order(1)
    @DisplayName("T013-1: Should create store associations successfully")
    @Transactional
    void testCreateStoreAssociations() {
        // Arrange
        testPackageId = createTestPackage();
        UUID storeId1 = UUID.randomUUID();
        UUID storeId2 = UUID.randomUUID();
        List<UUID> storeIds = Arrays.asList(storeId1, storeId2);

        // Act
        packageService.updateStoreAssociations(testPackageId, storeIds, "test-user");

        // Assert
        List<UUID> savedStoreIds = storeAssociationRepository.findStoreIdsByPackageId(testPackageId);
        assertThat(savedStoreIds).hasSize(2);
        assertThat(savedStoreIds).containsExactlyInAnyOrder(storeId1, storeId2);
    }

    /**
     * T013-2: 测试门店关联更新（全量替换）
     */
    @Test
    @Order(2)
    @DisplayName("T013-2: Should replace all store associations on update")
    @Transactional
    void testUpdateStoreAssociations() {
        // Arrange - 先创建初始关联
        testPackageId = createTestPackage();
        UUID storeId1 = UUID.randomUUID();
        UUID storeId2 = UUID.randomUUID();
        UUID storeId3 = UUID.randomUUID();

        packageService.updateStoreAssociations(testPackageId, Arrays.asList(storeId1, storeId2), "test-user");

        // Act - 更新为新的门店列表
        packageService.updateStoreAssociations(testPackageId, Arrays.asList(storeId2, storeId3), "test-user");

        // Assert - 应该只有 storeId2 和 storeId3
        List<UUID> savedStoreIds = storeAssociationRepository.findStoreIdsByPackageId(testPackageId);
        assertThat(savedStoreIds).hasSize(2);
        assertThat(savedStoreIds).containsExactlyInAnyOrder(storeId2, storeId3);
        assertThat(savedStoreIds).doesNotContain(storeId1);
    }

    /**
     * T013-3: 测试门店关联随场景包 DTO 返回
     */
    @Test
    @Order(3)
    @DisplayName("T013-3: Should include storeIds in package DTO")
    @Transactional
    void testStoreIdsInPackageDTO() {
        // Arrange
        testPackageId = createTestPackage();
        UUID storeId1 = UUID.randomUUID();
        UUID storeId2 = UUID.randomUUID();

        packageService.updateStoreAssociations(testPackageId, Arrays.asList(storeId1, storeId2), "test-user");

        // Act
        ScenarioPackageDTO dto = packageService.findById(testPackageId);

        // Assert
        assertThat(dto.getStoreIds()).hasSize(2);
        assertThat(dto.getStoreIds()).containsExactlyInAnyOrder(storeId1, storeId2);
    }

    /**
     * T013-4: 测试不存在的门店拒绝关联
     */
    @Test
    @Order(4)
    @DisplayName("T013-4: Should reject inactive stores")
    @Transactional
    void testRejectInactiveStores() {
        // Arrange
        testPackageId = createTestPackage();
        UUID activeStoreId = UUID.randomUUID();
        UUID inactiveStoreId = UUID.randomUUID();

        // Mock: activeStoreId 活跃, inactiveStoreId 不活跃
        when(storeService.isStoreActive(activeStoreId)).thenReturn(true);
        when(storeService.isStoreActive(inactiveStoreId)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() ->
            packageService.updateStoreAssociations(testPackageId,
                Arrays.asList(activeStoreId, inactiveStoreId), "test-user")
        ).isInstanceOf(IllegalArgumentException.class)
         .hasMessageContaining(inactiveStoreId.toString());
    }

    /**
     * T013-5: 测试空门店列表
     */
    @Test
    @Order(5)
    @DisplayName("T013-5: Should handle empty store list")
    @Transactional
    void testEmptyStoreList() {
        // Arrange
        testPackageId = createTestPackage();
        UUID storeId1 = UUID.randomUUID();

        // 先添加一个门店
        packageService.updateStoreAssociations(testPackageId, Arrays.asList(storeId1), "test-user");

        // Act - 清空所有关联
        packageService.updateStoreAssociations(testPackageId, Arrays.asList(), "test-user");

        // Assert
        List<UUID> savedStoreIds = storeAssociationRepository.findStoreIdsByPackageId(testPackageId);
        assertThat(savedStoreIds).isEmpty();
    }

    /**
     * T013-6: 测试检查门店是否被关联
     */
    @Test
    @Order(6)
    @DisplayName("T013-6: Should check if store is associated")
    @Transactional
    void testIsStoreAssociated() {
        // Arrange
        testPackageId = createTestPackage();
        UUID associatedStoreId = UUID.randomUUID();
        UUID notAssociatedStoreId = UUID.randomUUID();

        packageService.updateStoreAssociations(testPackageId, Arrays.asList(associatedStoreId), "test-user");

        // Act & Assert
        assertThat(packageService.isStoreAssociated(associatedStoreId)).isTrue();
        assertThat(packageService.isStoreAssociated(notAssociatedStoreId)).isFalse();
    }

    /**
     * T013-7: 测试场景包详情包含门店信息（通过 update API）
     */
    @Test
    @Order(7)
    @DisplayName("T013-7: Should save store associations via update API")
    @Transactional
    void testSaveStoreAssociationsViaUpdateApi() {
        // Arrange
        testPackageId = createTestPackage();
        ScenarioPackageDTO originalPkg = packageService.findById(testPackageId);

        UUID storeId1 = UUID.randomUUID();
        UUID storeId2 = UUID.randomUUID();

        UpdatePackageRequest updateRequest = new UpdatePackageRequest();
        updateRequest.setVersionLock(originalPkg.getVersionLock());
        updateRequest.setName("更新后的场景包");
        updateRequest.setStoreIds(Arrays.asList(storeId1, storeId2));

        // Act
        ScenarioPackageDTO updated = packageService.update(testPackageId, updateRequest);

        // Assert
        ScenarioPackageDTO reloaded = packageService.findById(testPackageId);
        assertThat(reloaded.getStoreIds()).hasSize(2);
        assertThat(reloaded.getStoreIds()).containsExactlyInAnyOrder(storeId1, storeId2);
    }
}
