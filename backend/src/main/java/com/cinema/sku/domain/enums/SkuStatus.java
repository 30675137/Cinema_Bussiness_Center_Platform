package com.cinema.sku.domain.enums;

/**
 * SKU状态枚举
 * - DRAFT: 草稿（不可用于BOM或销售）
 * - ENABLED: 已启用（可正常使用）
 * - DISABLED: 已停用（已创建但暂停使用）
 */
public enum SkuStatus {
    /** 草稿 - 不可用于BOM配方、销售订单或库存操作 */
    DRAFT("draft"),

    /** 已启用 - 可正常使用 */
    ENABLED("enabled"),

    /** 已停用 - 已创建但暂停使用 */
    DISABLED("disabled");

    private final String dbValue;

    SkuStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static SkuStatus fromDbValue(String dbValue) {
        for (SkuStatus status : values()) {
            if (status.dbValue.equals(dbValue)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown SKU status: " + dbValue);
    }
}
