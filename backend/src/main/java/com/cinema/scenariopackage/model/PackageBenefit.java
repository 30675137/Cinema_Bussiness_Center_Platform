package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包硬权益实体
 * <p>
 * 记录观影购票优惠权益（折扣票价、免费场次等）
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@Entity
@Table(name = "package_benefits")
public class PackageBenefit {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    /**
     * 权益类型：DISCOUNT_TICKET（折扣票价）、FREE_SCREENING（免费场次）
     */
    @Column(name = "benefit_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private BenefitType benefitType;

    /**
     * 折扣率（如 0.75 表示 75 折），仅 DISCOUNT_TICKET 类型使用
     */
    @Column(name = "discount_rate", precision = 5, scale = 2)
    private BigDecimal discountRate;

    /**
     * 免费场次数量，仅 FREE_SCREENING 类型使用
     */
    @Column(name = "free_count")
    private Integer freeCount;

    /**
     * 权益描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

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

    // ========== Enum ==========

    public enum BenefitType {
        DISCOUNT_TICKET,  // 折扣票价
        FREE_SCREENING    // 免费场次
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

    public BenefitType getBenefitType() {
        return benefitType;
    }

    public void setBenefitType(BenefitType benefitType) {
        this.benefitType = benefitType;
    }

    public BigDecimal getDiscountRate() {
        return discountRate;
    }

    public void setDiscountRate(BigDecimal discountRate) {
        this.discountRate = discountRate;
    }

    public Integer getFreeCount() {
        return freeCount;
    }

    public void setFreeCount(Integer freeCount) {
        this.freeCount = freeCount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
