package com.cinema.sku.domain.enums;

/**
 * SKU类型枚举
 * - RAW_MATERIAL: 原料（如威士忌、可乐糖浆、玉米等）
 * - PACKAGING: 包材（如杯子、吸管、袋子等）
 * - FINISHED_PRODUCT: 成品（带BOM配方的可售商品）
 * - COMBO: 组合/套餐（成品的捆绑）
 */
public enum SkuType {
    /** 原料 - 生产中消耗的成分 */
    RAW_MATERIAL("raw_material"),

    /** 包材 - 包装中消耗的杯子、吸管、盒子 */
    PACKAGING("packaging"),

    /** 成品 - 带BOM配方的可售商品 */
    FINISHED_PRODUCT("finished_product"),

    /** 组合/套餐 - 成品的捆绑 */
    COMBO("combo");

    private final String dbValue;

    SkuType(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static SkuType fromDbValue(String dbValue) {
        for (SkuType type : values()) {
            if (type.dbValue.equals(dbValue)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown SKU type: " + dbValue);
    }
}
