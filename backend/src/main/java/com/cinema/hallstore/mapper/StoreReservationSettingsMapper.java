package com.cinema.hallstore.mapper;

import com.cinema.hallstore.domain.StoreReservationSettings;
import com.cinema.hallstore.dto.StoreReservationSettingsDTO;
import com.cinema.hallstore.dto.UpdateStoreReservationSettingsRequest;

import java.util.List;
import java.util.stream.Collectors;

/**
 * StoreReservationSettings ↔ StoreReservationSettingsDTO 映射：
 * - 隔离领域模型与对外传输结构，便于后续演进
 * 
 * @since 015-store-reservation-settings
 * @updated 016-store-reservation-settings 添加新字段映射
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

        // 016-store-reservation-settings 新增字段
        dto.setTimeSlots(toTimeSlotDtos(settings.getTimeSlots()));
        dto.setMinAdvanceHours(settings.getMinAdvanceHours());
        dto.setDurationUnit(settings.getDurationUnit());
        dto.setDepositRequired(settings.getDepositRequired());
        dto.setDepositAmount(settings.getDepositAmount());
        dto.setDepositPercentage(settings.getDepositPercentage());
        dto.setIsActive(settings.getIsActive());

        return dto;
    }

    /**
     * 时间段领域模型列表转DTO列表
     */
    private static List<StoreReservationSettingsDTO.TimeSlotDTO> toTimeSlotDtos(
            List<StoreReservationSettings.TimeSlot> timeSlots) {
        if (timeSlots == null) {
            return null;
        }
        return timeSlots.stream()
                .map(slot -> new StoreReservationSettingsDTO.TimeSlotDTO(
                        slot.getDayOfWeek(),
                        slot.getStartTime(),
                        slot.getEndTime()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 请求时间段列表转领域模型列表
     */
    public static List<StoreReservationSettings.TimeSlot> toTimeSlotDomains(
            List<UpdateStoreReservationSettingsRequest.TimeSlotRequest> timeSlots) {
        if (timeSlots == null) {
            return null;
        }
        return timeSlots.stream()
                .map(req -> new StoreReservationSettings.TimeSlot(
                        req.getDayOfWeek(),
                        req.getStartTime(),
                        req.getEndTime()
                ))
                .collect(Collectors.toList());
    }
}
