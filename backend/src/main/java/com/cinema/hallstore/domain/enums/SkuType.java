package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * SKU类型枚举
 * 
 * M001 架构调整后,SKU 仅保留成品和套餐类型:
 * - 原料 (RAW_MATERIAL) → 迁移到 Material 表
 * - 包材 (PACKAGING) → 迁移到 Material 表
 * - 成品 (FINISHED_PRODUCT) → 保留在 SKU 表
 * - 套餐 (COMBO) → 保留在 SKU 表
 * 
 * @spec M001-material-unit-system Phase 9
 */
public enum SkuType {
    /**
     * 成品 - 带 BOM 配方的可售商品
     */
    FINISHED_PRODUCT("finished_product", "成品"),

    /**
     * 套餐/组合 - 成品的捆绑
     */
    COMBO("combo", "套餐");

    private final String value;
    private final String displayName;

    SkuType(String value, String displayName) {
        this.value = value;
        this.displayName = displayName;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * 从字符串值获取枚举
     */
    @JsonCreator
    public static SkuType fromValue(String value) {
        for (SkuType type : SkuType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown SKU type: " + value);
    }
}
