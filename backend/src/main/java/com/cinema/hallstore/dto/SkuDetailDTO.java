package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.BomComponent;
import com.cinema.hallstore.domain.ComboItem;
import com.cinema.hallstore.domain.Sku;
import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * SKU详情DTO(包含BOM和套餐子项)
 *
 * @since P001-sku-master-data
 */
public class SkuDetailDTO {

    private UUID id;
    private String code;
    private String name;
    private UUID spuId;
    private SkuType skuType;
    private String mainUnit;
    private String[] storeScope;
    private BigDecimal standardCost;
    private BigDecimal wasteRate;
    private BigDecimal price; // 零售价
    private SkuStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 品牌和分类信息(从SPU获取)
    private String brandId;
    private String brandName;
    private String categoryId;
    private String categoryName;

    // BOM组件(仅成品类型)
    private List<BomComponent> bom;

    // 套餐子项(仅套餐类型)
    private List<ComboItem> comboItems;

    // 从Sku实体创建
    public static SkuDetailDTO from(Sku sku) {
        SkuDetailDTO dto = new SkuDetailDTO();
        dto.id = sku.getId();
        dto.code = sku.getCode();
        dto.name = sku.getName();
        dto.spuId = sku.getSpuId();
        dto.skuType = sku.getSkuType();
        dto.mainUnit = sku.getMainUnit();
        dto.storeScope = sku.getStoreScope();
        dto.standardCost = sku.getStandardCost();
        dto.wasteRate = sku.getWasteRate();
        dto.price = sku.getPrice();
        dto.status = sku.getStatus();
        dto.createdAt = sku.getCreatedAt();
        dto.updatedAt = sku.getUpdatedAt();
        return dto;
    }

    // Getters and Setters
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

    public UUID getSpuId() {
        return spuId;
    }

    public void setSpuId(UUID spuId) {
        this.spuId = spuId;
    }

    public SkuType getSkuType() {
        return skuType;
    }

    public void setSkuType(SkuType skuType) {
        this.skuType = skuType;
    }

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
    }

    public String[] getStoreScope() {
        return storeScope;
    }

    public void setStoreScope(String[] storeScope) {
        this.storeScope = storeScope;
    }

    public BigDecimal getStandardCost() {
        return standardCost;
    }

    public void setStandardCost(BigDecimal standardCost) {
        this.standardCost = standardCost;
    }

    public BigDecimal getWasteRate() {
        return wasteRate;
    }

    public void setWasteRate(BigDecimal wasteRate) {
        this.wasteRate = wasteRate;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public SkuStatus getStatus() {
        return status;
    }

    public void setStatus(SkuStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<BomComponent> getBom() {
        return bom;
    }

    public void setBom(List<BomComponent> bom) {
        this.bom = bom;
    }

    public List<ComboItem> getComboItems() {
        return comboItems;
    }

    public void setComboItems(List<ComboItem> comboItems) {
        this.comboItems = comboItems;
    }

    public String getBrandId() {
        return brandId;
    }

    public void setBrandId(String brandId) {
        this.brandId = brandId;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
