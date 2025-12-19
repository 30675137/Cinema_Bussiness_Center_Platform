package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

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

    private String backgroundImageUrl;

    @NotNull(message = "使用规则不能为空")
    private RuleRequest rule;

    @NotEmpty(message = "至少需要选择一个影厅类型")
    private List<UUID> hallTypeIds;

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

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public RuleRequest getRule() {
        return rule;
    }

    public void setRule(RuleRequest rule) {
        this.rule = rule;
    }

    public List<UUID> getHallTypeIds() {
        return hallTypeIds;
    }

    public void setHallTypeIds(List<UUID> hallTypeIds) {
        this.hallTypeIds = hallTypeIds;
    }
}
