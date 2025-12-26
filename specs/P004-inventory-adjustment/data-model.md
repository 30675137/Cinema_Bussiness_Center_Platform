# Data Model: 库存调整管理 (P004-inventory-adjustment)

**Date**: 2025-12-26
**Status**: Draft
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

本数据模型定义库存调整管理功能所需的数据库表结构，基于 Supabase PostgreSQL 实现。设计原则：
1. **复用现有结构**：扩展 P003 定义的 `store_inventory` 和 `inventory_transactions` 表
2. **审批流程解耦**：独立的审批记录表，便于扩展多级审批
3. **原因标准化**：预置原因字典表，支持后续扩展

## Entity Relationship Diagram

```
┌─────────────────────────────────┐
│         adjustment_reasons      │
│  (调整原因字典)                  │
├─────────────────────────────────┤
│ PK id: uuid                     │
│    code: varchar(50)            │
│    name: varchar(100)           │
│    category: enum               │
│    is_active: boolean           │
│    sort_order: integer          │
└─────────────────────────────────┘
              │
              │ 1:N (reason_code)
              ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│      inventory_adjustments      │◄───────▶│       approval_records          │
│  (库存调整单)                    │  1:N    │  (审批记录)                      │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ PK id: uuid                     │         │ PK id: uuid                     │
│ FK sku_id: uuid                 │         │ FK adjustment_id: uuid          │
│ FK store_id: uuid               │         │    approver_id: uuid            │
│    adjustment_type: enum        │         │    approver_name: varchar(100)  │
│    quantity: integer            │         │    action: enum                 │
│    unit_price: decimal          │         │    status_before: enum          │
│    adjustment_amount: decimal   │         │    status_after: enum           │
│ FK reason_code: varchar(50)     │         │    comments: text               │
│    reason_text: varchar(500)    │         │    action_time: timestamptz     │
│    remarks: varchar(500)        │         │    created_at: timestamptz      │
│    status: enum                 │         └─────────────────────────────────┘
│    stock_before: integer        │
│    stock_after: integer         │
│    available_before: integer    │
│    available_after: integer     │
│    requires_approval: boolean   │
│    operator_id: uuid            │
│    created_at: timestamptz      │
│    updated_at: timestamptz      │
│    version: integer             │
└─────────────────────────────────┘
              │
              │ 生成 (on approved)
              ▼
┌─────────────────────────────────┐
│     inventory_transactions      │
│  (库存流水 - P003已定义)          │
├─────────────────────────────────┤
│ PK id: uuid                     │
│ FK sku_id: uuid                 │
│ FK store_id: uuid               │
│    transaction_type: enum       │
│    quantity: integer            │
│    stock_before: integer        │
│    stock_after: integer         │
│    source_type: enum            │
│ FK source_id: uuid (adjustment) │
│    operator_id: uuid            │
│    remarks: varchar(500)        │
│    created_at: timestamptz      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        store_inventory          │
│  (门店库存 - P003已定义)          │
├─────────────────────────────────┤
│ PK id: uuid                     │
│ FK sku_id: uuid                 │
│ FK store_id: uuid               │
│    on_hand_qty: integer         │
│    available_qty: integer       │
│    reserved_qty: integer        │
│    safety_stock: integer        │  ← 安全库存阈值（可编辑）
│    min_stock: integer           │
│    max_stock: integer           │
│    reorder_point: integer       │
│    version: integer             │  ← 乐观锁版本号
│    updated_at: timestamptz      │
└─────────────────────────────────┘
```

## Table Definitions

### 1. adjustment_reasons (调整原因字典)

预置的库存调整原因列表，用于标准化原因录入。

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 主键 |
| code | varchar(50) | NOT NULL, UNIQUE | 原因代码（如 STOCK_DIFF） |
| name | varchar(100) | NOT NULL | 原因名称（如 盘点差异） |
| category | varchar(20) | NOT NULL | 分类：surplus/shortage/damage |
| is_active | boolean | DEFAULT true | 是否启用 |
| sort_order | integer | DEFAULT 0 | 排序序号 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |
| updated_at | timestamptz | DEFAULT now() | 更新时间 |

