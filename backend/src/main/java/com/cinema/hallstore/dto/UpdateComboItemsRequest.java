package com.cinema.hallstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * 更新套餐子项配置请求DTO
 *
 * @since P001-sku-master-data
 */
public class UpdateComboItemsRequest {

    @Valid
    @NotNull(message = "套餐子项列表不能为空")
    private List<ComboItemInput> items;

    // Getters and Setters
    public List<ComboItemInput> getItems() {
        return items;
    }

    public void setItems(List<ComboItemInput> items) {
        this.items = items;
    }

    /**
     * 套餐子项输入
     */
    public static class ComboItemInput {
        @NotNull(message = "子项ID不能为空")
        private UUID subItemId;

        @NotNull(message = "数量不能为空")
        @DecimalMin(value = "0.01", message = "数量必须大于0")
        private BigDecimal quantity;

        @NotNull(message = "单位不能为空")
        private String unit;

        private Integer sortOrder;

        // Getters and Setters
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

        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
    }
}
