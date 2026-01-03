package com.cinema.category.controller;

import com.cinema.category.dto.*;
import com.cinema.category.service.MenuCategoryService;
import com.cinema.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 菜单分类管理控制器（B端管理后台）
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/menu-categories")
@RequiredArgsConstructor
@Tag(name = "MenuCategory Admin", description = "菜单分类管理接口（B端）")
public class MenuCategoryAdminController {

    private final MenuCategoryService menuCategoryService;

    /**
     * T035: GET /api/admin/menu-categories - 获取分类列表
     */
    @GetMapping
    @Operation(summary = "获取分类列表", description = "获取所有分类，支持过滤隐藏分类和包含商品数量")
    public ResponseEntity<ApiResponse<List<MenuCategoryDTO>>> getCategories(
            @Parameter(description = "是否包含隐藏分类") @RequestParam(defaultValue = "true") boolean includeHidden,
            @Parameter(description = "是否包含商品数量") @RequestParam(defaultValue = "true") boolean includeProductCount
    ) {
        log.info("Getting categories: includeHidden={}, includeProductCount={}", includeHidden, includeProductCount);

        List<MenuCategoryDTO> categories = menuCategoryService.getCategories(includeHidden, includeProductCount);

        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * T036: POST /api/admin/menu-categories - 创建分类
     */
    @PostMapping
    @Operation(summary = "创建分类", description = "创建新的菜单分类")
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> createCategory(
            @Valid @RequestBody CreateMenuCategoryRequest request
    ) {
        log.info("Creating category: code={}", request.getCode());

        MenuCategoryDTO category = menuCategoryService.createCategory(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(category));
    }

    /**
     * T037: GET /api/admin/menu-categories/{id} - 获取单个分类
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取分类详情", description = "根据 ID 获取分类详情")
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> getCategoryById(
            @Parameter(description = "分类 ID") @PathVariable UUID id
    ) {
        log.info("Getting category by id: {}", id);

        MenuCategoryDTO category = menuCategoryService.getCategoryById(id);

        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * T038: PUT /api/admin/menu-categories/{id} - 更新分类
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新分类", description = "更新分类信息")
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> updateCategory(
            @Parameter(description = "分类 ID") @PathVariable UUID id,
            @Valid @RequestBody UpdateMenuCategoryRequest request
    ) {
        log.info("Updating category: id={}", id);

        MenuCategoryDTO category = menuCategoryService.updateCategory(id, request);

        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * T039: DELETE /api/admin/menu-categories/{id} - 删除分类
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类", description = "删除分类，如有关联商品则迁移到默认分类")
    public ResponseEntity<ApiResponse<DeleteCategoryResponse>> deleteCategory(
            @Parameter(description = "分类 ID") @PathVariable UUID id,
            @Parameter(description = "确认删除（如果有关联商品）") @RequestParam(defaultValue = "false") boolean confirm
    ) {
        log.info("Deleting category: id={}, confirm={}", id, confirm);

        DeleteCategoryResponse response = menuCategoryService.deleteCategory(id, confirm);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 批量更新排序
     */
    @PutMapping("/batch-sort")
    @Operation(summary = "批量更新排序", description = "批量更新分类排序顺序")
    public ResponseEntity<ApiResponse<Void>> batchUpdateSortOrder(
            @Valid @RequestBody BatchUpdateSortOrderRequest request
    ) {
        log.info("Batch updating sort order for {} categories", request.getItems().size());

        menuCategoryService.batchUpdateSortOrder(request);

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 切换分类可见性
     */
    @PatchMapping("/{id}/visibility")
    @Operation(summary = "切换可见性", description = "切换分类的可见状态")
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> toggleVisibility(
            @Parameter(description = "分类 ID") @PathVariable UUID id,
            @Parameter(description = "是否可见") @RequestParam boolean isVisible
    ) {
        log.info("Toggling visibility for category: id={}, isVisible={}", id, isVisible);

        MenuCategoryDTO category = menuCategoryService.toggleVisibility(id, isVisible);

        return ResponseEntity.ok(ApiResponse.success(category));
    }
}
