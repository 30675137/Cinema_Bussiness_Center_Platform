package com.cinema.hallstore.repository;

import com.cinema.hallstore.domain.Spu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * SPU JPA Repository
 * 使用 Spring Data JPA 实现 SPU 数据的查询和 CRUD 操作
 * 替代原来的 Supabase REST API 调用
 *
 * @since P001-spu-management
 */
@Repository
public interface SpuJpaRepository extends JpaRepository<Spu, UUID> {

    /**
     * 按编码查询 SPU
     */
    Optional<Spu> findByCode(String code);

    /**
     * 检查编码是否存在
     */
    boolean existsByCode(String code);

    /**
     * 检查编码是否存在（排除指定 ID）
     */
    boolean existsByCodeAndIdNot(String code, UUID id);

    /**
     * 按状态查询
     */
    List<Spu> findByStatus(String status);

    /**
     * 按类目ID查询
     */
    List<Spu> findByCategoryId(String categoryId);

    /**
     * 按品牌ID查询
     */
    List<Spu> findByBrandId(String brandId);

    /**
     * 按关键词搜索（名称或编码）
     */
    @Query("SELECT s FROM Spu s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Spu> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 综合查询：按状态、类目、品牌和关键词筛选
     */
    @Query("SELECT s FROM Spu s WHERE " +
           "(:status IS NULL OR :status = '' OR s.status = :status) AND " +
           "(:categoryId IS NULL OR :categoryId = '' OR s.categoryId = :categoryId) AND " +
           "(:brandId IS NULL OR :brandId = '' OR s.brandId = :brandId) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY s.createdAt DESC")
    List<Spu> findAllWithFilters(
            @Param("status") String status,
            @Param("categoryId") String categoryId,
            @Param("brandId") String brandId,
            @Param("keyword") String keyword);

    /**
     * 查询所有 SPU，按创建时间倒序
     */
    List<Spu> findAllByOrderByCreatedAtDesc();
}
