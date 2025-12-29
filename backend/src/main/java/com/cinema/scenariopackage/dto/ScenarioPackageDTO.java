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
    private String image;
    private PackageStatus status;
    private Boolean isLatest;
    private PackageRuleDTO rule;
    private List<HallTypeDTO> hallTypes;
    private List<PackageBenefitDTO> benefits;
    private List<PackageItemDTO> items;
    private List<PackageServiceDTO> services;
    // 019-store-association: 门店关联
    private List<StoreDTO> stores;
    private List<UUID> storeIds;
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

    public static class PackageBenefitDTO {
        private UUID id;
        private String benefitType;
        private BigDecimal discountRate;
        private Integer freeCount;
        private String description;
        private Integer sortOrder;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getBenefitType() {
            return benefitType;
        }

        public void setBenefitType(String benefitType) {
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
    }

    public static class PackageItemDTO {
        private UUID id;
        private UUID itemId;
        private Integer quantity;
        private String itemName;
        private BigDecimal itemPrice;
        private Integer sortOrder;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
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

        public String getItemName() {
            return itemName;
        }

        public void setItemName(String itemName) {
            this.itemName = itemName;
        }

        public BigDecimal getItemPrice() {
            return itemPrice;
        }

        public void setItemPrice(BigDecimal itemPrice) {
            this.itemPrice = itemPrice;
        }

        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
    }

    public static class PackageServiceDTO {
        private UUID id;
        private UUID serviceId;
        private String serviceName;
        private BigDecimal servicePrice;
        private Integer sortOrder;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public UUID getServiceId() {
            return serviceId;
        }

        public void setServiceId(UUID serviceId) {
            this.serviceId = serviceId;
        }

        public String getServiceName() {
            return serviceName;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public BigDecimal getServicePrice() {
            return servicePrice;
        }

        public void setServicePrice(BigDecimal servicePrice) {
            this.servicePrice = servicePrice;
        }

        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }
    }

    /**
     * 门店摘要 DTO
     * Feature: 019-store-association
     */
    public static class StoreDTO {
        private UUID id;
        private String code;
        private String name;
        private String region;
        private String status;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String region) {
            this.region = region;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
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

    public List<PackageBenefitDTO> getBenefits() {
        return benefits;
    }

    public void setBenefits(List<PackageBenefitDTO> benefits) {
        this.benefits = benefits;
    }

    public List<PackageItemDTO> getItems() {
        return items;
    }

    public void setItems(List<PackageItemDTO> items) {
        this.items = items;
    }

    public List<PackageServiceDTO> getServices() {
        return services;
    }

    public void setServices(List<PackageServiceDTO> services) {
        this.services = services;
    }

    // 019-store-association: Stores getters and setters
    public List<StoreDTO> getStores() {
        return stores;
    }

    public void setStores(List<StoreDTO> stores) {
        this.stores = stores;
    }

    public List<UUID> getStoreIds() {
        return storeIds;
    }

    public void setStoreIds(List<UUID> storeIds) {
        this.storeIds = storeIds;
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
