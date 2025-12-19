package com.cinema.hallstore.dto;

import java.util.List;

/**
 * ActivityTypeListResponse - 活动类型列表响应DTO
 *
 * <p>遵循统一的 API 响应格式规范</p>
 */
public class ActivityTypeListResponse {

    private boolean success = true;
    private List<ActivityTypeDTO> data;
    private Integer total;
    private String message;

    public ActivityTypeListResponse() {
    }

    public ActivityTypeListResponse(List<ActivityTypeDTO> data, Integer total) {
        this.data = data;
        this.total = total;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<ActivityTypeDTO> getData() {
        return data;
    }

    public void setData(List<ActivityTypeDTO> data) {
        this.data = data;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}




