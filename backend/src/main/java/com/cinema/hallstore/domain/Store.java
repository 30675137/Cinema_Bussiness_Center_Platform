package com.cinema.hallstore.domain;

import com.cinema.hallstore.domain.enums.StoreStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * Store 领域模型，对应 Supabase 中的 stores 表。
 * 
 * @since 014-hall-store-backend
 * @updated 020-store-address 添加地址字段
 * @updated 022-store-crud 添加version字段和createdBy/updatedBy
 */
public class Store {

    private UUID id;
    private String code;
    private String name;
    private String region;
    private StoreStatus status;
    private Long version;  // 022-store-crud: 乐观锁版本号
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;   // 022-store-crud: 创建人ID
    private UUID updatedBy;   // 022-store-crud: 最后修改人ID

    // 020-store-address 新增字段
    private String province;   // 省份，如 "北京市"
    private String city;       // 城市，如 "北京市"
    private String district;   // 区县，如 "朝阳区"
    private String address;    // 详细地址
    private String phone;      // 联系电话

    // 023-store-cinema-fields 新增字段
    private LocalDate openingDate;  // 开业时间
    private Integer area;            // 面积(平方米)
    private Integer hallCount;       // 影厅数
    private Integer seatCount;       // 座位数

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public StoreStatus getStatus() {
        return status;
    }

    public void setStatus(StoreStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // 022-store-crud: version/createdBy/updatedBy getter/setter
    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

    public UUID getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(UUID updatedBy) {
        this.updatedBy = updatedBy;
    }

    // 020-store-address 地址字段 getter/setter
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Store)) return false;
        Store store = (Store) o;
        return Objects.equals(id, store.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}



