# Data Model: 活动类型管理

**Feature**: 016-activity-type  
**Date**: 2025-12-18

## Database Schema

### Table: `activity_types`

活动类型表，存储所有活动类型配置。

```sql
CREATE TABLE activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'ENABLED' CHECK (status IN ('ENABLED', 'DISABLED', 'DELETED')),
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- 索引
CREATE INDEX idx_activity_types_status ON activity_types(status);
CREATE INDEX idx_activity_types_sort ON activity_types(sort);
CREATE INDEX idx_activity_types_name ON activity_types(name);

-- 唯一约束（名称）
CREATE UNIQUE INDEX idx_activity_types_name_unique ON activity_types(name) WHERE status != 'DELETED';

-- 触发器：自动更新 updated_at
CREATE TRIGGER trigger_update_activity_types_updated_at
  BEFORE UPDATE ON activity_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 Row Level Security (RLS)
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;

-- RLS 策略（允许所有操作 - 可根据实际需求调整）
CREATE POLICY "Enable all access for activity_types" ON activity_types FOR ALL USING (true);
```

### Field Descriptions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | 活动类型ID |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE (非已删除状态) | 活动类型名称（如"企业团建"、"订婚"、"生日Party"） |
| `description` | VARCHAR(500) | NULLABLE | 活动类型描述，可选 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ENABLED', CHECK | 状态：ENABLED（启用）、DISABLED（停用）、DELETED（已删除） |
| `sort` | INTEGER | NOT NULL, DEFAULT 0 | 排序号，用于控制显示顺序 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 最后更新时间 |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | 删除时间（软删除时记录），可选 |
| `created_by` | VARCHAR(255) | NULLABLE | 创建人（如果支持用户追踪），可选 |
| `updated_by` | VARCHAR(255) | NULLABLE | 更新人（如果支持用户追踪），可选 |

### Validation Rules

1. **`name` 唯一性**: 在非已删除状态下，名称必须唯一
   - 使用部分唯一索引：`CREATE UNIQUE INDEX ... WHERE status != 'DELETED'`
   - 允许已删除的活动类型名称可以重新使用

2. **`status` 枚举值**: 只能是 'ENABLED', 'DISABLED', 'DELETED' 之一
   - 默认值为 'ENABLED'
   - 软删除时设置为 'DELETED'

3. **`sort` 排序号**: 用于控制显示顺序
   - 允许重复，但建议唯一以便精确控制
   - 排序时：`ORDER BY sort ASC, created_at ASC`

4. **软删除**: 删除时将 `status` 设置为 'DELETED'，记录 `deleted_at`（可选）
   - 查询时自动过滤 `status != 'DELETED'`
   - 历史预约记录仍可通过 ID 关联查询

## Backend Domain Model

### Entity: `ActivityType`

```java
package com.cinema.hallstore.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * ActivityType 领域模型
 * 
 * <p>表示一种预约活动类型，如"企业团建"、"订婚"、"生日Party"等。</p>
 * <p>对应 Supabase 中的 activity_types 表。</p>
 */
public class ActivityType {

    private UUID id;
    private String name;
    private String description;
    private ActivityTypeStatus status = ActivityTypeStatus.ENABLED;
    private Integer sort = 0;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant deletedAt;
    private String createdBy;
    private String updatedBy;

    // Constructors, getters, setters, equals, hashCode
}
```

### Enum: `ActivityTypeStatus`

```java
package com.cinema.hallstore.domain.enums;

/**
 * 活动类型状态枚举
 */
public enum ActivityTypeStatus {
    ENABLED("启用"),
    DISABLED("停用"),
    DELETED("已删除");

    private final String displayName;

    ActivityTypeStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static ActivityTypeStatus fromValue(String value) {
        for (ActivityTypeStatus status : ActivityTypeStatus.values()) {
            if (status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown ActivityTypeStatus value: " + value);
    }
}
```

### DTO: `ActivityTypeDTO`

```java
package com.cinema.hallstore.dto;

import com.cinema.hallstore.domain.enums.ActivityTypeStatus;
import java.time.Instant;
import java.util.UUID;

/**
 * 活动类型DTO，用于API响应
 */
public class ActivityTypeDTO {
    private UUID id;
    private String name;
    private String description;
    private ActivityTypeStatus status;
    private Integer sort;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    // Constructors, getters, setters
}
```