**初始数据**:
```sql
INSERT INTO adjustment_reasons (code, name, category, sort_order) VALUES
('STOCK_DIFF', '盘点差异', 'surplus', 1),
('GOODS_DAMAGE', '货物损坏', 'damage', 2),
('EXPIRED_WRITE_OFF', '过期报废', 'damage', 3),
('INBOUND_ERROR', '入库错误', 'shortage', 4),
('OTHER', '其他', 'shortage', 5);
```

---

### 2. inventory_adjustments (库存调整单)

记录每次库存调整操作的完整信息。

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 主键 |
| adjustment_number | varchar(30) | UNIQUE, NOT NULL | 调整单号（如 ADJ20251226001） |
| sku_id | uuid | FK → skus.id, NOT NULL | 关联SKU |
| store_id | uuid | FK → stores.id, NOT NULL | 关联门店 |
| adjustment_type | varchar(20) | NOT NULL | 调整类型：surplus/shortage/damage |
| quantity | integer | NOT NULL, CHECK > 0 | 调整数量（始终为正数） |
| unit_price | decimal(12,2) | NOT NULL | SKU单价（来自主数据） |
| adjustment_amount | decimal(12,2) | GENERATED | 调整金额 = quantity × unit_price |
| reason_code | varchar(50) | FK → adjustment_reasons.code, NOT NULL | 原因代码 |
| reason_text | varchar(500) | | 原因补充说明 |
| remarks | varchar(500) | | 备注 |
| status | varchar(20) | NOT NULL, DEFAULT 'draft' | 状态：draft/pending_approval/approved/rejected/withdrawn |
| stock_before | integer | NOT NULL | 调整前现存数量 |
| stock_after | integer | NOT NULL | 调整后现存数量 |
| available_before | integer | NOT NULL | 调整前可用数量 |
| available_after | integer | NOT NULL | 调整后可用数量 |
| requires_approval | boolean | DEFAULT false | 是否需要审批（金额>=阈值） |
| operator_id | uuid | FK → users.id, NOT NULL | 操作人ID |
| operator_name | varchar(100) | NOT NULL | 操作人姓名（冗余存储） |
| approved_at | timestamptz | | 审批通过时间 |
| approved_by | uuid | FK → users.id | 审批人ID |
| transaction_id | uuid | FK → inventory_transactions.id | 关联的流水ID（审批后生成） |
| created_at | timestamptz | DEFAULT now() | 创建时间 |
| updated_at | timestamptz | DEFAULT now() | 更新时间 |
| version | integer | DEFAULT 1 | 乐观锁版本号 |

**索引**:
```sql
CREATE INDEX idx_adjustments_sku_store ON inventory_adjustments(sku_id, store_id);
CREATE INDEX idx_adjustments_status ON inventory_adjustments(status);
CREATE INDEX idx_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX idx_adjustments_operator ON inventory_adjustments(operator_id);
CREATE INDEX idx_adjustments_requires_approval ON inventory_adjustments(requires_approval) WHERE requires_approval = true;
```

**状态枚举**:
```sql
CREATE TYPE adjustment_status AS ENUM (
  'draft',              -- 草稿（未提交）
  'pending_approval',   -- 待审批
  'approved',           -- 已审批通过
  'rejected',           -- 已拒绝
  'withdrawn'           -- 已撤回
);
```

**调整类型枚举**:
```sql
CREATE TYPE adjustment_type AS ENUM (
  'surplus',   -- 盘盈（增加库存）
  'shortage',  -- 盘亏（减少库存）
  'damage'     -- 报损（减少库存并标记损耗）
);
```

---

### 3. approval_records (审批记录)

记录调整审批的完整历史。

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 主键 |
| adjustment_id | uuid | FK → inventory_adjustments.id, NOT NULL | 关联调整单 |
| approver_id | uuid | FK → users.id, NOT NULL | 审批人ID |
| approver_name | varchar(100) | NOT NULL | 审批人姓名 |
| action | varchar(20) | NOT NULL | 操作：approve/reject/withdraw |
| status_before | varchar(20) | NOT NULL | 操作前状态 |
| status_after | varchar(20) | NOT NULL | 操作后状态 |
| comments | text | | 审批意见 |
| action_time | timestamptz | DEFAULT now() | 操作时间 |
| created_at | timestamptz | DEFAULT now() | 创建时间 |

