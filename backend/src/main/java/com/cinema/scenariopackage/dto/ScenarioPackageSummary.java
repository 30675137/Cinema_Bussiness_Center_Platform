package com.cinema.scenariopackage.dto;

import com.cinema.scenariopackage.model.ScenarioPackage.PackageStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包摘要 DTO（列表展示）
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ScenarioPackageSummary {

    private UUID id;
    private String name;
    private String description;
    private String backgroundImageUrl;
    private PackageStatus status;
    private Integer version;
    private Boolean isLatest;
    private BigDecimal durationHours;
    private String peopleRange;
    private Integer hallCount;
    private Instant createdAt;
    private Instant updatedAt;

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public PackageStatus getStatus() {
        return status;
    }

    public void setStatus(PackageStatus status) {
        this.status = status;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Boolean getIsLatest() {
        return isLatest;
    }

    public void setIsLatest(Boolean isLatest) {
        this.isLatest = isLatest;
    }

    public BigDecimal getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(BigDecimal durationHours) {
        this.durationHours = durationHours;
    }

    public String getPeopleRange() {
        return peopleRange;
    }

    public void setPeopleRange(String peopleRange) {
        this.peopleRange = peopleRange;
    }

    public Integer getHallCount() {
        return hallCount;
    }

    public void setHallCount(Integer hallCount) {
        this.hallCount = hallCount;
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
}
