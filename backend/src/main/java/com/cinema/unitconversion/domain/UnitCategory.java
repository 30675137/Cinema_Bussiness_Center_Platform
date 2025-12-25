package com.cinema.unitconversion.domain;

/**
 * 单位类别枚举
 * 数据库存储小写值，Java 使用小写枚举名以匹配数据库
 */
public enum UnitCategory {
    volume(1),    // 体积类 - 默认1位小数
    weight(0),    // 重量类 - 默认0位小数
    quantity(0);  // 计数类 - 默认0位小数

    private final int defaultPrecision;

    UnitCategory(int defaultPrecision) {
        this.defaultPrecision = defaultPrecision;
    }

    public int getDefaultPrecision() {
        return defaultPrecision;
    }

    /**
     * 获取前端显示名称
     */
    public String getDisplayName() {
        return switch (this) {
            case volume -> "VOLUME";
            case weight -> "WEIGHT";
            case quantity -> "COUNT";
        };
    }

    /**
     * 获取中文显示名称
     */
    public String getChineseName() {
        return switch (this) {
            case volume -> "体积";
            case weight -> "重量";
            case quantity -> "计数";
        };
    }

    /**
     * 从字符串解析枚举值（支持大小写）
     */
    public static UnitCategory fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        return switch (value.toLowerCase()) {
            case "volume" -> volume;
            case "weight" -> weight;
            case "quantity", "count" -> quantity;
            default -> throw new IllegalArgumentException("Unknown category: " + value);
        };
    }
}
