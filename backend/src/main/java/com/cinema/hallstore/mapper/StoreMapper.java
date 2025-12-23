package com.cinema.hallstore.mapper;

import com.cinema.hallstore.domain.Store;
import com.cinema.hallstore.dto.StoreDTO;

/**
 * Store ↔ StoreDTO 映射：
 * - 隔离领域模型与对外传输结构，便于后续演进
 * @updated 020-store-address 添加地址字段映射
 */
public final class StoreMapper {

    private StoreMapper() {
    }

    public static StoreDTO toDto(Store store) {
        if (store == null) {
            return null;
        }
        StoreDTO dto = new StoreDTO();
        dto.setId(store.getId() != null ? store.getId().toString() : null);
        dto.setCode(store.getCode());
        dto.setName(store.getName());
        dto.setRegion(store.getRegion());
        dto.setStatus(store.getStatus());
        dto.setCreatedAt(store.getCreatedAt());
        dto.setUpdatedAt(store.getUpdatedAt());
        // 020-store-address 地址字段映射
        dto.setProvince(store.getProvince());
        dto.setCity(store.getCity());
        dto.setDistrict(store.getDistrict());
        dto.setAddress(store.getAddress());
        dto.setPhone(store.getPhone());
        // 022-store-crud 版本号字段映射
        dto.setVersion(store.getVersion());
        // 023-store-cinema-fields 影城字段映射
        dto.setOpeningDate(store.getOpeningDate());
        dto.setArea(store.getArea());
        dto.setHallCount(store.getHallCount());
        dto.setSeatCount(store.getSeatCount());
        return dto;
    }
}



