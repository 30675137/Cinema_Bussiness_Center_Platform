package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackageServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 场景包服务项目 Repository
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@Repository
public interface PackageServiceItemRepository extends JpaRepository<PackageServiceItem, UUID> {

    /**
     * 根据场景包 ID 查询所有服务项（按排序序号排序）
     */
    @Query("SELECT s FROM PackageServiceItem s WHERE s.packageId = :packageId ORDER BY s.sortOrder ASC")
    List<PackageServiceItem> findByPackageId(@Param("packageId") UUID packageId);

    /**
     * 根据场景包 ID 删除所有服务项
     */
    @Modifying
    @Query("DELETE FROM PackageServiceItem s WHERE s.packageId = :packageId")
    void deleteByPackageId(@Param("packageId") UUID packageId);

    /**
     * 统计场景包的服务数量
     */
    @Query("SELECT COUNT(s) FROM PackageServiceItem s WHERE s.packageId = :packageId")
    int countByPackageId(@Param("packageId") UUID packageId);

    /**
     * 检查场景包是否包含指定服务
     */
    @Query("SELECT COUNT(s) > 0 FROM PackageServiceItem s WHERE s.packageId = :packageId AND s.serviceId = :serviceId")
    boolean existsByPackageIdAndServiceId(@Param("packageId") UUID packageId, @Param("serviceId") UUID serviceId);
}
