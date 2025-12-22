# Data Model: 门店预约设置管理

**Feature**: 016-store-reservation-settings
**Date**: 2025-12-22
**Database**: Supabase PostgreSQL

## Overview

本文档定义门店预约设置管理功能的数据模型，包括实体定义、字段规范、关系映射、验证规则和数据库schema。所有数据存储在Supabase PostgreSQL数据库中，通过Spring Boot JPA访问。

## Entity Relationship Diagram

```
┌─────────────────┐
│     Store       │
│ (014已存在)     │
├─────────────────┤
│ id (PK)         │
│ name            │
│ region/city     │
│ status          │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1
         │
         │ 1 (One-to-One)
         │
         ▼
┌──────────────────────────┐
│  ReservationSettings     │
├──────────────────────────┤
│ id (PK)                  │
│ store_id (FK, UNIQUE)    │───► references stores(id)
│ time_slots (JSONB)       │    [{dayOfWeek, startTime, endTime}]
│ min_advance_hours        │
│ max_advance_days         │
│ duration_unit            │
│ deposit_required         │
│ deposit_amount           │
│ deposit_percentage       │
│ is_active                │
│ created_by               │
│ updated_by               │
│ created_at               │
│ updated_at               │
└──────────────────────────┘
```

## Core Entities

### 1. Store (门店)

**说明**: 门店实体，由014-hall-store-backend功能定义，本功能仅扩展关联关系。

**表名**: `stores`

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 示例 |
|-------|------|------|------|------|
| id | UUID | PK | 门店唯一标识 | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| name | VARCHAR(255) | NOT NULL | 门店名称 | `北京朝阳影院` |
| region | VARCHAR(100) | - | 所属区域 | `华北` |
| city | VARCHAR(100) | - | 所属城市 | `北京` |
| status | VARCHAR(50) | NOT NULL | 门店状态 | `ACTIVE`, `INACTIVE` |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 | `2025-12-22T10:00:00Z` |
| updated_at | TIMESTAMPTZ | NOT NULL | 更新时间 | `2025-12-22T15:30:00Z` |

**关系**:
- **ReservationSettings**: One-to-One (一个门店对应一个预约设置配置)

**Java Entity**:
```java
@Entity
@Table(name = "stores")
public class Store {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String region;
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StoreStatus status;

    @OneToOne(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private ReservationSettings reservationSettings;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
```

---

### 2. ReservationSettings (预约设置)

**说明**: 门店预约设置实体，存储门店的预约规则配置，包括可预约时间段、提前量、时长单位和押金规则。

**表名**: `reservation_settings`

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 示例 |
|-------|------|------|------|------|
| id | UUID | PK | 设置唯一标识 | `b1ffc99-8d1c-5fg9-cc7e-7cc0ce491b22` |
| store_id | UUID | FK, UNIQUE, NOT NULL | 所属门店ID | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| time_slots | JSONB | NOT NULL, DEFAULT '[]' | 可预约时间段列表 | `[{"dayOfWeek": 1, "startTime": "10:00", "endTime": "22:00"}]` |
| min_advance_hours | INTEGER | NOT NULL, DEFAULT 1, CHECK > 0 | 最小提前小时数 | `2` (至少提前2小时) |
| max_advance_days | INTEGER | NOT NULL, DEFAULT 30, CHECK > min_advance_hours/24 | 最大提前天数 | `30` (最多提前30天) |
| duration_unit | INTEGER | NOT NULL, DEFAULT 1, CHECK IN (1,2,4) | 预约单位时长（小时） | `1`, `2`, `4` |
| deposit_required | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否需要押金 | `true`, `false` |
| deposit_amount | DECIMAL(10,2) | CHECK >= 0 | 押金金额（元） | `200.00` |
| deposit_percentage | INTEGER | CHECK >= 0 AND <= 100 | 押金比例（百分比） | `10` (总价的10%) |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 配置是否生效 | `true` (生效), `false` (门店停用时) |
| created_by | UUID | - | 创建人ID | `user-uuid` |
| updated_by | UUID | - | 最后修改人ID | `user-uuid` |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 | `2025-12-22T10:00:00Z` |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 | `2025-12-22T15:30:00Z` |

