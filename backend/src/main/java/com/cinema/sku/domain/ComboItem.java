package com.cinema.sku.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * 套餐子项领域模型
 * - 对应 Supabase 中的 combo_items 表
 * - 表示套餐 SKU 的子项配置
 *
 * 关键设计点：
 * - comboId: 套餐 SKU ID
 * - subItemId: 子项 SKU ID（不能是套餐类型，避免嵌套）
 * - unitCost: 保存时记录的单位成本快照
 * - sortOrder: 用于控制套餐子项的显示顺序
 */
public class ComboItem {

    /** 套餐子项主键，对应表字段 id */
    private UUID id;

    /** 套餐SKU主键，对应表字段 combo_id */
    private UUID comboId;

    /** 子项SKU主键，对应表字段 sub_item_id */
    private UUID subItemId;

    /** 子项数量，对应表字段 quantity */
    private BigDecimal quantity;

    /** 子项单位（如 杯、份、个），对应表字段 unit */
    private String unit;

    /** 单位成本快照（元），保存时记录，对应表字段 unit_cost */
    private BigDecimal unitCost;

    /** 排序序号，对应表字段 sort_order */
    private int sortOrder;

    /** 创建时间戳，对应表字段 created_at */
    private Instant createdAt;

    // 构造函数
    public ComboItem() {
        this.sortOrder = 0;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getComboId() {
        return comboId;
    }

    public void setComboId(UUID comboId) {
        this.comboId = comboId;
    }

    public UUID getSubItemId() {
        return subItemId;
    }

    public void setSubItemId(UUID subItemId) {
        this.subItemId = subItemId;
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
        ComboItem comboItem = (ComboItem) o;
        return Objects.equals(id, comboItem.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ComboItem{" +
                "id=" + id +
                ", comboId=" + comboId +
                ", subItemId=" + subItemId +
                ", quantity=" + quantity +
                ", unit='" + unit + '\'' +
                ", unitCost=" + unitCost +
                ", sortOrder=" + sortOrder +
                '}';
    }

    // 业务方法

    /**
     * 计算子项总成本
     * @return 数量 × 单位成本
     */
    public BigDecimal calculateTotalCost() {
        if (quantity == null || unitCost == null) {
            return BigDecimal.ZERO;
        }
        return quantity.multiply(unitCost);
    }

    /**
     * 验证子项数据有效性
     * @return true 如果数据有效
     */
    public boolean isValid() {
        return comboId != null
                && subItemId != null
                && quantity != null
                && quantity.compareTo(BigDecimal.ZERO) > 0
                && unit != null
                && !unit.isEmpty();
    }
}
