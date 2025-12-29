package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * SKU状态枚举
 */
public enum SkuStatus {
    /**
     * 草稿状态
     */
    DRAFT("draft", "草稿"),

    /**
     * 启用状态
     */
    ENABLED("enabled", "启用"),

    /**
     * 停用状态
     */
    DISABLED("disabled", "停用");

    private final String value;
    private final String displayName;

    SkuStatus(String value, String displayName) {
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
    public static SkuStatus fromValue(String value) {
        for (SkuStatus status : SkuStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown SKU status: " + value);
    }
}
