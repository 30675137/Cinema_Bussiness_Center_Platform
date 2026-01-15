/**
 * @spec I003-inventory-query
 * Store Inventory JPA Repository
 *
 * Purpose: Data access layer for inventory queries with SKU and Store relationships
 * Replaces the Supabase REST API based StoreInventoryRepository for complex queries
 *
 * Features:
 * - Complex filtering (store, keyword, pagination)
 * - JOIN FETCH for SKU and Store entities
 * - JPQL for flexible query conditions
 *
 * Author: Migration from Supabase REST API
 * Date: 2026-01-11
 */

package com.cinema.inventory.repository;

import com.cinema.inventory.entity.Inventory;
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
 * 门店库存 JPA Repository
 *
 * 提供复杂的库存查询功能，使用 JPQL 实现关联查询。
 * 支持按门店、关键词过滤和分页。
 */
@Repository
public interface StoreInventoryJpaRepository extends JpaRepository<Inventory, UUID> {

    /**
     * 查询库存列表，带 SKU 和 Store 关联信息（分页）
     * 支持可选的门店过滤
     *
     * @param storeId  门店ID（可选，null 表示不过滤）
     * @param pageable 分页参数
     * @return 库存分页结果
     */
    @Query("SELECT i FROM Inventory i " +
           "LEFT JOIN FETCH i.sku s " +
           "LEFT JOIN FETCH i.store st " +
           "WHERE (:storeId IS NULL OR i.storeId = :storeId) " +
           "ORDER BY i.updatedAt DESC")
    List<Inventory> findByStoreIdWithDetails(
        @Param("storeId") UUID storeId,
        Pageable pageable
    );

    /**
     * 查询库存列表，带关键词搜索（按 SKU 名称或编码）
     *
     * @param storeId  门店ID（可选）
     * @param keyword  关键词（模糊匹配 SKU 名称或编码）
     * @param pageable 分页参数
     * @return 库存分页结果
     */
    @Query("SELECT i FROM Inventory i " +
           "LEFT JOIN FETCH i.sku s " +
           "LEFT JOIN FETCH i.store st " +
           "WHERE (:storeId IS NULL OR i.storeId = :storeId) " +
           "AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY i.updatedAt DESC")
    List<Inventory> findByStoreIdAndKeywordWithDetails(
        @Param("storeId") UUID storeId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    /**
     * 统计符合条件的库存记录数（不带关键词）
     *
     * @param storeId 门店ID（可选）
     * @return 记录总数
     */
    @Query("SELECT COUNT(i) FROM Inventory i " +
           "WHERE (:storeId IS NULL OR i.storeId = :storeId)")
    long countByStoreId(@Param("storeId") UUID storeId);

    /**
     * 统计符合条件的库存记录数（带关键词搜索）
     *
     * @param storeId 门店ID（可选）
     * @param keyword 关键词
     * @return 记录总数
     */
    @Query("SELECT COUNT(i) FROM Inventory i " +
           "LEFT JOIN i.sku s " +
           "WHERE (:storeId IS NULL OR i.storeId = :storeId) " +
           "AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    long countByStoreIdAndKeyword(
        @Param("storeId") UUID storeId,
        @Param("keyword") String keyword
    );

    /**
     * 根据ID查询库存详情，带关联信息
     *
     * @param id 库存记录ID
     * @return 库存详情（含 SKU 和 Store 信息）
     */
    @Query("SELECT i FROM Inventory i " +
           "LEFT JOIN FETCH i.sku s " +
           "LEFT JOIN FETCH i.store st " +
           "WHERE i.id = :id")
    Optional<Inventory> findByIdWithDetails(@Param("id") UUID id);

    /**
     * 根据 SKU ID 和门店 ID 查询库存，带关联信息
     *
     * @param skuId   SKU ID
     * @param storeId 门店 ID
     * @return 库存记录
     */
    @Query("SELECT i FROM Inventory i " +
           "LEFT JOIN FETCH i.sku s " +
           "LEFT JOIN FETCH i.store st " +
           "WHERE i.skuId = :skuId AND i.storeId = :storeId")
    Optional<Inventory> findBySkuIdAndStoreIdWithDetails(
        @Param("skuId") UUID skuId,
        @Param("storeId") UUID storeId
    );
}
