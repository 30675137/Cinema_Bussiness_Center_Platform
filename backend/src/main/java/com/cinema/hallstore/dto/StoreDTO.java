package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.StoreStatus;

import java.time.Instant;

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
}


