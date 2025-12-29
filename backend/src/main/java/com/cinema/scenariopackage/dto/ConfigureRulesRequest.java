package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * 配置规则请求 DTO
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
public class ConfigureRulesRequest {

  /**
   * 包场时长（小时），必须大于0
   */
  @NotNull(message = "包场时长不能为空")
  @DecimalMin(value = "0.5", message = "包场时长至少0.5小时")
  private BigDecimal durationHours;

  /**
   * 最小人数
   */
  @NotNull(message = "最小人数不能为空")
  @Min(value = 1, message = "最小人数至少为1")
  private Integer minPeople;

  /**
   * 最大人数
   */
  @NotNull(message = "最大人数不能为空")
  @Min(value = 1, message = "最大人数至少为1")
  private Integer maxPeople;

  /**
   * 乐观锁版本号（用于并发控制）
   */
  @NotNull(message = "版本号不能为空")
  private Integer versionLock;

  // Getters and Setters

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

  public Integer getVersionLock() {
    return versionLock;
  }

  public void setVersionLock(Integer versionLock) {
    this.versionLock = versionLock;
  }
}
