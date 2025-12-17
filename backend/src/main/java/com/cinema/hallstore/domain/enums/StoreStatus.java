package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 门店状态枚举：
 * - ACTIVE: 正常营业，可用于新建排期/预约等业务场景
 * - DISABLED: 已停用/关闭，仅保留历史数据用于查询与报表
 */
public enum StoreStatus {
    ACTIVE("active"),
    DISABLED("disabled");

    private final String value;

    StoreStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static StoreStatus fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (StoreStatus status : StoreStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown StoreStatus value: " + value);
    }
}


