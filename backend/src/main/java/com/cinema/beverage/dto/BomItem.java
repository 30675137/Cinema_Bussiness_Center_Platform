/**
 * @spec O003-beverage-order
 * BOM配料项 DTO
 */
package com.cinema.beverage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * BOM配料项
 *
 * 描述一个饮品配方中的一项原料及其用量
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BomItem {

    /**
     * 原料SKU ID
     */
    private UUID skuId;

    /**
     * 原料名称（冗余字段，便于调试）
     */
    private String materialName;

    /**
     * 用量（单位：基础单位，如 g、ml）
     */
    private Integer quantity;

    /**
     * 单位（g、ml、个等）
     */
    private String unit;

    /**
     * 备注
     */
    private String remarks;
}
