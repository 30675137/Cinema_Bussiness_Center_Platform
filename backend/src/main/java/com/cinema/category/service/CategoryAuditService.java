package com.cinema.category.service;

import com.cinema.category.entity.CategoryAuditLog;
import com.cinema.category.entity.CategoryAuditLog.AuditAction;
import com.cinema.category.entity.MenuCategory;
import com.cinema.category.repository.CategoryAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @spec O002-miniapp-menu-config
 * 分类审计日志服务
 *
 * 根据 FR-011：仅记录关键操作（DELETE, BATCH_SORT）
 * 普通更新（如名称修改、可见性切换）不记录，以最小化存储开销
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryAuditService {

    private final CategoryAuditLogRepository auditLogRepository;

    /**
     * 记录删除操作（关键操作）
     *
     * @param category 被删除的分类
     * @param affectedProductCount 受影响的商品数量
     */
    @Async
    public void logDelete(MenuCategory category, int affectedProductCount) {
        log.info("Logging DELETE audit for category: id={}, code={}, affectedProducts={}",
                category.getId(), category.getCode(), affectedProductCount);

        CategoryAuditLog auditLog = CategoryAuditLog.builder()
                .categoryId(category.getId())
                .action(AuditAction.DELETE)
                .beforeData(buildCategorySnapshotMap(category))
                .changeDescription(String.format("删除分类 '%s'，%d 个商品迁移到默认分类",
                        category.getDisplayName(), affectedProductCount))
                .affectedProductCount(affectedProductCount)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * 记录批量排序操作（关键操作）
     *
     * @param beforeCategories 排序前的分类列表
     * @param afterCategories 排序后的分类列表
     */
    @Async
    public void logBatchSort(List<MenuCategory> beforeCategories, List<MenuCategory> afterCategories) {
        log.info("Logging BATCH_SORT audit for {} categories", afterCategories.size());

        // 为整个批量操作记录一条审计日志
        // 使用第一个分类的 ID 作为关联，实际影响多个分类
        if (!afterCategories.isEmpty()) {
            CategoryAuditLog auditLog = CategoryAuditLog.builder()
                    .categoryId(afterCategories.get(0).getId())
                    .action(AuditAction.BATCH_SORT)
                    .beforeData(buildBatchSortSnapshotMap(beforeCategories))
                    .afterData(buildBatchSortSnapshotMap(afterCategories))
                    .changeDescription(String.format("批量排序 %d 个分类", afterCategories.size()))
                    .build();

            auditLogRepository.save(auditLog);
        }
    }

    /**
     * 查询分类的审计日志
     */
    public List<CategoryAuditLog> getAuditLogs(UUID categoryId) {
        return auditLogRepository.findByCategoryIdOrderByCreatedAtDesc(categoryId);
    }

    /**
     * 构建分类快照（Map 格式）
     */
    private java.util.Map<String, Object> buildCategorySnapshotMap(MenuCategory category) {
        java.util.Map<String, Object> snapshot = new java.util.HashMap<>();
        snapshot.put("code", category.getCode());
        snapshot.put("displayName", category.getDisplayName());
        snapshot.put("sortOrder", category.getSortOrder());
        snapshot.put("isVisible", category.getIsVisible());
        snapshot.put("isDefault", category.getIsDefault());
        snapshot.put("iconUrl", category.getIconUrl() != null ? category.getIconUrl() : "");
        snapshot.put("description", category.getDescription() != null ? category.getDescription() : "");
        return snapshot;
    }

    /**
     * 构建批量排序快照（Map 格式）
     */
    private java.util.Map<String, Object> buildBatchSortSnapshotMap(List<MenuCategory> categories) {
        java.util.Map<String, Object> snapshot = new java.util.HashMap<>();
        snapshot.put("count", categories.size());
        snapshot.put("categories", categories.stream()
                .map(cat -> {
                    java.util.Map<String, Object> item = new java.util.HashMap<>();
                    item.put("id", cat.getId().toString());
                    item.put("code", cat.getCode());
                    item.put("sortOrder", cat.getSortOrder());
                    return item;
                })
                .collect(Collectors.toList()));
        return snapshot;
    }
}
