package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.ScenarioPackageStoreAssociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 场景包-门店关联 Repository
 * <p>
 * 提供场景包与门店关联关系的数据访问操作。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-21
 * @see ScenarioPackageStoreAssociation
 */
@Repository
public interface StoreAssociationRepository extends JpaRepository<ScenarioPackageStoreAssociation, UUID> {

    /**
     * 根据场景包ID查询所有关联的门店ID
     *
     * @param packageId 场景包ID
     * @return 门店ID列表
     */
    @Query("SELECT sa.storeId FROM ScenarioPackageStoreAssociation sa WHERE sa.packageId = :packageId")
    List<UUID> findStoreIdsByPackageId(@Param("packageId") UUID packageId);

    /**
     * 根据场景包ID查询所有关联记录
     *
     * @param packageId 场景包ID
     * @return 关联记录列表
     */
    List<ScenarioPackageStoreAssociation> findByPackageId(UUID packageId);

    /**
     * 根据门店ID查询所有关联的场景包ID
     *
     * @param storeId 门店ID
     * @return 场景包ID列表
     */
    @Query("SELECT sa.packageId FROM ScenarioPackageStoreAssociation sa WHERE sa.storeId = :storeId")
    List<UUID> findPackageIdsByStoreId(@Param("storeId") UUID storeId);

    /**
     * 删除场景包的所有门店关联
     *
     * @param packageId 场景包ID
     */
    @Modifying
    @Query("DELETE FROM ScenarioPackageStoreAssociation sa WHERE sa.packageId = :packageId")
    void deleteByPackageId(@Param("packageId") UUID packageId);

    /**
     * 检查门店是否被任何场景包关联
     *
     * @param storeId 门店ID
     * @return 关联数量
     */
    @Query("SELECT COUNT(sa) FROM ScenarioPackageStoreAssociation sa WHERE sa.storeId = :storeId")
    long countByStoreId(@Param("storeId") UUID storeId);

    /**
     * 检查特定的场景包-门店关联是否存在
     *
     * @param packageId 场景包ID
     * @param storeId 门店ID
     * @return 是否存在
     */
    boolean existsByPackageIdAndStoreId(UUID packageId, UUID storeId);
}
