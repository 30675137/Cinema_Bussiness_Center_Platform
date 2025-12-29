package com.cinema.inventory.dto;

import com.cinema.inventory.domain.InventoryStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 库存列表项 DTO - 用于列表展示
 * 包含 SKU 编码、名称、库存数量、状态、单位等信息。
 * 
 * @since P003-inventory-query
 */
public class StoreInventoryItemDto {

    /** 库存记录ID */
    private String id;

    /** 门店ID */
    private String storeId;

    /** 门店名称 */
    private String storeName;

    /** SKU ID */
    private String skuId;

    /** SKU编码 */
    private String skuCode;

    /** SKU名称 */
    private String skuName;

    /** 现存数量 */
    private BigDecimal onHandQty;

    /** 可用数量 */
    private BigDecimal availableQty;

    /** 预占数量 */
    private BigDecimal reservedQty;

    /** 安全库存 */
    private BigDecimal safetyStock;

    /** 库存单位 */
    private String mainUnit;

    /** 分类ID */
    private String categoryId;

    /** 分类名称 */
    private String categoryName;

    /** 库存状态 */
    private InventoryStatus inventoryStatus;

    /** 最后更新时间 */
    private Instant updatedAt;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStoreId() {
        return storeId;
    }

    public void setStoreId(String storeId) {
        this.storeId = storeId;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getSkuId() {
        return skuId;
    }

    public void setSkuId(String skuId) {
        this.skuId = skuId;
    }

    public String getSkuCode() {
        return skuCode;
    }

    public void setSkuCode(String skuCode) {
        this.skuCode = skuCode;
    }

    public String getSkuName() {
        return skuName;
    }

    public void setSkuName(String skuName) {
        this.skuName = skuName;
    }

    public BigDecimal getOnHandQty() {
        return onHandQty;
    }

    public void setOnHandQty(BigDecimal onHandQty) {
        this.onHandQty = onHandQty;
    }

    public BigDecimal getAvailableQty() {
        return availableQty;
    }

    public void setAvailableQty(BigDecimal availableQty) {
        this.availableQty = availableQty;
    }

    public BigDecimal getReservedQty() {
        return reservedQty;
    }

    public void setReservedQty(BigDecimal reservedQty) {
        this.reservedQty = reservedQty;
    }

    public BigDecimal getSafetyStock() {
        return safetyStock;
    }

    public void setSafetyStock(BigDecimal safetyStock) {
        this.safetyStock = safetyStock;
    }

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
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

    public InventoryStatus getInventoryStatus() {
        return inventoryStatus;
    }

    public void setInventoryStatus(InventoryStatus inventoryStatus) {
        this.inventoryStatus = inventoryStatus;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
