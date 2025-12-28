/**
 * @spec O003-beverage-order
 * 饮品数据访问层
 */
package com.cinema.beverage.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cinema.beverage.entity.Beverage;
import com.cinema.beverage.entity.Beverage.BeverageCategory;
import com.cinema.beverage.entity.Beverage.BeverageStatus;

/**
 * 饮品Repository
 *
 * 对应 spec: O003-beverage-order
 * 提供饮品数据的CRUD操作和自定义查询
 */
@Repository
public interface BeverageRepository extends JpaRepository<Beverage, UUID> {

    /**
     * 查询所有启用的饮品，按排序顺序和创建时间降序
     */
    List<Beverage> findByStatusOrderBySortOrderDescCreatedAtDesc(BeverageStatus status);

    /**
     * 根据分类查询启用的饮品
     */
    List<Beverage> findByCategoryAndStatusOrderBySortOrderDescCreatedAtDesc(
            BeverageCategory category,
            BeverageStatus status
    );

    /**
     * 查询所有启用的饮品，按分类分组
     */
    @Query("SELECT b FROM Beverage b WHERE b.status = :status ORDER BY b.category, b.sortOrder DESC, b.createdAt DESC")
    List<Beverage> findAllActiveGroupedByCategory(@Param("status") BeverageStatus status);

    /**
     * 根据ID查询饮品（包含状态过滤）
     */
    Optional<Beverage> findByIdAndStatus(UUID id, BeverageStatus status);

    /**
     * 查询推荐饮品
     */
    List<Beverage> findByIsRecommendedAndStatusOrderBySortOrderDescCreatedAtDesc(
            Boolean isRecommended,
            BeverageStatus status
    );

    /**
     * 检查饮品是否存在且启用
     */
    boolean existsByIdAndStatus(UUID id, BeverageStatus status);
}
