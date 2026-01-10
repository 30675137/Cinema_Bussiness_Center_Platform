package com.cinema.hallstore.repository;

import com.cinema.hallstore.domain.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Brand JPA Repository
 * 使用 Spring Data JPA 实现 Brand 数据的查询和 CRUD 操作
 * 替代原来的 Supabase REST API 调用
 *
 * @spec B001-fix-brand-creation
 */
@Repository
public interface BrandJpaRepository extends JpaRepository<Brand, UUID> {

    /**
     * 按品牌编码查询
     */
    Optional<Brand> findByBrandCode(String brandCode);

    /**
     * 检查品牌编码是否存在
     */
    boolean existsByBrandCode(String brandCode);

    /**
     * 检查品牌编码是否存在（排除指定 ID）
     */
    boolean existsByBrandCodeAndIdNot(String brandCode, UUID id);

    /**
     * 按状态查询
     */
    List<Brand> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * 按品牌类型查询
     */
    List<Brand> findByBrandTypeOrderByCreatedAtDesc(String brandType);

    /**
     * 关键字搜索（名称、英文名或编码）
     */
    @Query("SELECT b FROM Brand b WHERE " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.englishName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.brandCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY b.createdAt DESC")
    List<Brand> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 综合查询：按关键词、品牌类型、状态筛选
     */
    @Query("SELECT b FROM Brand b WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.englishName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.brandCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:brandType IS NULL OR :brandType = '' OR b.brandType = :brandType) AND " +
           "(:status IS NULL OR :status = '' OR b.status = :status) " +
           "ORDER BY b.createdAt DESC")
    List<Brand> findAllWithFilters(
            @Param("keyword") String keyword,
            @Param("brandType") String brandType,
            @Param("status") String status);

    /**
     * 查询所有品牌，按创建时间倒序
     */
    List<Brand> findAllByOrderByCreatedAtDesc();

    /**
     * 检查品牌名称在同一类型下是否重复
     */
    @Query("SELECT COUNT(b) > 0 FROM Brand b WHERE " +
           "b.name = :name AND b.brandType = :brandType AND " +
           "(:excludeId IS NULL OR b.id != :excludeId)")
    boolean existsByNameAndBrandType(
            @Param("name") String name,
            @Param("brandType") String brandType,
            @Param("excludeId") UUID excludeId);
}
