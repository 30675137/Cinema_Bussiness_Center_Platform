/**
 * @spec N001-purchase-inbound
 * 收货入库明细数据传输对象
 */
package com.cinema.procurement.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class GoodsReceiptItemDTO {

    private UUID id;
    private PurchaseOrderItemDTO.SkuDTO sku;
    private BigDecimal orderedQty;
    private BigDecimal receivedQty;
    private String qualityStatus;
    private String rejectionReason;

    public GoodsReceiptItemDTO() {}

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PurchaseOrderItemDTO.SkuDTO getSku() {
        return sku;
    }

    public void setSku(PurchaseOrderItemDTO.SkuDTO sku) {
        this.sku = sku;
    }

    public BigDecimal getOrderedQty() {
        return orderedQty;
    }

    public void setOrderedQty(BigDecimal orderedQty) {
        this.orderedQty = orderedQty;
    }

    public BigDecimal getReceivedQty() {
        return receivedQty;
    }

    public void setReceivedQty(BigDecimal receivedQty) {
        this.receivedQty = receivedQty;
    }

    public String getQualityStatus() {
        return qualityStatus;
    }

    public void setQualityStatus(String qualityStatus) {
        this.qualityStatus = qualityStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
