package com.cinema.unit.dto;

import com.cinema.unit.domain.UnitCategory;
import lombok.Data;

/**
 * M001: 单位创建/更新请求 DTO
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Data
public class UnitRequest {
    
    /**
     * 单位代码 (必填, 唯一)
     */
    private String code;
    
    /**
     * 单位名称 (必填)
     */
    private String name;
    
    /**
     * 单位分类 (必填)
     */
    private UnitCategory category;
    
    /**
     * 小数位数 (必填, 默认2)
     */
    private Integer decimalPlaces = 2;
    
    /**
     * 是否基础单位 (必填, 默认false)
     */
    private Boolean isBaseUnit = false;
    
    /**
     * 描述 (可选)
     */
    private String description;
}