**JSONB字段结构 - time_slots**:
```json
[
  {
    "dayOfWeek": 1,        // 1-7 表示周一至周日
    "startTime": "10:00",  // HH:mm 格式
    "endTime": "22:00"     // HH:mm 格式
  },
  {
    "dayOfWeek": 2,
    "startTime": "10:00",
    "endTime": "22:00"
  },
  // ... 最多7条记录（每天一条）
]
```

**业务规则**:
1. **唯一性**: 每个门店（store_id）只能有一个预约设置配置（通过UNIQUE约束保证）
2. **级联删除**: 门店删除时，关联的预约设置自动删除（ON DELETE CASCADE）
3. **默认值**: 新创建门店时自动生成默认配置：
   - 工作日（周一至周五）: 09:00-21:00
   - 周末（周六至周日）: 09:00-21:00
   - 最小提前1小时，最大提前30天
   - 时长单位1小时，无押金
4. **时间段验证**: startTime必须早于endTime（前端Zod验证 + 后端自定义校验器）
5. **提前量验证**: max_advance_days * 24 必须大于 min_advance_hours（数据库CHECK约束）
6. **押金互斥**: deposit_amount和deposit_percentage不能同时设置（应用层验证）
7. **门店停用**: 门店status变为INACTIVE时，is_active设为false；重新启用时恢复为true

**索引**:
- `idx_reservation_settings_store_id`: UNIQUE索引在store_id字段（保证一对一关系）
- `idx_reservation_settings_time_slots`: GIN索引在time_slots字段（加速JSONB查询）

**Java Entity**:
```java
@Entity
@Table(name = "reservation_settings")
public class ReservationSettings {
    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne
    @JoinColumn(name = "store_id", nullable = false, unique = true)
    private Store store;

    @Type(JsonBinaryType.class)
    @Column(name = "time_slots", columnDefinition = "jsonb", nullable = false)
    private List<TimeSlot> timeSlots = new ArrayList<>();

    @Column(name = "min_advance_hours", nullable = false)
    @Min(1)
    private Integer minAdvanceHours = 1;

    @Column(name = "max_advance_days", nullable = false)
    @Min(1)
    private Integer maxAdvanceDays = 30;

    @Column(name = "duration_unit", nullable = false)
    @Pattern(regexp = "^(1|2|4)$")
    private Integer durationUnit = 1;

    @Column(name = "deposit_required", nullable = false)
    private Boolean depositRequired = false;

    @Column(name = "deposit_amount")
    @DecimalMin("0.0")
    private BigDecimal depositAmount;

    @Column(name = "deposit_percentage")
    @Min(0)
    @Max(100)
    private Integer depositPercentage;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;
}
```

---

### 3. TimeSlot (预约时间段 - 嵌套对象)

**说明**: 嵌套在ReservationSettings的time_slots JSONB字段中，表示某一天的可预约时间段。

**非数据库表，仅作为JSONB反序列化对象**

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 示例 |
|-------|------|------|------|------|
| dayOfWeek | Integer | NOT NULL, 1-7 | 星期几 | `1` (周一), `7` (周日) |
| startTime | String | NOT NULL, HH:mm格式 | 开始时间 | `"10:00"` |
| endTime | String | NOT NULL, HH:mm格式 | 结束时间 | `"22:00"` |

**验证规则**:
- dayOfWeek: 必须在1-7范围内
- startTime/endTime: 必须符合HH:mm格式（如"09:00", "21:30"）
- startTime必须早于endTime

**Java Class (DTO)**:
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimeSlot {
    @NotNull
    @Min(1)
    @Max(7)
    private Integer dayOfWeek;

    @NotBlank
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "时间格式必须为HH:mm")
    private String startTime;

    @NotBlank
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "时间格式必须为HH:mm")
    private String endTime;

    @AssertTrue(message = "开始时间必须早于结束时间")
    public boolean isValidTimeRange() {
        return startTime.compareTo(endTime) < 0;
    }
}
```

---

## Database Schema (PostgreSQL DDL)

```sql
-- 扩展UUID生成功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 reservation_settings 表
CREATE TABLE reservation_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL UNIQUE,
    time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_advance_hours INTEGER NOT NULL DEFAULT 1 CHECK (min_advance_hours > 0),
    max_advance_days INTEGER NOT NULL DEFAULT 30 CHECK (max_advance_days > 0),
    duration_unit INTEGER NOT NULL DEFAULT 1 CHECK (duration_unit IN (1, 2, 4)),
    deposit_required BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2) CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
    deposit_percentage INTEGER CHECK (deposit_percentage IS NULL OR (deposit_percentage >= 0 AND deposit_percentage <= 100)),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 外键约束
    CONSTRAINT fk_reservation_settings_store FOREIGN KEY (store_id)
        REFERENCES stores(id) ON DELETE CASCADE,

    -- 业务约束
    CONSTRAINT check_advance_time_range CHECK (max_advance_days * 24 > min_advance_hours)
);

