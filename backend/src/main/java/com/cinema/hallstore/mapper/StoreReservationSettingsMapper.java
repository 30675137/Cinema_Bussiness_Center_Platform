package com.cinema.hallstore.mapper;

import com.cinema.hallstore.domain.StoreReservationSettings;
import com.cinema.hallstore.dto.StoreReservationSettingsDTO;

/**
 * StoreReservationSettings ↔ StoreReservationSettingsDTO 映射：
 * - 隔离领域模型与对外传输结构，便于后续演进
 */
public final class StoreReservationSettingsMapper {

    private StoreReservationSettingsMapper() {
    }

    /**
     * 领域模型转DTO
     */
    public static StoreReservationSettingsDTO toDto(StoreReservationSettings settings) {
        if (settings == null) {
            return null;
        }
        StoreReservationSettingsDTO dto = new StoreReservationSettingsDTO();
        dto.setId(settings.getId() != null ? settings.getId().toString() : null);
        dto.setStoreId(settings.getStoreId() != null ? settings.getStoreId().toString() : null);
        dto.setIsReservationEnabled(settings.getIsReservationEnabled());
        dto.setMaxReservationDays(settings.getMaxReservationDays());
        dto.setCreatedAt(settings.getCreatedAt());
        dto.setUpdatedAt(settings.getUpdatedAt());
        dto.setUpdatedBy(settings.getUpdatedBy());
        return dto;
    }
}

