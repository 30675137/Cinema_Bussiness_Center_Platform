/**
 * @spec N001-purchase-inbound
 * 供应商实体与DTO映射器
 */
package com.cinema.procurement.dto;

import com.cinema.procurement.entity.SupplierEntity;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierDTO toDTO(SupplierEntity entity) {
        if (entity == null) {
            return null;
        }
        return new SupplierDTO(
            entity.getId(),
            entity.getCode(),
            entity.getName(),
            entity.getContactName(),
            entity.getContactPhone(),
            entity.getStatus() != null ? entity.getStatus().name() : null
        );
    }

    public SupplierEntity toEntity(SupplierDTO dto) {
        if (dto == null) {
            return null;
        }
        SupplierEntity entity = new SupplierEntity();
        entity.setId(dto.getId());
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setContactName(dto.getContactName());
        entity.setContactPhone(dto.getContactPhone());
        return entity;
    }
}