-- 创建索引
CREATE UNIQUE INDEX idx_reservation_settings_store_id ON reservation_settings(store_id);
CREATE INDEX idx_reservation_settings_time_slots ON reservation_settings USING GIN (time_slots);
CREATE INDEX idx_reservation_settings_is_active ON reservation_settings(is_active);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reservation_settings_updated_at
BEFORE UPDATE ON reservation_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 插入默认配置的函数（可选，供应用层调用）
CREATE OR REPLACE FUNCTION create_default_reservation_settings(p_store_id UUID, p_created_by UUID)
RETURNS UUID AS $$
DECLARE
    v_settings_id UUID;
    v_default_time_slots JSONB;
BEGIN
    -- 生成默认时间段（周一至周日 09:00-21:00）
    v_default_time_slots := jsonb_build_array(
        jsonb_build_object('dayOfWeek', 1, 'startTime', '09:00', 'endTime', '21:00'),
        jsonb_build_object('dayOfWeek', 2, 'startTime', '09:00', 'endTime', '21:00'),
        jsonb_build_object('dayOfWeek', 3, 'startTime', '09:00', 'endTime', '21:00'),
        jsonb_build_object('dayOfWeek', 4, 'startTime', '09:00', 'endTime', '21:00'),
        jsonb_build_object('dayOfWeek', 5, 'startTime', '09:00', 'endTime', '21:00'),
        jsonb_build_object('dayOfWeek', 6, 'startTime', '09:00', 'endTime', '21:00'),
        jsonb_build_object('dayOfWeek', 7, 'startTime', '09:00', 'endTime', '21:00')
    );

    INSERT INTO reservation_settings (
        store_id, time_slots, min_advance_hours, max_advance_days,
        duration_unit, deposit_required, is_active, created_by, updated_by
    ) VALUES (
        p_store_id, v_default_time_slots, 1, 30, 1, FALSE, TRUE, p_created_by, p_created_by
    )
    RETURNING id INTO v_settings_id;

    RETURN v_settings_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Validation Rules

### 实体级验证

**ReservationSettings**:
1. **store_id**: 必填，必须引用有效的Store记录
2. **time_slots**: 必填，必须是有效的JSONB数组，长度为7（每天一条）
3. **min_advance_hours**: 必填，必须 > 0
4. **max_advance_days**: 必填，必须 > 0，且 max_advance_days * 24 > min_advance_hours
5. **duration_unit**: 必填，必须为1、2或4
6. **deposit_amount**: 可选，如果填写必须 >= 0
7. **deposit_percentage**: 可选，如果填写必须在0-100之间
8. **deposit_amount和deposit_percentage**: 不能同时设置（应用层验证）

**TimeSlot**:
1. **dayOfWeek**: 必填，必须在1-7范围内
2. **startTime**: 必填，必须符合HH:mm格式
3. **endTime**: 必填，必须符合HH:mm格式
4. **startTime < endTime**: 必须满足

### 业务级验证

1. **唯一性验证**: 每个门店只能有一个预约设置（数据库UNIQUE约束 + 应用层检查）
2. **时间段完整性**: time_slots数组必须包含7条记录（周一至周日）
3. **押金配置一致性**:
   - 如果deposit_required为false，则deposit_amount和deposit_percentage必须为null
   - 如果deposit_required为true，则deposit_amount和deposit_percentage必须至少有一个非null
4. **门店状态联动**:
   - 门店status为INACTIVE时，is_active自动设为false
   - 门店status恢复为ACTIVE时，is_active恢复为true

---

## Data Migration

### 初始化脚本

**文件路径**: `backend/src/main/resources/db/migration/V016_001__create_reservation_settings.sql`

