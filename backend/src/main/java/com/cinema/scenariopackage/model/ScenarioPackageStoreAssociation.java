package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * 场景包-门店关联实体
 * <p>
 * 表示场景包与门店的多对多关联关系。
 * 一个场景包可以关联多个门店，一个门店也可以被多个场景包关联。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-21
 * @see ScenarioPackage
 */
@Entity
@Table(
    name = "scenario_package_store_associations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"package_id", "store_id"})
)
public class ScenarioPackageStoreAssociation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 场景包 ID
     */
    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    /**
     * 门店 ID
     */
    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * 创建人（用户ID或用户名）
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // ============================================================
    // Constructors
    // ============================================================

    public ScenarioPackageStoreAssociation() {
    }

    public ScenarioPackageStoreAssociation(UUID packageId, UUID storeId, String createdBy) {
        this.packageId = packageId;
        this.storeId = storeId;
        this.createdBy = createdBy;
    }

    // ============================================================
    // Getters and Setters
    // ============================================================

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

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    // ============================================================
    // Object Methods
    // ============================================================

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScenarioPackageStoreAssociation that = (ScenarioPackageStoreAssociation) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ScenarioPackageStoreAssociation{" +
                "id=" + id +
                ", packageId=" + packageId +
                ", storeId=" + storeId +
                ", createdAt=" + createdAt +
                ", createdBy='" + createdBy + '\'' +
                '}';
    }
}
