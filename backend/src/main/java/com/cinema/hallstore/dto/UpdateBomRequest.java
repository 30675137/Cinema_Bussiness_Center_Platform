package com.cinema.hallstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * 更新BOM配置请求DTO
 *
 * @since P001-sku-master-data
 */
public class UpdateBomRequest {

    @Valid
    @NotNull(message = "BOM组件列表不能为空")
    private List<BomComponentInput> components;

    @DecimalMin(value = "0.0", message = "损耗率不能小于0")
    @DecimalMax(value = "100.0", message = "损耗率不能大于100")
    private BigDecimal wasteRate;

    // Getters and Setters
    public List<BomComponentInput> getComponents() {
        return components;
    }

    public void setComponents(List<BomComponentInput> components) {
        this.components = components;
    }

    public BigDecimal getWasteRate() {
        return wasteRate;
    }

    public void setWasteRate(BigDecimal wasteRate) {
        this.wasteRate = wasteRate;
    }

    /**
     * BOM组件输入
     */
    public static class BomComponentInput {
        @NotNull(message = "组件ID不能为空")
        private UUID componentId;

        @NotNull(message = "数量不能为空")
        @DecimalMin(value = "0.01", message = "数量必须大于0")
        private BigDecimal quantity;

        @NotNull(message = "单位不能为空")
        private String unit;

        private Boolean isOptional;
        private Integer sortOrder;

        // Getters and Setters
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

        public Boolean getIsOptional() {
            return isOptional;
        }

        public void setIsOptional(Boolean isOptional) {
            this.isOptional = isOptional;
        }

        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
    }
}
