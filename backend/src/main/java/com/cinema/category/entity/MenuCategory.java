package com.cinema.category.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * @spec O002-miniapp-menu-config
 * 菜单分类实体
 * 替代原 ChannelCategory 枚举，实现动态可配置的商品分类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "menu_category",
    indexes = {
        @Index(name = "idx_menu_category_sort_order", columnList = "sort_order"),
        @Index(name = "idx_menu_category_is_visible", columnList = "is_visible")
    }
)
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted_at IS NULL")
public class MenuCategory {

    /**
     * 分类唯一标识符
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * 分类编码（唯一标识，如 "ALCOHOL", "COFFEE"）
     * 用于 API 查询和向后兼容
     */
    @Column(name = "code", nullable = false, length = 50)
    private String code;

    /**
     * 显示名称（中文，如 "经典特调", "精品咖啡"）
     */
    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    /**
     * 排序序号（数字越小越靠前）
     */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    /**
     * 是否可见（false 则小程序不显示）
     */
    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private Boolean isVisible = true;

    /**
     * 是否为默认分类（"其他"分类，不可删除）
     */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    /**
     * 图标 URL
     */
    @Column(name = "icon_url", columnDefinition = "TEXT")
    private String iconUrl;

    /**
     * 分类描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 乐观锁版本号（JPA @Version）
     * 用于检测并发编辑冲突
     * 每次更新时自动递增
     */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 创建人 ID
     */
    @Column(name = "created_by")
    private UUID createdBy;

    /**
     * 更新人 ID
     */
    @Column(name = "updated_by")
    private UUID updatedBy;

    /**
     * 软删除时间
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * 关联的商品数量（查询时计算，非持久化字段）
     */
    @Transient
    private Integer productCount;

    /**
     * 是否已删除
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }

    /**
     * 软删除
     */
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    /**
     * 恢复删除
     */
    public void restore() {
        this.deletedAt = null;
    }

    /**
     * 检查是否可以修改（默认分类有限制）
     */
    public boolean canModify() {
        return !Boolean.TRUE.equals(isDefault);
    }

    /**
     * 检查是否可以删除（默认分类不可删除）
     */
    public boolean canDelete() {
        return !Boolean.TRUE.equals(isDefault);
    }

    /**
     * 检查是否可以隐藏（默认分类不可隐藏）
     */
    public boolean canHide() {
        return !Boolean.TRUE.equals(isDefault);
    }
}
