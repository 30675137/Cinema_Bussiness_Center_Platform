package com.cinema.inventory.repository;

import com.cinema.inventory.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Category JPA Repository
 * 使用 Spring Data JPA 访问 categories 表
 * 
 * @since P003-inventory-query
 */
@Repository
public interface CategoryJpaRepository extends JpaRepository<Category, UUID> {

    /**
     * 按状态查询分类，按 sortOrder 和 level 升序排序
     * 
     * @param status 分类状态（如 "ACTIVE"）
     * @return 分类列表
     */
    List<Category> findByStatusOrderBySortOrderAscLevelAsc(String status);
    
    /**
     * 按状态查询分类（自定义查询，确保数据完整性）
     * 只返回 id 和 name 不为空的有效记录
     * 
     * @param status 分类状态
     * @return 有效的分类列表
     */
    @Query("SELECT c FROM Category c WHERE c.status = :status AND c.id IS NOT NULL AND c.name IS NOT NULL AND TRIM(c.name) <> '' ORDER BY c.sortOrder ASC, c.level ASC")
    List<Category> findValidByStatus(String status);
    
    /**
     * 查询所有激活状态的分类
     * 
     * @return 激活的分类列表
     */
    default List<Category> findAllActive() {
        return findValidByStatus("ACTIVE");
    }
}
