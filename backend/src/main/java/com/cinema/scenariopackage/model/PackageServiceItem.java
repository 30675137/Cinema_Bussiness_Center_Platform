package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包服务项目实体
 * <p>
 * 记录场景包包含的服务项目（如管家服务、布置服务），使用快照保留添加时的名称和价格
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
@Entity
@Table(name = "package_services")
public class PackageServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    /**
     * 服务主数据 ID（关联 services 表）
     */
    @Column(name = "service_id", nullable = false)
    private UUID serviceId;

    /**
     * 服务名称快照（添加时的名称）
     */
    @Column(name = "service_name_snapshot", nullable = false, length = 255)
    private String serviceNameSnapshot;

    /**
     * 服务价格快照（添加时的价格）
     */
    @Column(name = "service_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal servicePriceSnapshot;

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

    public UUID getServiceId() {
        return serviceId;
    }

    public void setServiceId(UUID serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceNameSnapshot() {
        return serviceNameSnapshot;
    }

    public void setServiceNameSnapshot(String serviceNameSnapshot) {
        this.serviceNameSnapshot = serviceNameSnapshot;
    }

    public BigDecimal getServicePriceSnapshot() {
        return servicePriceSnapshot;
    }

    public void setServicePriceSnapshot(BigDecimal servicePriceSnapshot) {
        this.servicePriceSnapshot = servicePriceSnapshot;
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
