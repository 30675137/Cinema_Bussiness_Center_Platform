/**
 * @spec N001-purchase-inbound
 * 采购订单状态变更历史实体
 */
package com.cinema.procurement.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "purchase_order_status_history", indexes = {
    @Index(name = "idx_posh_po_id", columnList = "purchase_order_id"),
    @Index(name = "idx_posh_created_at", columnList = "created_at")
})
public class PurchaseOrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrderEntity purchaseOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 30)
    private PurchaseOrderStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 30)
    private PurchaseOrderStatus toStatus;

    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(name = "changed_by_name", length = 100)
    private String changedByName;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PurchaseOrderStatusHistory() {}

    public PurchaseOrderStatusHistory(PurchaseOrderEntity purchaseOrder,
                                       PurchaseOrderStatus fromStatus,
                                       PurchaseOrderStatus toStatus,
                                       String remarks) {
        this.purchaseOrder = purchaseOrder;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.remarks = remarks;
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PurchaseOrderEntity getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setPurchaseOrder(PurchaseOrderEntity purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
    }

    public PurchaseOrderStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(PurchaseOrderStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public PurchaseOrderStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(PurchaseOrderStatus toStatus) {
        this.toStatus = toStatus;
    }

    public UUID getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(UUID changedBy) {
        this.changedBy = changedBy;
    }

    public String getChangedByName() {
        return changedByName;
    }

    public void setChangedByName(String changedByName) {
        this.changedByName = changedByName;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
