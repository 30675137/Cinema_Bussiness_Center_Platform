package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackageAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 场景包-加购项关联 Repository
 */
@Repository
public interface PackageAddonRepository extends JpaRepository<PackageAddon, UUID> {

    /**
     * 根据场景包ID查询关联的加购项
     */
    @Query("SELECT pa FROM PackageAddon pa WHERE pa.packageId = :packageId ORDER BY pa.sortOrder ASC")
    List<PackageAddon> findByPackageIdOrderBySortOrder(UUID packageId);

    /**
     * 根据场景包ID删除所有关联
     */
    void deleteByPackageId(UUID packageId);
}
