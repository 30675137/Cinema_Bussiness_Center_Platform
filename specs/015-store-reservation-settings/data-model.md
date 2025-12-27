# Data Model: 门店预约设置

**Feature**: 015-store-reservation-settings  
**Date**: 2025-12-17

## Database Schema

### Table: `store_reservation_settings`

门店预约设置表，与 `stores` 表建立一对一关系。

```sql
CREATE TABLE store_reservation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES stores(id) ON DELETE CASCADE,
  is_reservation_enabled BOOLEAN NOT NULL DEFAULT false,
  max_reservation_days INTEGER NOT NULL DEFAULT 0 CHECK (max_reservation_days >= 0 AND max_reservation_days <= 365),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(255) -- 如果支持用户追踪，记录最后更新人
);

-- 索引
CREATE INDEX idx_store_reservation_settings_store_id ON store_reservation_settings(store_id);
CREATE INDEX idx_store_reservation_settings_enabled ON store_reservation_settings(is_reservation_enabled);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_store_reservation_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_store_reservation_settings_updated_at
  BEFORE UPDATE ON store_reservation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_reservation_settings_updated_at();
```

### Field Descriptions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | 预约设置记录ID |
| `store_id` | UUID | NOT NULL, UNIQUE, FK → stores(id) | 门店ID，一对一关系 |
| `is_reservation_enabled` | BOOLEAN | NOT NULL, DEFAULT false | 是否开放预约 |
| `max_reservation_days` | INTEGER | NOT NULL, DEFAULT 0, CHECK (0-365) | 可预约天数（未来N天） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 最后更新时间 |
| `updated_by` | VARCHAR(255) | NULLABLE | 最后更新人（如果支持审计） |

### Validation Rules

1. **`max_reservation_days` 范围**: 0-365 天
   - 当 `is_reservation_enabled=false` 时，可以为 0
   - 当 `is_reservation_enabled=true` 时，必须 > 0 且 <= 365

2. **`store_id` 唯一性**: 每个门店只能有一个预约设置记录

3. **级联删除**: 当门店被删除时，对应的预约设置自动删除（`ON DELETE CASCADE`）

## Backend Domain Model

### Entity: `StoreReservationSettings`

```java
package com.cinema.hallstore.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "store_reservation_settings")
public class StoreReservationSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @OneToOne
    @JoinColumn(name = "store_id", unique = true, nullable = false)
    private Store store;
    
    @Column(name = "is_reservation_enabled", nullable = false)
    private Boolean isReservationEnabled = false;
    
    @Column(name = "max_reservation_days", nullable = false)
    private Integer maxReservationDays = 0;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    // Constructors, getters, setters
}
```

### DTO: `StoreReservationSettingsDTO`

```java
package com.cinema.hallstore.dto;

import java.time.Instant;

public class StoreReservationSettingsDTO {
    private String id;                    // UUID as string
    private String storeId;                // UUID as string
    private Boolean isReservationEnabled;  // 是否开放预约
    private Integer maxReservationDays;    // 可预约天数
    private Instant createdAt;            // 创建时间
    private Instant updatedAt;            // 更新时间
    private String updatedBy;             // 最后更新人（可选）
    
    // Getters and setters
}
```

### Request DTO: `UpdateStoreReservationSettingsRequest`

```java
package com.cinema.hallstore.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateStoreReservationSettingsRequest {
    @NotNull(message = "是否开放预约不能为空")
    private Boolean isReservationEnabled;
    
    @Min(value = 1, message = "可预约天数必须大于0")
    @Max(value = 365, message = "可预约天数不能超过365")
    private Integer maxReservationDays;
    
    // Custom validation: if enabled, maxReservationDays must be > 0
    // 通过 @AssertTrue 或自定义 Validator 实现
    
    // Getters and setters
}
```

### Request DTO: `BatchUpdateStoreReservationSettingsRequest`

