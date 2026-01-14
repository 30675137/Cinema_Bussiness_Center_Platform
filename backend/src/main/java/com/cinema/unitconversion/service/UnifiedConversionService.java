/** @spec M001-material-unit-system */
package com.cinema.unitconversion.service;

import com.cinema.unitconversion.dto.ConversionRequest;
import com.cinema.unitconversion.dto.ConversionResponse;

/**
 * M001: 统一换算服务接口
 * 
 * 支持物料级换算优先逻辑:
 * 1. 如果提供 materialId 且物料配置了换算率 → 使用物料级换算
 * 2. 如果物料启用 use_global_conversion 或未配置换算率 → 使用全局换算
 * 3. 如果未提供 materialId → 使用纯全局换算
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public interface UnifiedConversionService {
    
    /**
     * 执行单位换算
     * 
     * 换算优先级:
     * - 物料级换算 (material.conversion_rate)
     * - 全局换算 (unit_conversions 表)
     * 
     * @param request 换算请求
     * @return 换算结果,包含换算来源 (source: material/global)
     * @throws IllegalArgumentException 如果物料不存在或找不到换算规则
     */
    ConversionResponse convert(ConversionRequest request);
}
