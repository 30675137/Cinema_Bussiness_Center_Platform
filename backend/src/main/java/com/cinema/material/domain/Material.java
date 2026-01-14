package com.cinema.material.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * M001: 物料主数据实体
 * 
 * 独立管理原料和包材,不依赖SPU/SKU体系
 * 替代原SKU表中的RAW_MATERIAL和PACKAGING类型
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Entity
@Table(name = "materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {
    
    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    /**
     * 物料编码 (自动生成)
     * 格式: MAT-{RAW|PKG}-{序号}
     * 例如: MAT-RAW-001, MAT-PKG-001
     */
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;
    
    /**
     * 物料名称
     * 例如: 朗姆酒, 玻璃杯, 爆米花桶
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    /**
     * 物料类别
     * RAW_MATERIAL: 原料
     * PACKAGING: 包材
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private MaterialCategory category;
    
    /**
     * 库存单位代码
     * 外键引用 units.code
     * 例如: ml, g, piece
     */
    @Column(name = "inventory_unit_code", nullable = false, length = 20)
    private String inventoryUnitCode;
    
    /**
     * 采购单位代码
     * 外键引用 units.code
     * 例如: bottle, box, bag
     */
    @Column(name = "purchase_unit_code", length = 20)
    private String purchaseUnitCode;
    
    /**
     * 物料级换算率 (采购单位 → 库存单位)
     * 例如: 1瓶=500ml, 则 conversion_rate = 500
     * 优先级高于全局换算规则
     */
    @Column(name = "conversion_rate", precision = 10, scale = 6)
    private BigDecimal conversionRate;
    
    /**
     * 是否使用全局换算
     * true: 使用 unit_conversions 表的全局换算规则
     * false: 使用 conversion_rate 字段的物料级换算率
     */
    @Column(name = "use_global_conversion")
    private Boolean useGlobalConversion;
    
    /**
     * 标准成本 (以库存单位计价)
     * 例如: 50元/ml, 0.5元/g, 2元/个
     */
    @Column(name = "standard_cost", precision = 10, scale = 2)
    private BigDecimal standardCost;
    
    /**
     * 物料描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * 状态
     * ACTIVE: 启用
     * INACTIVE: 停用
     */
    @Column(name = "status", length = 20)
    private String status;
    
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
     * 预设默认值
     */
    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = "ACTIVE";
        }
        if (useGlobalConversion == null) {
            useGlobalConversion = false;
        }
    }
}
