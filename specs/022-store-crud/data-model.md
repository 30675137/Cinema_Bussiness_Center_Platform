# Data Model: 门店管理 - 增删改功能

**Feature**: 022-store-crud
**Date**: 2025-12-22
**Dependencies**: 014-hall-store-backend, 020-store-address

## Overview

本文档定义门店管理CRUD功能涉及的数据模型,包括扩展现有Store实体和新增StoreOperationLog审计日志实体。所有实体设计基于research.md中的技术决策。

## Core Entities

### 1. Store (门店) - Extended

**Description**: 影院门店基本信息实体,在014和020基础上扩展status字段和version字段。

**Table Name**: `stores`

**Fields**:

| Field Name | Type | Constraints | Description | Source |
|-----------|------|-------------|-------------|--------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 门店唯一标识 | 014 |
| name | VARCHAR(100) | NOT NULL, UNIQUE (case-insensitive) | 门店名称,去除前后空格后不区分大小写 | 014 |
| region | VARCHAR(50) | NOT NULL | 所属区域(如"华北"、"华东") | 014 |
| city | VARCHAR(50) | NOT NULL | 所属城市(如"北京"、"上海") | 014 |
| province | VARCHAR(50) | NULL | 所属省份(如"北京市"、"上海市") | 020 |
| district | VARCHAR(50) | NULL | 所属区县(如"朝阳区") | 020 |
| address | TEXT | NOT NULL | 详细地址(如"建国路1号") | 020 |
| phone | VARCHAR(20) | NOT NULL, CHECK (regex match) | 联系电话(手机号或座机号) | 020 |
| **status** | **VARCHAR(20)** | **NOT NULL, DEFAULT 'ACTIVE', CHECK (status IN ('ACTIVE', 'INACTIVE'))** | **门店状态(启用/停用)** | **022** |
| **version** | **BIGINT** | **NOT NULL, DEFAULT 0** | **乐观锁版本号,每次更新自动递增** | **022** |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 | 014 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 最后更新时间 | 014 |
| created_by | UUID | NULL | 创建人ID(外键关联users表,如存在) | 014 |
| updated_by | UUID | NULL | 最后修改人ID(外键关联users表,如存在) | 014 |

**Business Rules**:
- 门店名称唯一性检查:去除前后空格后,不区分大小写比较(如"北京朝阳店"和" 北京朝阳店 "视为重复)
- 电话号码格式验证:必须符合手机号(11位,以1开头)或座机号(区号-号码,如010-12345678)格式
- 新创建的门店默认状态为ACTIVE
- 版本号每次UPDATE时由JPA自动递增,用于乐观锁冲突检测

**Relationships**:
- Store 1:N Hall (一个门店有多个影厅,外键在halls.store_id) - 来自014
- Store 1:1 ReservationSettings (一个门店有一个预约设置,外键在reservation_settings.store_id) - 来自016
- Store 1:N StoreOperationLog (一个门店有多个操作日志,外键在store_operation_logs.store_id) - 来自022

**State Transitions**:
```
ACTIVE (启用) <--> INACTIVE (停用)
```
- ACTIVE → INACTIVE: 运营人员点击"停用"按钮,确认后执行
- INACTIVE → ACTIVE: 运营人员点击"启用"按钮,确认后执行
- 停用门店在C端预约页面不可见,但已有预约记录不受影响

---

### 2. StoreOperationLog (门店操作日志) - New

**Description**: 记录门店所有操作的审计日志,包括创建、编辑、状态变更和删除。

**Table Name**: `store_operation_logs`

**Fields**:

