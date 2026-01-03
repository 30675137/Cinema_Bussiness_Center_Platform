package com.cinema.category.service;

import com.cinema.category.dto.BatchUpdateSortOrderRequest;
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
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryAuditService {

    private final CategoryAuditLogRepository auditLogRepository;

    /**
     * 记录创建操作
     */
    @Async
    public void logCreate(MenuCategory category) {
        log.debug("Logging CREATE audit for category: {}", category.getId());

        CategoryAuditLog auditLog = CategoryAuditLog.builder()
                .categoryId(category.getId())
                .action(AuditAction.CREATE)
                .newValues(buildCategorySnapshot(category))
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * 记录更新操作
     */
    @Async
    public void logUpdate(MenuCategory category, String oldValues, String newValues) {
        log.debug("Logging UPDATE audit for category: {}", category.getId());

        CategoryAuditLog auditLog = CategoryAuditLog.builder()
                .categoryId(category.getId())
                .action(AuditAction.UPDATE)
                .oldValues(oldValues)
                .newValues(newValues)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * 记录删除操作
     */
    @Async
    public void logDelete(MenuCategory category, int migratedProductCount) {
        log.debug("Logging DELETE audit for category: {}", category.getId());

        String details = String.format("{\"migratedProductCount\":%d}", migratedProductCount);

        CategoryAuditLog auditLog = CategoryAuditLog.builder()
                .categoryId(category.getId())
                .action(AuditAction.DELETE)
                .oldValues(buildCategorySnapshot(category))
                .newValues(details)
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * 记录重排序操作
     */
    @Async
    public void logReorder(List<BatchUpdateSortOrderRequest.SortOrderItem> items) {
        log.debug("Logging REORDER audit for {} categories", items.size());

        String itemsJson = items.stream()
                .map(item -> String.format("{\"id\":\"%s\",\"sortOrder\":%d}", item.getId(), item.getSortOrder()))
                .collect(Collectors.joining(",", "[", "]"));

        // 为每个分类记录一条审计日志
        for (BatchUpdateSortOrderRequest.SortOrderItem item : items) {
            CategoryAuditLog auditLog = CategoryAuditLog.builder()
                    .categoryId(item.getId())
                    .action(AuditAction.REORDER)
                    .newValues(String.format("{\"sortOrder\":%d}", item.getSortOrder()))
                    .build();

            auditLogRepository.save(auditLog);
        }
    }

    /**
     * 记录切换可见性操作
     */
    @Async
    public void logToggleVisibility(MenuCategory category, boolean oldVisibility, boolean newVisibility) {
        log.debug("Logging TOGGLE_VISIBILITY audit for category: {}", category.getId());

        CategoryAuditLog auditLog = CategoryAuditLog.builder()
                .categoryId(category.getId())
                .action(AuditAction.TOGGLE_VISIBILITY)
                .oldValues(String.format("{\"isVisible\":%s}", oldVisibility))
                .newValues(String.format("{\"isVisible\":%s}", newVisibility))
                .build();

        auditLogRepository.save(auditLog);
    }

    /**
     * 查询分类的审计日志
     */
    public List<CategoryAuditLog> getAuditLogs(UUID categoryId) {
        return auditLogRepository.findByCategoryIdOrderByCreatedAtDesc(categoryId);
    }

    /**
     * 构建分类快照
     */
    private String buildCategorySnapshot(MenuCategory category) {
        return String.format(
                "{\"code\":\"%s\",\"displayName\":\"%s\",\"sortOrder\":%d,\"isVisible\":%s,\"isDefault\":%s,\"iconUrl\":\"%s\",\"description\":\"%s\"}",
                category.getCode(),
                category.getDisplayName(),
                category.getSortOrder(),
                category.getIsVisible(),
                category.getIsDefault(),
                category.getIconUrl() != null ? category.getIconUrl() : "",
                category.getDescription() != null ? category.getDescription() : ""
        );
    }
}
