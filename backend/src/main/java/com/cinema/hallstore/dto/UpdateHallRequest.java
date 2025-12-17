package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

/**
 * 更新影厅请求 DTO
 */
public class UpdateHallRequest {

    private String code;

    private String name;

    private HallType type;

    @Min(value = 1, message = "容量必须大于0")
    @Max(value = 1000, message = "容量不能超过1000")
    private Integer capacity;

    private List<String> tags;

    private HallStatus status;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public HallType getType() {
        return type;
    }

    public void setType(HallType type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public HallStatus getStatus() {
        return status;
    }

    public void setStatus(HallStatus status) {
        this.status = status;
    }
}
