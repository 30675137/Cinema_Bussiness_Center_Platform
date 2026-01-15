package com.cinema.procurement.entity;

/**
 * @spec N001-purchase-inbound
 * 采购订单状态枚举
 */
public enum PurchaseOrderStatus {
    DRAFT,              // 草稿
    PENDING_APPROVAL,   // 待审核
    APPROVED,           // 已审核
    REJECTED,           // 已拒绝
    PARTIAL_RECEIVED,   // 部分收货
    FULLY_RECEIVED,     // 全部收货
    CLOSED              // 已关闭
}