**索引**:
```sql
CREATE INDEX idx_approval_adjustment ON approval_records(adjustment_id);
CREATE INDEX idx_approval_approver ON approval_records(approver_id);
CREATE INDEX idx_approval_action_time ON approval_records(action_time DESC);
```

**审批操作枚举**:
```sql
CREATE TYPE approval_action AS ENUM (
  'approve',   -- 审批通过
  'reject',    -- 审批拒绝
  'withdraw'   -- 申请人撤回
);
```

---

### 4. store_inventory (门店库存 - 扩展)

P003 已定义的门店库存表，P004 需要扩展以下字段支持安全库存编辑和乐观锁。

**扩展字段**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| safety_stock | integer | DEFAULT 0, CHECK >= 0 | 安全库存阈值（可编辑） |
| version | integer | DEFAULT 1, NOT NULL | 乐观锁版本号 |

**乐观锁更新示例**:
```sql
-- 编辑安全库存时，检查 version 防止并发冲突
UPDATE store_inventory
SET safety_stock = :new_value,
    version = version + 1,
    updated_at = now()
WHERE id = :id AND version = :expected_version;

-- 如果更新行数为0，表示已被其他人修改
```

---

### 5. inventory_transactions (库存流水 - P003已定义)

复用 P003 定义的流水表，通过 `source_type = 'adjustment_order'` 和 `source_id = adjustment_id` 关联调整记录。

**关联字段使用**:
- `source_type`: 设为 `'adjustment_order'`
- `source_id`: 关联 `inventory_adjustments.id`
- `transaction_type`: 根据调整类型映射
  - surplus → `adjustment_in`
  - shortage → `adjustment_out`
  - damage → `damage_out`

---

## System Configuration

### approval_threshold (审批阈值配置)

当前版本审批阈值硬编码为 **1000元**，后续可扩展为配置表。

```typescript
// 前端常量
const APPROVAL_THRESHOLD = 1000; // 单位：元

// 计算是否需要审批
const requiresApproval = (quantity: number, unitPrice: number): boolean => {
  const adjustmentAmount = Math.abs(quantity * unitPrice);
  return adjustmentAmount >= APPROVAL_THRESHOLD;
};
```

---

## TypeScript Type Definitions

```typescript
// === 调整原因 ===
export interface AdjustmentReason {
  id: string;
  code: string;
  name: string;
  category: 'surplus' | 'shortage' | 'damage';
  isActive: boolean;
  sortOrder: number;
}

// === 调整类型 ===
export type AdjustmentType = 'surplus' | 'shortage' | 'damage';

// === 调整状态 ===
export type AdjustmentStatus =
  | 'draft'             // 草稿
  | 'pending_approval'  // 待审批
  | 'approved'          // 已审批
  | 'rejected'          // 已拒绝
  | 'withdrawn';        // 已撤回

// === 库存调整单 ===
export interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  skuId: string;
  sku?: SkuInfo;        // 关联SKU信息
  storeId: string;
  store?: StoreInfo;    // 关联门店信息
  adjustmentType: AdjustmentType;
  quantity: number;
  unitPrice: number;
  adjustmentAmount: number;
  reasonCode: string;
  reasonText?: string;
  remarks?: string;
  status: AdjustmentStatus;
  stockBefore: number;
  stockAfter: number;
  availableBefore: number;
  availableAfter: number;
  requiresApproval: boolean;
  operatorId: string;
  operatorName: string;
  approvedAt?: string;
  approvedBy?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// === 审批记录 ===
export interface ApprovalRecord {
  id: string;
  adjustmentId: string;
  approverId: string;
  approverName: string;
  action: 'approve' | 'reject' | 'withdraw';
  statusBefore: AdjustmentStatus;
  statusAfter: AdjustmentStatus;
  comments?: string;
  actionTime: string;
  createdAt: string;
}

// === 创建调整请求 ===
export interface CreateAdjustmentRequest {
  skuId: string;
  storeId: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reasonCode: string;
  reasonText?: string;
  remarks?: string;
}

// === 审批请求 ===
export interface ApprovalRequest {
  adjustmentId: string;
  action: 'approve' | 'reject';
  comments?: string;
}

// === 安全库存更新请求 ===
export interface UpdateSafetyStockRequest {
  inventoryId: string;
  safetyStock: number;
  version: number;  // 乐观锁版本号
}

// === 流水查询参数 ===
export interface TransactionQueryParams {
  skuId?: string;
  storeId?: string;
  transactionTypes?: TransactionType[];
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}
```

