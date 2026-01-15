package com.cinema.hallstore.repository;

import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * SKU JPA Repository
 * 使用 Spring Data JPA 实现 SKU 数据的查询和 CRUD 操作
 * 替代原来的 Supabase REST API 调用
 *
 * @since P001-sku-master-data
 */
@Repository
public interface SkuJpaRepository extends JpaRepository<Sku, UUID> {

    /**
     * 按编码查询 SKU
     */
    Optional<Sku> findByCode(String code);

    /**
     * 检查编码是否存在
     */
    boolean existsByCode(String code);

    /**
     * 检查编码是否存在（排除指定 ID）
     */
    boolean existsByCodeAndIdNot(String code, UUID id);

    /**
     * 按 SKU 类型查询
     */
    List<Sku> findBySkuType(SkuType skuType);

    /**
     * 按状态查询
     */
    List<Sku> findByStatus(SkuStatus status);

    /**
     * 按类型和状态查询
     */
    List<Sku> findBySkuTypeAndStatus(SkuType skuType, SkuStatus status);

    /**
     * 按关键词搜索（名称或编码）
     */
    @Query("SELECT s FROM Sku s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Sku> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 综合查询：按类型、状态和关键词筛选
     */
    @Query("SELECT s FROM Sku s WHERE " +
           "(:skuType IS NULL OR s.skuType = :skuType) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY s.createdAt DESC")
    List<Sku> findAllWithFilters(
            @Param("skuType") SkuType skuType,
            @Param("status") SkuStatus status,
            @Param("keyword") String keyword);

    /**
     * 按 SPU ID 查询所有 SKU
     */
    List<Sku> findBySpuId(UUID spuId);

    /**
     * 查询所有 SKU，按创建时间倒序
     */
    List<Sku> findAllByOrderByCreatedAtDesc();
}
