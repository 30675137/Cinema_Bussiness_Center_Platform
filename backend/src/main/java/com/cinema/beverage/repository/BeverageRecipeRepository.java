/**
 * @spec O003-beverage-order
 * 饮品配方数据访问层
 */
package com.cinema.beverage.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cinema.beverage.entity.BeverageRecipe;

/**
 * 饮品配方Repository
 *
 * 对应 spec: O003-beverage-order
 * 提供饮品配方数据的CRUD操作和自定义查询
 */
@Repository
public interface BeverageRecipeRepository extends JpaRepository<BeverageRecipe, UUID> {

    /**
     * 根据饮品ID查询所有配方
     */
    List<BeverageRecipe> findByBeverageIdOrderByCreatedAtDesc(UUID beverageId);

    /**
     * 根据饮品ID删除所有配方
     */
    void deleteByBeverageId(UUID beverageId);

    /**
     * 检查饮品是否有配方
     */
    boolean existsByBeverageId(UUID beverageId);

    /**
     * 统计饮品的配方数量
     */
    long countByBeverageId(UUID beverageId);
}
