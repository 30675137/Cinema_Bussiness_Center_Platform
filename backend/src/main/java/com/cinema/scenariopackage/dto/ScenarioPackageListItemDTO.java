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
     * 图片 URL（已从 backgroundImageUrl 重命名，兼容 C 端前端）
     */
    @NotBlank
    private String image;

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

    /**
     * 场馆位置（如 "耀莱成龙影城（五棵松店）"）
     */
    private String location;

    /**
     * 套餐列表（包含价格信息）
     */
    private List<PackageSummary> packages;

    // Constructors

    public ScenarioPackageListItemDTO() {
    }

    public ScenarioPackageListItemDTO(
            UUID id,
            String title,
            PackageCategory category,
            String image,
            BigDecimal packagePrice,
            BigDecimal rating,
            List<String> tags) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.image = image;
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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<PackageSummary> getPackages() {
        return packages;
    }

    public void setPackages(List<PackageSummary> packages) {
        this.packages = packages;
    }

    @Override
    public String toString() {
        return "ScenarioPackageListItemDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", category=" + category +
                ", packagePrice=" + packagePrice +
                ", rating=" + rating +
                ", location='" + location + '\'' +
                ", tagsCount=" + (tags != null ? tags.size() : 0) +
                ", packagesCount=" + (packages != null ? packages.size() : 0) +
                '}';
    }

    /**
     * 套餐摘要（列表展示用）
     */
    public static class PackageSummary {
        private String id;
        private String name;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private String desc;
        private List<String> tags;

        public PackageSummary() {
        }

        public PackageSummary(String id, String name, BigDecimal price, BigDecimal originalPrice, String desc, List<String> tags) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.originalPrice = originalPrice;
            this.desc = desc;
            this.tags = tags;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public BigDecimal getOriginalPrice() {
            return originalPrice;
        }

        public void setOriginalPrice(BigDecimal originalPrice) {
            this.originalPrice = originalPrice;
        }

        public String getDesc() {
            return desc;
        }

        public void setDesc(String desc) {
            this.desc = desc;
        }

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
        }
    }
}
