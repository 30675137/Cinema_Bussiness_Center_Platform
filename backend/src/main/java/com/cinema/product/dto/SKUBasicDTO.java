package com.cinema.product.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * @spec P006-fix-sku-edit-data
 * SKU基本信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class SKUBasicDTO {
    private UUID id;
    private String code;
    private String name;
    private BigDecimal price;
    private Integer stockQuantity;
    private String status;
    private UUID spuId;
    private Long version;  // 乐观锁版本号
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
