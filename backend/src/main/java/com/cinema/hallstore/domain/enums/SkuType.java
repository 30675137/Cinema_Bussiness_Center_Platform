package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * SKU类型枚举
 */
public enum SkuType {
    /**
     * 原料
     */
    RAW_MATERIAL("raw_material", "原料"),

    /**
     * 包材
     */
    PACKAGING("packaging", "包材"),

    /**
     * 成品
     */
    FINISHED_PRODUCT("finished_product", "成品"),

    /**
     * 套餐/组合
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
