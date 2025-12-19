package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.PackageRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * 场景包规则 Repository
 * <p>
 * 提供场景包规则的数据访问接口
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Repository
public interface PackageRuleRepository extends JpaRepository<PackageRule, UUID> {

    /**
     * 根据场景包 ID 查询规则
     *
     * @param packageId 场景包 ID
     * @return Optional 规则
     */
    Optional<PackageRule> findByPackageId(UUID packageId);

    /**
     * 根据场景包 ID 删除规则
     *
     * @param packageId 场景包 ID
     */
    void deleteByPackageId(UUID packageId);
}
