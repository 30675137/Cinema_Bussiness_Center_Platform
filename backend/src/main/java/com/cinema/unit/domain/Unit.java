package com.cinema.unit.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * M001: 单位主数据实体
 * 
 * 用于存储系统所有计量单位,替代前端硬编码的单位列表
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Entity
@Table(name = "units")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit {
    
    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    /**
     * 单位代码 (唯一标识符)
     * 例如: ml, L, g, kg, piece, bottle
     */
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;
    
    /**
     * 单位名称
     * 例如: 毫升, 升, 克, 千克, 个, 瓶
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;
    
    /**
     * 单位分类
     * VOLUME: 体积单位
     * WEIGHT: 重量单位
     * COUNT: 计数单位
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private UnitCategory category;
    
    /**
     * 小数位数
     * 用于格式化数值显示
     * 例如: 体积单位通常为1-2位,计数单位通常为0位
     */
    @Column(name = "decimal_places", nullable = false)
    private Integer decimalPlaces;
    
    /**
     * 是否基础单位
     * 基础单位不可删除 (如 ml, g, piece)
     */
    @Column(name = "is_base_unit", nullable = false)
    private Boolean isBaseUnit;
    
    /**
     * 单位描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