| Field Name | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 日志唯一标识 |
| store_id | UUID | NOT NULL, FOREIGN KEY REFERENCES stores(id) ON DELETE CASCADE | 关联的门店ID |
| operation_type | VARCHAR(20) | NOT NULL, CHECK (operation_type IN ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE')) | 操作类型 |
| operator_id | UUID | NULL | 操作人ID(外键关联users表,如存在) |
| operator_name | VARCHAR(100) | NULL | 操作人名称(冗余字段,便于查询) |
| before_value | JSONB | NULL | 修改前的值(JSON格式),仅UPDATE和STATUS_CHANGE有值 |
| after_value | JSONB | NOT NULL | 修改后的值(JSON格式),所有操作类型都有 |
| operation_time | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 操作时间 |
| ip_address | VARCHAR(45) | NULL | 操作IP地址(支持IPv4和IPv6) |
| remark | TEXT | NULL | 备注(如删除原因) |

**Indexes**:
- `idx_store_operation_logs_store_id` ON (store_id): 加速按门店查询操作日志
- `idx_store_operation_logs_operation_time` ON (operation_time DESC): 加速按时间倒序查询(最新操作优先)

**Business Rules**:
- 操作类型枚举值:
  - CREATE: 创建门店,before_value为null,after_value包含新门店完整数据
  - UPDATE: 编辑门店信息,before_value和after_value包含修改前后的完整数据
  - STATUS_CHANGE: 状态变更,before_value和after_value包含修改前后的status字段
  - DELETE: 删除门店,before_value包含删除前的门店数据,after_value为null
- before_value和after_value的JSONB格式示例:
  ```json
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "北京朝阳店",
    "region": "华北",
    "city": "北京",
    "status": "ACTIVE",
    "version": 3
  }
  ```
- ON DELETE CASCADE: 当门店被删除时,相关的操作日志也被删除(保持数据库清洁)

**Relationships**:
- StoreOperationLog N:1 Store (多个操作日志属于一个门店,外键store_id)

---

## Database Schema

### Migration Script

```sql
-- ============================================================
-- Feature 022-store-crud Database Migration
-- ============================================================

-- 1. Extend stores table with status and version fields
ALTER TABLE stores
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
  CHECK (status IN ('ACTIVE', 'INACTIVE')),
ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Create index for status field (for filtering active stores)
CREATE INDEX idx_stores_status ON stores(status);

-- Add comment for new fields
COMMENT ON COLUMN stores.status IS '门店状态: ACTIVE(启用) | INACTIVE(停用)';
COMMENT ON COLUMN stores.version IS '乐观锁版本号,每次UPDATE自动递增';

-- ============================================================

-- 2. Create store_operation_logs table
CREATE TABLE store_operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE')),
  operator_id UUID,
  operator_name VARCHAR(100),
  before_value JSONB,
  after_value JSONB,
  operation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  remark TEXT
);

-- Create indexes
CREATE INDEX idx_store_operation_logs_store_id ON store_operation_logs(store_id);
CREATE INDEX idx_store_operation_logs_operation_time ON store_operation_logs(operation_time DESC);

-- Add table and column comments
COMMENT ON TABLE store_operation_logs IS '门店操作审计日志';
COMMENT ON COLUMN store_operation_logs.operation_type IS '操作类型: CREATE | UPDATE | STATUS_CHANGE | DELETE';
COMMENT ON COLUMN store_operation_logs.before_value IS 'JSON格式的修改前快照(UPDATE/STATUS_CHANGE时有值)';
COMMENT ON COLUMN store_operation_logs.after_value IS 'JSON格式的修改后快照';

-- ============================================================

-- 3. Update existing stores to have default status (if needed)
-- 如果stores表已有数据,确保所有记录都有status和version值
UPDATE stores
SET status = 'ACTIVE', version = 0
WHERE status IS NULL OR version IS NULL;
```

### Rollback Script

```sql
-- ============================================================
-- Feature 022-store-crud Rollback Script
-- ============================================================

-- 1. Drop store_operation_logs table
DROP TABLE IF EXISTS store_operation_logs CASCADE;

-- 2. Remove columns from stores table
ALTER TABLE stores
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS version;

-- 3. Drop indexes
DROP INDEX IF EXISTS idx_stores_status;
```

---

## TypeScript Type Definitions

### Frontend Types

```typescript
// frontend/src/features/store-management/types/store.ts

// Enum for store status
export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Extended Store interface
export interface Store {
  id: string;
  name: string;
  region: string;
  city: string;
  province?: string;
  district?: string;
  address: string;
  phone: string;
  status: StoreStatus;  // New field
  version: number;       // New field for optimistic locking
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// DTO for creating a new store
export interface CreateStoreDTO {
  name: string;
  region: string;
  city: string;
  province?: string;
  district?: string;
  address: string;
  phone: string;
  // status defaults to ACTIVE on server side
}

// DTO for updating an existing store
export interface UpdateStoreDTO {
  name?: string;
  region?: string;
  city?: string;
  province?: string;
  district?: string;
  address?: string;
  phone?: string;
  version: number;  // Required for optimistic locking
}

// DTO for toggling store status
export interface ToggleStatusDTO {
  status: StoreStatus;
}
```

```typescript
// frontend/src/features/store-management/types/operationLog.ts

// Enum for operation types
export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  DELETE = 'DELETE',
}

// StoreOperationLog interface
export interface StoreOperationLog {
  id: string;
  storeId: string;
  operationType: OperationType;
  operatorId?: string;
  operatorName?: string;
  beforeValue?: Record<string, any>;  // JSONB stored as object
  afterValue: Record<string, any>;
  operationTime: string;
  ipAddress?: string;
  remark?: string;
}
```

---

## Java Entity Definitions

### Backend Entities

```java
// backend/src/main/java/com/cinema/entity/Store.java

package com.cinema.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stores")
@Data
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "region", nullable = false, length = 50)
    private String region;

    @Column(name = "city", nullable = false, length = 50)
    private String city;

    @Column(name = "province", length = 50)
    private String province;

    @Column(name = "district", length = 50)
    private String district;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StoreStatus status = StoreStatus.ACTIVE;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

```java
// backend/src/main/java/com/cinema/entity/StoreStatus.java

package com.cinema.entity;

public enum StoreStatus {
    ACTIVE,
    INACTIVE
}
```

```java
// backend/src/main/java/com/cinema/entity/StoreOperationLog.java

package com.cinema.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "store_operation_logs")
@Data
public class StoreOperationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @Column(name = "operator_id")
    private UUID operatorId;

    @Column(name = "operator_name", length = 100)
    private String operatorName;

    @Type(JsonBinaryType.class)
    @Column(name = "before_value", columnDefinition = "jsonb")
    private Map<String, Object> beforeValue;

    @Type(JsonBinaryType.class)
    @Column(name = "after_value", columnDefinition = "jsonb")
    private Map<String, Object> afterValue;

    @Column(name = "operation_time", nullable = false)
    private Instant operationTime = Instant.now();

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
}
```

```java
// backend/src/main/java/com/cinema/entity/OperationType.java

