/**
 * @spec O003-beverage-order
 * B端饮品配置管理服务接口 (User Story 3)
 */
package com.cinema.beverage.service;

import com.cinema.beverage.dto.*;
import com.cinema.beverage.entity.Beverage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * B端饮品配置管理服务接口
 *
 * 提供以下功能:
 * - FR-028: 饮品列表查询（分页/搜索/筛选）
 * - FR-029: 新增饮品
 * - FR-030: 编辑饮品
 * - FR-031: 删除饮品（软删除）
 * - FR-032: 配置饮品规格
 * - FR-033: 编辑/删除规格
 * - FR-034: 切换饮品状态
 * - FR-035: 配置饮品配方（BOM）
 * - FR-036: 编辑/删除配方
 * - FR-037: 配方SKU校验
 */
public interface BeverageAdminService {

    /**
     * FR-028: 获取饮品列表（分页/搜索/筛选）
     */
    Page<BeverageDTO> findBeverages(
        String name,
        String category,
        Beverage.BeverageStatus status,
        Pageable pageable
    );

    /**
     * FR-029: 新增饮品
     */
    BeverageDTO createBeverage(CreateBeverageRequest request);

    /**
     * 获取饮品详情
     */
    BeverageDetailDTO getBeverageDetail(String id);

    /**
     * FR-030: 更新饮品信息
     */
    BeverageDTO updateBeverage(String id, UpdateBeverageRequest request);

    /**
     * FR-031: 删除饮品（软删除）
     */
    void deleteBeverage(String id);

    /**
     * FR-034: 切换饮品状态
     */
    BeverageDTO updateStatus(String id, Beverage.BeverageStatus status);

    /**
     * FR-029: 上传饮品图片
     */
    String uploadImage(MultipartFile file);

    // ==================== 规格管理 ====================

    /**
     * FR-032: 获取饮品规格列表
     */
    List<BeverageSpecDTO> getBeverageSpecs(String beverageId);

    /**
     * FR-032: 添加饮品规格
     */
    BeverageSpecDTO addSpec(String beverageId, CreateSpecRequest request);

    /**
     * FR-033: 更新饮品规格
     */
    BeverageSpecDTO updateSpec(String beverageId, String specId, UpdateSpecRequest request);

    /**
     * FR-033: 删除饮品规格
     */
    void deleteSpec(String beverageId, String specId);

    // ==================== 配方(BOM)管理 ====================

    /**
     * FR-035: 获取饮品配方列表
     */
    List<BeverageRecipeDTO> getBeverageRecipes(String beverageId);

    /**
     * FR-035 & FR-037: 添加饮品配方（包含SKU校验）
     */
    BeverageRecipeDTO addRecipe(String beverageId, CreateRecipeRequest request);

    /**
     * FR-036 & FR-037: 更新饮品配方（包含SKU校验）
     */
    BeverageRecipeDTO updateRecipe(String beverageId, String recipeId, UpdateRecipeRequest request);

    /**
     * FR-036: 删除饮品配方（校验未完成订单）
     */
    void deleteRecipe(String beverageId, String recipeId);
}
