package com.cinema.channelproduct.domain;

import com.cinema.category.entity.MenuCategory;
import com.cinema.channelproduct.domain.enums.ChannelCategory;
import com.cinema.channelproduct.domain.enums.ChannelProductStatus;
import com.cinema.channelproduct.domain.enums.ChannelType;
import com.cinema.hallstore.domain.Sku;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @spec O005-channel-product-config, O002-miniapp-menu-config
 * 渠道商品配置实体
 * 记录 SKU 成品在特定销售渠道的展示配置
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "channel_product_config",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_sku_channel", columnNames = {"sku_id", "channel_type"})
    },
    indexes = {
        @Index(name = "idx_channel_product_channel_type", columnList = "channel_type"),
        @Index(name = "idx_channel_product_category", columnList = "channel_category"),
        @Index(name = "idx_channel_product_category_id", columnList = "category_id"),
        @Index(name = "idx_channel_product_status", columnList = "status"),
        @Index(name = "idx_channel_product_sku_id", columnList = "sku_id")
    }
)
@EntityListeners(AuditingEntityListener.class)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChannelProductConfig {

    /**
     * 配置唯一标识符
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * 关联的 SKU 成品 ID
     */
    @Column(name = "sku_id", nullable = false)
    private UUID skuId;

    /**
     * 渠道类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "channel_type", nullable = false, length = 50)
    @Builder.Default
    private ChannelType channelType = ChannelType.MINI_PROGRAM;

    /**
     * 渠道展示名称（空则使用 SKU 名称）
     */
    @Column(name = "display_name", length = 100)
    private String displayName;

    /**
     * 渠道分类（旧枚举，保留用于向后兼容）
     * @deprecated 使用 category 字段替代
     */
    @Deprecated
    @Enumerated(EnumType.STRING)
    @Column(name = "channel_category", nullable = false, length = 50)
    private ChannelCategory channelCategory;

    /**
     * @spec O002-miniapp-menu-config
     * 商品分类（外键关联 menu_category）
     * 替代原 channel_category 枚举
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonProperty("category")
    private MenuCategory category;

    /**
     * @spec O002-miniapp-menu-config
     * 分类 ID（用于 DTO 映射，只读）
     */
    @Column(name = "category_id", insertable = false, updatable = false)
    private UUID categoryId;

    /**
     * 渠道价格（分），空则使用 SKU 价格
     */
    @Column(name = "channel_price")
    private Long channelPrice;

    /**
     * 主图 URL（空则使用 SKU 主图）
     */
    @Column(name = "main_image", columnDefinition = "TEXT")
    private String mainImage;

    /**
     * 详情图 URL 数组
     */
    @Type(JsonType.class)
    @Column(name = "detail_images", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> detailImages = new ArrayList<>();

    /**
     * 渠道商品描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 规格配置 (JSONB)
     */
    @Type(JsonType.class)
    @Column(name = "specs", columnDefinition = "jsonb")
    @Builder.Default
    private List<ChannelProductSpec> specs = new ArrayList<>();

    /**
     * 是否推荐
     */
    @Column(name = "is_recommended", nullable = false)
    @Builder.Default
    private Boolean isRecommended = false;

    /**
     * 商品状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ChannelProductStatus status = ChannelProductStatus.ACTIVE;

    /**
     * 排序序号
     */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

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
     * 软删除时间
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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
     * SKU 关联信息（查询时通过 DTO 附加）
     */
    @Transient
    @JsonProperty("sku")
    private SkuBasicInfoDto skuInfo;

    /**
     * 设置 SKU 关联信息
     */
    @JsonProperty("sku")
    public void setSkuInfo(SkuBasicInfoDto skuInfo) {
        this.skuInfo = skuInfo;
    }

    /**
     * 获取 SKU 关联信息
     */
    @JsonProperty("sku")
    public SkuBasicInfoDto getSkuInfo() {
        return skuInfo;
    }

    /**
     * SKU 基础信息 DTO（用于查询返回）
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkuBasicInfoDto {
        private String id;
        private String skuCode;   // SKU 编码（来自 Sku.code）
        private String skuName;   // SKU 名称（来自 Sku.name）
        private Long price;        // 价格（分）
        private String imageUrl;    // 主图 URL
    }
}
