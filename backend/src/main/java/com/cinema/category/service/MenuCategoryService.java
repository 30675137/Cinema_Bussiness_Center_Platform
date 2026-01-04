package com.cinema.category.service;

import com.cinema.category.dto.*;
import com.cinema.category.entity.MenuCategory;
import com.cinema.category.repository.MenuCategoryRepository;
import com.cinema.channelproduct.repository.ChannelProductRepository;
import com.cinema.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @spec O002-miniapp-menu-config
 * 菜单分类服务层
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MenuCategoryService {

    private final MenuCategoryRepository menuCategoryRepository;
    private final ChannelProductRepository channelProductRepository;
    private final CategoryAuditService categoryAuditService;

    /**
     * T028: 创建分类（含编码唯一性验证）
     */
    @Transactional
    public MenuCategoryDTO createCategory(CreateMenuCategoryRequest request) {
        log.info("Creating menu category with code: {}", request.getCode());

        // 验证编码唯一性
        if (menuCategoryRepository.findByCode(request.getCode()).isPresent()) {
            throw new BusinessException("CAT_DUP_001", "分类编码已存在: " + request.getCode());
        }

        // 验证编码格式
        if (!isValidCode(request.getCode())) {
            throw new BusinessException("CAT_VAL_001", "分类编码格式无效，仅允许大写字母、数字和下划线");
        }

        // 验证显示名称
        if (request.getDisplayName() == null || request.getDisplayName().trim().isEmpty()) {
            throw new BusinessException("CAT_VAL_002", "显示名称不能为空");
        }

        // 获取最大排序序号
        Integer maxSortOrder = menuCategoryRepository.findMaxSortOrder();

        MenuCategory category = MenuCategory.builder()
                .code(request.getCode().toUpperCase())
                .displayName(request.getDisplayName().trim())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : maxSortOrder + 10)
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .isDefault(false) // 新创建的分类不能是默认分类
                .iconUrl(request.getIconUrl())
                .description(request.getDescription())
                .build();

        MenuCategory saved = menuCategoryRepository.save(category);

        // 根据 FR-011：创建操作不记录审计日志，仅记录关键操作（DELETE, BATCH_SORT）

        log.info("Created menu category: id={}, code={}", saved.getId(), saved.getCode());
        return MenuCategoryDTO.fromEntity(saved);
    }

    /**
     * T029: 更新分类（含默认分类保护）
     */
    @Transactional
    public MenuCategoryDTO updateCategory(UUID id, UpdateMenuCategoryRequest request) {
        log.info("Updating menu category: id={}", id);

        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CAT_NTF_001", "分类不存在: " + id));

        // 更新字段
        if (request.getDisplayName() != null) {
            if (request.getDisplayName().trim().isEmpty()) {
                throw new BusinessException("CAT_VAL_002", "显示名称不能为空");
            }
            category.setDisplayName(request.getDisplayName().trim());
        }

        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        if (request.getIsVisible() != null) {
            // 默认分类不能隐藏
            if (category.getIsDefault() && !request.getIsVisible()) {
                throw new BusinessException("CAT_BIZ_002", "默认分类不能隐藏");
            }
            category.setIsVisible(request.getIsVisible());
        }

        if (request.getIconUrl() != null) {
            category.setIconUrl(request.getIconUrl());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        MenuCategory saved = menuCategoryRepository.save(category);

        // 根据 FR-011：更新操作不记录审计日志，仅记录关键操作（DELETE, BATCH_SORT）

        log.info("Updated menu category: id={}, code={}", saved.getId(), saved.getCode());
        return MenuCategoryDTO.fromEntity(saved);
    }

    /**
     * T030: 删除分类（商品迁移到默认分类）
     */
    @Transactional
    public DeleteCategoryResponse deleteCategory(UUID id, boolean confirm) {
        log.info("Deleting menu category: id={}, confirm={}", id, confirm);

        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CAT_NTF_001", "分类不存在: " + id));

        // 默认分类不能删除
        if (category.getIsDefault()) {
            throw new BusinessException("CAT_BIZ_001", "默认分类不能删除");
        }

        // 查询关联商品数量
        int productCount = channelProductRepository.countByCategoryId(id);

        // 如果有关联商品且未确认，返回需要确认的响应
        if (productCount > 0 && !confirm) {
            MenuCategory defaultCategory = getDefaultCategory();
            return DeleteCategoryResponse.builder()
                    .deletedCategoryId(id)
                    .deletedCategoryName(category.getDisplayName())
                    .affectedProductCount(productCount)
                    .targetCategoryId(defaultCategory.getId())
                    .targetCategoryName(defaultCategory.getDisplayName())
                    .build();
        }

        // 迁移商品到默认分类
        MenuCategory defaultCategory = null;
        if (productCount > 0) {
            defaultCategory = getDefaultCategory();
            channelProductRepository.updateCategoryId(id, defaultCategory.getId());
            log.info("Migrated {} products from category {} to default category {}",
                    productCount, id, defaultCategory.getId());
        }

        // 记录审计日志（FR-011：删除操作需要审计）
        categoryAuditService.logDelete(category, productCount);

        // 软删除分类
        menuCategoryRepository.softDeleteById(id);

        log.info("Deleted menu category: id={}, code={}, migratedProducts={}",
                id, category.getCode(), productCount);

        return DeleteCategoryResponse.of(
                id,
                category.getDisplayName(),
                productCount,
                defaultCategory != null ? defaultCategory.getId() : null,
                defaultCategory != null ? defaultCategory.getDisplayName() : null
        );
    }

    /**
     * T031: 获取分类列表（支持过滤条件）
     */
    @Transactional(readOnly = true)
    public List<MenuCategoryDTO> getCategories(boolean includeHidden, boolean includeProductCount) {
        log.debug("Getting categories: includeHidden={}, includeProductCount={}", includeHidden, includeProductCount);

        List<MenuCategory> categories;
        if (includeHidden) {
            categories = menuCategoryRepository.findAllOrderBySortOrder();
        } else {
            categories = menuCategoryRepository.findAllVisible();
        }

        return categories.stream()
                .map(category -> {
                    MenuCategoryDTO dto = MenuCategoryDTO.fromEntity(category);
                    if (includeProductCount) {
                        int count = channelProductRepository.countByCategoryId(category.getId());
                        dto.setProductCount(count);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * T032: 根据 ID 获取分类
     */
    @Transactional(readOnly = true)
    public MenuCategoryDTO getCategoryById(UUID id) {
        log.debug("Getting category by id: {}", id);

        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CAT_NTF_001", "分类不存在: " + id));

        MenuCategoryDTO dto = MenuCategoryDTO.fromEntity(category);
        dto.setProductCount(channelProductRepository.countByCategoryId(id));

        return dto;
    }

    /**
     * 获取客户端分类列表（仅可见分类）
     */
    @Transactional(readOnly = true)
    public List<ClientMenuCategoryDTO> getClientCategories() {
        log.debug("Getting client categories");

        List<MenuCategory> categories = menuCategoryRepository.findAllVisible();

        return categories.stream()
                .map(category -> {
                    int count = channelProductRepository.countByCategoryId(category.getId());
                    return ClientMenuCategoryDTO.fromEntity(category, count);
                })
                .collect(Collectors.toList());
    }

    /**
     * 批量更新排序（FR-011：需要审计）
     */
    @Transactional
    public void batchUpdateSortOrder(BatchUpdateSortOrderRequest request) {
        log.info("Batch updating sort order for {} categories", request.getItems().size());

        // 获取排序前的分类状态
        List<UUID> categoryIds = request.getItems().stream()
                .map(BatchUpdateSortOrderRequest.SortOrderItem::getId)
                .collect(Collectors.toList());
        List<MenuCategory> beforeCategories = menuCategoryRepository.findAllByIdInOrderBySortOrder(categoryIds);

        // 执行批量更新
        for (BatchUpdateSortOrderRequest.SortOrderItem item : request.getItems()) {
            menuCategoryRepository.updateSortOrder(item.getId(), item.getSortOrder());
        }

        // 获取排序后的分类状态
        List<MenuCategory> afterCategories = menuCategoryRepository.findAllByIdInOrderBySortOrder(categoryIds);

        // 记录审计日志（FR-011：批量排序需要审计）
        categoryAuditService.logBatchSort(beforeCategories, afterCategories);

        log.info("Batch updated sort order completed");
    }

    /**
     * 切换分类可见性
     */
    @Transactional
    public MenuCategoryDTO toggleVisibility(UUID id, boolean isVisible) {
        log.info("Toggling visibility for category: id={}, isVisible={}", id, isVisible);

        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException("CAT_NTF_001", "分类不存在: " + id));

        // 默认分类不能隐藏
        if (category.getIsDefault() && !isVisible) {
            throw new BusinessException("CAT_BIZ_002", "默认分类不能隐藏");
        }

        boolean oldVisibility = category.getIsVisible();
        category.setIsVisible(isVisible);

        MenuCategory saved = menuCategoryRepository.save(category);

        // 根据 FR-011：可见性切换不记录审计日志，仅记录关键操作（DELETE, BATCH_SORT）

        log.info("Toggled visibility for category: id={}, from={} to={}", id, oldVisibility, isVisible);
        return MenuCategoryDTO.fromEntity(saved);
    }

    /**
     * 获取默认分类
     */
    private MenuCategory getDefaultCategory() {
        return menuCategoryRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new BusinessException("CAT_SYS_001", "系统未配置默认分类"));
    }

    /**
     * 验证编码格式（仅允许大写字母、数字、下划线）
     */
    private boolean isValidCode(String code) {
        if (code == null || code.isEmpty()) {
            return false;
        }
        return code.matches("^[A-Z][A-Z0-9_]{1,49}$");
    }
}
