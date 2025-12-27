package com.cinema.hallstore.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * 品牌实体类
 */
@Entity
@Table(name = "brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "brand_code", nullable = false, unique = true, length = 50)
    @JsonProperty("brand_code")
    private String brandCode;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "english_name", length = 200)
    @JsonProperty("english_name")
    private String englishName;

    @Column(name = "brand_type", nullable = false, length = 20)
    @JsonProperty("brand_type")
    private String brandType;

    @Column(name = "primary_categories", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @JsonProperty("primary_categories")
    private String[] primaryCategories;

    @Column(name = "company", length = 200)
    private String company;

    @Column(name = "brand_level", length = 20)
    @JsonProperty("brand_level")
    private String brandLevel;

    @Column(name = "tags", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] tags;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "logo_url", columnDefinition = "text")
    @JsonProperty("logo_url")
    private String logoUrl;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    @JsonProperty("updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    @JsonProperty("created_by")
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    @JsonProperty("updated_by")
    private String updatedBy;
}
