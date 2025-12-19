package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/**
 * 更新场景包请求 DTO
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
public class UpdatePackageRequest {

    @NotNull(message = "版本锁不能为空")
    private Integer versionLock;

    private String name;
    private String description;
    private String backgroundImageUrl;
    private CreatePackageRequest.RuleRequest rule;
    private List<UUID> hallTypeIds;

    // Getters and Setters

    public Integer getVersionLock() {
        return versionLock;
    }

    public void setVersionLock(Integer versionLock) {
        this.versionLock = versionLock;
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

    public CreatePackageRequest.RuleRequest getRule() {
        return rule;
    }

    public void setRule(CreatePackageRequest.RuleRequest rule) {
        this.rule = rule;
    }

    public List<UUID> getHallTypeIds() {
        return hallTypeIds;
    }

    public void setHallTypeIds(List<UUID> hallTypeIds) {
        this.hallTypeIds = hallTypeIds;
    }
}
