/**
 * @spec O003-beverage-order
 * B端饮品配置管理API Controller (User Story 3)
 */
package com.cinema.beverage.controller;

import com.cinema.beverage.dto.*;
import com.cinema.beverage.entity.Beverage;
import com.cinema.beverage.service.BeverageAdminService;
import com.cinema.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * B端饮品配置管理Controller
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
@Slf4j
@RestController
@RequestMapping("/api/admin/beverages")
@RequiredArgsConstructor
public class BeverageAdminController {

    private final BeverageAdminService beverageAdminService;

    /**
     * FR-028: 获取饮品列表（分页/搜索/筛选）
     *
     * @param page 页码(从0开始)
     * @param size 每页数量(默认20)
     * @param name 饮品名称(模糊搜索)
     * @param category 分类筛选
     * @param status 状态筛选
     * @return 分页饮品列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BeverageDTO>>> getBeverageList(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) Beverage.BeverageStatus status
    ) {
        log.info("获取B端饮品列表: page={}, size={}, name={}, category={}, status={}",
            page, size, name, category, status);

        Pageable pageable = PageRequest.of(page, size);
        Page<BeverageDTO> beverages = beverageAdminService.findBeverages(
            name, category, status, pageable
        );

        return ResponseEntity.ok(ApiResponse.success(beverages));
    }

    /**
     * FR-029: 新增饮品
     *
     * @param request 饮品创建请求
     * @return 创建的饮品信息
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BeverageDTO>> createBeverage(
        @Valid @RequestBody CreateBeverageRequest request
    ) {
        log.info("创建饮品: {}", request.getName());

        BeverageDTO beverage = beverageAdminService.createBeverage(request);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(beverage));
    }

    /**
     * FR-029: 上传饮品图片
     *
     * @param file 图片文件
     * @return 图片URL
     */
    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadBeverageImage(
        @RequestParam("file") MultipartFile file
    ) {
        log.info("上传饮品图片: {}", file.getOriginalFilename());

        String imageUrl = beverageAdminService.uploadImage(file);

        return ResponseEntity.ok(ApiResponse.success(imageUrl));
    }

    /**
     * 获取饮品详情
     *
     * @param id 饮品ID (UUID字符串)
     * @return 饮品详细信息
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BeverageDetailDTO>> getBeverageDetail(
        @PathVariable String id
    ) {
        log.info("获取饮品详情: id={}", id);

        BeverageDetailDTO beverage = beverageAdminService.getBeverageDetail(id);

        return ResponseEntity.ok(ApiResponse.success(beverage));
    }

    /**
     * FR-030: 更新饮品信息
     *
     * @param id 饮品ID (UUID字符串)
     * @param request 更新请求
     * @return 更新后的饮品信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BeverageDTO>> updateBeverage(
        @PathVariable String id,
        @Valid @RequestBody UpdateBeverageRequest request
    ) {
        log.info("更新饮品: id={}", id);

        BeverageDTO beverage = beverageAdminService.updateBeverage(id, request);

        return ResponseEntity.ok(ApiResponse.success(beverage));
    }

    /**
     * FR-031: 删除饮品（软删除）
     *
     * @param id 饮品ID (UUID字符串)
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBeverage(@PathVariable String id) {
        log.info("删除饮品: id={}", id);

        beverageAdminService.deleteBeverage(id);

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * FR-034: 切换饮品状态
     *
     * @param id 饮品ID (UUID字符串)
     * @param status 目标状态
     * @return 更新后的饮品信息
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BeverageDTO>> updateBeverageStatus(
        @PathVariable String id,
        @RequestParam Beverage.BeverageStatus status
    ) {
        log.info("切换饮品状态: id={}, status={}", id, status);

        BeverageDTO beverage = beverageAdminService.updateStatus(id, status);

        return ResponseEntity.ok(ApiResponse.success(beverage));
    }

    // ==================== 规格管理 API ====================

    /**
     * FR-032: 获取饮品规格列表
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @return 规格列表
     */
    @GetMapping("/{beverageId}/specs")
    public ResponseEntity<ApiResponse<List<BeverageSpecDTO>>> getBeverageSpecs(
        @PathVariable String beverageId
    ) {
        log.info("获取饮品规格: beverageId={}", beverageId);

        List<BeverageSpecDTO> specs = beverageAdminService.getBeverageSpecs(beverageId);

        return ResponseEntity.ok(ApiResponse.success(specs));
    }

