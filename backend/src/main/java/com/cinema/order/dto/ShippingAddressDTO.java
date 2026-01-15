/**
 * @spec O001-product-order-list
 * 收货地址数据传输对象
 */
package com.cinema.order.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 收货地址 DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ShippingAddressDTO {
    private String province;
    private String city;
    private String district;
    private String detail;

    public ShippingAddressDTO() {
    }

    public ShippingAddressDTO(String province, String city, String district, String detail) {
        this.province = province;
        this.city = city;
        this.district = district;
        this.detail = detail;
    }

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

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }
}
