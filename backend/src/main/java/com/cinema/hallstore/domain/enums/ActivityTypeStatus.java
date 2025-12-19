package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 活动类型状态枚举：
 * - ENABLED: 启用，小程序端用户可以看到并选择
 * - DISABLED: 停用，小程序端用户不可见，但保留在后台用于统计和历史数据
 * - DELETED: 已删除（软删除），不在任何列表中显示，但数据保留在数据库中，历史预约记录仍可正常关联
 */
public enum ActivityTypeStatus {
    ENABLED("ENABLED"),
    DISABLED("DISABLED"),
    DELETED("DELETED");

    private final String value;

    ActivityTypeStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ActivityTypeStatus fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (ActivityTypeStatus status : ActivityTypeStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown ActivityTypeStatus value: " + value);
    }
}




