package com.cinema.reservation.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 修改预约单请求 DTO (B端)
 * <p>
 * 用于 B 端运营人员修改预约单联系人信息时提交的请求数据。
 * 核心字段（场景包、时段、套餐、加购项）不可修改。
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-23
 */
public class UpdateReservationRequest {

    /**
     * 联系人姓名
     */
    @Size(max = 100, message = "联系人姓名不能超过100个字符")
    private String contactName;

    /**
     * 联系人手机号
     */
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String contactPhone;

    /**
     * 备注
     */
    @Size(max = 200, message = "备注不能超过200个字符")
    private String remark;

    // Getters and Setters

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
