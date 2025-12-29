package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 门店操作类型枚举
 * 用于审计日志记录
 * 
 * @since 022-store-crud
 */
public enum OperationType {
    CREATE("CREATE"),
    UPDATE("UPDATE"),
    STATUS_CHANGE("STATUS_CHANGE"),
    DELETE("DELETE");

    private final String value;

    OperationType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static OperationType fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (OperationType type : OperationType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown OperationType value: " + value);
    }
}
