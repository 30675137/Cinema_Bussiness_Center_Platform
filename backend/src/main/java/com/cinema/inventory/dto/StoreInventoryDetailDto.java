package com.cinema.inventory.dto;

import com.cinema.inventory.domain.InventoryStatus;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * 库存详情 DTO - 用于详情展示
 * 扩展列表项 DTO，增加创建时间和门店编码字段。
 * 
 * @since P003-inventory-query
 */
public class StoreInventoryDetailDto extends StoreInventoryItemDto {

    /** 门店编码 */
    private String storeCode;

    /** 创建时间 */
    private Instant createdAt;

    // Getters and Setters
    public String getStoreCode() {
        return storeCode;
    }

    public void setStoreCode(String storeCode) {
        this.storeCode = storeCode;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
