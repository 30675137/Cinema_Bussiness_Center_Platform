/**
 * @spec O003-beverage-order
 * BOM配方管理服务
 */
package com.cinema.beverage.service;

import com.cinema.beverage.dto.BomItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * BOM配方管理服务
 *
 * MVP版本：使用内存Map存储配方数据
 * 后续版本：迁移到数据库表（beverage_recipes）
 *
 * 职责：
 * 1. 维护饮品与原料的配方关系
 * 2. 提供配方查询接口
 * 3. 支持配方的CRUD操作（TODO: 未来版本）
 */
@Service
public class BomRecipeService {

    private static final Logger logger = LoggerFactory.getLogger(BomRecipeService.class);

    /**
     * 内存配方数据
     * Key: beverageId, Value: List<BomItem>
     */
    private final Map<UUID, List<BomItem>> recipeDatabase = new HashMap<>();

    public BomRecipeService() {
        // 初始化示例配方数据
        initializeSampleRecipes();
    }

    /**
     * 根据饮品ID获取配方
     *
     * @param beverageId 饮品ID
     * @return 配方项列表，如果没有配方返回空列表
     */
    public List<BomItem> getRecipeByBeverageId(UUID beverageId) {
        List<BomItem> recipe = recipeDatabase.get(beverageId);
        if (recipe == null) {
            logger.warn("未找到饮品配方 - beverageId: {}，返回空列表", beverageId);
            return Collections.emptyList();
        }
        return new ArrayList<>(recipe); // 返回副本
    }

    /**
     * 添加或更新配方
     *
     * @param beverageId 饮品ID
     * @param bomItems 配方项列表
     */
    public void saveRecipe(UUID beverageId, List<BomItem> bomItems) {
        recipeDatabase.put(beverageId, new ArrayList<>(bomItems));
        logger.info("保存配方 - beverageId: {}, 配方项数: {}", beverageId, bomItems.size());
    }

    /**
     * 删除配方
     *
     * @param beverageId 饮品ID
     */
    public void deleteRecipe(UUID beverageId) {
        recipeDatabase.remove(beverageId);
        logger.info("删除配方 - beverageId: {}", beverageId);
    }

    /**
     * 批量获取配方
     *
     * @param beverageIds 饮品ID列表
     * @return Map<beverageId, recipe>
     */
    public Map<UUID, List<BomItem>> getRecipesByBeverageIds(List<UUID> beverageIds) {
        Map<UUID, List<BomItem>> result = new HashMap<>();
        for (UUID beverageId : beverageIds) {
            List<BomItem> recipe = getRecipeByBeverageId(beverageId);
            if (!recipe.isEmpty()) {
                result.put(beverageId, recipe);
            }
        }
        return result;
    }

    /**
     * 初始化示例配方数据
     *
     * 注意：这些UUID需要与实际数据库中的饮品和SKU对应
     * TODO: 后续从配置文件或数据库加载
     */
    private void initializeSampleRecipes() {
        // 示例配方 1: 拿铁
        // UUID beverageLatteId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        // UUID skuCoffeeBeanId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        // UUID skuMilkId = UUID.fromString("10000000-0000-0000-0000-000000000002");
        //
        // List<BomItem> latteRecipe = Arrays.asList(
        //     BomItem.builder()
        //         .skuId(skuCoffeeBeanId)
        //         .materialName("咖啡豆")
        //         .quantity(20) // 20克
        //         .unit("g")
        //         .remarks("深烘焙咖啡豆")
        //         .build(),
        //     BomItem.builder()
        //         .skuId(skuMilkId)
        //         .materialName("牛奶")
        //         .quantity(200) // 200毫升
        //         .unit("ml")
        //         .remarks("全脂牛奶")
        //         .build()
        // );
        // recipeDatabase.put(beverageLatteId, latteRecipe);

        // 示例配方 2: 美式咖啡
        // UUID beverageAmericanoId = UUID.fromString("00000000-0000-0000-0000-000000000002");
        // List<BomItem> americanoRecipe = Arrays.asList(
        //     BomItem.builder()
        //         .skuId(skuCoffeeBeanId)
        //         .materialName("咖啡豆")
        //         .quantity(18) // 18克
        //         .unit("g")
        //         .remarks("中烘焙咖啡豆")
        //         .build()
        // );
        // recipeDatabase.put(beverageAmericanoId, americanoRecipe);

        logger.info("初始化BOM配方数据完成 - 配方数: {}", recipeDatabase.size());
    }

    /**
     * 检查饮品是否有配方
     *
     * @param beverageId 饮品ID
     * @return true if recipe exists
     */
    public boolean hasRecipe(UUID beverageId) {
        return recipeDatabase.containsKey(beverageId) && !recipeDatabase.get(beverageId).isEmpty();
    }

    /**
     * 获取所有配方
     *
     * @return 所有配方的Map
     */
    public Map<UUID, List<BomItem>> getAllRecipes() {
        Map<UUID, List<BomItem>> result = new HashMap<>();
        recipeDatabase.forEach((k, v) -> result.put(k, new ArrayList<>(v)));
        return result;
    }
}
