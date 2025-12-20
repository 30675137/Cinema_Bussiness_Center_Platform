package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;

import java.time.Instant;
import java.util.List;

/**
 * HallDTO - 影厅数据传输对象
 *
 * <p>对外 API 返回的影厅结构，与前端 Hall 类型字段保持一致</p>
 *
 * <p>前端类型定义（frontend/src/pages/schedule/types/schedule.types.ts）：</p>
 * <pre>
 * export interface Hall {
 *   id: string;                    // 对应 HallDTO.id (UUID字符串)
 *   name: string;                  // 对应 HallDTO.name
 *   capacity: number;              // 对应 HallDTO.capacity
 *   type: HallType;                // 对应 HallDTO.type ('VIP' | 'Public' | 'CP' | 'Party')
 *   tags: string[];                // 对应 HallDTO.tags
 *   operatingHours?: {...};        // 可选字段，暂未实现
 *   status: HallStatus;            // 对应 HallDTO.status ('active' | 'inactive' | 'maintenance')
 *   createdAt: string;             // 对应 HallDTO.createdAt (ISO 8601格式)
 *   updatedAt: string;             // 对应 HallDTO.updatedAt (ISO 8601格式)
 * }
 * </pre>
 *
 * <p>注意事项：</p>
 * <ul>
 *   <li>storeId 和 code 是后端内部使用字段，前端可忽略或选择性使用</li>
 *   <li>operatingHours 字段暂未实现，未来可扩展</li>
 *   <li>枚举值序列化为前端期望格式（HallType: "VIP"/"Public"/"CP"/"Party", HallStatus: "active"/"inactive"/"maintenance"）</li>
 *   <li>时间字段 Instant 自动序列化为 ISO 8601 格式字符串</li>
 * </ul>
 */
public class HallDTO {

    /** 影厅ID - 对应前端 Hall.id (UUID字符串) */
    private String id;

    /** 门店ID - 后端内部字段，前端可忽略 */
    private String storeId;

    /** 影厅编码 - 后端内部字段，前端可忽略 */
    private String code;

    /** 影厅名称 - 对应前端 Hall.name */
    private String name;

    /** 影厅类型 - 对应前端 Hall.type，序列化为 'VIP' | 'Public' | 'CP' | 'Party' */
    private HallType type;

    /** 容量 - 对应前端 Hall.capacity */
    private int capacity;

    /** 标签列表 - 对应前端 Hall.tags */
    private List<String> tags;

    /** 影厅状态 - 对应前端 Hall.status，序列化为 'active' | 'inactive' | 'maintenance' */
    private HallStatus status;

    /** 创建时间 - 对应前端 Hall.createdAt，序列化为 ISO 8601 格式 */
    private Instant createdAt;

    /** 更新时间 - 对应前端 Hall.updatedAt，序列化为 ISO 8601 格式 */
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
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



