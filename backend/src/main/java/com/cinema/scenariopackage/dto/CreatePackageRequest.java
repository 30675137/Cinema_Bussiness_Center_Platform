package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * 创建场景包请求 DTO
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class CreatePackageRequest {

    @NotBlank(message = "场景包名称不能为空")
    @Size(max = 255, message = "场景包名称长度不能超过255个字符")
    private String name;

    private String description;

    private String image;

    @NotNull(message = "使用规则不能为空")
    private RuleRequest rule;

    // 开发阶段暂时可选，使用字符串类型以支持开发测试
    // 后续有真实影厅数据后改为 List<UUID> 并添加 @NotEmpty 验证
    private List<String> hallTypeIds;

    // Nested DTO
    public static class RuleRequest {
        @NotNull(message = "时长不能为空")
        @DecimalMin(value = "0.1", message = "时长必须大于0")
        private BigDecimal durationHours;

        @Min(value = 0, message = "最小人数不能为负数")
        private Integer minPeople;

        @Min(value = 0, message = "最大人数不能为负数")
        private Integer maxPeople;

        public BigDecimal getDurationHours() {
            return durationHours;
        }

        public void setDurationHours(BigDecimal durationHours) {
            this.durationHours = durationHours;
        }

        public Integer getMinPeople() {
            return minPeople;
        }

        public void setMinPeople(Integer minPeople) {
            this.minPeople = minPeople;
        }

        public Integer getMaxPeople() {
            return maxPeople;
        }

        public void setMaxPeople(Integer maxPeople) {
            this.maxPeople = maxPeople;
        }
    }

    // Getters and Setters

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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public RuleRequest getRule() {
        return rule;
    }

    public void setRule(RuleRequest rule) {
        this.rule = rule;
    }

    public List<String> getHallTypeIds() {
        return hallTypeIds;
    }

    public void setHallTypeIds(List<String> hallTypeIds) {
        this.hallTypeIds = hallTypeIds;
    }
}
