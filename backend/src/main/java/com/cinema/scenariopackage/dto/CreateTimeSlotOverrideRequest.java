package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * 创建时段覆盖请求 DTO
 */
public class CreateTimeSlotOverrideRequest {

    /**
     * 日期 (YYYY-MM-DD 格式)
     */
    @NotBlank(message = "日期不能为空")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "日期格式必须为 YYYY-MM-DD")
    private String date;

    /**
     * 覆盖类型：ADD（新增）、MODIFY（修改）、CANCEL（取消）
     */
    @NotBlank(message = "覆盖类型不能为空")
    @Pattern(regexp = "ADD|MODIFY|CANCEL", message = "覆盖类型必须为 ADD、MODIFY 或 CANCEL")
    private String overrideType;

    /**
     * 开始时间 (HH:mm 格式)，ADD/MODIFY 类型必填
     */
    private String startTime;

    /**
     * 结束时间 (HH:mm 格式)，ADD/MODIFY 类型必填
     */
    private String endTime;

    /**
     * 可预约容量
     */
    private Integer capacity;

    /**
     * 覆盖原因/备注
     */
    private String reason;

    // Getters and Setters

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getOverrideType() {
        return overrideType;
    }

    public void setOverrideType(String overrideType) {
        this.overrideType = overrideType;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
