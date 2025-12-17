package com.cinema.hallstore.mapper;

import com.cinema.hallstore.domain.Hall;
import com.cinema.hallstore.dto.HallDTO;

/**
 * Hall ↔ HallDTO 映射：
 * - 保证后端领域模型与前端使用的 Hall 类型字段一一对应
 */
public final class HallMapper {

    private HallMapper() {
    }

    public static HallDTO toDto(Hall hall) {
        if (hall == null) {
            return null;
        }
        HallDTO dto = new HallDTO();
        dto.setId(hall.getId() != null ? hall.getId().toString() : null);
        dto.setStoreId(hall.getStoreId() != null ? hall.getStoreId().toString() : null);
        dto.setCode(hall.getCode());
        dto.setName(hall.getName());
        dto.setType(hall.getType());
        dto.setCapacity(hall.getCapacity());
        dto.setTags(hall.getTags());
        dto.setStatus(hall.getStatus());
        dto.setCreatedAt(hall.getCreatedAt());
        dto.setUpdatedAt(hall.getUpdatedAt());
        return dto;
    }
}


