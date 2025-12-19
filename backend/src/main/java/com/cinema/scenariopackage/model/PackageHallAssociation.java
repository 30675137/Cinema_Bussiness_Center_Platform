package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包-影厅关联实体
 * <p>
 * 多对多关系，记录场景包适用的影厅类型
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Entity
@Table(
    name = "package_hall_associations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"package_id", "hall_type_id"})
)
public class PackageHallAssociation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 场景包 ID
     */
    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    /**
     * 影厅类型 ID
     */
    @Column(name = "hall_type_id", nullable = false)
    private UUID hallTypeId;

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

    public UUID getHallTypeId() {
        return hallTypeId;
    }

    public void setHallTypeId(UUID hallTypeId) {
        this.hallTypeId = hallTypeId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "PackageHallAssociation{" +
                "id=" + id +
                ", packageId=" + packageId +
                ", hallTypeId=" + hallTypeId +
                '}';
    }
}
