/**
 * @spec O003-beverage-order
 * 饮品实体类
 */
package com.cinema.beverage.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * 饮品实体
 *
 * 映射数据库表: beverages
 * 对应 spec: O003-beverage-order
 */
@Entity
@Table(name = "beverages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Beverage {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    /**
     * 饮品名称
     */
    @NotBlank(message = "饮品名称不能为空")
    @Size(max = 100, message = "饮品名称长度不能超过100")
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * 饮品描述
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 饮品分类
     */
    @NotNull(message = "饮品分类不能为空")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BeverageCategory category;

    /**
     * 主图URL
     */
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    /**
     * 详情图片列表 (JSON数组)
     * FIXME: 临时修复 Hibernate 6.x 类型冲突问题 (O002-miniapp-menu-config)
     * TODO: 在开发 O003-beverage-order 时重新审视此修改
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "detail_images", columnDefinition = "jsonb")
    private List<String> detailImages;

    /**
     * 基础价格 (单位: 元)
     */
    @NotNull(message = "基础价格不能为空")
    @Min(value = 0, message = "基础价格不能为负数")
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    /**
     * 营养信息 (JSON对象)
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "nutrition_info", columnDefinition = "jsonb")
    private String nutritionInfo;

    /**
     * 饮品状态
     */
    @NotNull(message = "饮品状态不能为空")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BeverageStatus status;

    /**
     * 是否推荐
     */
    @Column(name = "is_recommended", nullable = false)
    private Boolean isRecommended = false;

    /**
     * 排序顺序
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 创建人
     */
    @Column(name = "created_by", columnDefinition = "uuid")
    private UUID createdBy;

    /**
     * 更新人
     */
    @Column(name = "updated_by", columnDefinition = "uuid")
    private UUID updatedBy;

    /**
     * 饮品分类枚举
     */
    public enum BeverageCategory {
        /** 咖啡 */
        COFFEE,
        /** 茶饮 */
        TEA,
        /** 果汁 */
        JUICE,
        /** 奶昔 */
        SMOOTHIE,
        /** 奶茶 */
        MILK_TEA,
        /** 其他 */
        OTHER
    }

    /**
     * 饮品状态枚举
     */
    public enum BeverageStatus {
        /** 启用 */
        ACTIVE,
        /** 禁用 */
        INACTIVE,
        /** 售罄 */
        OUT_OF_STOCK
    }
}
