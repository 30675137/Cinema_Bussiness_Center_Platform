package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包规则实体
 * <p>
 * 定义场景包的使用规则（时长、人数范围）
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Entity
@Table(name = "package_rules")
public class PackageRule {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 关联的场景包 ID（1:1 关系）
     */
    @Column(name = "package_id", nullable = false, unique = true)
    private UUID packageId;

    /**
     * 时长（小时，支持小数，如 2.5 小时）
     */
    @Column(name = "duration_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal durationHours;

    /**
     * 最小人数（NULL 表示不限）
     */
    @Column(name = "min_people")
    private Integer minPeople;

    /**
     * 最大人数（NULL 表示不限）
     */
    @Column(name = "max_people")
    private Integer maxPeople;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
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

    public BigDecimal getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(BigDecimal durationHours) {
        this.durationHours = durationHours;
    }

    public Integer getMinPeople() {
        return minPeople;
    }

    public void setMinPeople(Integer minPeople) {
        this.minPeople = minPeople;
    }

    public Integer getMaxPeople() {
        return maxPeople;
    }

    public void setMaxPeople(Integer maxPeople) {
        this.maxPeople = maxPeople;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "PackageRule{" +
                "id=" + id +
                ", packageId=" + packageId +
                ", durationHours=" + durationHours +
                ", minPeople=" + minPeople +
                ", maxPeople=" + maxPeople +
                '}';
    }
}