---

## Zod Validation Schemas

```typescript
import { z } from 'zod';

// 创建调整请求验证
export const CreateAdjustmentSchema = z.object({
  skuId: z.string().uuid('无效的SKU ID'),
  storeId: z.string().uuid('无效的门店ID'),
  adjustmentType: z.enum(['surplus', 'shortage', 'damage'], {
    errorMap: () => ({ message: '请选择有效的调整类型' })
  }),
  quantity: z.number()
    .int('调整数量必须为整数')
    .positive('调整数量必须大于0'),
  reasonCode: z.string()
    .min(1, '请选择调整原因'),
  reasonText: z.string()
    .max(500, '原因说明不能超过500字符')
    .optional(),
  remarks: z.string()
    .max(500, '备注不能超过500字符')
    .optional()
});

// 审批请求验证
export const ApprovalRequestSchema = z.object({
  adjustmentId: z.string().uuid('无效的调整单ID'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: '请选择有效的审批操作' })
  }),
  comments: z.string()
    .max(1000, '审批意见不能超过1000字符')
    .optional()
});

// 安全库存更新验证
export const UpdateSafetyStockSchema = z.object({
  inventoryId: z.string().uuid('无效的库存ID'),
  safetyStock: z.number()
    .int('安全库存必须为整数')
    .nonnegative('安全库存不能为负数'),
  version: z.number().int().positive()
});

// 流水查询参数验证
export const TransactionQuerySchema = z.object({
  skuId: z.string().uuid().optional(),
  storeId: z.string().uuid().optional(),
  transactionTypes: z.array(z.nativeEnum(TransactionType)).optional(),
  dateRange: z.tuple([z.string(), z.string()]).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});
```

---

## Database Migration Script