    /**
     * FR-032: 添加饮品规格
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @param request 规格创建请求
     * @return 创建的规格信息
     */
    @PostMapping("/{beverageId}/specs")
    public ResponseEntity<ApiResponse<BeverageSpecDTO>> addBeverageSpec(
        @PathVariable String beverageId,
        @Valid @RequestBody CreateSpecRequest request
    ) {
        log.info("添加饮品规格: beverageId={}, type={}", beverageId, request.getSpecType());

        BeverageSpecDTO spec = beverageAdminService.addSpec(beverageId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(spec));
    }

    /**
     * FR-033: 更新饮品规格
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @param specId 规格ID (UUID字符串)
     * @param request 更新请求
     * @return 更新后的规格信息
     */
    @PutMapping("/{beverageId}/specs/{specId}")
    public ResponseEntity<ApiResponse<BeverageSpecDTO>> updateBeverageSpec(
        @PathVariable String beverageId,
        @PathVariable String specId,
        @Valid @RequestBody UpdateSpecRequest request
    ) {
        log.info("更新饮品规格: beverageId={}, specId={}", beverageId, specId);

        BeverageSpecDTO spec = beverageAdminService.updateSpec(beverageId, specId, request);

        return ResponseEntity.ok(ApiResponse.success(spec));
    }

    /**
     * FR-033: 删除饮品规格
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @param specId 规格ID (UUID字符串)
     * @return 操作结果
     */
    @DeleteMapping("/{beverageId}/specs/{specId}")
    public ResponseEntity<ApiResponse<Void>> deleteBeverageSpec(
        @PathVariable String beverageId,
        @PathVariable String specId
    ) {
        log.info("删除饮品规格: beverageId={}, specId={}", beverageId, specId);

        beverageAdminService.deleteSpec(beverageId, specId);

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== 配方(BOM)管理 API ====================

    /**
     * FR-035: 获取饮品配方列表
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @return 配方列表
     */
    @GetMapping("/{beverageId}/recipes")
    public ResponseEntity<ApiResponse<List<BeverageRecipeDTO>>> getBeverageRecipes(
        @PathVariable String beverageId
    ) {
        log.info("获取饮品配方: beverageId={}", beverageId);

        List<BeverageRecipeDTO> recipes = beverageAdminService.getBeverageRecipes(beverageId);

        return ResponseEntity.ok(ApiResponse.success(recipes));
    }

    /**
     * FR-035 & FR-037: 添加饮品配方（包含SKU校验）
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @param request 配方创建请求
     * @return 创建的配方信息
     */
    @PostMapping("/{beverageId}/recipes")
    public ResponseEntity<ApiResponse<BeverageRecipeDTO>> addBeverageRecipe(
        @PathVariable String beverageId,
        @Valid @RequestBody CreateRecipeRequest request
    ) {
        log.info("添加饮品配方: beverageId={}, 原料数量={}", beverageId, request.getIngredients().size());

        BeverageRecipeDTO recipe = beverageAdminService.addRecipe(beverageId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(recipe));
    }

    /**
     * FR-036 & FR-037: 更新饮品配方（包含SKU校验）
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @param recipeId 配方ID (UUID字符串)
     * @param request 更新请求
     * @return 更新后的配方信息
     */
    @PutMapping("/{beverageId}/recipes/{recipeId}")
    public ResponseEntity<ApiResponse<BeverageRecipeDTO>> updateBeverageRecipe(
        @PathVariable String beverageId,
        @PathVariable String recipeId,
        @Valid @RequestBody UpdateRecipeRequest request
    ) {
        log.info("更新饮品配方: beverageId={}, recipeId={}", beverageId, recipeId);

        BeverageRecipeDTO recipe = beverageAdminService.updateRecipe(beverageId, recipeId, request);

        return ResponseEntity.ok(ApiResponse.success(recipe));
    }

    /**
     * FR-036: 删除饮品配方（校验未完成订单）
     *
     * @param beverageId 饮品ID (UUID字符串)
     * @param recipeId 配方ID (UUID字符串)
     * @return 操作结果
     */
    @DeleteMapping("/{beverageId}/recipes/{recipeId}")
    public ResponseEntity<ApiResponse<Void>> deleteBeverageRecipe(
        @PathVariable String beverageId,
        @PathVariable String recipeId
    ) {
        log.info("删除饮品配方: beverageId={}, recipeId={}", beverageId, recipeId);

        beverageAdminService.deleteRecipe(beverageId, recipeId);

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
