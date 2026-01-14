package com.cinema.unit.domain;

/**
 * M001: 单位分类枚举
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
public enum UnitCategory {
    /**
     * 体积单位 (如: ml, L, bottle, cup)
     */
    VOLUME,
    
    /**
     * 重量单位 (如: g, kg)
     */
    WEIGHT,
    
    /**
     * 计数单位 (如: piece, box, serving, bag, pack)
     */
    COUNT
}
