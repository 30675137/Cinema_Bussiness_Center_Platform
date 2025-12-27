# 数据模型: 商品订单列表查看与管理

**Feature**: O001-product-order-list
**Created**: 2025-12-27
**Database**: Supabase (PostgreSQL)

## 概览

本功能涉及 4 个核心实体：商品订单（ProductOrder）、订单商品项（OrderItem）、订单日志（OrderLog）、用户（User）。采用关系型数据模型，通过外键关联实现订单与商品项、日志的一对多关系。

---

## 实体关系图（ER Diagram）

```
┌─────────────────┐         ┌──────────────────┐
│     User        │1       *│  ProductOrder    │
│                 ├─────────┤                  │
│  - id (PK)      │         │  - id (PK)       │
│  - username     │         │  - order_number  │
│  - phone        │         │  - user_id (FK)  │
│  - address      │         │  - status        │
└─────────────────┘         │  - total_amount  │
                            │  - created_at    │
                            │  - version       │
                            └──────────────────┘
                                     │1
                        ┌────────────┴────────────┐
                        │                         │
                       *│                        *│
            ┌───────────┴─────────┐  ┌───────────┴─────────┐
            │    OrderItem        │  │    OrderLog         │
            │                     │  │                     │
            │  - id (PK)          │  │  - id (PK)          │
            │  - order_id (FK)    │  │  - order_id (FK)    │
            │  - product_id       │  │  - action           │
            │  - quantity         │  │  - operator_id      │
            │  - unit_price       │  │  - status_before    │
            └─────────────────────┘  │  - status_after     │
                                     │  - created_at       │
                                     └─────────────────────┘
```

---

## 实体详细定义

### 1. ProductOrder（商品订单）

**表名**: `product_orders`

**描述**: 存储商品订单的核心信息，包括订单号、用户、状态、金额等。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 主键，订单唯一标识 |
| order_number | VARCHAR(20) | NOT NULL, UNIQUE | 订单号，格式：ORD + YYYYMMDD + 6位随机字母数字 |
| user_id | UUID | NOT NULL, FK → users.id | 用户ID，外键关联用户表 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING_PAYMENT' | 订单状态（枚举值） |
| product_total | DECIMAL(10,2) | NOT NULL | 商品总金额（元） |
| shipping_fee | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | 运费（元） |
| discount_amount | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | 优惠金额（元） |
| total_amount | DECIMAL(10,2) | NOT NULL | 实付金额（元） |
| shipping_address | JSONB | NULL | 收货地址（JSON格式：{province, city, district, detail}） |
| payment_method | VARCHAR(20) | NULL | 支付方式（WECHAT_PAY, ALIPAY, 等） |
| payment_time | TIMESTAMP | NULL | 支付时间 |
| shipped_time | TIMESTAMP | NULL | 发货时间 |
| completed_time | TIMESTAMP | NULL | 完成时间 |
| cancelled_time | TIMESTAMP | NULL | 取消时间 |
| cancel_reason | TEXT | NULL | 取消原因 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |
| version | INTEGER | NOT NULL, DEFAULT 1 | 乐观锁版本号 |

**索引**:
```sql
CREATE UNIQUE INDEX idx_order_number ON product_orders(order_number);
CREATE INDEX idx_user_id ON product_orders(user_id);
CREATE INDEX idx_status ON product_orders(status);
CREATE INDEX idx_created_at ON product_orders(created_at DESC);
CREATE INDEX idx_status_created_at ON product_orders(status, created_at DESC);
```

**状态枚举**:
```typescript
enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',   // 待支付
  PAID = 'PAID',                         // 已支付
  SHIPPED = 'SHIPPED',                   // 已发货
  COMPLETED = 'COMPLETED',               // 已完成
  CANCELLED = 'CANCELLED'                // 已取消
}
```

**状态转换规则**:
```
PENDING_PAYMENT → PAID → SHIPPED → COMPLETED
       ↓                    ↓
   CANCELLED          CANCELLED
```

**校验规则**:
- `total_amount` = `product_total` + `shipping_fee` - `discount_amount`
- `order_number` 必须唯一
- 状态为 `PAID` 时，`payment_time` 必填
- 状态为 `SHIPPED` 时，`shipped_time` 必填
- 状态为 `CANCELLED` 时，`cancelled_time` 和 `cancel_reason` 必填

---

### 2. OrderItem（订单商品项）

**表名**: `order_items`

