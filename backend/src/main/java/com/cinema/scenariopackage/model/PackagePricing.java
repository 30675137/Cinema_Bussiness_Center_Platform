package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包定价实体
 * <p>
 * 存储场景包的定价信息
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */
@Entity
@Table(name = "package_pricing")
public class PackagePricing {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 场景包 ID（外键）
     */
    @Column(name = "package_id", nullable = false, unique = true)
    private UUID packageId;

    /**
     * 打包一口价
     */
    @Column(name = "package_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal packagePrice;

    /**
     * 参考价格快照
     */
    @Column(name = "reference_price_snapshot", precision = 10, scale = 2)
    private BigDecimal referencePriceSnapshot;

    /**
     * 折扣百分比
     */
    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    /**
     * 折扣金额
     */
    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Lifecycle callbacks

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters

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

    public BigDecimal getPackagePrice() {
        return packagePrice;
    }

    public void setPackagePrice(BigDecimal packagePrice) {
        this.packagePrice = packagePrice;
    }

    public BigDecimal getReferencePriceSnapshot() {
        return referencePriceSnapshot;
    }

    public void setReferencePriceSnapshot(BigDecimal referencePriceSnapshot) {
        this.referencePriceSnapshot = referencePriceSnapshot;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
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

    @Override
    public String toString() {
        return "PackagePricing{" +
                "id=" + id +
                ", packageId=" + packageId +
                ", packagePrice=" + packagePrice +
                '}';
    }
}
