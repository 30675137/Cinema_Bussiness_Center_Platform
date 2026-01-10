/**
 * @spec N001-purchase-inbound
 * 收货入库单数据传输对象
 */
package com.cinema.procurement.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class GoodsReceiptDTO {

    private UUID id;
    private String receiptNumber;
    private PurchaseOrderSummary purchaseOrder;
    private PurchaseOrderDTO.StoreDTO store;
    private String status;
    private UUID receivedBy;
    private String receivedByName;
    private Instant receivedAt;
    private String remarks;
    private Integer version;
    private Instant createdAt;
    private Instant updatedAt;
    private List<GoodsReceiptItemDTO> items;

    public GoodsReceiptDTO() {}

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public PurchaseOrderSummary getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setPurchaseOrder(PurchaseOrderSummary purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public PurchaseOrderDTO.StoreDTO getStore() {
        return store;
    }

    public void setStore(PurchaseOrderDTO.StoreDTO store) {
        this.store = store;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getReceivedBy() {
        return receivedBy;
    }

    public void setReceivedBy(UUID receivedBy) {
        this.receivedBy = receivedBy;
    }

    public String getReceivedByName() {
        return receivedByName;
    }

    public void setReceivedByName(String receivedByName) {
        this.receivedByName = receivedByName;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<GoodsReceiptItemDTO> getItems() {
        return items;
    }

    public void setItems(List<GoodsReceiptItemDTO> items) {
        this.items = items;
    }

    // Inner class for Purchase Order Summary
    public static class PurchaseOrderSummary {
        private UUID id;
        private String orderNumber;
        private SupplierDTO supplier;

        public PurchaseOrderSummary() {}

        public PurchaseOrderSummary(UUID id, String orderNumber, SupplierDTO supplier) {
            this.id = id;
            this.orderNumber = orderNumber;
            this.supplier = supplier;
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getOrderNumber() {
            return orderNumber;
        }

        public void setOrderNumber(String orderNumber) {
            this.orderNumber = orderNumber;
        }

        public SupplierDTO getSupplier() {
            return supplier;
        }

        public void setSupplier(SupplierDTO supplier) {
            this.supplier = supplier;
        }
    }
}