**描述**: 存储订单中的商品明细，一个订单可以包含多个商品项。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 主键 |
| order_id | UUID | NOT NULL, FK → product_orders.id ON DELETE CASCADE | 订单ID，外键关联订单表 |
| product_id | UUID | NOT NULL | 商品ID（关联商品管理模块P模块） |
| product_name | VARCHAR(200) | NOT NULL | 商品名称（冗余存储，防止商品删除后无法查看） |
| product_spec | VARCHAR(100) | NULL | 商品规格（如"500ml"、"大杯"） |
| product_image | VARCHAR(500) | NULL | 商品图片URL |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) | 购买数量 |
| unit_price | DECIMAL(10,2) | NOT NULL | 单价（元） |
| subtotal | DECIMAL(10,2) | NOT NULL | 小计金额（元） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引**:
```sql
CREATE INDEX idx_order_id ON order_items(order_id);
CREATE INDEX idx_product_id ON order_items(product_id);
```

**校验规则**:
- `subtotal` = `quantity` × `unit_price`
- `quantity` 必须 > 0

---

### 3. OrderLog（订单日志）

**表名**: `order_logs`

**描述**: 记录订单的所有状态变更历史，用于审计和追溯。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 主键 |
| order_id | UUID | NOT NULL, FK → product_orders.id ON DELETE CASCADE | 订单ID，外键关联订单表 |
| action | VARCHAR(50) | NOT NULL | 操作类型（枚举值） |
| status_before | VARCHAR(20) | NULL | 变更前状态 |
| status_after | VARCHAR(20) | NULL | 变更后状态 |
| operator_id | UUID | NOT NULL | 操作人ID |
| operator_name | VARCHAR(100) | NOT NULL | 操作人姓名 |
| comments | TEXT | NULL | 备注信息（如取消原因） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 操作时间 |

**索引**:
```sql
CREATE INDEX idx_order_id ON order_logs(order_id);
CREATE INDEX idx_created_at ON order_logs(created_at DESC);
```

**操作类型枚举**:
```typescript
enum LogAction {
  CREATE_ORDER = 'CREATE_ORDER',       // 创建订单
  PAYMENT = 'PAYMENT',                 // 支付
  SHIP = 'SHIP',                       // 发货
  COMPLETE = 'COMPLETE',               // 完成
  CANCEL = 'CANCEL',                   // 取消
  SYSTEM_AUTO = 'SYSTEM_AUTO'          // 系统自动操作
}
```

---

### 4. User（用户）

**表名**: `users`（复用现有用户表）

**描述**: 存储用户基本信息，由用户管理模块（U模块）维护。本功能仅读取用户数据。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, NOT NULL | 主键 |
| username | VARCHAR(100) | NOT NULL | 用户名 |
| phone | VARCHAR(20) | NOT NULL, UNIQUE | 手机号 |
| province | VARCHAR(50) | NULL | 省份 |
| city | VARCHAR(50) | NULL | 城市 |
| district | VARCHAR(50) | NULL | 区县 |
| address | VARCHAR(500) | NULL | 详细地址 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

**注意**: 用户表由 U 模块管理，本功能不修改用户数据。

---

## 数据库迁移脚本

### 创建表（Supabase SQL Editor）

```sql
-- 1. 创建商品订单表
CREATE TABLE product_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    product_total DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    payment_method VARCHAR(20),
    payment_time TIMESTAMP,
    shipped_time TIMESTAMP,
    completed_time TIMESTAMP,
    cancelled_time TIMESTAMP,
    cancel_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,

    CHECK (total_amount = product_total + shipping_fee - discount_amount)
);

-- 2. 创建订单商品项表
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_spec VARCHAR(100),
    product_image VARCHAR(500),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CHECK (subtotal = quantity * unit_price)
);

-- 3. 创建订单日志表
CREATE TABLE order_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    status_before VARCHAR(20),
    status_after VARCHAR(20),
    operator_id UUID NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. 创建索引
CREATE UNIQUE INDEX idx_order_number ON product_orders(order_number);
CREATE INDEX idx_orders_user_id ON product_orders(user_id);
CREATE INDEX idx_orders_status ON product_orders(status);
CREATE INDEX idx_orders_created_at ON product_orders(created_at DESC);
CREATE INDEX idx_orders_status_created_at ON product_orders(status, created_at DESC);

CREATE INDEX idx_items_order_id ON order_items(order_id);
CREATE INDEX idx_items_product_id ON order_items(product_id);

CREATE INDEX idx_logs_order_id ON order_logs(order_id);
CREATE INDEX idx_logs_created_at ON order_logs(created_at DESC);

-- 5. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_orders_updated_at
    BEFORE UPDATE ON product_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## TypeScript 类型定义

### Frontend Types

```typescript
/**
 * @spec O001-product-order-list
 * 订单相关的 TypeScript 类型定义
 */

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum LogAction {
  CREATE_ORDER = 'CREATE_ORDER',
  PAYMENT = 'PAYMENT',
  SHIP = 'SHIP',
  COMPLETE = 'COMPLETE',
  CANCEL = 'CANCEL',
  SYSTEM_AUTO = 'SYSTEM_AUTO'
}

