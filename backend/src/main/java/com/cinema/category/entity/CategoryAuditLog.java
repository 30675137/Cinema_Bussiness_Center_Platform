package com.cinema.category.entity;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 分类操作审计日志实体
 * 记录所有分类配置的变更操作
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "category_audit_log",
    indexes = {
        @Index(name = "idx_category_audit_log_category_id", columnList = "category_id"),
        @Index(name = "idx_category_audit_log_action", columnList = "action"),
        @Index(name = "idx_category_audit_log_created_at", columnList = "created_at")
    }
)
public class CategoryAuditLog {

    /**
     * 日志唯一标识符
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * 操作的分类 ID
     */
    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    /**
     * 操作类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private AuditAction action;

    /**
     * 操作前数据快照（JSON）
     */
    @Type(JsonType.class)
    @Column(name = "before_data", columnDefinition = "jsonb")
    private Map<String, Object> beforeData;

    /**
     * 操作后数据快照（JSON）
     */
    @Type(JsonType.class)
    @Column(name = "after_data", columnDefinition = "jsonb")
    private Map<String, Object> afterData;

    /**
     * 变更详情描述
     */
    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;

    /**
     * 受影响的商品数量（删除分类时）
     */
    @Column(name = "affected_product_count")
    @Builder.Default
    private Integer affectedProductCount = 0;

    /**
     * 操作人 ID
     */
    @Column(name = "operator_id")
    private UUID operatorId;

    /**
     * 操作人名称
     */
    @Column(name = "operator_name", length = 100)
    private String operatorName;

    /**
     * 操作时间
     */
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * 操作 IP 地址
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /**
     * 审计操作类型枚举
     */
    public enum AuditAction {
        /**
         * 创建分类
         */
        CREATE,

        /**
         * 更新分类
         */
        UPDATE,

        /**
         * 删除分类
         */
        DELETE,

        /**
         * 重新排序
         */
        REORDER,

        /**
         * 切换可见性
         */
        TOGGLE_VISIBILITY
    }

    /**
     * 创建日志的静态工厂方法
     */
    public static CategoryAuditLog create(
            UUID categoryId,
            AuditAction action,
            Map<String, Object> beforeData,
            Map<String, Object> afterData,
            String changeDescription,
            UUID operatorId,
            String operatorName
    ) {
        return CategoryAuditLog.builder()
                .categoryId(categoryId)
                .action(action)
                .beforeData(beforeData)
                .afterData(afterData)
                .changeDescription(changeDescription)
                .operatorId(operatorId)
                .operatorName(operatorName)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
