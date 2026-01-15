package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * 创建SKU请求DTO
 *
 * @since P001-sku-master-data
 */
public class SkuCreateRequest {

    @NotBlank(message = "SKU编码不能为空")
    private String code;

    @NotBlank(message = "SKU名称不能为空")
    private String name;

    @NotNull(message = "SPU ID不能为空")
    private UUID spuId;

    @NotNull(message = "SKU类型不能为空")
    private SkuType skuType;

    @NotBlank(message = "主单位不能为空")
    private String mainUnit;

    private String[] storeScope;

    private BigDecimal standardCost;

    private BigDecimal wasteRate;

    private SkuStatus status;

    // BOM组件(仅成品类型)
    private List<BomComponentInput> bomComponents;

    // 套餐子项(仅套餐类型)
    private List<ComboItemInput> comboItems;

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getSpuId() {
        return spuId;
    }

    public void setSpuId(UUID spuId) {
        this.spuId = spuId;
    }

    public SkuType getSkuType() {
        return skuType;
    }

    public void setSkuType(SkuType skuType) {
        this.skuType = skuType;
    }

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
    }

    public String[] getStoreScope() {
        return storeScope;
    }

    public void setStoreScope(String[] storeScope) {
        this.storeScope = storeScope;
    }

    public BigDecimal getStandardCost() {
        return standardCost;
    }

    public void setStandardCost(BigDecimal standardCost) {
        this.standardCost = standardCost;
    }

    public BigDecimal getWasteRate() {
        return wasteRate;
    }

    public void setWasteRate(BigDecimal wasteRate) {
        this.wasteRate = wasteRate;
    }

    public SkuStatus getStatus() {
        return status;
    }

    public void setStatus(SkuStatus status) {
        this.status = status;
    }

    public List<BomComponentInput> getBomComponents() {
        return bomComponents;
    }

    public void setBomComponents(List<BomComponentInput> bomComponents) {
        this.bomComponents = bomComponents;
    }

    public List<ComboItemInput> getComboItems() {
        return comboItems;
    }

    public void setComboItems(List<ComboItemInput> comboItems) {
        this.comboItems = comboItems;
    }

    /**
     * BOM组件输入
     * N004: 支持物料和SKU两种类型
     */
    public static class BomComponentInput {
        private UUID componentId;
        /** 组件类型: MATERIAL 或 SKU */
        private String componentType;
        private BigDecimal quantity;
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

        public String getComponentType() {
            return componentType;
        }

        public void setComponentType(String componentType) {
            this.componentType = componentType;
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

    /**
     * 套餐子项输入
     */
    public static class ComboItemInput {
        private UUID subItemId;
        private BigDecimal quantity;
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