```sql
-- 见上方 Database Schema (PostgreSQL DDL) 部分
```

### 数据迁移策略

**场景1: 新部署**
- 运行DDL脚本创建表和索引
- 对于已存在的门店，批量生成默认配置：
  ```sql
  INSERT INTO reservation_settings (store_id, time_slots, created_by, updated_by)
  SELECT
      s.id,
      '[
        {"dayOfWeek": 1, "startTime": "09:00", "endTime": "21:00"},
        {"dayOfWeek": 2, "startTime": "09:00", "endTime": "21:00"},
        {"dayOfWeek": 3, "startTime": "09:00", "endTime": "21:00"},
        {"dayOfWeek": 4, "startTime": "09:00", "endTime": "21:00"},
        {"dayOfWeek": 5, "startTime": "09:00", "endTime": "21:00"},
        {"dayOfWeek": 6, "startTime": "09:00", "endTime": "21:00"},
        {"dayOfWeek": 7, "startTime": "09:00", "endTime": "21:00"}
      ]'::jsonb,
      '00000000-0000-0000-0000-000000000000', -- 系统用户ID
      '00000000-0000-0000-0000-000000000000'
  FROM stores s
  WHERE NOT EXISTS (
      SELECT 1 FROM reservation_settings rs WHERE rs.store_id = s.id
  );
  ```

**场景2: 已有数据库更新**
- 运行migration脚本（Flyway或Liquibase）
- 应用层在创建新门店时自动调用`create_default_reservation_settings()`函数

---

## TypeScript Type Definitions (Frontend)

```typescript
// types/reservation-settings.ts

export interface TimeSlot {
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export interface ReservationSettings {
  id: string;
  storeId: string;
  timeSlots: TimeSlot[];
  minAdvanceHours: number;
  maxAdvanceDays: number;
  durationUnit: 1 | 2 | 4;
  depositRequired: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ReservationSettingsDTO {
  storeId: string;
  timeSlots: TimeSlot[];
  minAdvanceHours: number;
  maxAdvanceDays: number;
  durationUnit: 1 | 2 | 4;
  depositRequired: boolean;
  depositAmount?: number;
  depositPercentage?: number;
}

// Zod 验证 Schema
import { z } from 'zod';

export const timeSlotSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: '开始时间必须早于结束时间', path: ['endTime'] }
);

export const reservationSettingsDTOSchema = z.object({
  storeId: z.string().uuid(),
  timeSlots: z.array(timeSlotSchema).length(7),
  minAdvanceHours: z.number().int().positive(),
  maxAdvanceDays: z.number().int().positive(),
  durationUnit: z.union([z.literal(1), z.literal(2), z.literal(4)]),
  depositRequired: z.boolean(),
  depositAmount: z.number().nonnegative().optional(),
  depositPercentage: z.number().int().min(0).max(100).optional(),
}).refine(
  (data) => data.maxAdvanceDays * 24 > data.minAdvanceHours,
  { message: '最大提前天数必须大于最小提前小时数', path: ['maxAdvanceDays'] }
).refine(
  (data) => !data.depositRequired || (data.depositAmount != null || data.depositPercentage != null),
  { message: '启用押金时，必须设置押金金额或押金比例', path: ['depositRequired'] }
);
```

---

## Summary

### 核心实体
- **Store**: 门店实体（014已存在）
- **ReservationSettings**: 预约设置实体（新增，一对一关联Store）
- **TimeSlot**: 时间段嵌套对象（存储在ReservationSettings的JSONB字段中）

### 关键设计决策
1. **One-to-One关系**: Store与ReservationSettings通过store_id UNIQUE外键实现一对一关系
2. **JSONB存储**: time_slots使用JSONB字段存储时间段数组，提升读写性能
3. **默认配置**: 新门店自动生成默认预约设置（周一至周日09:00-21:00）
4. **审计字段**: 包含created_by, updated_by, created_at, updated_at满足审计需求
5. **级联删除**: 门店删除时自动删除关联的预约设置

### 数据完整性保障
- 数据库级约束（CHECK, UNIQUE, FK, NOT NULL）
- 应用层验证（Spring Validation + Zod）
- 触发器自动更新updated_at字段
- GIN索引加速JSONB查询
