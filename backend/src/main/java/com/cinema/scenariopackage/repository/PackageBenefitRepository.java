package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackageBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 场景包硬权益 Repository
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@Repository
public interface PackageBenefitRepository extends JpaRepository<PackageBenefit, UUID> {

    /**
     * 根据场景包 ID 查询所有硬权益（按排序序号排序）
     */
    @Query("SELECT b FROM PackageBenefit b WHERE b.packageId = :packageId ORDER BY b.sortOrder ASC")
    List<PackageBenefit> findByPackageId(@Param("packageId") UUID packageId);

    /**
     * 根据场景包 ID 删除所有硬权益
     */
    @Modifying
    @Query("DELETE FROM PackageBenefit b WHERE b.packageId = :packageId")
    void deleteByPackageId(@Param("packageId") UUID packageId);

    /**
     * 统计场景包的硬权益数量
     */
    @Query("SELECT COUNT(b) FROM PackageBenefit b WHERE b.packageId = :packageId")
    int countByPackageId(@Param("packageId") UUID packageId);
}
