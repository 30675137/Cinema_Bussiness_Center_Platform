/**
 * @spec O003-beverage-order
 * 原料库存不足异常
 */
package com.cinema.beverage.exception;

import java.util.Map;

/**
 * 原料库存不足异常
 */
public class InsufficientIngredientException extends BeverageException {

    public InsufficientIngredientException(String skuId, String skuName, double required, double available) {
        super(
            BeverageErrorCode.BEV_BIZ_001,
            String.format("原料 '%s' 库存不足: 需要 %.2f，可用 %.2f", skuName, required, available),
            Map.of(
                "skuId", skuId,
                "skuName", skuName,
                "required", required,
                "available", available
            )
        );
    }
}