```sql
-- Migration: P004-inventory-adjustment
-- Date: 2025-12-26
-- Description: Add tables for inventory adjustment management

-- 1. Create ENUMs
CREATE TYPE adjustment_type AS ENUM ('surplus', 'shortage', 'damage');
CREATE TYPE adjustment_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'withdrawn');
CREATE TYPE approval_action AS ENUM ('approve', 'reject', 'withdraw');

-- 2. Create adjustment_reasons table
CREATE TABLE IF NOT EXISTS adjustment_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(50) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  category varchar(20) NOT NULL CHECK (category IN ('surplus', 'shortage', 'damage')),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert initial data
INSERT INTO adjustment_reasons (code, name, category, sort_order) VALUES
('STOCK_DIFF', '盘点差异', 'surplus', 1),
('GOODS_DAMAGE', '货物损坏', 'damage', 2),
('EXPIRED_WRITE_OFF', '过期报废', 'damage', 3),
('INBOUND_ERROR', '入库错误', 'shortage', 4),
('OTHER', '其他', 'shortage', 5);

-- 3. Create inventory_adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_number varchar(30) UNIQUE NOT NULL,
  sku_id uuid NOT NULL REFERENCES skus(id),
  store_id uuid NOT NULL REFERENCES stores(id),
  adjustment_type adjustment_type NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(12,2) NOT NULL,
  adjustment_amount decimal(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  reason_code varchar(50) NOT NULL REFERENCES adjustment_reasons(code),
  reason_text varchar(500),
  remarks varchar(500),
  status adjustment_status NOT NULL DEFAULT 'draft',
  stock_before integer NOT NULL,
  stock_after integer NOT NULL,
  available_before integer NOT NULL,
  available_after integer NOT NULL,
  requires_approval boolean DEFAULT false,
  operator_id uuid NOT NULL,
  operator_name varchar(100) NOT NULL,
  approved_at timestamptz,
  approved_by uuid,
  transaction_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  version integer DEFAULT 1
);

-- Create indexes
CREATE INDEX idx_adjustments_sku_store ON inventory_adjustments(sku_id, store_id);
CREATE INDEX idx_adjustments_status ON inventory_adjustments(status);
CREATE INDEX idx_adjustments_created_at ON inventory_adjustments(created_at DESC);
CREATE INDEX idx_adjustments_operator ON inventory_adjustments(operator_id);
CREATE INDEX idx_adjustments_requires_approval ON inventory_adjustments(requires_approval) WHERE requires_approval = true;

-- 4. Create approval_records table
CREATE TABLE IF NOT EXISTS approval_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id uuid NOT NULL REFERENCES inventory_adjustments(id),
  approver_id uuid NOT NULL,
  approver_name varchar(100) NOT NULL,
  action approval_action NOT NULL,
  status_before varchar(20) NOT NULL,
  status_after varchar(20) NOT NULL,
  comments text,
  action_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_approval_adjustment ON approval_records(adjustment_id);
CREATE INDEX idx_approval_approver ON approval_records(approver_id);
CREATE INDEX idx_approval_action_time ON approval_records(action_time DESC);

-- 5. Extend store_inventory table (if not already exists)
ALTER TABLE store_inventory
ADD COLUMN IF NOT EXISTS safety_stock integer DEFAULT 0 CHECK (safety_stock >= 0),
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1 NOT NULL;

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_adjustment_reasons_updated_at
  BEFORE UPDATE ON adjustment_reasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_adjustments_updated_at
  BEFORE UPDATE ON inventory_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS) policies
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustment_reasons ENABLE ROW LEVEL SECURITY;

-- Public read access for adjustment reasons
CREATE POLICY "adjustment_reasons_read" ON adjustment_reasons
  FOR SELECT USING (true);

-- Inventory admin can manage adjustments
CREATE POLICY "adjustments_admin_all" ON inventory_adjustments
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('inventory_admin', 'operations_director', 'admin')
  );

-- Operations director can view/approve
CREATE POLICY "approval_records_director_all" ON approval_records
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('operations_director', 'admin')
  );
```

---

## Data Flow Diagrams

### 调整录入流程
```
用户选择SKU → 输入调整信息 → 前端验证 → 调用API
                                          ↓
                            ┌─────────────────────────┐
                            │ POST /api/adjustments   │
                            ├─────────────────────────┤
                            │ 1. 验证SKU存在性        │
                            │ 2. 获取当前库存         │
                            │ 3. 计算调整金额         │
                            │ 4. 判断是否需审批       │
                            │ 5. 创建调整记录         │
                            │ 6. 如不需审批,立即执行  │
                            │    - 更新库存           │
                            │    - 生成流水           │
                            └─────────────────────────┘
                                          ↓
                            返回调整记录 + 是否需审批标识
```

### 审批流程
```
待审批调整 → 运营总监审批列表 → 查看详情 → 通过/拒绝
                                              ↓
                              ┌───────────────────────────┐
                              │ POST /api/approvals       │
                              ├───────────────────────────┤
                              │ 1. 验证权限               │
                              │ 2. 验证调整单状态         │
                              │ 3. 记录审批操作           │
                              │ 4. 更新调整单状态         │
                              │ 5. 如通过:                │
                              │    - 更新库存             │
                              │    - 生成流水             │
                              │    - 关联transaction_id   │
                              │ 6. 发送通知               │
                              └───────────────────────────┘
```

---

## Related Documents

- [spec.md](./spec.md) - 功能规格
- [plan.md](./plan.md) - 实施计划
- [research.md](./research.md) - 研究决策
- [contracts/api.yaml](./contracts/api.yaml) - API规范 (待生成)
