/**
 * @spec N003-supplier-edit
 * 供应商更新请求 DTO
 * 注意：不包含 code 字段，编码创建后不可修改
 */
package com.cinema.procurement.dto;

import com.cinema.procurement.entity.SupplierStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SupplierUpdateRequest {

    @NotBlank(message = "供应商名称不能为空")
    @Size(max = 200, message = "供应商名称最大长度为200")
    private String name;

    @Size(max = 100, message = "联系人姓名最大长度为100")
    private String contactName;

    @Pattern(regexp = "^$|^1[3-9]\\d{9}$", message = "请输入正确的手机号")
    private String contactPhone;

    @NotNull(message = "状态不能为空")
    private SupplierStatus status;

    // Getters and Setters

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

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

    public SupplierStatus getStatus() {
        return status;
    }

    public void setStatus(SupplierStatus status) {
        this.status = status;
    }
}
