/**
 * @spec O003-beverage-order
 * 配方原料关联数据访问层 (T085)
 */
package com.cinema.beverage.repository;

import com.cinema.beverage.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * 配方原料关联数据访问层
 *
 * 职责: 查询饮品配方所需的原料清单
 */
@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, UUID> {

    /**
     * 根据配方 ID 查询所有原料
     *
     * @param recipeId 配方 ID
     * @return 原料列表
     */
    List<RecipeIngredient> findByRecipeId(UUID recipeId);

    /**
     * 根据多个配方 ID 批量查询原料
     *
     * @param recipeIds 配方 ID 列表
     * @return 原料列表
     */
    List<RecipeIngredient> findByRecipeIdIn(List<UUID> recipeIds);

    /**
     * 根据 SKU ID 查询使用该原料的所有配方
     *
     * @param skuId SKU ID (原料) - UUID 格式
     * @return 配方关联列表
     */
    List<RecipeIngredient> findBySkuId(UUID skuId);

    /**
     * 检查配方是否包含指定原料
     *
     * @param recipeId 配方 ID
     * @param skuId SKU ID (原料) - UUID 格式
     * @return 是否存在
     */
    boolean existsByRecipeIdAndSkuId(UUID recipeId, UUID skuId);

    /**
     * 删除指定配方的所有原料
     *
     * @param recipeId 配方 ID
     */
    void deleteByRecipeId(UUID recipeId);

    /**
     * 批量查询配方的原料数量
     *
     * @param recipeIds 配方 ID 列表
     * @return 配方原料统计 Map (recipeId -> 原料数量)
     */
    @Query("SELECT ri.recipeId as recipeId, COUNT(ri.id) as count " +
           "FROM RecipeIngredient ri " +
           "WHERE ri.recipeId IN :recipeIds " +
           "GROUP BY ri.recipeId")
    List<RecipeIngredientCount> countIngredientsByRecipeIds(@Param("recipeIds") List<UUID> recipeIds);

    /**
     * 配方原料数量统计接口
     */
    interface RecipeIngredientCount {
        UUID getRecipeId();
        Long getCount();
    }
}
