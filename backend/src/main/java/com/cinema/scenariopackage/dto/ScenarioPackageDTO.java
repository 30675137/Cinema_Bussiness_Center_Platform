package com.cinema.scenariopackage.dto;

import com.cinema.scenariopackage.model.ScenarioPackage.PackageStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * 场景包响应 DTO（完整信息）
 * <p>
 * 用于返回场景包的详细信息
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class ScenarioPackageDTO {

    private UUID id;
    private UUID basePackageId;
    private Integer version;
    private Integer versionLock;
    private String name;
    private String description;
    private String backgroundImageUrl;
    private PackageStatus status;
    private Boolean isLatest;
    private PackageRuleDTO rule;
    private List<HallTypeDTO> hallTypes;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;

    // Nested DTOs

    public static class PackageRuleDTO {
        private BigDecimal durationHours;
        private Integer minPeople;
        private Integer maxPeople;

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
    }

    public static class HallTypeDTO {
        private UUID id;
        private String name;

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
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getBasePackageId() {
        return basePackageId;
    }

    public void setBasePackageId(UUID basePackageId) {
        this.basePackageId = basePackageId;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Integer getVersionLock() {
        return versionLock;
    }

    public void setVersionLock(Integer versionLock) {
        this.versionLock = versionLock;
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

    public Boolean getIsLatest() {
        return isLatest;
    }

    public void setIsLatest(Boolean isLatest) {
        this.isLatest = isLatest;
    }

    public PackageRuleDTO getRule() {
        return rule;
    }

    public void setRule(PackageRuleDTO rule) {
        this.rule = rule;
    }

    public List<HallTypeDTO> getHallTypes() {
        return hallTypes;
    }

    public void setHallTypes(List<HallTypeDTO> hallTypes) {
        this.hallTypes = hallTypes;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
