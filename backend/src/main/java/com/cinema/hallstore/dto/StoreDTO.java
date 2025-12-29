package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.StoreStatus;

import java.time.Instant;
import java.time.LocalDate;

/**
 * StoreDTO - 门店数据传输对象
 *
 * <p>对外 API 返回的门店结构，与前端 Store 类型及 OpenAPI contracts/api.yaml 保持一致</p>
 *
 * <p>API 返回示例：</p>
 * <pre>
 * {
 *   "id": "uuid-string",          // 门店ID (UUID字符串)
 *   "code": "STORE-001",           // 门店编码
 *   "name": "北京朝阳店",          // 门店名称
 *   "region": "北京",              // 所属区域
 *   "status": "active",            // 门店状态 ('active' | 'disabled')
 *   "createdAt": "2025-12-17T...", // 创建时间 (ISO 8601格式)
 *   "updatedAt": "2025-12-17T..."  // 更新时间 (ISO 8601格式)
 * }
 * </pre>
 *
 * <p>注意事项：</p>
 * <ul>
 *   <li>status 枚举序列化为小写格式 ('active' | 'disabled')</li>
 *   <li>时间字段 Instant 自动序列化为 ISO 8601 格式字符串</li>
 *   <li>字段命名与前端约定保持一致，便于直接使用</li>
 * </ul>
 */
public class StoreDTO {

    /** 门店ID - UUID字符串 */
    private String id;

    /** 门店编码 - 唯一标识，如 "STORE-001" */
    private String code;

    /** 门店名称 */
    private String name;

    /** 所属区域 - 如 "北京"、"上海" */
    private String region;

    /** 门店状态 - 序列化为 'active' | 'disabled' */
    private StoreStatus status;

    /** 创建时间 - 序列化为 ISO 8601 格式 */
    private Instant createdAt;

    /** 更新时间 - 序列化为 ISO 8601 格式 */
    private Instant updatedAt;

    // 020-store-address 新增字段
    /** 省份 - 如 "北京市" */
    private String province;

    /** 城市 - 如 "北京市" */
    private String city;

    /** 区县 - 如 "朝阳区" */
    private String district;

    /** 详细地址 - 如 "xx路xx号xx大厦" */
    private String address;

    /** 联系电话 - 支持手机号、座机、400热线 */
    private String phone;

    /** 版本号 - 用于乐观锁 @since 022-store-crud */
    private Long version;

    // 023-store-cinema-fields 新增字段
    /** 开业时间 */
    private LocalDate openingDate;

    /** 面积(平方米) */
    private Integer area;

    /** 影厅数 */
    private Integer hallCount;

    /** 座位数 */
    private Integer seatCount;

    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    // 022-store-crud 新增 version getter/setter
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

    /**
     * 获取地址摘要（派生字段）
     * 格式："城市 区县"，如 "北京市 朝阳区"
     * 
     * @return 地址摘要字符串，如果城市和区县都为空则返回 null
     */
    public String getAddressSummary() {
        if (city == null && district == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        if (city != null) sb.append(city);
        if (district != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(district);
        }
        return sb.toString();
    }
}



