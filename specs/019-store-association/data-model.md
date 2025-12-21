# Data Model: 场景包场馆关联配置

**Feature**: 019-store-association
**Date**: 2025-12-21
**Status**: Design Complete

## 概述

本文档定义场景包与门店关联功能的数据模型，包括数据库表结构、TypeScript 类型定义和 Java DTO。

## 实体关系图

```
┌─────────────────────┐     ┌───────────────────────────────────┐     ┌─────────────────────┐
│  scenario_packages  │     │ scenario_package_store_associations│     │       stores        │
├─────────────────────┤     ├───────────────────────────────────┤     ├─────────────────────┤
│ id (PK)             │◄────│ package_id (FK)                   │     │ id (PK)             │
│ name                │     │ store_id (FK)                     │────►│ code                │
│ description         │     │ id (PK)                           │     │ name                │
│ status              │     │ created_at                        │     │ region              │
│ version_lock        │     │ created_by                        │     │ status              │
│ ...                 │     └───────────────────────────────────┘     │ ...                 │
└─────────────────────┘                                               └─────────────────────┘
        1                              M                    M                    1
```

**关系说明**:
- 一个场景包可以关联多个门店（1:M）
- 一个门店可以被多个场景包关联（1:M）
- 通过中间表 `scenario_package_store_associations` 实现多对多关系

---

## 数据库 Schema

### 新增表: scenario_package_store_associations

```sql
-- Migration: V5__add_store_associations.sql
-- Feature: 019-store-association
-- Date: 2025-12-21

-- 场景包-门店关联表
CREATE TABLE IF NOT EXISTS scenario_package_store_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),

    -- 防止重复关联
    CONSTRAINT unique_package_store UNIQUE(package_id, store_id)
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_pkg_store_package ON scenario_package_store_associations(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_store_store ON scenario_package_store_associations(store_id);

-- 启用 Row Level Security
ALTER TABLE scenario_package_store_associations ENABLE ROW LEVEL SECURITY;

-- RLS 策略（允许所有操作 - 可根据实际需求调整）
CREATE POLICY "Enable all access for scenario_package_store_associations"
    ON scenario_package_store_associations FOR ALL USING (true);

-- 注释
COMMENT ON TABLE scenario_package_store_associations IS '场景包-门店关联表，实现场景包与门店的多对多关系';
COMMENT ON COLUMN scenario_package_store_associations.package_id IS '场景包ID，关联 scenario_packages 表';
COMMENT ON COLUMN scenario_package_store_associations.store_id IS '门店ID，关联 stores 表';
COMMENT ON COLUMN scenario_package_store_associations.created_by IS '创建人（用户ID或用户名）';
```

### 字段说明

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, NOT NULL | 关联记录唯一标识 |
| package_id | UUID | FK, NOT NULL | 场景包ID，级联删除 |
| store_id | UUID | FK, NOT NULL | 门店ID，限制删除 |
| created_at | TIMESTAMPTZ | NOT NULL | 创建时间 |
| created_by | VARCHAR(100) | NULL | 创建人 |

### 外键策略

- **package_id**: `ON DELETE CASCADE` - 场景包删除时，关联记录自动删除
- **store_id**: `ON DELETE RESTRICT` - 门店被关联时，禁止删除门店

---

## TypeScript 类型定义

### 前端类型 (frontend/src/features/scenario-package-management/types/index.ts)

```typescript
// ============================================================
// 门店关联相关类型
// Feature: 019-store-association
// ============================================================

/**
 * 门店摘要信息（用于关联选择展示）
 */
export interface StoreSummary {
  /** 门店唯一标识 */
  id: string;
  /** 门店编码 */
  code: string;
  /** 门店名称 */
  name: string;
  /** 所属区域（可选） */
  region: string | null;
  /** 门店状态 */
  status: 'active' | 'inactive';
}

/**
 * 场景包门店关联记录
 */
export interface ScenarioPackageStoreAssociation {
  /** 关联记录ID */
  id: string;
  /** 场景包ID */
  packageId: string;
  /** 门店ID */
  storeId: string;
  /** 门店信息（查询时关联） */
  store?: StoreSummary;
  /** 创建时间 */
  createdAt: string;
  /** 创建人 */
  createdBy?: string;
}

/**
 * 场景包详情（扩展门店关联）
 * 扩展现有 ScenarioPackageDetail 类型
 */
export interface ScenarioPackageDetailWithStores extends ScenarioPackageDetail {
  /** 关联的门店列表 */
  stores: StoreSummary[];
  /** 关联的门店ID列表（用于表单提交） */
  storeIds: string[];
}

/**
 * 创建/更新场景包请求（扩展门店关联）
 * 扩展现有请求类型
 */
export interface ScenarioPackageRequestWithStores extends ScenarioPackageRequest {
  /** 关联的门店ID列表 */
  storeIds: string[];
}

/**
 * 门店选择器组件 Props
 */
export interface StoreSelectorProps {
  /** 已选中的门店ID列表 */
  value: string[];
  /** 选中状态变化回调 */
  onChange: (storeIds: string[]) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否必填（至少选择一个） */
  required?: boolean;
}
```

