package com.cinema.product.exception;

import java.util.UUID;

/**
 * @spec P006-fix-sku-edit-data
 * SKU不存在异常
 */
public class SkuNotFoundException extends RuntimeException {

    private final UUID skuId;

    public SkuNotFoundException(UUID skuId) {
        super(String.format("SKU不存在: id=%s", skuId));
        this.skuId = skuId;
    }

    public UUID getSkuId() {
        return skuId;
    }
}
