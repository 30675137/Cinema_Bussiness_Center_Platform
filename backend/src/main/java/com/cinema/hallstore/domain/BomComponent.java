package com.cinema.hallstore.domain;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * BOM组件实体类
 * 用于成品SKU的物料清单配置
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bom_components", uniqueConstraints = {
    @UniqueConstraint(name = "uk_bom_component", columnNames = {"finished_product_id", "component_id"})
})
@EntityListeners(AuditingEntityListener.class)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class BomComponent {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * 成品SKU ID
     */
    @Column(name = "finished_product_id", nullable = false)
    private UUID finishedProductId;

    /**
     * 组件SKU ID (必须是原料或包材类型)
     */
    @Column(name = "component_id", nullable = false)
    private UUID componentId;

    /**
     * 组件数量
     */
    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    /**
     * 组件单位
     */
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;

    /**
     * 单位成本快照(保存时记录,用于成本计算)
     */
    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    /**
     * 是否可选组件
     */
    @Column(name = "is_optional")
    @Builder.Default
    private Boolean isOptional = false;

    /**
     * 排序序号
     */
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 可选: 关联到成品SKU实体 (延迟加载)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_product_id", insertable = false, updatable = false)
    private Sku finishedProduct;

    /**
     * 可选: 关联到组件SKU实体 (延迟加载)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", insertable = false, updatable = false)
    private Sku component;

    /**
     * 计算总成本 = 数量 × 单位成本
     */
    public BigDecimal getTotalCost() {
        if (quantity == null || unitCost == null) {
            return BigDecimal.ZERO;
        }
        return quantity.multiply(unitCost);
    }
}
