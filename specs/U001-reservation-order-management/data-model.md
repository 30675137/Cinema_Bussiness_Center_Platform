# Data Model: 预约单管理系统

**Feature**: U001-reservation-order-management
**Date**: 2025-12-24
**Status**: Complete

---

## 1. 核心实体 (Core Entities)

### 1.1 预约单 (reservation_orders)

**说明**: 表示一次客户的场景包预订意向

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 预约单唯一标识 |
| `order_number` | VARCHAR(20) | UNIQUE, NOT NULL | 预约单号 (R+时间戳+随机数) |
| `user_id` | UUID | FK → users(id), NOT NULL | 客户用户 ID |
| `scenario_package_id` | UUID | FK → scenario_packages(id), NOT NULL | 场景包 ID |
| `scenario_package_name` | VARCHAR(255) | NOT NULL | 场景包名称快照 |
| `reservation_date` | DATE | NOT NULL | 预订日期 |
| `time_slot` | VARCHAR(20) | NOT NULL | 预订时段 (如 "10:00-14:00") |
| `tier_id` | UUID | FK → package_tiers(id), NOT NULL | 套餐 ID |
| `tier_name` | VARCHAR(100) | NOT NULL | 套餐名称快照 |
| `tier_price` | DECIMAL(10,2) | NOT NULL, CHECK > 0 | 套餐价格快照 |
| `total_amount` | DECIMAL(10,2) | NOT NULL, CHECK > 0 | 总金额 |
| `contact_name` | VARCHAR(50) | NOT NULL | 联系人姓名 |
| `contact_phone` | VARCHAR(11) | NOT NULL, CHECK 格式 | 联系人手机号 |
| `remark` | VARCHAR(200) | | 备注 |
| `status` | VARCHAR(20) | NOT NULL, CHECK 枚举 | 预约单状态 |
| `requires_payment` | BOOLEAN | NOT NULL, DEFAULT false | 是否要求支付 |
| `cancel_reason` | TEXT | | 取消原因 |
| `cancelled_at` | TIMESTAMPTZ | | 取消时间 |
| `paid_at` | TIMESTAMPTZ | | 支付时间 |
| `payment_method` | VARCHAR(50) | | 支付方式 |
| `payment_transaction_id` | VARCHAR(100) | | 支付流水号 |
| `version` | BIGINT | NOT NULL, DEFAULT 0 | 乐观锁版本号 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**状态枚举**:
- `PENDING` - 待确认
- `CONFIRMED` - 已确认
- `CANCELLED` - 已取消
- `COMPLETED` - 已完成

**索引**:
- `idx_reservation_user` ON (user_id, created_at DESC)
- `idx_reservation_status` ON (status, created_at DESC)
- `idx_reservation_date` ON (reservation_date, scenario_package_id)
- `idx_reservation_number` ON (order_number) UNIQUE

---

### 1.2 预约单明细 (reservation_items)

**说明**: 预约单中的加购项明细

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 明细 ID |
| `reservation_order_id` | UUID | FK → reservation_orders(id), NOT NULL | 预约单 ID |
| `addon_item_id` | UUID | NOT NULL | 加购项 ID |
| `addon_name` | VARCHAR(100) | NOT NULL | 加购项名称快照 |
| `unit_price` | DECIMAL(10,2) | NOT NULL, CHECK > 0 | 单价快照 |
| `quantity` | INTEGER | NOT NULL, CHECK > 0 | 数量 |
| `subtotal` | DECIMAL(10,2) | NOT NULL, CHECK > 0 | 小计金额 |

**索引**:
- `idx_item_order` ON (reservation_order_id)

---

### 1.3 操作日志 (reservation_operation_logs)

**说明**: 预约单的操作历史记录

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 日志 ID |
| `reservation_order_id` | UUID | FK → reservation_orders(id), NOT NULL | 预约单 ID |
| `operation_type` | VARCHAR(20) | NOT NULL, CHECK 枚举 | 操作类型 |
| `operator_id` | UUID | | 操作人 ID (运营人员) |
| `operator_name` | VARCHAR(50) | | 操作人姓名 |
| `before_value` | JSONB | | 操作前数据快照 |
| `after_value` | JSONB | | 操作后数据快照 |
| `remark` | TEXT | | 操作备注 (如取消原因) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 操作时间 |

**操作类型枚举**:
- `CREATE` - 创建预约单
- `CONFIRM` - 确认预约 (包含 requiresPayment 选项)
- `CANCEL` - 取消预约
- `UPDATE` - 修改预约单
- `PAYMENT` - 支付完成

**索引**:
- `idx_log_order` ON (reservation_order_id, created_at DESC)

---

### 1.4 库存快照 (slot_inventory_snapshots)

**说明**: 预约单创建时的库存状态快照

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | 快照 ID |
| `reservation_order_id` | UUID | FK → reservation_orders(id), NOT NULL | 预约单 ID |
| `scenario_package_id` | UUID | NOT NULL | 场景包 ID |
| `reservation_date` | DATE | NOT NULL | 预订日期 |
| `time_slot` | VARCHAR(20) | NOT NULL | 时段 |
| `total_capacity` | INTEGER | NOT NULL | 总容量 |
| `booked_count_before` | INTEGER | NOT NULL | 预订前已占用数量 |
| `booked_count_after` | INTEGER | NOT NULL | 预订后已占用数量 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 快照时间 |

**约束**:
- `UNIQUE(reservation_order_id)` - 每个预约单只有一条快照

---

## 2. 实体关系图 (ERD)

