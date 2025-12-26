package com.cinema.inventory.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * 门店库存领域模型，对应 store_inventory 表。
 * 记录某门店某SKU的库存数量，包含现存、可用、预占数量和安全库存阈值。
 * 
 * <p>库存数量关系：可用数量 = 现存数量 - 预占数量</p>
 * 
 * @since P003-inventory-query
 */
public class StoreInventory {

    private UUID id;
    private UUID storeId;
    private UUID skuId;
    
    /** 现存数量：实际在仓库中的库存数量 */
    private BigDecimal onHandQty = BigDecimal.ZERO;
    
    /** 可用数量：可用于销售的库存，计算公式：可用 = 现存 - 预占 */
    private BigDecimal availableQty = BigDecimal.ZERO;
    
    /** 预占数量：已被订单锁定但未出库的数量 */
    private BigDecimal reservedQty = BigDecimal.ZERO;
    
    /** 安全库存：SKU的最低库存警戒线，低于此值需要补货 */
    private BigDecimal safetyStock = BigDecimal.ZERO;
    
    private Instant createdAt;
    private Instant updatedAt;

    // 关联信息（用于查询时填充）
    private String skuCode;
    private String skuName;
    private String mainUnit;
    private UUID categoryId;
    private String categoryName;
    private String storeName;
    private String storeCode;

    /**
     * 根据可用库存与安全库存的比例计算库存状态。
     * 
     * @return 库存状态枚举
     */
    public InventoryStatus getInventoryStatus() {
        if (availableQty == null || availableQty.compareTo(BigDecimal.ZERO) == 0) {
            return InventoryStatus.OUT_OF_STOCK;
        }
        
        BigDecimal safetyStockValue = safetyStock != null ? safetyStock : BigDecimal.ZERO;
        
        // 如果安全库存为0，则只要有可用库存就是充足
        if (safetyStockValue.compareTo(BigDecimal.ZERO) == 0) {
            return InventoryStatus.SUFFICIENT;
        }
        
        BigDecimal threshold = safetyStockValue.multiply(new BigDecimal("0.5"));
        BigDecimal doubleThreshold = safetyStockValue.multiply(new BigDecimal("2"));

        if (availableQty.compareTo(threshold) < 0) {
            return InventoryStatus.LOW;
        } else if (availableQty.compareTo(safetyStockValue) < 0) {
            return InventoryStatus.BELOW_THRESHOLD;
        } else if (availableQty.compareTo(doubleThreshold) < 0) {
            return InventoryStatus.NORMAL;
        }
        return InventoryStatus.SUFFICIENT;
    }

    /**
     * 判断库存是否低于安全库存
     */
    public boolean isBelowSafetyStock() {
        if (safetyStock == null || safetyStock.compareTo(BigDecimal.ZERO) == 0) {
            return false;
        }
        return availableQty != null && availableQty.compareTo(safetyStock) < 0;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public UUID getSkuId() {
        return skuId;
    }

    public void setSkuId(UUID skuId) {
        this.skuId = skuId;
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

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getStoreCode() {
        return storeCode;
    }

    public void setStoreCode(String storeCode) {
        this.storeCode = storeCode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StoreInventory)) return false;
        StoreInventory that = (StoreInventory) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
