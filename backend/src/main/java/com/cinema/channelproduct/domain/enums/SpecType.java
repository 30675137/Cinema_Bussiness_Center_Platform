package com.cinema.channelproduct.domain.enums;

/**
 * @spec O005-channel-product-config
 * 规格类型枚举
 */
public enum SpecType {
    /**
     * 大小：小杯/中杯/大杯
     */
    SIZE,

    /**
     * 温度：冷/热/去冰
     */
    TEMPERATURE,

    /**
     * 甜度：无糖/半糖/标准/多糖
     */
    SWEETNESS,

    /**
     * 配料：珍珠/椰果/布丁（可多选）
     */
    TOPPING,

    /**
     * 辣度：不辣/微辣/中辣/特辣
     */
    SPICINESS,

    /**
     * 配菜：薯条/沙拉/洋葱圈
     */
    SIDE,

    /**
     * 做法：煎/烤/炸
     */
    COOKING,

    /**
     * 自定义规格
     */
    CUSTOM
}
