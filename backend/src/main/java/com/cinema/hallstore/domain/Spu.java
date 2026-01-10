package com.cinema.hallstore.domain;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * SPU实体类
 * SPU (Standard Product Unit) 标准产品单元
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "spus")
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Spu {

    /**
     * 主键ID
     */
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * SPU编码，全局唯一
     */
    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    /**
     * SPU名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /**
     * SPU简称
     */
    @Column(name = "short_name", length = 100)
    private String shortName;

    /**
     * SPU描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 类目ID
     */
    @Column(name = "category_id", length = 100)
    private String categoryId;

    /**
     * 类目名称（冗余，便于查询）
     */
    @Column(name = "category_name", length = 200)
    private String categoryName;

    /**
     * 品牌ID
     */
    @Column(name = "brand_id", length = 100)
    private String brandId;

    /**
     * 品牌名称（冗余，便于查询）
     */
    @Column(name = "brand_name", length = 100)
    private String brandName;

    /**
     * SPU状态: draft-草稿, active-启用, inactive-停用, archived-归档
     */
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "draft";

    /**
     * 基本单位
     */
    @Column(name = "unit", length = 20)
    private String unit;

    /**
     * 标签数组
     */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;

    /**
     * 图片列表JSON
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "images", columnDefinition = "jsonb")
    private JsonNode images;

    /**
     * 规格列表JSON
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specifications", columnDefinition = "jsonb")
    private JsonNode specifications;

    /**
     * 属性列表JSON
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attributes", columnDefinition = "jsonb")
    private JsonNode attributes;

    /**
     * 创建时间
     */
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /**
     * 创建人
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;

    /**
     * 更新人
     */
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
}