```java
package com.cinema.hallstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public class BatchUpdateStoreReservationSettingsRequest {
    @NotEmpty(message = "门店ID列表不能为空")
    private List<UUID> storeIds;
    
    @Valid
    @NotNull
    private UpdateStoreReservationSettingsRequest settings;
    
    // Getters and setters
}
```

### Response DTO: `BatchUpdateResult`

```java
package com.cinema.hallstore.dto;

import java.util.List;

public class BatchUpdateResult {
    private Integer successCount;      // 成功更新的门店数量
    private Integer failureCount;      // 失败的门店数量
    private List<FailureDetail> failures; // 失败详情列表
    
    public static class FailureDetail {
        private String storeId;        // 门店ID
        private String error;         // 错误类型
        private String message;       // 错误消息
    }
}
```

## Frontend Type Definitions

### Type: `StoreReservationSettings`

```typescript
export interface StoreReservationSettings {
  id: string;                    // UUID as string
  storeId: string;               // UUID as string
  isReservationEnabled: boolean; // 是否开放预约
  maxReservationDays: number;    // 可预约天数 (1-365)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  updatedBy?: string;            // 最后更新人（可选）
}
```

### Type: `UpdateStoreReservationSettingsRequest`

```typescript
export interface UpdateStoreReservationSettingsRequest {
  isReservationEnabled: boolean;
  maxReservationDays: number; // 1-365 when enabled, 0 when disabled
}
```

### Type: `BatchUpdateStoreReservationSettingsRequest`

```typescript
export interface BatchUpdateStoreReservationSettingsRequest {
  storeIds: string[]; // Array of store UUIDs
  settings: UpdateStoreReservationSettingsRequest;
}
```

### Type: `BatchUpdateResult`

```typescript
export interface BatchUpdateResult {
  successCount: number;
  failureCount: number;
  failures: Array<{
    storeId: string;
    error: string;
    message: string;
  }>;
}
```

## Relationships

### StoreReservationSettings ↔ Store (One-to-One)

- **Direction**: `StoreReservationSettings` → `Store` (Many-to-One via `store_id`)
- **Cardinality**: 1:1 (每个门店只有一个预约设置)
- **Cascade**: `ON DELETE CASCADE` (门店删除时，预约设置自动删除)
- **Optional**: No (每个门店必须有预约设置，新建门店时自动创建)

## Data Validation

### Backend Validation (Bean Validation)

```java
@NotNull
private Boolean isReservationEnabled;

@Min(1)
@Max(365)
private Integer maxReservationDays;

// Custom validator: if isReservationEnabled=true, maxReservationDays must be > 0
@AssertTrue(message = "开启预约时必须设置可预约天数")
private boolean isValidMaxReservationDays() {
    if (isReservationEnabled == null) return true;
    if (!isReservationEnabled) return true; // Disabled, maxReservationDays can be 0
    return maxReservationDays != null && maxReservationDays > 0;
}
```

### Frontend Validation (Zod Schema)

```typescript
import { z } from 'zod';

export const reservationSettingsSchema = z.object({
  isReservationEnabled: z.boolean(),
  maxReservationDays: z.number().int().min(0).max(365),
}).refine(data => {
  if (data.isReservationEnabled && (!data.maxReservationDays || data.maxReservationDays <= 0)) {
    return false;
  }
  return true;
}, {
  message: "开启预约时必须设置可预约天数（1-365天）",
  path: ["maxReservationDays"],
});
```

## Default Values

- **新建门店时**: 自动创建预约设置记录，使用默认值：
  - `is_reservation_enabled = false`
  - `max_reservation_days = 0`
- **查询不存在的预约设置**: 返回默认值（不推荐，应确保每个门店都有记录）

## Indexes

- `idx_store_reservation_settings_store_id`: 加速按门店ID查询
- `idx_store_reservation_settings_enabled`: 加速按预约状态筛选

## Notes

- 预约设置与门店主数据解耦，便于独立管理和扩展
- 支持软删除场景：如果门店被软删除，预约设置可以保留但标记为无效
- `updated_by` 字段为可选，如果系统支持用户追踪则使用，否则为 null

