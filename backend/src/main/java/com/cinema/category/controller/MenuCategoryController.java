package com.cinema.category.controller;

import com.cinema.category.dto.*;
import com.cinema.category.exception.CategoryNotFoundException;
import com.cinema.category.exception.DefaultCategoryException;
import com.cinema.category.service.MenuCategoryService;
import com.cinema.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 菜单分类管理 Controller（Admin API）
 *
 * 端点：
 * - GET    /api/admin/menu-categories - 获取所有分类（含商品数量）
 * - GET    /api/admin/menu-categories/{id} - 获取单个分类
 * - POST   /api/admin/menu-categories - 创建分类
 * - PUT    /api/admin/menu-categories/{id} - 更新分类
 * - DELETE /api/admin/menu-categories/{id} - 删除分类
 * - PATCH  /api/admin/menu-categories/{id}/visibility - 切换可见性
 * - PUT    /api/admin/menu-categories/batch-sort - 批量排序
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/menu-categories")
@RequiredArgsConstructor
public class MenuCategoryController {

    private final MenuCategoryService menuCategoryService;

    /**
     * 获取所有分类（含商品数量）
     *
     * @param includeHidden 是否包含隐藏分类（默认 false）
     * @return 分类列表
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuCategoryDTO>>> getCategories(
            @RequestParam(defaultValue = "false") boolean includeHidden
    ) {
        log.info("GET /api/admin/menu-categories?includeHidden={}", includeHidden);

        List<MenuCategoryDTO> categories = menuCategoryService.getCategories(includeHidden, true);

        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * 获取单个分类
     *
     * @param id 分类 ID
     * @return 分类详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> getCategoryById(@PathVariable UUID id) {
        log.info("GET /api/admin/menu-categories/{}", id);

        try {
            MenuCategoryDTO category = menuCategoryService.getCategoryById(id);
            return ResponseEntity.ok(ApiResponse.success(category));
        } catch (CategoryNotFoundException e) {
            log.warn("Category not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getErrorCode() + ": " + e.getMessage()));
        }
    }

    /**
     * 创建分类
     *
     * @param request 创建请求
     * @return 创建的分类
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> createCategory(
            @Valid @RequestBody CreateMenuCategoryRequest request
    ) {
        log.info("POST /api/admin/menu-categories, code={}", request.getCode());

        try {
            MenuCategoryDTO created = menuCategoryService.createCategory(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(created));
        } catch (Exception e) {
            log.error("Failed to create category: {}", request.getCode(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("CAT_VAL_003: " + e.getMessage()));
        }
    }

    /**
     * 更新分类
     *
     * @param id 分类 ID
     * @param request 更新请求（含 version 字段用于乐观锁）
     * @return 更新后的分类
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMenuCategoryRequest request
    ) {
        log.info("PUT /api/admin/menu-categories/{}, version={}", id, request.getVersion());

        try {
            MenuCategoryDTO updated = menuCategoryService.updateCategory(id, request);
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (CategoryNotFoundException e) {
            log.warn("Category not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getErrorCode() + ": " + e.getMessage()));
        } catch (DefaultCategoryException e) {
            log.warn("Cannot modify default category: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(ApiResponse.failure(e.getErrorCode() + ": " + e.getMessage()));
        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic locking failure for category: {}", id);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.failure("CAT_CONFLICT_001: 数据已被其他用户修改，请刷新后重试"));
        }
    }

    /**
     * 删除分类（商品迁移到默认分类）
     *
     * @param id 分类 ID
     * @param confirm 是否确认删除（有商品时需要确认）
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<DeleteCategoryResponse>> deleteCategory(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean confirm
    ) {
        log.info("DELETE /api/admin/menu-categories/{}?confirm={}", id, confirm);

        try {
            DeleteCategoryResponse response = menuCategoryService.deleteCategory(id, confirm);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (CategoryNotFoundException e) {
            log.warn("Category not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getErrorCode() + ": " + e.getMessage()));
        } catch (DefaultCategoryException e) {
            log.warn("Cannot delete default category: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(ApiResponse.failure(e.getErrorCode() + ": " + e.getMessage()));
        }
    }

    /**
     * 切换分类可见性
     *
     * @param id 分类 ID
     * @param request 可见性切换请求
     * @return 更新后的分类
     */
    @PatchMapping("/{id}/visibility")
    public ResponseEntity<ApiResponse<MenuCategoryDTO>> toggleVisibility(
            @PathVariable UUID id,
            @RequestBody ToggleVisibilityRequest request
    ) {
        log.info("PATCH /api/admin/menu-categories/{}/visibility, isVisible={}",
                id, request.getIsVisible());

        try {
            MenuCategoryDTO updated = menuCategoryService.toggleVisibility(id, request.getIsVisible());
            return ResponseEntity.ok(ApiResponse.success(updated));
        } catch (CategoryNotFoundException e) {
            log.warn("Category not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure(e.getErrorCode() + ": " + e.getMessage()));
        } catch (DefaultCategoryException e) {
            log.warn("Cannot hide default category: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(ApiResponse.failure(e.getErrorCode() + ": " + e.getMessage()));
        }
    }

    /**
     * 批量排序
     *
     * @param request 批量排序请求
     * @return 成功响应
     */
    @PutMapping("/batch-sort")
    public ResponseEntity<ApiResponse<Void>> batchSort(
            @Valid @RequestBody BatchUpdateSortOrderRequest request
    ) {
        log.info("PUT /api/admin/menu-categories/batch-sort, count={}", request.getItems().size());

        try {
            menuCategoryService.batchUpdateSortOrder(request);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Failed to batch sort categories", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("CAT_VAL_004: 批量排序失败: " + e.getMessage()));
        }
    }

    /**
     * 可见性切换请求 DTO（内部类）
     */
    public static class ToggleVisibilityRequest {
        private Boolean isVisible;

        public Boolean getIsVisible() {
            return isVisible;
        }

        public void setIsVisible(Boolean isVisible) {
            this.isVisible = isVisible;
        }
    }
}