export interface ShippingAddress {
  province: string
  city: string
  district: string
  detail: string
}

export interface ProductOrder {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  productTotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  shippingAddress: ShippingAddress | null
  paymentMethod: string | null
  paymentTime: string | null
  shippedTime: string | null
  completedTime: string | null
  cancelledTime: string | null
  cancelReason: string | null
  createdAt: string
  updatedAt: string
  version: number

  // 关联数据
  items?: OrderItem[]
  logs?: OrderLog[]
  user?: User
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productSpec: string | null
  productImage: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  createdAt: string
}

export interface OrderLog {
  id: string
  orderId: string
  action: LogAction
  statusBefore: OrderStatus | null
  statusAfter: OrderStatus | null
  operatorId: string
  operatorName: string
  comments: string | null
  createdAt: string
}

export interface User {
  id: string
  username: string
  phone: string
  province: string | null
  city: string | null
  district: string | null
  address: string | null
}
```

### Backend DTOs (Java)

```java
/**
 * @spec O001-product-order-list
 * 订单相关的 Java DTO 定义
 */

// OrderStatus.java
public enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    SHIPPED,
    COMPLETED,
    CANCELLED
}

// ProductOrderDTO.java
@Data
public class ProductOrderDTO {
    private UUID id;
    private String orderNumber;
    private UUID userId;
    private OrderStatus status;
    private BigDecimal productTotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private Map<String, String> shippingAddress;
    private String paymentMethod;
    private Instant paymentTime;
    private Instant shippedTime;
    private Instant completedTime;
    private Instant cancelledTime;
    private String cancelReason;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer version;

    // 关联数据
    private List<OrderItemDTO> items;
    private List<OrderLogDTO> logs;
    private UserDTO user;
}
```

---

## 数据访问层（Repository）

### Supabase 查询示例

```typescript
// 查询订单列表（带分页和筛选）
const { data, error } = await supabase
  .from('product_orders')
  .select(`
    *,
    items:order_items(*),
    user:users(id, username, phone)
  `)
  .eq('status', 'PAID')
  .gte('created_at', startDate)
  .lte('created_at', endDate)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)

// 更新订单状态（带乐观锁）
const { data, error } = await supabase
  .from('product_orders')
  .update({
    status: 'SHIPPED',
    shipped_time: new Date().toISOString(),
    version: currentVersion + 1
  })
  .eq('id', orderId)
  .eq('version', currentVersion)
  .select()
```

---

## 数据完整性约束

1. **外键约束**:
   - `order_items.order_id` → `product_orders.id` (CASCADE DELETE)
   - `order_logs.order_id` → `product_orders.id` (CASCADE DELETE)
   - `product_orders.user_id` → `users.id`

2. **唯一性约束**:
   - `product_orders.order_number` 必须唯一

3. **业务约束**:
   - 订单总金额 = 商品总额 + 运费 - 优惠金额
   - 订单项小计 = 数量 × 单价
   - 订单状态转换必须符合状态机规则

4. **乐观锁约束**:
   - 更新订单时必须校验 `version` 字段
   - 更新成功后 `version` 自动递增

---

## 性能优化建议

1. **索引优化**:
   - 为常用查询字段（status, created_at）创建复合索引
   - 订单号使用唯一索引加速查找

2. **分页查询**:
   - 使用 offset + limit 或 cursor-based pagination
   - 默认每页 20 条记录

3. **数据归档**:
   - 超过 1 年的已完成订单可归档到历史表
   - 使用 PostgreSQL 分区表（按月份分区）

4. **缓存策略**:
   - 订单详情缓存 1 分钟（TanStack Query）
   - 订单列表缓存 30 秒

---

## 测试数据种子（Seed Data）

```sql
-- 插入测试订单
INSERT INTO product_orders (order_number, user_id, status, product_total, shipping_fee, discount_amount, total_amount)
VALUES
('ORD20251227AB12CD', 'user-uuid-1', 'PAID', 150.00, 10.00, 5.00, 155.00),
('ORD20251227EF34GH', 'user-uuid-2', 'SHIPPED', 200.00, 0.00, 20.00, 180.00),
('ORD20251226IJ56KL', 'user-uuid-3', 'COMPLETED', 80.00, 10.00, 0.00, 90.00);
```

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2025-12-27 | 初始版本 - 创建核心表结构 |
