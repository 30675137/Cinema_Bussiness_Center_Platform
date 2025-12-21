package com.cinema.scenariopackage.dto;

import com.cinema.scenariopackage.model.ScenarioPackage.PackageCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * 场景包列表项 DTO（用于C端小程序首页展示）
 * <p>
 * 符合 contracts/api.yaml 中定义的 ScenarioPackageListItem 规范
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-21
 * @see specs/018-hall-reserve-homepage/contracts/api.yaml
 */
public class ScenarioPackageListItemDTO {

    /**
     * 场景包唯一标识符
     */
    @NotNull
    private UUID id;

    /**
     * 场景包标题
     */
    @NotBlank
    @Size(min = 1, max = 255)
    private String title;

    /**
     * 分类枚举（MOVIE, TEAM, PARTY）
     */
    @NotNull
    private PackageCategory category;

    /**
     * 背景图片 URL
     */
    @NotBlank
    private String backgroundImageUrl;

    /**
     * 打包一口价（起价），单位：元
     */
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal packagePrice;

    /**
     * 运营配置的固定评分（0-5分，可选）
     */
    @DecimalMin("0.0")
    @DecimalMax("5.0")
    private BigDecimal rating;

    /**
     * 业务标签（如 ["浪漫", "惊喜", "求婚"]）
     */
    @NotNull
    private List<String> tags;

    // Constructors

    public ScenarioPackageListItemDTO() {
    }

    public ScenarioPackageListItemDTO(
            UUID id,
            String title,
            PackageCategory category,
            String backgroundImageUrl,
            BigDecimal packagePrice,
            BigDecimal rating,
            List<String> tags) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.backgroundImageUrl = backgroundImageUrl;
        this.packagePrice = packagePrice;
        this.rating = rating;
        this.tags = tags;
    }

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public PackageCategory getCategory() {
        return category;
    }

    public void setCategory(PackageCategory category) {
        this.category = category;
    }

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public BigDecimal getPackagePrice() {
        return packagePrice;
    }

    public void setPackagePrice(BigDecimal packagePrice) {
        this.packagePrice = packagePrice;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    @Override
    public String toString() {
        return "ScenarioPackageListItemDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", category=" + category +
                ", packagePrice=" + packagePrice +
                ", rating=" + rating +
                ", tagsCount=" + (tags != null ? tags.size() : 0) +
                '}';
    }
}
