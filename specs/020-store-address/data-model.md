# Data Model: 门店地址信息管理

**Feature**: 020-store-address
**Date**: 2025-12-22

## Entity Definitions

### Store (扩展)

基于 014-hall-store-backend 的 Store 实体扩展，增加地址信息字段。

#### Database Schema (Supabase PostgreSQL)

```sql
-- 现有 stores 表字段
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 020-store-address 新增字段 (Migration V6)
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS province VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50),
ADD COLUMN IF NOT EXISTS district VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- 添加索引以支持按区域筛选
CREATE INDEX IF NOT EXISTS idx_stores_province ON stores(province);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_district ON stores(district);

-- 添加约束：phone 格式校验 (可选，也可在应用层校验)
-- 支持手机号(11位)、座机(带区号)、400热线
ALTER TABLE stores
ADD CONSTRAINT chk_phone_format CHECK (
    phone IS NULL OR
    phone ~ '^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$'
);
```

#### Backend Domain Model (Java)

```java
// Store.java - 扩展字段
public class Store {
    // 现有字段
    private UUID id;
    private String code;
    private String name;
    private String region;      // 保留，向后兼容
    private StoreStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    // 020-store-address 新增字段
    private String province;    // 省份，如 "北京市"
    private String city;        // 城市，如 "北京市" (直辖市时与省份相同)
    private String district;    // 区县，如 "朝阳区"
    private String address;     // 详细地址，如 "xx路xx号xx大厦"
    private String phone;       // 联系电话
}
```

#### Backend DTO (Java)

```java
// StoreDTO.java - 扩展字段
public class StoreDTO {
    // 现有字段
    private String id;
    private String code;
    private String name;
    private String region;
    private StoreStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    // 020-store-address 新增字段
    private String province;
    private String city;
    private String district;
    private String address;
    private String phone;

    // 派生字段 - 地址摘要
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
```

#### Frontend TypeScript (B端)

```typescript
// frontend/src/types/store.ts - 更新 StoreAddress
export interface StoreAddress {
  province: string;         // 省份
  city: string;             // 城市
  district: string;         // 区县
  address?: string;         // 详细地址
  // 移除 street, building, postalCode (简化)
}

// 更新 Store interface
export interface Store {
  id: string;
  code: string;
  name: string;
  region?: string;          // 保留，向后兼容
  province?: string;        // 新增
  city?: string;            // 新增
  district?: string;        // 新增
  address?: string;         // 新增 (详细地址)
  phone?: string;           // 新增
  addressSummary?: string;  // 派生字段
  status: StoreStatus;
  createdAt: string;
  updatedAt: string;
}
```

#### Frontend TypeScript (C端 Taro)

```typescript
// hall-reserve-taro/src/types/store.ts - 新建
export interface Store {
  id: string;
  code: string;
  name: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  addressSummary?: string;
  status: 'active' | 'inactive';
}

// 完整地址格式化
export function formatFullAddress(store: Store): string {
  const parts = [
    store.province,
    store.city,
    store.district,
    store.address
  ].filter(Boolean);
  return parts.join('');
}
```

---

## Validation Rules

### 字段校验

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|----------|
| province | string | 是 | 非空，最大50字符 |
| city | string | 是 | 非空，最大50字符 |
| district | string | 是 | 非空，最大50字符 |
| address | string | 否 | 最大500字符 |
| phone | string | 否 | 符合电话格式正则 |

### 电话格式正则

```regex
^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$
```

支持格式示例:
- 手机号: `13812345678`
- 座机: `010-12345678`, `02187654321`
- 400热线: `400-123-4567`

---

## State Transitions

Store 状态无变化，地址字段不影响状态机。

---

## Data Migration Strategy

### 阶段 1: 添加字段

```sql
-- V6__add_store_address_fields.sql
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS province VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50),
ADD COLUMN IF NOT EXISTS district VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
```

### 阶段 2: 数据迁移 (可选)

如果现有数据的 `region` 字段需要拆分到新字段：

```sql
-- 示例: 将 "北京" 迁移到 province 和 city
UPDATE stores
SET province = region, city = region
WHERE region IS NOT NULL AND province IS NULL;
```

### 阶段 3: 添加索引

```sql
CREATE INDEX IF NOT EXISTS idx_stores_province ON stores(province);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
```

---

## Relationships

```
┌─────────────────────────────────────────────────────────┐
│                        stores                           │
├─────────────────────────────────────────────────────────┤
│ id (PK)       │ UUID                                    │
│ code          │ VARCHAR(50) UNIQUE                      │
│ name          │ VARCHAR(100)                            │
│ region        │ VARCHAR(50)         ← 保留              │
│ province      │ VARCHAR(50)         ← 新增              │
│ city          │ VARCHAR(50)         ← 新增              │
│ district      │ VARCHAR(50)         ← 新增              │
│ address       │ TEXT                ← 新增              │
│ phone         │ VARCHAR(30)         ← 新增              │
│ status        │ VARCHAR(20)                             │
│ created_at    │ TIMESTAMPTZ                             │
│ updated_at    │ TIMESTAMPTZ                             │
└─────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────┐
│                        halls                            │
├─────────────────────────────────────────────────────────┤
│ store_id (FK) │ UUID → stores.id                        │
│ ...           │                                         │
└─────────────────────────────────────────────────────────┘
```

---

## API Response Examples

### GET /api/stores (列表)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-store-1",
      "code": "STORE-001",
      "name": "北京朝阳店",
      "region": "北京",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "address": "建国路88号SOHO现代城",
      "phone": "010-12345678",
      "addressSummary": "北京市 朝阳区",
      "status": "active",
      "createdAt": "2025-12-22T10:00:00Z",
      "updatedAt": "2025-12-22T10:00:00Z"
    }
  ],
  "total": 1
}
```

### GET /api/stores/{id} (详情)

```json
{
  "success": true,
  "data": {
    "id": "uuid-store-1",
    "code": "STORE-001",
    "name": "北京朝阳店",
    "region": "北京",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "address": "建国路88号SOHO现代城",
    "phone": "010-12345678",
    "addressSummary": "北京市 朝阳区",
    "status": "active",
    "createdAt": "2025-12-22T10:00:00Z",
    "updatedAt": "2025-12-22T10:00:00Z"
  }
}
```
