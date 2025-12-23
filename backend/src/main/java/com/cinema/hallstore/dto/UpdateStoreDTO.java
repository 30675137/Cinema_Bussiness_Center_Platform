package com.cinema.hallstore.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * DTO for updating an existing store
 * All fields are optional except version (required for optimistic locking)
 * 
 * @since 022-store-crud
 */
public class UpdateStoreDTO {

    @Size(max = 100, message = "门店名称不能超过100字符")
    private String name;

    @Size(max = 50, message = "区域不能超过50字符")
    private String region;

    @Size(max = 50, message = "城市不能超过50字符")
    private String city;

    @Size(max = 50, message = "省份不能超过50字符")
    private String province;

    @Size(max = 50, message = "区县不能超过50字符")
    private String district;

    private String address;

    @Pattern(
        regexp = "^(1[3-9]\\d{9}|0\\d{2,3}-\\d{7,8})$",
        message = "请输入有效的电话号码(手机号11位或座机号如010-12345678)"
    )
    private String phone;

    @NotNull(message = "version字段必填，用于乐观锁检查")
    private Long version;

    // 023-store-cinema-fields 新增字段
    /** 开业时间 */
    private LocalDate openingDate;

    /** 面积(平方米) */
    @Positive(message = "面积必须为正数")
    private Integer area;

    /** 影厅数 */
    @Positive(message = "影厅数必须为正整数")
    private Integer hallCount;

    /** 座位数 */
    @Positive(message = "座位数必须为正整数")
    private Integer seatCount;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
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

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    // 023-store-cinema-fields getter/setter
    public LocalDate getOpeningDate() {
        return openingDate;
    }

    public void setOpeningDate(LocalDate openingDate) {
        this.openingDate = openingDate;
    }

    public Integer getArea() {
        return area;
    }

    public void setArea(Integer area) {
        this.area = area;
    }

    public Integer getHallCount() {
        return hallCount;
    }

    public void setHallCount(Integer hallCount) {
        this.hallCount = hallCount;
    }

    public Integer getSeatCount() {
        return seatCount;
    }

    public void setSeatCount(Integer seatCount) {
        this.seatCount = seatCount;
    }
}
