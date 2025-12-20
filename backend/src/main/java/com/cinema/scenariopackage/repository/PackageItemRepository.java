package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackageItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 场景包软权益（单品）Repository
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@Repository
public interface PackageItemRepository extends JpaRepository<PackageItem, UUID> {

    /**
     * 根据场景包 ID 查询所有单品项（按排序序号排序）
     */
    @Query("SELECT i FROM PackageItem i WHERE i.packageId = :packageId ORDER BY i.sortOrder ASC")
    List<PackageItem> findByPackageId(@Param("packageId") UUID packageId);

    /**
     * 根据场景包 ID 删除所有单品项
     */
    @Modifying
    @Query("DELETE FROM PackageItem i WHERE i.packageId = :packageId")
    void deleteByPackageId(@Param("packageId") UUID packageId);

    /**
     * 统计场景包的单品数量
     */
    @Query("SELECT COUNT(i) FROM PackageItem i WHERE i.packageId = :packageId")
    int countByPackageId(@Param("packageId") UUID packageId);

    /**
     * 检查场景包是否包含指定单品
     */
    @Query("SELECT COUNT(i) > 0 FROM PackageItem i WHERE i.packageId = :packageId AND i.itemId = :itemId")
    boolean existsByPackageIdAndItemId(@Param("packageId") UUID packageId, @Param("itemId") UUID itemId);
}
