package com.cinema.scenariopackage.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * 场景包实体
 * <p>
 * 场景包的核心实体，存储基本信息和版本管理元数据
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Entity
@Table(name = "scenario_packages")
public class ScenarioPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    /**
     * 基础包 ID（版本分组）
     * 指向原始包的 ID，所有版本共享同一个 base_package_id
     */
    @Column(name = "base_package_id")
    private UUID basePackageId;

    /**
     * 版本号（从 1 开始递增）
     */
    @Column(nullable = false)
    private Integer version = 1;

    /**
     * 场景包名称
     */
    @Column(nullable = false, length = 255)
    private String name;

    /**
     * 描述信息
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 背景图片 URL（Supabase Storage 公开链接）
     */
    @Column(name = "background_image_url", columnDefinition = "TEXT")
    private String backgroundImageUrl;

    /**
     * 状态：DRAFT（草稿）, PUBLISHED（已发布）, UNPUBLISHED（已下架）
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PackageStatus status = PackageStatus.DRAFT;

    /**
     * 是否为最新版本（查询优化标记）
     */
    @Column(name = "is_latest", nullable = false)
    private Boolean isLatest = true;

    /**
     * 乐观锁版本号（用于防止并发冲突）
     */
    @Version
    @Column(name = "version_lock", nullable = false)
    private Integer versionLock = 0;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * 软删除时间戳
     */
    @Column(name = "deleted_at")
    private Instant deletedAt;

    /**
     * 创建人
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;

    /**
     * 分类（用于C端小程序首页分组）
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PackageCategory category;

    /**
     * 固定评分（0-5分，运营配置）
     */
    @Column(precision = 3, scale = 2)
    private java.math.BigDecimal rating;

    /**
     * 业务标签（JSONB存储）
     */
    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private java.util.List<String> tags;

    // Lifecycle callbacks

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getBasePackageId() {
        return basePackageId;
    }

    public void setBasePackageId(UUID basePackageId) {
        this.basePackageId = basePackageId;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public PackageStatus getStatus() {
        return status;
    }

    public void setStatus(PackageStatus status) {
        this.status = status;
    }

    public Boolean getIsLatest() {
        return isLatest;
    }

    public void setIsLatest(Boolean isLatest) {
        this.isLatest = isLatest;
    }

    public Integer getVersionLock() {
        return versionLock;
    }

    public void setVersionLock(Integer versionLock) {
        this.versionLock = versionLock;
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

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public PackageCategory getCategory() {
        return category;
    }

    public void setCategory(PackageCategory category) {
        this.category = category;
    }

    public java.math.BigDecimal getRating() {
        return rating;
    }

    public void setRating(java.math.BigDecimal rating) {
        this.rating = rating;
    }

    public java.util.List<String> getTags() {
        return tags;
    }

    public void setTags(java.util.List<String> tags) {
        this.tags = tags;
    }

    @Override
    public String toString() {
        return "ScenarioPackage{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", version=" + version +
                ", status=" + status +
                ", isLatest=" + isLatest +
                ", versionLock=" + versionLock +
                '}';
    }

    /**
     * 场景包状态枚举
     */
    public enum PackageStatus {
        /** 草稿 */
        DRAFT,
        /** 已发布 */
        PUBLISHED,
        /** 已下架 */
        UNPUBLISHED
    }

    /**
     * 场景包分类枚举（用于C端小程序首页分组）
     */
    public enum PackageCategory {
        /** 私人订制（观影类） */
        MOVIE,
        /** 商务团建 */
        TEAM,
        /** 派对策划 */
        PARTY
    }
}
