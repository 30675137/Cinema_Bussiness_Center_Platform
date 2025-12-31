package com.cinema.beverage.entity;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * 饮品SKU映射表 - 数据迁移时记录旧饮品ID → 新SKU ID的映射关系
 * - 对应 Supabase 中的 beverage_sku_mapping 表
 * - 用于向下兼容和数据追溯
 *
 * 关键设计点：
 * - oldBeverageId: 旧饮品管理表 beverage_config 的 ID（主键）
 * - newSkuId: 迁移后的SKU ID（必须是成品类型）
 * - migrationScriptVersion: 记录迁移脚本版本号，支持回滚
 *
 * @spec O004-beverage-sku-reuse
 */
public class BeverageSkuMapping {

    /** 旧饮品ID（主键），对应表字段 old_beverage_id */
    private UUID oldBeverageId;

    /** 新SKU ID，对应表字段 new_sku_id */
    private UUID newSkuId;

    /** 迁移时间戳，对应表字段 migrated_at */
    private Instant migratedAt;

    /** 迁移脚本版本号，对应表字段 migration_script_version */
    private String migrationScriptVersion;

    /** 映射状态（active/deprecated），对应表字段 status */
    private MappingStatus status;

    /**
     * 映射状态枚举
     */
    public enum MappingStatus {
        /** 激活状态 - 映射有效 */
        ACTIVE("active"),

        /** 已废弃 - 映射不再使用 */
        DEPRECATED("deprecated");

        private final String value;

        MappingStatus(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static MappingStatus fromValue(String value) {
            for (MappingStatus status : values()) {
                if (status.value.equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown status: " + value);
        }
    }

    // 构造函数
    public BeverageSkuMapping() {
        this.status = MappingStatus.ACTIVE;
        this.migratedAt = Instant.now();
    }

    public BeverageSkuMapping(UUID oldBeverageId, UUID newSkuId, String migrationScriptVersion) {
        this();
        this.oldBeverageId = oldBeverageId;
        this.newSkuId = newSkuId;
        this.migrationScriptVersion = migrationScriptVersion;
    }

    // Getters and Setters
    public UUID getOldBeverageId() {
        return oldBeverageId;
    }

    public void setOldBeverageId(UUID oldBeverageId) {
        this.oldBeverageId = oldBeverageId;
    }

    public UUID getNewSkuId() {
        return newSkuId;
    }

    public void setNewSkuId(UUID newSkuId) {
        this.newSkuId = newSkuId;
    }

    public Instant getMigratedAt() {
        return migratedAt;
    }

    public void setMigratedAt(Instant migratedAt) {
        this.migratedAt = migratedAt;
    }

    public String getMigrationScriptVersion() {
        return migrationScriptVersion;
    }

    public void setMigrationScriptVersion(String migrationScriptVersion) {
        this.migrationScriptVersion = migrationScriptVersion;
    }

    public MappingStatus getStatus() {
        return status;
    }

    public void setStatus(MappingStatus status) {
        this.status = status;
    }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BeverageSkuMapping that = (BeverageSkuMapping) o;
        return Objects.equals(oldBeverageId, that.oldBeverageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(oldBeverageId);
    }

    @Override
    public String toString() {
        return "BeverageSkuMapping{" +
                "oldBeverageId=" + oldBeverageId +
                ", newSkuId=" + newSkuId +
                ", migrationScriptVersion='" + migrationScriptVersion + '\'' +
                ", status=" + status +
                ", migratedAt=" + migratedAt +
                '}';
    }

    // 业务方法

    /**
     * 判断映射是否激活
     * @return true 如果状态为 ACTIVE
     */
    public boolean isActive() {
        return this.status == MappingStatus.ACTIVE;
    }

    /**
     * 标记映射为已废弃
     */
    public void deprecate() {
        this.status = MappingStatus.DEPRECATED;
    }

    /**
     * 重新激活映射
     */
    public void activate() {
        this.status = MappingStatus.ACTIVE;
    }

    /**
     * 验证映射数据有效性
     * @return true 如果数据有效
     */
    public boolean isValid() {
        return oldBeverageId != null
                && newSkuId != null
                && migrationScriptVersion != null
                && !migrationScriptVersion.isEmpty();
    }
}
