package com.cinema.material.dto;

import com.cinema.material.domain.MaterialCategory;
import com.cinema.unit.dto.UnitResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * M001: 物料响应 DTO
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialResponse {
    
    private UUID id;
    private String code;
    private String name;
    private MaterialCategory category;
    private UnitResponse inventoryUnit;
    private UnitResponse purchaseUnit;
    private BigDecimal conversionRate;
    private Boolean useGlobalConversion;
    private String specification;
    private String description;
    private BigDecimal standardCost;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    /**
     * 从实体转换为响应DTO
     */
    public static MaterialResponse fromEntity(com.cinema.material.entity.Material material) {
        if (material == null) {
            return null;
        }
        return MaterialResponse.builder()
                .id(material.getId())
                .code(material.getCode())
                .name(material.getName())
                .category(material.getCategory())
                .inventoryUnit(UnitResponse.fromEntity(material.getInventoryUnit()))
                .purchaseUnit(UnitResponse.fromEntity(material.getPurchaseUnit()))
                .conversionRate(material.getConversionRate())
                .useGlobalConversion(material.getUseGlobalConversion())
                .specification(material.getSpecification())
                .description(material.getDescription())
                .standardCost(material.getStandardCost())
                .status(material.getStatus())
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .createdBy(material.getCreatedBy())
                .updatedBy(material.getUpdatedBy())
                .build();
    }
}
