package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * 创建时段模板请求
 */
public class CreateTimeSlotTemplateRequest {

    @NotNull(message = "星期几不能为空")
    @Min(value = 0, message = "dayOfWeek必须在0-6之间")
    @Max(value = 6, message = "dayOfWeek必须在0-6之间")
    private Integer dayOfWeek;

    @NotNull(message = "开始时间不能为空")
    private String startTime;  // HH:mm 格式

    @NotNull(message = "结束时间不能为空")
    private String endTime;    // HH:mm 格式

    private Integer capacity;

    private Map<String, Object> priceAdjustment;

    private Boolean isEnabled = true;

    // Getters and Setters
    public Integer getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(Integer dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Map<String, Object> getPriceAdjustment() { return priceAdjustment; }
    public void setPriceAdjustment(Map<String, Object> priceAdjustment) { this.priceAdjustment = priceAdjustment; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
}
