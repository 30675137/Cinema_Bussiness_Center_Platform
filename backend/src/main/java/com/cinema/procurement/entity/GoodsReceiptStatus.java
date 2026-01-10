package com.cinema.procurement.entity;

/**
 * @spec N001-purchase-inbound
 * 收货入库单状态枚举
 */
public enum GoodsReceiptStatus {
    PENDING,    // 待收货
    CONFIRMED,  // 已确认
    CANCELLED   // 已取消
}