### Zod Schema（可选，用于运行时验证）

```typescript
import { z } from 'zod';

/**
 * 门店摘要 Schema
 */
export const StoreSummarySchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  region: z.string().nullable(),
  status: z.enum(['active', 'inactive']),
});

/**
 * 场景包门店关联请求 Schema
 */
export const StoreAssociationRequestSchema = z.object({
  storeIds: z.array(z.string().uuid()).min(1, '请至少选择一个门店'),
});

/**
 * 场景包完整请求 Schema（扩展门店关联）
 */
export const ScenarioPackageRequestWithStoresSchema =
  ScenarioPackageRequestSchema.extend({
    storeIds: z.array(z.string().uuid()).min(1, '请至少选择一个门店'),
  });
```

---

## Java 类型定义

### 实体类 (backend/src/main/java/com/cinema/scenariopackage/model/)

```java
package com.cinema.scenariopackage.model;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * 场景包-门店关联实体
 *
 * 表示场景包与门店的多对多关联关系。
 * 一个场景包可以关联多个门店，一个门店也可以被多个场景包关联。
 *
 * @see ScenarioPackage
 * @see com.cinema.hallstore.domain.Store
 */
public class ScenarioPackageStoreAssociation {

    /** 关联记录唯一标识 */
    private UUID id;

    /** 场景包ID */
    private UUID packageId;

    /** 门店ID */
    private UUID storeId;

    /** 创建时间 */
    private OffsetDateTime createdAt;

    /** 创建人（用户ID或用户名） */
    private String createdBy;

    // ============================================================
    // Constructors
    // ============================================================

    public ScenarioPackageStoreAssociation() {
    }

    public ScenarioPackageStoreAssociation(UUID packageId, UUID storeId, String createdBy) {
        this.packageId = packageId;
        this.storeId = storeId;
        this.createdBy = createdBy;
        this.createdAt = OffsetDateTime.now();
    }

    // ============================================================
    // Getters and Setters
    // ============================================================

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPackageId() {
        return packageId;
    }

    public void setPackageId(UUID packageId) {
        this.packageId = packageId;
    }

    public UUID getStoreId() {
        return storeId;
    }

    public void setStoreId(UUID storeId) {
        this.storeId = storeId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    // ============================================================
    // Object Methods
    // ============================================================

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScenarioPackageStoreAssociation that = (ScenarioPackageStoreAssociation) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ScenarioPackageStoreAssociation{" +
                "id=" + id +
                ", packageId=" + packageId +
                ", storeId=" + storeId +
                ", createdAt=" + createdAt +
                ", createdBy='" + createdBy + '\'' +
                '}';
    }
}
```

### DTO 扩展 (backend/src/main/java/com/cinema/scenariopackage/dto/)

```java
package com.cinema.scenariopackage.dto;

import com.cinema.hallstore.dto.StoreDTO;
import java.util.List;
import java.util.UUID;

/**
 * 场景包详情 DTO（扩展门店关联信息）
 *
 * 在查询场景包详情时返回关联的门店信息。
 */
public class ScenarioPackageDetailDTO extends ScenarioPackageDTO {

    /** 关联的门店列表 */
    private List<StoreDTO> stores;

    /** 关联的门店ID列表 */
    private List<UUID> storeIds;

    // Getters and Setters

    public List<StoreDTO> getStores() {
        return stores;
    }

    public void setStores(List<StoreDTO> stores) {
        this.stores = stores;
    }

    public List<UUID> getStoreIds() {
        return storeIds;
    }

    public void setStoreIds(List<UUID> storeIds) {
        this.storeIds = storeIds;
    }
}
```

