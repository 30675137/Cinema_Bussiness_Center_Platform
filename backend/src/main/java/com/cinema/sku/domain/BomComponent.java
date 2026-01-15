package com.cinema.sku.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * BOM 组件领域模型
 * - 对应 Supabase 中的 bom_components 表
 * - 表示成品 SKU 的物料清单（Bill of Materials）组件
 *
 * 关键设计点：
 * - finishedProductId: 成品 SKU ID
 * - componentId: 组件 SKU ID（必须是原料或包材类型）
 * - unitCost: 保存时记录的单位成本快照
 * - isOptional: 标记可选组件
 */
public class BomComponent {

    /** BOM组件主键，对应表字段 id */
    private UUID id;

    /** 成品SKU主键，对应表字段 finished_product_id */
    private UUID finishedProductId;

    /** 组件SKU主键，对应表字段 component_id */
    private UUID componentId;

    /** 组件数量，对应表字段 quantity */
    private BigDecimal quantity;

    /** 组件单位（如 ml、个、克），对应表字段 unit */
    private String unit;

    /** 单位成本快照（元），保存时记录，对应表字段 unit_cost */
    private BigDecimal unitCost;

    /** 是否可选组件，对应表字段 is_optional */
    private boolean isOptional;

    /** 排序序号，对应表字段 sort_order */
    private int sortOrder;

    /** 创建时间戳，对应表字段 created_at */
    private Instant createdAt;

    // 构造函数
    public BomComponent() {
        this.isOptional = false;
        this.sortOrder = 0;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getFinishedProductId() {
        return finishedProductId;
    }

    public void setFinishedProductId(UUID finishedProductId) {
        this.finishedProductId = finishedProductId;
    }

    public UUID getComponentId() {
        return componentId;
    }

    public void setComponentId(UUID componentId) {
        this.componentId = componentId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public boolean isOptional() {
        return isOptional;
    }

    public void setOptional(boolean optional) {
        isOptional = optional;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BomComponent that = (BomComponent) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "BomComponent{" +
                "id=" + id +
                ", finishedProductId=" + finishedProductId +
                ", componentId=" + componentId +
                ", quantity=" + quantity +
                ", unit='" + unit + '\'' +
                ", unitCost=" + unitCost +
                ", isOptional=" + isOptional +
                '}';
    }

    // 业务方法

    /**
     * 计算组件总成本
     * @return 数量 × 单位成本
     */
    public BigDecimal calculateTotalCost() {
        if (quantity == null || unitCost == null) {
            return BigDecimal.ZERO;
        }
        return quantity.multiply(unitCost);
    }

    /**
     * 验证组件数据有效性
     * @return true 如果数据有效
     */
    public boolean isValid() {
        return finishedProductId != null
                && componentId != null
                && quantity != null
                && quantity.compareTo(BigDecimal.ZERO) > 0
                && unit != null
                && !unit.isEmpty();
    }
}
