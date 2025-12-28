package com.cinema.unitconversion.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 单位换算规则实体
 * 映射到 unit_conversions 表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unit_conversions")
public class UnitConversion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "from_unit", nullable = false, length = 20)
    private String fromUnit;

    @Column(name = "to_unit", nullable = false, length = 20)
    private String toUnit;

    @Column(name = "conversion_rate", nullable = false, precision = 10, scale = 6)
    private BigDecimal conversionRate;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private UnitCategory category;
}
