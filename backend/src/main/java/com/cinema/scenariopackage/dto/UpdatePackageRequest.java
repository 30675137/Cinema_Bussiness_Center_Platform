package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

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
    private String image;
    private CreatePackageRequest.RuleRequest rule;
    // 开发阶段使用字符串类型，后续改为 List<UUID>
    private List<String> hallTypeIds;

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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public CreatePackageRequest.RuleRequest getRule() {
        return rule;
    }

    public void setRule(CreatePackageRequest.RuleRequest rule) {
        this.rule = rule;
    }

    public List<String> getHallTypeIds() {
        return hallTypeIds;
    }

    public void setHallTypeIds(List<String> hallTypeIds) {
        this.hallTypeIds = hallTypeIds;
    }
}
