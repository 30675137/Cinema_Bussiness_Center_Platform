package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackagePricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * 场景包定价 Repository
 * <p>
 * 提供场景包定价的数据访问接口
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */
@Repository
public interface PackagePricingRepository extends JpaRepository<PackagePricing, UUID> {

    /**
     * 根据场景包 ID 查询定价信息
     *
     * @param packageId 场景包 ID
     * @return Optional 定价信息
     */
    @Query("SELECT pp FROM PackagePricing pp WHERE pp.packageId = :packageId")
    Optional<PackagePricing> findByPackageId(@Param("packageId") UUID packageId);
}
