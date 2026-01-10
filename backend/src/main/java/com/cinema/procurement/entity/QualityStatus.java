package com.cinema.procurement.entity;

/**
 * @spec N001-purchase-inbound
 * 质量状态枚举
 */
public enum QualityStatus {
    QUALIFIED,      // 合格
    UNQUALIFIED,    // 不合格
    PENDING_CHECK   // 待检验
}
