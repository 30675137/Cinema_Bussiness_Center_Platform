/**
 * @spec O003-beverage-order
 * 饮品规格实体类
 */
package com.cinema.beverage.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 饮品规格实体
 *
 * 映射数据库表: beverage_specs
 * 对应 spec: O003-beverage-order
 *
 * 用途: 定义饮品的可选规格（如大小、温度、甜度、配料等）及其价格调整
 */
@Entity
@Table(name = "beverage_specs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageSpec {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "uuid")
    private UUID id;

    /**
     * 饮品ID (外键)
     */
    @NotNull(message = "饮品ID不能为空")
    @Column(name = "beverage_id", nullable = false, columnDefinition = "uuid")
    private UUID beverageId;

    /**
     * 规格类型
     */
    @NotNull(message = "规格类型不能为空")
    @Enumerated(EnumType.STRING)
    @Column(name = "spec_type", nullable = false, length = 50)
    private SpecType specType;

    /**
     * 规格名称
     */
    @NotBlank(message = "规格名称不能为空")
    @Size(max = 50, message = "规格名称长度不能超过50")
    @Column(name = "spec_name", nullable = false, length = 50)
    private String specName;

    /**
     * 价格调整 (单位: 元, 可为负数)
     * 例如: 大杯 +3.00, 去糖 0.00, 少冰 0.00
     */
    @NotNull(message = "价格调整不能为空")
    @Column(name = "price_adjustment", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAdjustment;

    /**
     * 排序顺序
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /**
     * 是否为默认选项
     * 同一类型下只能有一个默认选项
     */
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    /**
     * 规格类型枚举
     */
    public enum SpecType {
        /** 容量大小 (小杯、中杯、大杯、超大杯) */
        SIZE,
        /** 温度 (冷、热、常温、去冰) */
        TEMPERATURE,
        /** 甜度 (无糖、三分糖、五分糖、七分糖、全糖) */
        SWEETNESS,
        /** 配料/加料 (珍珠、椰果、布丁、芝士奶盖等) */
        TOPPING
    }
}
