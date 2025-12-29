package com.cinema.scenariopackage.repository;

import com.cinema.scenariopackage.model.ScenarioPackage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 场景包 Repository
 * <p>
 * 提供场景包的数据访问接口
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Repository
public interface ScenarioPackageRepository extends JpaRepository<ScenarioPackage, UUID> {

    /**
     * 查询未删除的场景包（排除软删除）
     *
     * @param id 场景包 ID
     * @return Optional 场景包
     */
    @Query("SELECT sp FROM ScenarioPackage sp WHERE sp.id = :id AND sp.deletedAt IS NULL")
    Optional<ScenarioPackage> findByIdAndNotDeleted(@Param("id") UUID id);

    /**
     * 查询最新版本的场景包列表（分页）
     *
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT sp FROM ScenarioPackage sp WHERE sp.isLatest = true AND sp.deletedAt IS NULL")
    Page<ScenarioPackage> findLatestPackages(Pageable pageable);

    /**
     * 根据状态查询最新版本的场景包列表（分页）
     *
     * @param status   状态
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT sp FROM ScenarioPackage sp WHERE sp.isLatest = true AND sp.status = :status AND sp.deletedAt IS NULL")
    Page<ScenarioPackage> findLatestPackagesByStatus(
            @Param("status") ScenarioPackage.PackageStatus status,
            Pageable pageable
    );

    /**
     * 根据名称模糊搜索最新版本的场景包
     *
     * @param keyword  搜索关键词
     * @param pageable 分页参数
     * @return 分页结果
     */
    @Query("SELECT sp FROM ScenarioPackage sp WHERE sp.isLatest = true AND sp.name LIKE %:keyword% AND sp.deletedAt IS NULL")
    Page<ScenarioPackage> searchLatestPackagesByName(
            @Param("keyword") String keyword,
            Pageable pageable
    );

    /**
     * 查询基础包的所有版本
     *
     * @param basePackageId 基础包 ID
     * @return 版本列表
     */
    @Query("SELECT sp FROM ScenarioPackage sp WHERE (sp.basePackageId = :basePackageId OR sp.id = :basePackageId) AND sp.deletedAt IS NULL ORDER BY sp.version DESC")
    List<ScenarioPackage> findAllVersions(@Param("basePackageId") UUID basePackageId);

    /**
     * 查询基础包的最新版本
     *
     * @param basePackageId 基础包 ID
     * @return Optional 最新版本
     */
    @Query("SELECT sp FROM ScenarioPackage sp WHERE (sp.basePackageId = :basePackageId OR sp.id = :basePackageId) AND sp.isLatest = true AND sp.deletedAt IS NULL")
    Optional<ScenarioPackage> findLatestVersion(@Param("basePackageId") UUID basePackageId);

    /**
     * 查询已发布的场景包列表（用于C端小程序首页）
     * <p>
     * 规则：
     * - 仅返回 status = PUBLISHED 的场景包
     * - 仅返回最新版本（is_latest = true）
     * - 排除软删除（deleted_at IS NULL）
     * - 按创建时间倒序排列
     * </p>
     *
     * @return 已发布场景包列表
     */
    @Query("SELECT sp FROM ScenarioPackage sp WHERE sp.isLatest = true AND sp.status = 'PUBLISHED' AND sp.deletedAt IS NULL ORDER BY sp.createdAt DESC")
    List<ScenarioPackage> findPublishedPackages();
}