```java
package com.cinema.scenariopackage.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

/**
 * 场景包创建/更新请求 DTO（扩展门店关联）
 */
public class ScenarioPackageRequestDTO {

    // ... 现有字段 ...

    /** 关联的门店ID列表（至少一个） */
    @NotEmpty(message = "请至少选择一个门店")
    private List<UUID> storeIds;

    // Getter and Setter

    public List<UUID> getStoreIds() {
        return storeIds;
    }

    public void setStoreIds(List<UUID> storeIds) {
        this.storeIds = storeIds;
    }
}
```

---

## 数据验证规则

### 业务规则

| 规则编号 | 规则描述 | 实现位置 |
|----------|---------|---------|
| V1 | 场景包必须至少关联一个门店 | 前端 Zod + 后端 @NotEmpty |
| V2 | 同一场景包不能重复关联同一门店 | 数据库 UNIQUE 约束 |
| V3 | 关联的门店必须存在且状态为 active | 后端 Service 层校验 |
| V4 | 已关联门店不能直接删除 | 数据库 RESTRICT 约束 |

### 验证流程

```
前端提交
    ↓
Zod Schema 验证（storeIds.length >= 1）
    ↓
API 请求
    ↓
后端 @NotEmpty 验证
    ↓
Service 层验证（门店存在性、状态）
    ↓
数据库约束验证（唯一性）
    ↓
保存成功/返回错误
```

---

## 状态流转

### 场景包状态对门店关联的影响

| 场景包状态 | 门店关联操作 | 说明 |
|-----------|-------------|------|
| DRAFT | 可编辑 | 自由添加/移除门店关联 |
| PUBLISHED | 可编辑（需版本锁） | 修改后版本号+1 |
| UNPUBLISHED | 可编辑 | 同 DRAFT |

### 门店状态对关联的影响

| 门店状态 | 可否新关联 | 已有关联处理 |
|---------|-----------|-------------|
| active | ✅ 可以 | 正常显示 |
| inactive | ❌ 不可以 | 保留关联，UI 显示警告标识 |

---

## 查询场景

### 1. 获取场景包详情（含门店列表）

```sql
-- 查询场景包关联的门店
SELECT
    s.id,
    s.code,
    s.name,
    s.region,
    s.status
FROM stores s
INNER JOIN scenario_package_store_associations spsa
    ON s.id = spsa.store_id
WHERE spsa.package_id = :packageId
ORDER BY s.name;
```

### 2. 检查门店是否被关联（删除前校验）

```sql
SELECT COUNT(*)
FROM scenario_package_store_associations
WHERE store_id = :storeId;
```

### 3. 批量更新场景包门店关联

```sql
-- 事务内执行
BEGIN;

-- 1. 检查版本锁
SELECT version_lock FROM scenario_packages WHERE id = :packageId;

-- 2. 删除旧关联
DELETE FROM scenario_package_store_associations
WHERE package_id = :packageId;

-- 3. 插入新关联
INSERT INTO scenario_package_store_associations (package_id, store_id, created_by)
VALUES
    (:packageId, :storeId1, :createdBy),
    (:packageId, :storeId2, :createdBy),
    ...;

-- 4. 更新版本锁
UPDATE scenario_packages
SET version_lock = version_lock + 1, updated_at = NOW()
WHERE id = :packageId AND version_lock = :expectedVersion;

COMMIT;
```

---

## 索引策略

| 索引名 | 字段 | 类型 | 用途 |
|--------|-----|------|------|
| PRIMARY KEY | id | B-tree | 主键查询 |
| idx_pkg_store_package | package_id | B-tree | 按场景包查询关联 |
| idx_pkg_store_store | store_id | B-tree | 按门店查询关联 |
| unique_package_store | (package_id, store_id) | Unique | 防止重复关联 |

---

## 迁移注意事项

1. **迁移顺序**: 本迁移依赖 `stores` 表和 `scenario_packages` 表，确保它们已存在
2. **回滚策略**: `DROP TABLE IF EXISTS scenario_package_store_associations;`
3. **数据兼容**: 现有场景包初始无门店关联，需在 UI 提示用户配置
