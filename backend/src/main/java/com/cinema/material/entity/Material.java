/**
 * @spec M001-material-unit-system
 */
package com.cinema.material.entity;

import com.cinema.material.domain.MaterialCategory;
import com.cinema.unit.domain.Unit;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Material entity - 物料主数据实体
 *
 * <p>User Story: US2 - 物料主数据管理
 *
 * <p>This entity represents raw materials and packaging, independent from the SPU/SKU system.
 * It supports material-level unit conversion and inventory management.
 */
@Entity
@Table(
        name = "materials",
        uniqueConstraints = {@UniqueConstraint(name = "uk_materials_code", columnNames = "code")},
        indexes = {
            @Index(name = "idx_materials_code", columnList = "code"),
            @Index(name = "idx_materials_category", columnList = "category"),
            @Index(name = "idx_materials_status", columnList = "status"),
            @Index(name = "idx_materials_inventory_unit_id", columnList = "inventory_unit_id"),
            @Index(name = "idx_materials_purchase_unit_id", columnList = "purchase_unit_id")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * 物料编码（格式：MAT-{RAW|PKG}-{001-999}）
     *
     * <p>Examples: MAT-RAW-001, MAT-PKG-001
     */
    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    /**
     * 物料名称
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 物料类别
     *
     * <p>RAW_MATERIAL: 原料<br>
     * PACKAGING: 包材
     */
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "category", nullable = false)
    private MaterialCategory category;

    /**
     * 库存单位（外键到 units 表）
     *
     * <p>This is the unit used for inventory management and stock tracking.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_unit_id", nullable = false)
    private Unit inventoryUnit;

    /**
     * 采购单位（外键到 units 表）
     *
     * <p>This is the unit used for procurement and purchasing.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_unit_id", nullable = false)
    private Unit purchaseUnit;

    /**
     * 换算率（1 采购单位 = conversion_rate 库存单位）
     *
     * <p>Example: If 1 瓶 = 500 ml, then conversion_rate = 500
     *
     * <p>This field is required when use_global_conversion is false.
     */
    @Column(name = "conversion_rate", precision = 10, scale = 6)
    private BigDecimal conversionRate;

    /**
     * 是否使用全局换算规则
     *
     * <p>If true, uses the global unit_conversions table.<br>
     * If false, uses the material-level conversion_rate.
     */
    @Column(name = "use_global_conversion", nullable = false)
    private Boolean useGlobalConversion = true;

    /**
     * 规格说明
     *
     * <p>Examples: 750ml/瓶, 500g/袋
     */
    @Column(name = "specification", columnDefinition = "TEXT")
    private String specification;

    /**
     * 物料描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 标准成本 (以库存单位计价)
     *
     * <p>Examples: 50元/ml, 0.5元/g, 2元/个
     */
    @Column(name = "standard_cost", precision = 10, scale = 2)
    private BigDecimal standardCost;

    /**
     * 状态
     *
     * <p>ACTIVE: 启用<br>
     * INACTIVE: 停用
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

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
    @Column(name = "created_by", length = 100)
    private String createdBy;

    /**
     * 更新人
     */
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
}
