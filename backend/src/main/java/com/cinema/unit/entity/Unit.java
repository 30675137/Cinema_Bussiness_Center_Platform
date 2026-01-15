/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Unit entity - 单位主数据实体
 *
 * <p>User Story: US1 - 单位主数据管理
 *
 * <p>This entity represents the unit master data, replacing hardcoded unit strings
 * throughout the system.
 */
@Entity
@Table(
        name = "units",
        uniqueConstraints = {@UniqueConstraint(name = "uk_units_code", columnNames = "code")},
        indexes = {
            @Index(name = "idx_units_category", columnList = "category"),
            @Index(name = "idx_units_code", columnList = "code"),
            @Index(name = "idx_units_is_base_unit", columnList = "is_base_unit")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * 单位代码（唯一标识符）
     *
     * <p>Examples: ml, L, g, kg, 瓶, 个
     */
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    /**
     * 单位名称（显示名称）
     *
     * <p>Examples: 毫升, 升, 克, 千克, 瓶, 个
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * 单位分类
     *
     * <p>VOLUME: 体积单位<br>
     * WEIGHT: 重量单位<br>
     * COUNT: 计数单位
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private UnitCategory category;

    /**
     * 小数位数（0-6）
     *
     * <p>用于显示格式控制，如 2 表示保留两位小数
     */
    @Column(name = "decimal_places", nullable = false)
    private Integer decimalPlaces = 2;

    /**
     * 是否为基础单位
     *
     * <p>基础单位是单位换算的基准，如 ml 是体积的基础单位，g 是重量的基础单位
     */
    @Column(name = "is_base_unit", nullable = false)
    private Boolean isBaseUnit = false;

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

    /**
     * Unit category enumeration
     */
    public enum UnitCategory {
        /** 体积单位 (Volume) */
        VOLUME,

        /** 重量单位 (Weight) */
        WEIGHT,

        /** 计数单位 (Count) */
        COUNT
    }
}
