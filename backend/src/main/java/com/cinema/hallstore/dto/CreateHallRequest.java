package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 创建影厅请求 DTO
 */
public class CreateHallRequest {

    @NotNull(message = "门店ID不能为空")
    private String storeId;

    private String code;

    @NotBlank(message = "影厅名称不能为空")
    private String name;

    @NotNull(message = "影厅类型不能为空")
    private HallType type;

    @NotNull(message = "容量不能为空")
    @Min(value = 1, message = "容量必须大于0")
    @Max(value = 1000, message = "容量不能超过1000")
    private Integer capacity;

    private List<String> tags;

    private HallStatus status;

    public String getStoreId() {
        return storeId;
    }

    public void setStoreId(String storeId) {
        this.storeId = storeId;
    }

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
