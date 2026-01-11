/**
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 * 采购订单明细数据传输对象
 */
package com.cinema.procurement.dto;

import com.cinema.procurement.entity.ItemType;

import java.math.BigDecimal;
import java.util.UUID;

public class PurchaseOrderItemDTO {

    private UUID id;

    /**
     * N004: Item type discriminator
     */
    private ItemType itemType;

    /**
     * N004: Material reference (populated if itemType = MATERIAL)
     */
    private MaterialDTO material;

    /**
     * N004: Material name redundancy for soft-delete scenarios
     */
    private String materialName;

    /**
     * SKU reference (populated if itemType = SKU)
     */
    private SkuDTO sku;

    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineAmount;
    private BigDecimal receivedQty;
    private BigDecimal pendingQty;

    /**
     * N004: Unit display (from Material.purchaseUnit or SKU.mainUnit)
     */
    private String unit;

    public PurchaseOrderItemDTO() {}

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public SkuDTO getSku() {
        return sku;
    }

    public void setSku(SkuDTO sku) {
        this.sku = sku;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getLineAmount() {
        return lineAmount;
    }

    public void setLineAmount(BigDecimal lineAmount) {
        this.lineAmount = lineAmount;
    }

    public BigDecimal getReceivedQty() {
        return receivedQty;
    }

    public void setReceivedQty(BigDecimal receivedQty) {
        this.receivedQty = receivedQty;
    }

    public BigDecimal getPendingQty() {
        return pendingQty;
    }

    public void setPendingQty(BigDecimal pendingQty) {
        this.pendingQty = pendingQty;
    }

    // N004: New getters and setters

    public ItemType getItemType() {
        return itemType;
    }

    public void setItemType(ItemType itemType) {
        this.itemType = itemType;
    }

    public MaterialDTO getMaterial() {
        return material;
    }

    public void setMaterial(MaterialDTO material) {
        this.material = material;
    }

    public String getMaterialName() {
        return materialName;
    }

    public void setMaterialName(String materialName) {
        this.materialName = materialName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    // N004: Inner class for Material DTO
    public static class MaterialDTO {
        private UUID id;
        private String code;
        private String name;
        private String specification;
        private String purchaseUnitName;
        private String inventoryUnitName;

        public MaterialDTO() {}

        public MaterialDTO(UUID id, String code, String name, String specification,
                           String purchaseUnitName, String inventoryUnitName) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.specification = specification;
            this.purchaseUnitName = purchaseUnitName;
            this.inventoryUnitName = inventoryUnitName;
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

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

        public String getSpecification() {
            return specification;
        }

        public void setSpecification(String specification) {
            this.specification = specification;
        }

        public String getPurchaseUnitName() {
            return purchaseUnitName;
        }

        public void setPurchaseUnitName(String purchaseUnitName) {
            this.purchaseUnitName = purchaseUnitName;
        }

        public String getInventoryUnitName() {
            return inventoryUnitName;
        }

        public void setInventoryUnitName(String inventoryUnitName) {
            this.inventoryUnitName = inventoryUnitName;
        }
    }

    // Inner class for SKU
    public static class SkuDTO {
        private UUID id;
        private String code;
        private String name;
        private String mainUnit;

        public SkuDTO() {}

        public SkuDTO(UUID id, String code, String name, String mainUnit) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.mainUnit = mainUnit;
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

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

        public String getMainUnit() {
            return mainUnit;
        }

        public void setMainUnit(String mainUnit) {
            this.mainUnit = mainUnit;
        }
    }
}
