/**
 * @spec N001-purchase-inbound
 * 采购模块门店 DTO
 */
package com.cinema.procurement.dto;

import com.cinema.inventory.entity.StoreEntity;

import java.time.Instant;
import java.util.UUID;

/**
 * 采购模块门店 DTO
 * 用于采购订单创建时选择门店
 */
public class ProcurementStoreDTO {

    private UUID id;
    private String code;
    private String name;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    // 默认构造函数
    public ProcurementStoreDTO() {
    }

    // 从 Entity 转换的静态工厂方法
    public static ProcurementStoreDTO fromEntity(StoreEntity entity) {
        ProcurementStoreDTO dto = new ProcurementStoreDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
