/**
 * @spec O003-beverage-order
 * 饮品配方实体类
 */
package com.cinema.beverage.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * 饮品配方实体
 *
 * 映射数据库表: beverage_recipes
 * 对应 spec: O003-beverage-order
 *
 * 用途: 定义饮品的配方（BOM），关联原料SKU及用量
 */
@Entity
@Table(name = "beverage_recipes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageRecipe {

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
     * 配方名称
     */
    @NotBlank(message = "配方名称不能为空")
    @Size(max = 100, message = "配方名称长度不能超过100")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 适用规格组合 (JSON格式)
     * 例如: {"SIZE": "LARGE", "TEMPERATURE": "HOT"}
     * null 表示适用所有规格组合
     */
    @Column(name = "applicable_specs", columnDefinition = "TEXT")
    private String applicableSpecs;

    /**
     * 配方描述
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
