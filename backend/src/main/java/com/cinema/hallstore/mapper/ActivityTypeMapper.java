package com.cinema.hallstore.mapper;

import com.cinema.hallstore.domain.ActivityType;
import com.cinema.hallstore.dto.ActivityTypeDTO;

/**
 * ActivityType ↔ ActivityTypeDTO 映射：
 * - 隔离领域模型与对外传输结构，便于后续演进
 */
public final class ActivityTypeMapper {

    private ActivityTypeMapper() {
    }

    /**
     * 领域模型转DTO
     */
    public static ActivityTypeDTO toDto(ActivityType activityType) {
        if (activityType == null) {
            return null;
        }
        ActivityTypeDTO dto = new ActivityTypeDTO();
        dto.setId(activityType.getId() != null ? activityType.getId().toString() : null);
        dto.setName(activityType.getName());
        dto.setDescription(activityType.getDescription());
        dto.setBusinessCategory(activityType.getBusinessCategory());
        dto.setBackgroundImageUrl(activityType.getBackgroundImageUrl());
        dto.setStatus(activityType.getStatus());
        dto.setSort(activityType.getSort());
        dto.setCreatedAt(activityType.getCreatedAt());
        dto.setUpdatedAt(activityType.getUpdatedAt());
        dto.setDeletedAt(activityType.getDeletedAt());
        dto.setCreatedBy(activityType.getCreatedBy());
        dto.setUpdatedBy(activityType.getUpdatedBy());
        return dto;
    }
}

