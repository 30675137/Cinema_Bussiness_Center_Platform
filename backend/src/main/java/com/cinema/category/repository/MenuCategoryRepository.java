package com.cinema.category.repository;

import com.cinema.category.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 Repository
 */
@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, UUID> {

    /**
     * 根据编码查找分类
     */
    Optional<MenuCategory> findByCode(String code);

    /**
     * 根据编码查找分类（排除软删除）
     * 用于动态分类筛选
     */
    Optional<MenuCategory> findByCodeAndDeletedAtIsNull(String code);

    /**
     * 检查编码是否已存在
     */
    boolean existsByCode(String code);

    /**
     * 获取默认分类
     */
    Optional<MenuCategory> findByIsDefaultTrue();

    /**
     * 获取所有可见分类（按排序序号升序）
     */
    @Query("SELECT c FROM MenuCategory c WHERE c.isVisible = true AND c.deletedAt IS NULL ORDER BY c.sortOrder ASC")
    List<MenuCategory> findAllVisible();

    /**
     * 获取所有分类（按排序序号升序）
     */
    @Query("SELECT c FROM MenuCategory c WHERE c.deletedAt IS NULL ORDER BY c.sortOrder ASC")
    List<MenuCategory> findAllOrderBySortOrder();

    /**
     * 获取所有分类（包含隐藏的，按排序序号升序）
     */
    @Query("SELECT c FROM MenuCategory c WHERE c.deletedAt IS NULL ORDER BY c.sortOrder ASC")
    List<MenuCategory> findAllIncludeHidden();

    /**
     * 获取最大排序序号
     */
    @Query("SELECT COALESCE(MAX(c.sortOrder), 0) FROM MenuCategory c WHERE c.deletedAt IS NULL")
    Integer findMaxSortOrder();

    /**
     * 批量更新排序序号
     */
    @Modifying
    @Query("UPDATE MenuCategory c SET c.sortOrder = :sortOrder WHERE c.id = :id")
    void updateSortOrder(@Param("id") UUID id, @Param("sortOrder") Integer sortOrder);

    /**
     * 根据 ID 列表获取分类（按排序序号升序）
     */
    @Query("SELECT c FROM MenuCategory c WHERE c.id IN :ids AND c.deletedAt IS NULL ORDER BY c.sortOrder ASC")
    List<MenuCategory> findAllByIdInOrderBySortOrder(@Param("ids") List<UUID> ids);

    /**
     * 统计可见分类数量
     */
    @Query("SELECT COUNT(c) FROM MenuCategory c WHERE c.isVisible = true AND c.deletedAt IS NULL")
    long countVisible();

    /**
     * 统计总分类数量
     */
    @Query("SELECT COUNT(c) FROM MenuCategory c WHERE c.deletedAt IS NULL")
    long countAll();

    /**
     * 检查是否存在默认分类
     */
    @Query("SELECT COUNT(c) > 0 FROM MenuCategory c WHERE c.isDefault = true AND c.deletedAt IS NULL")
    boolean existsDefaultCategory();

    /**
     * 软删除分类
     */
    @Modifying
    @Query("UPDATE MenuCategory c SET c.deletedAt = CURRENT_TIMESTAMP WHERE c.id = :id")
    void softDeleteById(@Param("id") UUID id);

    /**
     * 恢复软删除的分类
     */
    @Modifying
    @Query("UPDATE MenuCategory c SET c.deletedAt = NULL WHERE c.id = :id")
    void restoreById(@Param("id") UUID id);
}
