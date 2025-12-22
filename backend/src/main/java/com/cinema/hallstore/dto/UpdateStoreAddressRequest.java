package com.cinema.hallstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 更新门店地址信息请求 DTO
 *
 * 用于 PUT /api/stores/{id} 接口的请求体
 *
 * @since 020-store-address
 */
public class UpdateStoreAddressRequest {

    /**
     * 省份 - 必填
     */
    @NotBlank(message = "省份不能为空")
    @Size(max = 50, message = "省份长度不能超过50个字符")
    private String province;

    /**
     * 城市 - 必填
     */
    @NotBlank(message = "城市不能为空")
    @Size(max = 50, message = "城市长度不能超过50个字符")
    private String city;

    /**
     * 区县 - 必填
     */
    @NotBlank(message = "区县不能为空")
    @Size(max = 50, message = "区县长度不能超过50个字符")
    private String district;

    /**
     * 详细地址 - 选填
     */
    @Size(max = 500, message = "详细地址长度不能超过500个字符")
    private String address;

    /**
     * 联系电话 - 选填，需符合格式
     * 支持：手机号(11位)、座机(区号+号码)、400热线
     */
    @Pattern(
        regexp = "^$|^(1[3-9]\\d{9})|(0\\d{2,3}-?\\d{7,8})|(400-?\\d{3}-?\\d{4})$",
        message = "电话格式不正确，支持手机号、座机或400热线"
    )
    private String phone;

    // Getters and Setters
    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
