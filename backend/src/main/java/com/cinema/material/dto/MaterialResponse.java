/** @spec M001-material-unit-system */
package com.cinema.material.dto;

import com.cinema.material.entity.Material;
import com.cinema.unit.dto.UnitResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MaterialResponse {

    private UUID id;
    private String code;
    private String name;
    private Material.MaterialCategory category;
    private UnitResponse inventoryUnit;
    private UnitResponse purchaseUnit;
    private BigDecimal conversionRate;
    private Boolean useGlobalConversion;
    private String description;
    private String specification;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MaterialResponse fromEntity(Material material) {
        return MaterialResponse.builder()
                .id(material.getId())
                .code(material.getCode())
                .name(material.getName())
                .category(material.getCategory())
                .inventoryUnit(material.getInventoryUnit() != null
                        ? UnitResponse.fromEntity(material.getInventoryUnit())
                        : null)
                .purchaseUnit(material.getPurchaseUnit() != null
                        ? UnitResponse.fromEntity(material.getPurchaseUnit())
                        : null)
                .conversionRate(material.getConversionRate())
                .useGlobalConversion(material.getUseGlobalConversion())
                .description(material.getDescription())
                .specification(material.getSpecification())
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }
}
