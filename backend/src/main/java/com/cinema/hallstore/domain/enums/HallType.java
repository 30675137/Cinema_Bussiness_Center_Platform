package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 影厅类型，对齐前端 HallType 与数据模型中的说明。
 * 前端期望值: 'VIP' | 'Public' | 'CP' | 'Party'
 */
public enum HallType {
    VIP("VIP"),
    PUBLIC("Public"),
    CP("CP"),
    PARTY("Party");

    private final String value;

    HallType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static HallType fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (HallType type : HallType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown HallType value: " + value);
    }
}


