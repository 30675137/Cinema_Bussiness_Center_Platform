package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包软权益（单品）实体
 * <p>
 * 记录场景包包含的单品及数量，使用快照保留添加时的名称和价格
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@Entity
@Table(name = "package_items")
public class PackageItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    /**
     * 单品主数据 ID（关联 items 表）
     */
    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    /**
     * 数量
     */
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    /**
     * 单品名称快照（添加时的名称）
     */
    @Column(name = "item_name_snapshot", nullable = false, length = 255)
    private String itemNameSnapshot;

    /**
     * 单品价格快照（添加时的价格）
     */
    @Column(name = "item_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal itemPriceSnapshot;

    /**
     * 排序序号
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }

    // ========== Getters and Setters ==========

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPackageId() {
        return packageId;
    }

    public void setPackageId(UUID packageId) {
        this.packageId = packageId;
    }

    public UUID getItemId() {
        return itemId;
    }

    public void setItemId(UUID itemId) {
        this.itemId = itemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getItemNameSnapshot() {
        return itemNameSnapshot;
    }

    public void setItemNameSnapshot(String itemNameSnapshot) {
        this.itemNameSnapshot = itemNameSnapshot;
    }

    public BigDecimal getItemPriceSnapshot() {
        return itemPriceSnapshot;
    }

    public void setItemPriceSnapshot(BigDecimal itemPriceSnapshot) {
        this.itemPriceSnapshot = itemPriceSnapshot;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
