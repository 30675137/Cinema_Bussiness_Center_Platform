package com.cinema.hallstore.domain;

import com.cinema.hallstore.domain.enums.SkuStatus;
import com.cinema.hallstore.domain.enums.SkuType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * SKU实体类
 * 支持四种类型: 原料(raw_material)、包材(packaging)、成品(finished_product)、套餐(combo)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "skus")
@EntityListeners(AuditingEntityListener.class)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Sku {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * SKU编码(条码),全局唯一
     */
    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    /**
     * SKU名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /**
     * 关联的SPU ID
     */
    @Column(name = "spu_id", nullable = false)
    private UUID spuId;

    /**
     * SKU类型: RAW_MATERIAL(原料), PACKAGING(包材), FINISHED_PRODUCT(成品), COMBO(套餐)
     * 使用 SkuTypeJpaConverter 自动转换数据库值（如 "finished_product"）到枚举常量
     */
    @Column(name = "sku_type", nullable = false, length = 20)
    private SkuType skuType;

    /**
     * 主单位
     */
    @Column(name = "main_unit", nullable = false, length = 20)
    private String mainUnit;

    /**
     * 门店范围: 空数组表示全门店可用,非空数组表示特定门店ID列表
     */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "store_scope", columnDefinition = "text[]")
    @Builder.Default
    private String[] storeScope = new String[0];

    /**
     * 标准成本(元)
     * - 原料/包材: 手动输入
     * - 成品: 从BOM自动计算
     * - 套餐: 从子项汇总计算
     */
    @Column(name = "standard_cost", precision = 10, scale = 2)
    private BigDecimal standardCost;

    /**
     * 损耗率(%)
     * 仅成品类型有效,范围0-100
     */
    @Column(name = "waste_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal wasteRate = BigDecimal.ZERO;

    /**
     * 零售价(元)
     * 仅成品/套餐类型使用
     */
    @Column(name = "price", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    /**
     * SKU状态: DRAFT(草稿), ENABLED(启用), DISABLED(停用)
     * 使用 SkuStatusJpaConverter 自动转换数据库值到枚举常量
     */
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private SkuStatus status = SkuStatus.DRAFT;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 乐观锁版本号 (@spec P006-fix-sku-edit-data)
     * 用于并发冲突检测，每次更新时自动递增
     */
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    /**
     * 业务规则验证: 原料和包材必须有标准成本
     */
    @JsonIgnore
    public boolean validateStandardCostRequired() {
        if (skuType == SkuType.RAW_MATERIAL || skuType == SkuType.PACKAGING) {
            return standardCost != null && standardCost.compareTo(BigDecimal.ZERO) > 0;
        }
        return true;
    }

    /**
     * 检查是否为全门店可用
     */
    @JsonIgnore
    public boolean isAvailableInAllStores() {
        return storeScope == null || storeScope.length == 0;
    }

    /**
     * 检查指定门店是否在范围内
     */
    @JsonIgnore
    public boolean isAvailableInStore(String storeId) {
        if (isAvailableInAllStores()) {
            return true;
        }
        for (String id : storeScope) {
            if (id.equals(storeId)) {
                return true;
            }
        }
        return false;
    }
}