package com.cinema.entity;

public enum OperationType {
    CREATE,
    UPDATE,
    STATUS_CHANGE,
    DELETE
}
```

---

## Validation Rules Summary

| Entity | Field | Validation Rules |
|--------|-------|-----------------|
| Store | name | NOT NULL, UNIQUE (case-insensitive after trim), max 100 chars |
| Store | region | NOT NULL, must be in predefined region list (frontend) |
| Store | city | NOT NULL, must be in predefined city list (frontend) |
| Store | address | NOT NULL |
| Store | phone | NOT NULL, regex: `^(1[3-9]\d{9}|0\d{2,3}-\d{7,8})$` |
| Store | status | NOT NULL, CHECK (ACTIVE or INACTIVE) |
| Store | version | NOT NULL, auto-incremented by JPA |
| StoreOperationLog | store_id | NOT NULL, FOREIGN KEY to stores(id) |
| StoreOperationLog | operation_type | NOT NULL, CHECK (CREATE, UPDATE, STATUS_CHANGE, DELETE) |

---

## Notes

1. **Optimistic Locking**: Store entity使用@Version字段实现乐观锁,每次UPDATE时JPA自动递增version值,并在SQL中添加WHERE version = ?条件,确保基于最新数据修改
2. **JSONB Storage**: StoreOperationLog的before_value和after_value使用JSONB类型存储,PostgreSQL原生支持JSON查询和索引,便于灵活分析历史变更
3. **Cascade Delete**: store_operation_logs使用ON DELETE CASCADE,当门店被删除时自动删除相关日志(保持数据库清洁)
4. **Index Strategy**: status字段建立索引用于过滤查询(如只查询ACTIVE门店),operation_time建立降序索引用于按时间倒序查询最新操作
