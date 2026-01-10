/**
 * @spec N001-purchase-inbound
 * 采购订单明细数据传输对象
 */
package com.cinema.procurement.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class PurchaseOrderItemDTO {

    private UUID id;
    private SkuDTO sku;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineAmount;
    private BigDecimal receivedQty;
    private BigDecimal pendingQty;

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
