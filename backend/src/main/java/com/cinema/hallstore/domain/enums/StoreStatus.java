package com.cinema.hallstore.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 门店状态枚举：
 * - ACTIVE: 正常营业，可用于新建排期/预约等业务场景
 * - INACTIVE: 已停用/关闭，仅保留历史数据用于查询与报表
 * - DISABLED: (兼容旧数据) 已停用
 * 
 * @since 014-hall-store-backend
 * @updated 022-store-crud 添加 INACTIVE 状态
 */
public enum StoreStatus {
    ACTIVE("active"),
    INACTIVE("inactive"),
    DISABLED("disabled");  // 保留兼容旧数据

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
        // 兼容处理：disabled 映射到 inactive
        if ("disabled".equalsIgnoreCase(value)) {
            return INACTIVE;
        }
        throw new IllegalArgumentException("Unknown StoreStatus value: " + value);
    }
    
    /**
     * 判断门店是否可用（启用状态）
     */
    public boolean isActive() {
        return this == ACTIVE;
    }
}



