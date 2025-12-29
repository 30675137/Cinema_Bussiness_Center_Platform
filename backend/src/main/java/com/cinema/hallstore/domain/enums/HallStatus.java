package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 影厅状态：
 * - ACTIVE: 可用于新建排期/预约
 * - INACTIVE: 已停用，不再用于新业务，但历史数据保留
 * - MAINTENANCE: 维护中，可用于维护/锁座场景，不允许正常业务排期
 */
public enum HallStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    MAINTENANCE("maintenance");

    private final String value;

    HallStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static HallStatus fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (HallStatus status : HallStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown HallStatus value: " + value);
    }
}



