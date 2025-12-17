package com.cinema.hallstore.domain.enums;

/**
 * 门店状态枚举：
 * - ACTIVE: 正常营业，可用于新建排期/预约等业务场景
 * - DISABLED: 已停用/关闭，仅保留历史数据用于查询与报表
 */
public enum StoreStatus {
    ACTIVE,
    DISABLED
}


