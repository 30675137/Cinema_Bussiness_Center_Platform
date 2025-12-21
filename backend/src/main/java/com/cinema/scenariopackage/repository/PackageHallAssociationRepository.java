package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackageHallAssociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 场景包-影厅关联 Repository
 * <p>
 * 提供场景包与影厅类型关联的数据访问接口
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Repository
public interface PackageHallAssociationRepository extends JpaRepository<PackageHallAssociation, UUID> {

    /**
     * 根据场景包 ID 查询所有影厅关联
     *
     * @param packageId 场景包 ID
     * @return 影厅关联列表
     */
    List<PackageHallAssociation> findByPackageId(UUID packageId);

    /**
     * 根据影厅类型 ID 查询所有场景包关联
     *
     * @param hallTypeId 影厅类型 ID
     * @return 场景包关联列表
     */
    List<PackageHallAssociation> findByHallTypeId(UUID hallTypeId);

    /**
     * 根据场景包 ID 删除所有影厅关联
     *
     * @param packageId 场景包 ID
     */
    void deleteByPackageId(UUID packageId);

    /**
     * 检查场景包是否关联了特定影厅类型
     *
     * @param packageId  场景包 ID
     * @param hallTypeId 影厅类型 ID
     * @return 是否存在关联
     */
    boolean existsByPackageIdAndHallTypeId(UUID packageId, UUID hallTypeId);
}
