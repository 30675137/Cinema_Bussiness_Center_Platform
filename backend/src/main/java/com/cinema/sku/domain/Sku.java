package com.cinema.sku.domain;

import com.cinema.sku.domain.enums.SkuStatus;
import com.cinema.sku.domain.enums.SkuType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * SKU 领域模型（库存保持单位）
 * - 对应 Supabase 中的 skus 表
 * - 支持四种SKU类型：原料、包材、成品、套餐
 *
 * 关键设计点：
 * - 使用 UUID 作为主键
 * - 通过 spuId 建立与 SPU（标准产品单元）的关系
 * - storeScope 为空数组表示全门店可用
 * - 原料/包材的 standardCost 手动输入，成品/套餐自动计算
 * - wasteRate 仅成品类型有效
 */
public class Sku {

    /** SKU主键，对应表字段 id */
    private UUID id;

    /** SKU编码，全局唯一，格式: SKU######，对应表字段 code */
    private String code;

    /** SKU名称，对应表字段 name */
    private String name;

    /** 关联SPU主键，对应表字段 spu_id */
    private UUID spuId;

    /** SKU类型，对应表字段 sku_type */
    private SkuType skuType;

    /** 主库存单位（ml、个、克等），对应表字段 main_unit */
    private String mainUnit;

    /** 门店范围，空数组=全门店，非空=特定门店列表，对应表字段 store_scope */
    private List<String> storeScope;

    /** 标准成本（元），对应表字段 standard_cost */
    private BigDecimal standardCost;

    /** 损耗率（%），仅成品类型有效，范围0-100，对应表字段 waste_rate */
    private BigDecimal wasteRate;

    /** SKU状态（draft/enabled/disabled），对应表字段 status */
    private SkuStatus status;

    /** 创建时间戳，对应表字段 created_at */
    private Instant createdAt;

    /** 更新时间戳，对应表字段 updated_at */
    private Instant updatedAt;

    // 构造函数
    public Sku() {
        this.storeScope = List.of(); // 默认全门店
        this.wasteRate = BigDecimal.ZERO; // 默认0%损耗率
        this.status = SkuStatus.DRAFT; // 默认草稿状态
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getSpuId() {
        return spuId;
    }

    public void setSpuId(UUID spuId) {
        this.spuId = spuId;
    }

    public SkuType getSkuType() {
        return skuType;
    }

    public void setSkuType(SkuType skuType) {
        this.skuType = skuType;
    }

    public String getMainUnit() {
        return mainUnit;
    }

    public void setMainUnit(String mainUnit) {
        this.mainUnit = mainUnit;
    }

    public List<String> getStoreScope() {
        return storeScope;
    }

    public void setStoreScope(List<String> storeScope) {
        this.storeScope = storeScope != null ? storeScope : List.of();
    }

    public BigDecimal getStandardCost() {
        return standardCost;
    }

    public void setStandardCost(BigDecimal standardCost) {
        this.standardCost = standardCost;
    }

    public BigDecimal getWasteRate() {
        return wasteRate;
    }

    public void setWasteRate(BigDecimal wasteRate) {
        this.wasteRate = wasteRate != null ? wasteRate : BigDecimal.ZERO;
    }

    public SkuStatus getStatus() {
        return status;
    }

    public void setStatus(SkuStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Sku sku = (Sku) o;
        return Objects.equals(id, sku.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Sku{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", skuType=" + skuType +
                ", mainUnit='" + mainUnit + '\'' +
                ", standardCost=" + standardCost +
                ", status=" + status +
                '}';
    }

    // 业务方法

    /**
     * 判断SKU是否可用于BOM或销售订单
     * @return true 如果状态为 ENABLED
     */
    public boolean isUsable() {
        return this.status == SkuStatus.ENABLED;
    }

    /**
     * 判断是否为全门店可用
     * @return true 如果 storeScope 为空
     */
    public boolean isAllStoresAvailable() {
        return this.storeScope == null || this.storeScope.isEmpty();
    }

    /**
     * 判断指定门店是否在范围内
     * @param storeId 门店ID
     * @return true 如果全门店可用或门店在范围内
     */
    public boolean isAvailableInStore(String storeId) {
        if (isAllStoresAvailable()) {
            return true;
        }
        return this.storeScope.contains(storeId);
    }

    /**
     * 判断是否需要配置BOM
     * @return true 如果是成品类型
     */
    public boolean requiresBom() {
        return this.skuType == SkuType.FINISHED_PRODUCT;
    }

    /**
     * 判断是否需要配置套餐子项
     * @return true 如果是套餐类型
     */
    public boolean requiresComboItems() {
        return this.skuType == SkuType.COMBO;
    }

    /**
     * 判断是否可以作为BOM组件
     * @return true 如果是原料或包材类型
     */
    public boolean canBeUsedAsComponent() {
        return this.skuType == SkuType.RAW_MATERIAL || this.skuType == SkuType.PACKAGING;
    }

    /**
     * 判断是否可以作为套餐子项
     * @return true 如果不是套餐类型（避免嵌套套餐）
     */
    public boolean canBeUsedAsComboItem() {
        return this.skuType != SkuType.COMBO;
    }
}