```
┌─────────────────────────────┐
│     scenario_packages       │
│ (外部依赖 - 场景包)         │
└──────────────┬──────────────┘
               │ 1:N
               ▼
┌─────────────────────────────┐
│     reservation_orders      │◄───────────────────────────────┐
│     (预约单主表)            │                                │
└──────────────┬──────────────┘                                │
               │                                               │
     ┌─────────┼─────────┬─────────────────────────┐          │
     │ 1:N     │ 1:N     │ 1:1                     │          │
     ▼         ▼         ▼                         │          │
┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │          │
│reservation│ │reservation│ │slot_inventory      │ │          │
│_items    │ │_operation │ │_snapshots          │ │          │
│(加购明细)│ │_logs     │ │(库存快照)          │ │          │
└──────────┘ │(操作日志)│ └──────────────────────┘ │          │
             └──────────┘                          │          │
                                                   │          │
┌─────────────────────────────┐                   │          │
│        users                │───────────────────┘          │
│ (外部依赖 - 用户)           │                               │
└─────────────────────────────┘                               │
                                                               │
┌─────────────────────────────┐                               │
│     package_tiers           │───────────────────────────────┘
│ (外部依赖 - 套餐)           │
└─────────────────────────────┘
```

---

## 3. 状态机 (State Machine)

### 3.1 状态转换图

```
                    ┌─────────────────────────────────────────────────────┐
                    │                                                     │
                    ▼                                                     │
┌─────────────┐  confirm(requiresPayment=true)  ┌─────────────┐  pay()  ┌─────────────┐
│   PENDING   │ ───────────────────────────────▶│  CONFIRMED  │────────▶│  COMPLETED  │
│  (待确认)   │                                 │  (已确认)   │         │  (已完成)   │
└─────────────┘                                 └─────────────┘         └─────────────┘
       │                                              │                        ▲
       │ confirm(requiresPayment=false)               │                        │
       └──────────────────────────────────────────────┼────────────────────────┘
                                                      │
       │                                              │
       │ cancel()                                     │ cancel()
       ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CANCELLED (已取消)                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 状态转换规则

| 当前状态 | 触发条件 | 目标状态 | 说明 |
|----------|----------|----------|------|
| PENDING | confirm(requiresPayment=true) | CONFIRMED | 确认并要求支付 |
| PENDING | confirm(requiresPayment=false) | COMPLETED | 确认并直接完成 |
| PENDING | cancel | CANCELLED | 取消预约 |
| PENDING | timeout(24h) | CANCELLED | 超时自动取消 |
| CONFIRMED | pay | COMPLETED | 支付完成 |
| CONFIRMED | cancel | CANCELLED | 取消预约(需退款) |
| CONFIRMED | timeout(24h) | CANCELLED | 支付超时自动取消 |

---

## 4. Profile 页面相关数据模型

### 4.1 菜单项 (前端模型)

**TypeScript 类型定义**:
```typescript
interface MenuItem {
  id: string
  icon: string        // 图标路径
  title: string       // 菜单标题
  path: string        // 跳转路径
  badge?: number      // 角标数量
  requireLogin?: boolean // 是否需要登录
}

// Profile 页面菜单配置
const menuItems: MenuItem[] = [
  {
    id: 'my-reservations',
    icon: '/assets/icons/reservation.png',
    title: '我的预约',
    path: '/pages/my-reservations/index',
    badge: 0,  // 动态获取
    requireLogin: true
  },
  {
    id: 'contact',
    icon: '/assets/icons/contact.png',
    title: '联系客服',
    path: '/pages/contact/index',
    requireLogin: false
  },
  {
    id: 'settings',
    icon: '/assets/icons/settings.png',
    title: '设置',
    path: '/pages/settings/index',
    requireLogin: false
  }
]
```

### 4.2 待处理订单计数 (API 响应)

**接口**: `GET /api/client/reservations/pending-count`

```typescript
interface PendingCountResponse {
  data: {
    pendingCount: number  // 待处理订单数量
  }
  timestamp: string
}
```

**计算规则**:
```sql
SELECT COUNT(*)
FROM reservation_orders
WHERE user_id = :userId
  AND (
    status = 'PENDING'
    OR (status = 'CONFIRMED' AND requires_payment = true)
  )
```

---

## 5. 验证规则 (Validation Rules)

### 5.1 预约单创建验证

| 字段 | 验证规则 |
|------|----------|
| reservation_date | 不能早于今天 |
| time_slot | 必须是场景包的有效时段 |
| tier_id | 必须属于该场景包 |
| contact_name | 非空, 2-50 字符 |
| contact_phone | 11 位数字, 匹配 `/^1[3-9]\d{9}$/` |
| remark | 可选, 最多 200 字符 |

### 5.2 状态转换验证

| 操作 | 前置条件 |
|------|----------|
| confirm | 状态必须为 PENDING |
| cancel | 状态不能为 COMPLETED |
| pay | 状态必须为 CONFIRMED 且 requires_payment=true |

---

## 6. 数据库迁移脚本参考

```sql
-- 创建预约单表
CREATE TABLE reservation_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    scenario_package_id UUID NOT NULL REFERENCES scenario_packages(id),
    scenario_package_name VARCHAR(255) NOT NULL,
    reservation_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    tier_id UUID NOT NULL REFERENCES package_tiers(id),
    tier_name VARCHAR(100) NOT NULL,
    tier_price DECIMAL(10,2) NOT NULL CHECK (tier_price > 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    contact_name VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(11) NOT NULL CHECK (contact_phone ~ '^1[3-9][0-9]{9}$'),
    remark VARCHAR(200),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    requires_payment BOOLEAN NOT NULL DEFAULT false,
    cancel_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(100),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_reservation_user ON reservation_orders(user_id, created_at DESC);
CREATE INDEX idx_reservation_status ON reservation_orders(status, created_at DESC);
CREATE INDEX idx_reservation_date ON reservation_orders(reservation_date, scenario_package_id);
```

---

**Data Model Complete**: 2025-12-24
