/**
 * @spec O003-beverage-order
 * 配方原料关联实体 (T085)
 */
package com.cinema.beverage.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * 配方原料关联实体
 *
 * 映射表: recipe_ingredients
 * 职责: 定义饮品配方所需的原料（SKU）及用量
 */
@Entity
@Table(name = "recipe_ingredients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredient {

    /**
     * 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    /**
     * 关联的配方 ID
     */
    @Column(name = "recipe_id", nullable = false)
    private UUID recipeId;

    /**
     * 关联的 SKU ID (原料)
     */
    @Column(name = "sku_id", nullable = false)
    private UUID skuId;

    /**
     * 原料用量（支持小数）
     */
    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    /**
     * 用量单位: g(克), ml(毫升), piece(个)
     */
    @Column(nullable = false, length = 20)
    private String unit;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * 自动设置创建时间
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