### Request DTOs

#### `CreateActivityTypeRequest`

```java
package com.cinema.hallstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 创建活动类型请求DTO
 */
public class CreateActivityTypeRequest {
    @NotBlank(message = "活动类型名称不能为空")
    @Size(max = 100, message = "活动类型名称长度不能超过100个字符")
    private String name;

    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;

    @NotNull(message = "排序号不能为空")
    private Integer sort;

    // Constructors, getters, setters
}
```

#### `UpdateActivityTypeRequest`

```java
package com.cinema.hallstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 更新活动类型请求DTO
 */
public class UpdateActivityTypeRequest {
    @NotBlank(message = "活动类型名称不能为空")
    @Size(max = 100, message = "活动类型名称长度不能超过100个字符")
    private String name;

    @Size(max = 500, message = "描述长度不能超过500个字符")
    private String description;

    @NotNull(message = "排序号不能为空")
    private Integer sort;

    // Constructors, getters, setters
}
```

#### `ActivityTypeListResponse`

```java
package com.cinema.hallstore.dto;

import java.util.List;

/**
 * 活动类型列表响应DTO
 */
public class ActivityTypeListResponse {
    private boolean success = true;
    private List<ActivityTypeDTO> data;
    private Integer total;
    private String message;

    // Constructors, getters, setters
}
```

## Frontend Type Definitions

### TypeScript Interfaces

```typescript
// activity-type.types.ts

export enum ActivityTypeStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED'
}

export interface ActivityType {
  id: string;                    // UUID as string
  name: string;                  // 活动类型名称
  description: string | null;    // 描述，可选
  status: ActivityTypeStatus;    // 状态
  sort: number;                  // 排序号
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  deletedAt?: string | null;     // 删除时间，可选
  createdBy?: string | null;     // 创建人，可选
  updatedBy?: string | null;     // 更新人，可选
}

export interface CreateActivityTypePayload {
  name: string;
  description?: string | null;
  sort: number;
}

export interface UpdateActivityTypePayload {
  name: string;
  description?: string | null;
  sort: number;
}

export interface ActivityTypeListResponse {
  success: boolean;
  data: ActivityType[];
  total: number;
  message?: string;
}

export interface ActivityTypeQueryParams {
  status?: ActivityTypeStatus;   // 过滤状态（运营后台使用）
}
```

### Zod Schema

```typescript
// activity-type.schema.ts

import { z } from 'zod';

export const createActivityTypeSchema = z.object({
  name: z.string()
    .min(1, '活动类型名称不能为空')
    .max(100, '活动类型名称长度不能超过100个字符'),
  description: z.string()
    .max(500, '描述长度不能超过500个字符')
    .nullable()
    .optional(),
  sort: z.number()
    .int('排序号必须是整数')
    .min(0, '排序号不能小于0')
});

export const updateActivityTypeSchema = createActivityTypeSchema;

export type CreateActivityTypeInput = z.infer<typeof createActivityTypeSchema>;
export type UpdateActivityTypeInput = z.infer<typeof updateActivityTypeSchema>;
```

## Relationships

### 与预约记录的关系

- **预约记录 (Reservation)**: 通过 `activity_type_id` 外键关联 `activity_types.id`
- **关系类型**: 多对一（多个预约记录可以关联同一个活动类型）
- **级联删除**: 不允许物理删除，软删除不影响历史预约记录
- **历史数据**: 即使活动类型被删除（status='DELETED'），历史预约记录仍可通过ID查询到活动类型信息

## State Transitions

### 活动类型状态流转

```
[新建] → ENABLED (默认状态)
ENABLED → DISABLED (停用操作)
DISABLED → ENABLED (启用操作)
ENABLED → DELETED (删除操作)
DISABLED → DELETED (删除操作)
DELETED → (不可恢复，永久删除状态)
```

### 业务规则

1. **新建活动类型**: 默认状态为 `ENABLED`
2. **启用/停用**: 只能在 `ENABLED` 和 `DISABLED` 之间切换
3. **删除**: 将状态设置为 `DELETED`，不可恢复
4. **查询过滤**: 
   - 运营后台列表：显示 `ENABLED` 和 `DISABLED`，不显示 `DELETED`
   - 小程序端列表：仅显示 `ENABLED`

