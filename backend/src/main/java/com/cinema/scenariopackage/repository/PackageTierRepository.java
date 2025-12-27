package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackageTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 套餐档位 Repository
 */
@Repository
public interface PackageTierRepository extends JpaRepository<PackageTier, UUID> {

    /**
     * 根据场景包ID查询所有套餐，按排序字段升序
     */
    @Query("SELECT t FROM PackageTier t WHERE t.packageId = :packageId ORDER BY t.sortOrder ASC")
    List<PackageTier> findByPackageIdOrderBySortOrder(UUID packageId);

    /**
     * 根据场景包ID删除所有套餐
     */
    void deleteByPackageId(UUID packageId);
}
