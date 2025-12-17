package com.cinema.hallstore.domain.enums;

/**
 * 影厅状态：
 * - ACTIVE: 可用于新建排期/预约
 * - INACTIVE: 已停用，不再用于新业务，但历史数据保留
 * - MAINTENANCE: 维护中，可用于维护/锁座场景，不允许正常业务排期
 */
public enum HallStatus {
    ACTIVE,
    INACTIVE,
    MAINTENANCE
}


