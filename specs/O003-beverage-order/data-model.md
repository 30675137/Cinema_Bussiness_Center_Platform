# Data Model: 饮品订单创建与出品管理

**Feature**: O003-beverage-order | **Date**: 2025-12-28 | **Version**: 1.1.0

## Overview

本文档定义了饮品订单创建与出品管理功能的完整数据模型，包括饮品管理、订单管理、配方管理（BOM）三大核心领域。数据模型设计遵循以下原则:

- **快照机制**: 订单项保存饮品和规格的快照数据，避免菜单变更影响历史订单
- **状态驱动**: 订单和取餐号采用明确的状态机模型，确保状态流转可控
- **BOM集成**: 配方设计支持与P003/P004库存管理模块集成，实现自动扣料
- **性能优化**: 合理使用索引、JSON字段、外键约束，平衡查询性能和数据一致性

## Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Beverage   │◄────┐   │  BeverageRecipe  │         │    Ingredient   │
│   (饮品)     │     │   │   (饮品配方)     │         │    (原料SKU)    │
└──────────────┘     │   └──────────────────┘         └─────────────────┘
       │             │            │                            △
       │ 1       1-N │            │ ingredients JSON           │
       │             │            │ (关联原料SKU)              │
       ▼             │            └────────────────────────────┘
┌──────────────────┐ │
│  BeverageSpec    │ │                    ┌─────────────────────┐
│  (饮品规格)      │─┘                    │  BeverageOrder      │
└──────────────────┘                      │  (饮品订单)         │
                                          └─────────────────────┘
                                                   │
                                                   │ 1
                                                   │
                                        ┌──────────┴──────────┐
                                        │                     │
                                    1-N │                     │ 1-1
                                        ▼                     ▼
                          ┌─────────────────────┐  ┌──────────────────┐
                          │ BeverageOrderItem   │  │  QueueNumber     │
                          │ (订单项)            │  │  (取餐号)        │
                          └─────────────────────┘  └──────────────────┘
                                    │
                                    │ beverage_snapshot JSON
                                    │ spec_snapshot JSON
                                    │ (快照机制防止菜单变更)
                                    ▼
                          快照数据包含饮品名称、规格、价格
```

## Entity Definitions

### 1. Beverage (饮品)

饮品是菜单的核心实体，代表可供顾客点单的饮品商品。

#### Entity Properties

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 饮品唯一标识 |
| name | VARCHAR(100) | NOT NULL | 饮品名称（如：拿铁咖啡、珍珠奶茶） |
| category | VARCHAR(50) | NOT NULL | 分类（COFFEE/TEA/JUICE/SMOOTHIE/MILK_TEA/OTHER） |
| base_price | DECIMAL(10,2) | NOT NULL, CHECK (base_price >= 0) | 基础价格（单位：元），规格调整在此基础上加减 |
| description | TEXT | NULL | 饮品描述/介绍 |
| main_image | TEXT | NULL | 主图URL（Supabase Storage） |
| detail_images | JSONB | NULL, DEFAULT '[]' | 详情图URL数组（Supabase Storage） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'INACTIVE' | 状态（ACTIVE/INACTIVE/OUT_OF_STOCK） |
| is_recommended | BOOLEAN | NOT NULL, DEFAULT false | 是否推荐商品（显示标签） |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 更新时间 |

#### Validation Rules

- **名称唯一性**: 同一门店内饮品名称不能重复（门店维度由业务逻辑控制）
- **分类枚举**: category 必须是以下值之一：`COFFEE`, `TEA`, `JUICE`, `SMOOTHIE`, `MILK_TEA`, `OTHER`
- **价格非负**: base_price 必须 >= 0
- **状态枚举**: status 必须是以下值之一：`ACTIVE`（上架）, `INACTIVE`（下架）, `OUT_OF_STOCK`（缺货）

#### State Transitions (Status)

```
INACTIVE (下架)
    │
    ├──→ ACTIVE (上架) ──────→ OUT_OF_STOCK (缺货)
    │         ↑                      │
    │         └──────────────────────┘
    │
    └──→ 软删除（更新 status = 'INACTIVE'，不物理删除）
```

#### Indexes

```sql
CREATE INDEX idx_beverage_category ON beverages(category);
CREATE INDEX idx_beverage_status ON beverages(status);
CREATE INDEX idx_beverage_is_recommended ON beverages(is_recommended);
CREATE INDEX idx_beverage_created_at ON beverages(created_at DESC);
```

#### PostgreSQL Table Definition

```sql
-- @spec O003-beverage-order
CREATE TABLE beverages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('COFFEE', 'TEA', 'JUICE', 'SMOOTHIE', 'MILK_TEA', 'OTHER')),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    description TEXT,
    main_image TEXT,
    detail_images JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_beverage_category ON beverages(category);
CREATE INDEX idx_beverage_status ON beverages(status);
CREATE INDEX idx_beverage_is_recommended ON beverages(is_recommended);
CREATE INDEX idx_beverage_created_at ON beverages(created_at DESC);

-- 更新时间触发器
CREATE TRIGGER update_beverage_updated_at
    BEFORE UPDATE ON beverages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### JSON Field Structure

**detail_images** (JSONB Array):
```json
[
    "https://supabase-storage-url/beverages/123/detail1.jpg",
    "https://supabase-storage-url/beverages/123/detail2.jpg"
]
```

---

### 2. BeverageSpec (饮品规格)

饮品规格定义了饮品的可选配置（如大小、温度、甜度、配料），每个规格可设置价格调整。

#### Entity Properties

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 规格唯一标识 |
| beverage_id | UUID | FK → beverages(id), NOT NULL, ON DELETE CASCADE | 关联饮品ID |
| spec_type | VARCHAR(50) | NOT NULL | 规格类型（SIZE/TEMPERATURE/SWEETNESS/TOPPING） |
| spec_name | VARCHAR(100) | NOT NULL | 规格选项名称（如：大杯、热、半糖、加珍珠） |
| price_adjustment | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | 价格调整（正数加价，负数减价，0不调整） |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | 是否默认选中（同一饮品同一类型最多一个默认） |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 排序权重（越小越靠前） |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 更新时间 |

#### Validation Rules

- **类型枚举**: spec_type 必须是以下值之一：`SIZE`, `TEMPERATURE`, `SWEETNESS`, `TOPPING`
- **默认规格唯一**: 同一饮品同一类型最多只能有一个 is_default=true 的规格（业务逻辑控制）
- **价格调整范围**: price_adjustment 建议在 -100 ~ 100 元之间（业务逻辑控制）

#### Indexes

```sql
CREATE INDEX idx_beverage_spec_beverage_id ON beverage_specs(beverage_id);
CREATE INDEX idx_beverage_spec_type ON beverage_specs(spec_type);
CREATE INDEX idx_beverage_spec_sort_order ON beverage_specs(sort_order);
```

#### PostgreSQL Table Definition

```sql
-- @spec O003-beverage-order
CREATE TABLE beverage_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
    spec_type VARCHAR(50) NOT NULL CHECK (spec_type IN ('SIZE', 'TEMPERATURE', 'SWEETNESS', 'TOPPING')),
    spec_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_beverage_spec_beverage_id ON beverage_specs(beverage_id);
CREATE INDEX idx_beverage_spec_type ON beverage_specs(spec_type);
CREATE INDEX idx_beverage_spec_sort_order ON beverage_specs(sort_order);

-- 更新时间触发器
CREATE TRIGGER update_beverage_spec_updated_at
    BEFORE UPDATE ON beverage_specs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Example Data

```sql
-- 拿铁咖啡的规格配置示例
INSERT INTO beverage_specs (beverage_id, spec_type, spec_name, price_adjustment, is_default, sort_order) VALUES
    ('beverage-uuid', 'SIZE', '中杯', 0, true, 1),
    ('beverage-uuid', 'SIZE', '大杯', 3, false, 2),
    ('beverage-uuid', 'TEMPERATURE', '热', 0, true, 1),
    ('beverage-uuid', 'TEMPERATURE', '冰', 0, false, 2),
    ('beverage-uuid', 'SWEETNESS', '标准糖', 0, true, 1),
    ('beverage-uuid', 'SWEETNESS', '半糖', 0, false, 2),
    ('beverage-uuid', 'SWEETNESS', '无糖', 0, false, 3),
    ('beverage-uuid', 'TOPPING', '不加配料', 0, true, 1),
    ('beverage-uuid', 'TOPPING', '珍珠', 2, false, 2),
    ('beverage-uuid', 'TOPPING', '椰果', 2, false, 3);
```

---

### 3. BeverageRecipe (饮品配方/BOM)

饮品配方定义了制作饮品所需的原料及用量，用于BOM自动扣料。

#### Entity Properties

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 配方唯一标识 |
| beverage_id | UUID | FK → beverages(id), NOT NULL, ON DELETE CASCADE | 关联饮品ID |
| spec_combination | JSONB | NULL, DEFAULT '{}' | 规格组合（JSON对象，指定适用的规格） |
| ingredients | JSONB | NOT NULL | 原料列表（JSON数组，包含SKU ID、用量、单位） |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 创建时间 |
| updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 更新时间 |

#### Validation Rules

- **原料关联**: ingredients 中的 sku_id 必须存在于 P003 库存管理的 skus 表中（业务逻辑校验）
- **单位一致性**: ingredients 中的 unit 必须与 skus 表中的单位一致（业务逻辑校验）
- **用量非负**: ingredients 中的 quantity 必须 > 0

#### Indexes

```sql
CREATE INDEX idx_beverage_recipe_beverage_id ON beverage_recipes(beverage_id);
CREATE INDEX idx_beverage_recipe_spec_combination ON beverage_recipes USING gin(spec_combination);
```

#### PostgreSQL Table Definition

```sql
-- @spec O003-beverage-order
CREATE TABLE beverage_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
    spec_combination JSONB DEFAULT '{}',
    ingredients JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_beverage_recipe_beverage_id ON beverage_recipes(beverage_id);
CREATE INDEX idx_beverage_recipe_spec_combination ON beverage_recipes USING gin(spec_combination);

-- 更新时间触发器
CREATE TRIGGER update_beverage_recipe_updated_at
    BEFORE UPDATE ON beverage_recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### JSON Field Structure

**spec_combination** (JSONB Object):
```json
{
    "SIZE": "大杯",
    "TOPPING": "珍珠"
}
```
*说明*: 空对象 `{}` 表示基础配方（不指定规格），适用于所有规格组合。

**ingredients** (JSONB Array):
```json
[
    {
        "sku_id": "sku-uuid-001",
        "sku_name": "咖啡豆",
        "quantity": 20,
        "unit": "g"
    },
    {
        "sku_id": "sku-uuid-002",
        "sku_name": "牛奶",
        "quantity": 200,
        "unit": "ml"
    },
    {
        "sku_id": "sku-uuid-003",
        "sku_name": "糖浆",
        "quantity": 10,
        "unit": "ml"
    }
]
```

#### Example Data

```sql
-- 拿铁咖啡基础配方（中杯）
INSERT INTO beverage_recipes (beverage_id, spec_combination, ingredients) VALUES
    ('beverage-uuid', '{}', '[
        {"sku_id": "sku-uuid-001", "sku_name": "咖啡豆", "quantity": 15, "unit": "g"},
        {"sku_id": "sku-uuid-002", "sku_name": "牛奶", "quantity": 150, "unit": "ml"}
    ]');

-- 拿铁咖啡大杯配方（原料加量）
INSERT INTO beverage_recipes (beverage_id, spec_combination, ingredients) VALUES
    ('beverage-uuid', '{"SIZE": "大杯"}', '[
        {"sku_id": "sku-uuid-001", "sku_name": "咖啡豆", "quantity": 20, "unit": "g"},
        {"sku_id": "sku-uuid-002", "sku_name": "牛奶", "quantity": 200, "unit": "ml"}
    ]');

-- 拿铁咖啡加珍珠配方（额外原料）
INSERT INTO beverage_recipes (beverage_id, spec_combination, ingredients) VALUES
    ('beverage-uuid', '{"TOPPING": "珍珠"}', '[
        {"sku_id": "sku-uuid-001", "sku_name": "咖啡豆", "quantity": 15, "unit": "g"},
        {"sku_id": "sku-uuid-002", "sku_name": "牛奶", "quantity": 150, "unit": "ml"},
        {"sku_id": "sku-uuid-004", "sku_name": "珍珠", "quantity": 30, "unit": "g"}
    ]');
```

---

### 4. BeverageOrder (饮品订单)

饮品订单代表顾客的一笔点单，包含订单状态、支付信息、取餐号等核心数据。

#### Entity Properties

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 订单唯一标识 |
| order_no | VARCHAR(50) | UNIQUE, NOT NULL | 订单号（业务生成，如：BO20251228001） |
| queue_number | VARCHAR(10) | NOT NULL | 取餐号（如：001、002，每日重置） |
| user_id | UUID | NOT NULL | 用户ID（关联用户表） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING_PAYMENT' | 订单状态 |
| total_price | DECIMAL(10,2) | NOT NULL, CHECK (total_price >= 0) | 订单总价（单位：元） |
| payment_method | VARCHAR(50) | NULL | 支付方式（MOCK/WECHAT/ALIPAY） |
| payment_time | TIMESTAMP WITH TIME ZONE | NULL | 支付时间 |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 创建时间（下单时间） |
| completed_at | TIMESTAMP WITH TIME ZONE | NULL | 完成时间（状态变为COMPLETED时） |
| remark | TEXT | NULL | 顾客备注 |

#### Validation Rules

- **订单号唯一性**: order_no 必须全局唯一
- **状态枚举**: status 必须是以下值之一：`PENDING_PAYMENT`, `PENDING_PREPARATION`, `PREPARING`, `COMPLETED`, `DELIVERED`, `CANCELLED`
- **总价非负**: total_price 必须 >= 0

#### State Transitions (Status)

```
PENDING_PAYMENT (待支付)
    │
    ├──→ PENDING_PREPARATION (待制作) ──→ PREPARING (制作中)
    │                                          │
    │                                          ▼
    │                                    COMPLETED (已完成)
    │                                          │
    │                                          ▼
    │                                    DELIVERED (已交付)
    │
    └──→ CANCELLED (已取消)
```

**状态流转规则**:
- `PENDING_PAYMENT` → `PENDING_PREPARATION`: 支付成功
- `PENDING_PREPARATION` → `PREPARING`: 工作人员点击"开始制作"（触发BOM扣料）
- `PREPARING` → `COMPLETED`: 工作人员点击"已完成"（触发叫号）
- `COMPLETED` → `DELIVERED`: 工作人员点击"已交付"
- `PENDING_PAYMENT` → `CANCELLED`: 用户取消订单或支付超时
- `PENDING_PREPARATION` → `CANCELLED`: 用户申请取消（需工作人员审批）

#### Indexes

```sql
CREATE INDEX idx_beverage_order_user_id ON beverage_orders(user_id);
CREATE INDEX idx_beverage_order_status ON beverage_orders(status);
CREATE INDEX idx_beverage_order_created_at ON beverage_orders(created_at DESC);
CREATE INDEX idx_beverage_order_queue_number ON beverage_orders(queue_number);
```

#### PostgreSQL Table Definition

```sql
-- @spec O003-beverage-order
CREATE TABLE beverage_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    queue_number VARCHAR(10) NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PENDING_PREPARATION', 'PREPARING', 'COMPLETED', 'DELIVERED', 'CANCELLED')),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    payment_method VARCHAR(50),
    payment_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    remark TEXT
);

-- 索引
CREATE INDEX idx_beverage_order_user_id ON beverage_orders(user_id);
CREATE INDEX idx_beverage_order_status ON beverage_orders(status);
CREATE INDEX idx_beverage_order_created_at ON beverage_orders(created_at DESC);
CREATE INDEX idx_beverage_order_queue_number ON beverage_orders(queue_number);
```

---

### 5. BeverageOrderItem (订单项)

订单项代表订单中的单个饮品项，包含饮品和规格的快照数据。

#### Entity Properties

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 订单项唯一标识 |
| order_id | UUID | FK → beverage_orders(id), NOT NULL, ON DELETE CASCADE | 关联订单ID |
| beverage_id | UUID | NOT NULL | 饮品ID（原始引用，不作外键约束） |
| beverage_snapshot | JSONB | NOT NULL | 饮品快照（名称、分类、主图等） |
| spec_snapshot | JSONB | NOT NULL, DEFAULT '[]' | 规格快照（规格类型、名称、价格调整） |
| quantity | INTEGER | NOT NULL, CHECK (quantity > 0) | 数量 |
| unit_price | DECIMAL(10,2) | NOT NULL, CHECK (unit_price >= 0) | 单价（含规格调整后的最终价格） |
| subtotal | DECIMAL(10,2) | NOT NULL, CHECK (subtotal >= 0) | 小计（unit_price * quantity） |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 创建时间 |

#### Validation Rules

- **数量正整数**: quantity 必须 > 0
- **单价非负**: unit_price 必须 >= 0
- **小计一致性**: subtotal = unit_price * quantity（业务逻辑保证）

#### Indexes

```sql
CREATE INDEX idx_beverage_order_item_order_id ON beverage_order_items(order_id);
CREATE INDEX idx_beverage_order_item_beverage_id ON beverage_order_items(beverage_id);
```

#### PostgreSQL Table Definition

```sql
-- @spec O003-beverage-order
CREATE TABLE beverage_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    beverage_id UUID NOT NULL,
    beverage_snapshot JSONB NOT NULL,
    spec_snapshot JSONB NOT NULL DEFAULT '[]',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_beverage_order_item_order_id ON beverage_order_items(order_id);
CREATE INDEX idx_beverage_order_item_beverage_id ON beverage_order_items(beverage_id);
```

#### JSON Field Structure

**beverage_snapshot** (JSONB Object):
```json
{
    "id": "beverage-uuid",
    "name": "拿铁咖啡",
    "category": "COFFEE",
    "base_price": 18.00,
    "main_image": "https://supabase-storage-url/beverages/latte.jpg"
}
```

**spec_snapshot** (JSONB Array):
```json
[
    {
        "spec_type": "SIZE",
        "spec_name": "大杯",
        "price_adjustment": 3.00
    },
    {
        "spec_type": "TEMPERATURE",
        "spec_name": "热",
        "price_adjustment": 0
    },
    {
        "spec_type": "SWEETNESS",
        "spec_name": "半糖",
        "price_adjustment": 0
    },
    {
        "spec_type": "TOPPING",
        "spec_name": "珍珠",
        "price_adjustment": 2.00
    }
]
```

**单价计算逻辑**:
```
unit_price = beverage_snapshot.base_price
            + SUM(spec_snapshot[*].price_adjustment)

示例: 18 + 3 + 0 + 0 + 2 = 23 元
```

---

### 6. QueueNumber (取餐号)

取餐号用于叫号系统，顾客凭取餐号取餐。

#### Entity Properties

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | 取餐号唯一标识 |
| queue_no | VARCHAR(10) | NOT NULL | 取餐号码（如：001、002） |
| order_id | UUID | FK → beverage_orders(id), UNIQUE, NOT NULL, ON DELETE CASCADE | 关联订单ID（一对一） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'WAITING' | 叫号状态 |
| called_at | TIMESTAMP WITH TIME ZONE | NULL | 叫号时间 |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT now() | 创建时间 |

#### Validation Rules

- **状态枚举**: status 必须是以下值之一：`WAITING`（待叫号）, `CALLED`（已叫号）, `PICKED_UP`（已取餐）
- **订单唯一**: 一个订单只能对应一个取餐号（UNIQUE约束）

#### State Transitions (Status)

```
WAITING (待叫号)
    │
    ▼
CALLED (已叫号)
    │
    ▼
PICKED_UP (已取餐)
```

#### Indexes

```sql
CREATE INDEX idx_queue_number_queue_no ON queue_numbers(queue_no);
CREATE INDEX idx_queue_number_status ON queue_numbers(status);
CREATE INDEX idx_queue_number_created_at ON queue_numbers(created_at DESC);
```

#### PostgreSQL Table Definition

```sql
-- @spec O003-beverage-order
CREATE TABLE queue_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_no VARCHAR(10) NOT NULL,
    order_id UUID UNIQUE NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'CALLED', 'PICKED_UP')),
    called_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_queue_number_queue_no ON queue_numbers(queue_no);
CREATE INDEX idx_queue_number_status ON queue_numbers(status);
CREATE INDEX idx_queue_number_created_at ON queue_numbers(created_at DESC);
```

#### Queue Number Generation Rule

取餐号生成规则：
- 格式：3位数字（001, 002, ..., 999）
- 每日0点重置，从001重新开始
- 生成逻辑：
  ```sql
  -- 获取今日最大取餐号
  SELECT COALESCE(MAX(CAST(queue_no AS INTEGER)), 0) + 1
  FROM queue_numbers
  WHERE DATE(created_at) = CURRENT_DATE;

  -- 格式化为3位数字
  -- 001, 002, ..., 999
  ```

---

## Relationships

### Foreign Key Constraints

```sql
-- beverage_specs 关联 beverages
ALTER TABLE beverage_specs
    ADD CONSTRAINT fk_beverage_spec_beverage
    FOREIGN KEY (beverage_id) REFERENCES beverages(id) ON DELETE CASCADE;

-- beverage_recipes 关联 beverages
ALTER TABLE beverage_recipes
    ADD CONSTRAINT fk_beverage_recipe_beverage
    FOREIGN KEY (beverage_id) REFERENCES beverages(id) ON DELETE CASCADE;

-- beverage_order_items 关联 beverage_orders
ALTER TABLE beverage_order_items
    ADD CONSTRAINT fk_beverage_order_item_order
    FOREIGN KEY (order_id) REFERENCES beverage_orders(id) ON DELETE CASCADE;

-- queue_numbers 关联 beverage_orders
ALTER TABLE queue_numbers
    ADD CONSTRAINT fk_queue_number_order
    FOREIGN KEY (order_id) REFERENCES beverage_orders(id) ON DELETE CASCADE;
```

### Relationship Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| Beverage → BeverageSpec | 1-N | 一个饮品可有多个规格（不同类型） |
| Beverage → BeverageRecipe | 1-N | 一个饮品可有多个配方（对应不同规格组合） |
| BeverageOrder → BeverageOrderItem | 1-N | 一个订单包含多个订单项 |
| BeverageOrder → QueueNumber | 1-1 | 一个订单对应一个取餐号 |

---

## Snapshot Mechanism

### Why Snapshot?

订单数据采用快照机制的原因：
1. **防止菜单变更影响历史订单**: 管理员修改饮品名称、价格、规格后，历史订单仍显示下单时的数据
2. **保证财务一致性**: 订单金额不随菜单变更而变化
3. **简化查询**: 无需关联多张表即可获取订单完整信息

### Snapshot Design

**BeverageOrderItem.beverage_snapshot**:
- 保存下单时的饮品核心信息（id, name, category, base_price, main_image）
- 不保存完整 detail_images 和 description（减少数据冗余）

**BeverageOrderItem.spec_snapshot**:
- 保存下单时选择的所有规格（spec_type, spec_name, price_adjustment）
- 按规格类型排序，便于展示

### Snapshot vs Foreign Key

| 字段 | 存储方式 | 原因 |
|------|---------|------|
| beverage_id | 外键引用（但不加FK约束） | 保留原始饮品ID，便于统计分析（如"拿铁咖啡销量"） |
| beverage_snapshot | JSON快照 | 保证历史订单不受菜单变更影响 |
| spec_snapshot | JSON快照 | 保证历史订单不受规格变更影响 |

---

## BOM Integration

### BOM Deduction Flow

```
订单状态: PENDING_PREPARATION → PREPARING
    │
    ├─→ 1. 根据 order_id 查询所有 beverage_order_items
    │
    ├─→ 2. 遍历每个 order_item:
    │       ├─→ 根据 beverage_id + spec_snapshot 匹配 beverage_recipes
    │       │   （精确匹配规格组合，或使用基础配方）
    │       │
    │       └─→ 获取 recipes.ingredients (JSONB数组)
    │
    ├─→ 3. 合并同一SKU的用量（quantity * item.quantity）
    │
    ├─→ 4. 调用 P004 库存扣减API:
    │       POST /api/admin/inventory/adjustments
    │       {
    │           "type": "BEVERAGE_ORDER_DEDUCTION",
    │           "order_id": "xxx",
    │           "items": [
    │               {"sku_id": "sku-001", "quantity": -60, "unit": "g"},
    │               {"sku_id": "sku-002", "quantity": -400, "unit": "ml"}
    │           ]
    │       }
    │
    └─→ 5. 库存扣减成功 → 订单状态更新为 PREPARING
        库存不足 → 返回错误，订单保持 PENDING_PREPARATION
```

### Recipe Matching Logic

```sql
-- 1. 优先匹配精确规格组合的配方
SELECT * FROM beverage_recipes
WHERE beverage_id = :beverageId
  AND spec_combination @> :specSnapshotJson  -- 包含所有选中规格
ORDER BY jsonb_array_length(spec_combination::jsonb) DESC
LIMIT 1;

-- 2. 如无精确匹配，使用基础配方（spec_combination = '{}'）
SELECT * FROM beverage_recipes
WHERE beverage_id = :beverageId
  AND spec_combination = '{}'::jsonb
LIMIT 1;
```

**示例**:
- 订单选择：大杯 + 珍珠
- 配方1：`{"SIZE": "大杯", "TOPPING": "珍珠"}` ✅ 精确匹配
- 配方2：`{"SIZE": "大杯"}` ❌ 不完全匹配
- 配方3：`{}` ✅ 基础配方（备选）

---

## Performance Optimization

### Index Strategy

1. **高频查询字段**: status, created_at, user_id, category
2. **关联查询**: beverage_id, order_id（外键字段）
3. **JSON字段**: 使用 GIN 索引支持 JSON 查询（spec_combination）

### Query Optimization

**C端菜单查询**（按分类，只显示上架饮品）:
```sql
SELECT id, name, category, base_price, main_image, is_recommended
FROM beverages
WHERE status = 'ACTIVE'
ORDER BY category, is_recommended DESC, created_at DESC;
```
*使用索引*: `idx_beverage_status`, `idx_beverage_category`

**B端订单列表查询**（支持轮询新订单）:
```sql
SELECT o.id, o.order_no, o.queue_number, o.status, o.total_price, o.created_at,
       COUNT(oi.id) AS item_count
FROM beverage_orders o
LEFT JOIN beverage_order_items oi ON o.id = oi.order_id
WHERE o.status IN ('PENDING_PREPARATION', 'PREPARING', 'COMPLETED')
  AND o.created_at > :lastPollTime
GROUP BY o.id
ORDER BY o.created_at DESC;
```
*使用索引*: `idx_beverage_order_status`, `idx_beverage_order_created_at`

**我的订单查询**（C端用户历史订单）:
```sql
SELECT * FROM beverage_orders
WHERE user_id = :userId
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```
*使用索引*: `idx_beverage_order_user_id`, `idx_beverage_order_created_at`

---

## Database Migration Script

完整的数据库迁移脚本位于：
`backend/src/main/resources/db/migration/V003__create_beverage_order_tables.sql`

```sql
-- @spec O003-beverage-order
-- Supabase PostgreSQL 数据库迁移脚本

-- 1. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 创建饮品表
CREATE TABLE beverages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('COFFEE', 'TEA', 'JUICE', 'SMOOTHIE', 'MILK_TEA', 'OTHER')),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    description TEXT,
    main_image TEXT,
    detail_images JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_beverage_category ON beverages(category);
CREATE INDEX idx_beverage_status ON beverages(status);
CREATE INDEX idx_beverage_is_recommended ON beverages(is_recommended);
CREATE INDEX idx_beverage_created_at ON beverages(created_at DESC);

CREATE TRIGGER update_beverage_updated_at
    BEFORE UPDATE ON beverages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. 创建饮品规格表
CREATE TABLE beverage_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
    spec_type VARCHAR(50) NOT NULL CHECK (spec_type IN ('SIZE', 'TEMPERATURE', 'SWEETNESS', 'TOPPING')),
    spec_name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_beverage_spec_beverage_id ON beverage_specs(beverage_id);
CREATE INDEX idx_beverage_spec_type ON beverage_specs(spec_type);
CREATE INDEX idx_beverage_spec_sort_order ON beverage_specs(sort_order);

CREATE TRIGGER update_beverage_spec_updated_at
    BEFORE UPDATE ON beverage_specs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. 创建饮品配方表
CREATE TABLE beverage_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE CASCADE,
    spec_combination JSONB DEFAULT '{}',
    ingredients JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_beverage_recipe_beverage_id ON beverage_recipes(beverage_id);
CREATE INDEX idx_beverage_recipe_spec_combination ON beverage_recipes USING gin(spec_combination);

CREATE TRIGGER update_beverage_recipe_updated_at
    BEFORE UPDATE ON beverage_recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 创建饮品订单表
CREATE TABLE beverage_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) UNIQUE NOT NULL,
    queue_number VARCHAR(10) NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'PENDING_PREPARATION', 'PREPARING', 'COMPLETED', 'DELIVERED', 'CANCELLED')),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    payment_method VARCHAR(50),
    payment_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    remark TEXT
);

CREATE INDEX idx_beverage_order_user_id ON beverage_orders(user_id);
CREATE INDEX idx_beverage_order_status ON beverage_orders(status);
CREATE INDEX idx_beverage_order_created_at ON beverage_orders(created_at DESC);
CREATE INDEX idx_beverage_order_queue_number ON beverage_orders(queue_number);

-- 6. 创建订单项表
CREATE TABLE beverage_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    beverage_id UUID NOT NULL,
    beverage_snapshot JSONB NOT NULL,
    spec_snapshot JSONB NOT NULL DEFAULT '[]',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_beverage_order_item_order_id ON beverage_order_items(order_id);
CREATE INDEX idx_beverage_order_item_beverage_id ON beverage_order_items(beverage_id);

-- 7. 创建取餐号表
CREATE TABLE queue_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_no VARCHAR(10) NOT NULL,
    order_id UUID UNIQUE NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'CALLED', 'PICKED_UP')),
    called_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_queue_number_queue_no ON queue_numbers(queue_no);
CREATE INDEX idx_queue_number_status ON queue_numbers(status);
CREATE INDEX idx_queue_number_created_at ON queue_numbers(created_at DESC);

-- 8. 插入测试数据（可选）
-- 示例饮品：拿铁咖啡
INSERT INTO beverages (id, name, category, base_price, description, main_image, status, is_recommended)
VALUES (
    'aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    '拿铁咖啡',
    'COFFEE',
    18.00,
    '经典意式拿铁，香浓醇厚',
    'https://example.com/latte.jpg',
    'ACTIVE',
    true
);

-- 拿铁规格配置
INSERT INTO beverage_specs (beverage_id, spec_type, spec_name, price_adjustment, is_default, sort_order)
VALUES
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'SIZE', '中杯', 0, true, 1),
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'SIZE', '大杯', 3, false, 2),
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'TEMPERATURE', '热', 0, true, 1),
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'TEMPERATURE', '冰', 0, false, 2),
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'SWEETNESS', '标准糖', 0, true, 1),
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'SWEETNESS', '半糖', 0, false, 2),
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'TOPPING', '不加配料', 0, true, 1),
    ('aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'TOPPING', '珍珠', 2, false, 2);

-- 拿铁基础配方
INSERT INTO beverage_recipes (beverage_id, spec_combination, ingredients)
VALUES (
    'aa1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    '{}',
    '[
        {"sku_id": "sku-001", "sku_name": "咖啡豆", "quantity": 15, "unit": "g"},
        {"sku_id": "sku-002", "sku_name": "牛奶", "quantity": 150, "unit": "ml"}
    ]'
);

COMMENT ON TABLE beverages IS '@spec O003-beverage-order 饮品表';
COMMENT ON TABLE beverage_specs IS '@spec O003-beverage-order 饮品规格表';
COMMENT ON TABLE beverage_recipes IS '@spec O003-beverage-order 饮品配方表';
COMMENT ON TABLE beverage_orders IS '@spec O003-beverage-order 饮品订单表';
COMMENT ON TABLE beverage_order_items IS '@spec O003-beverage-order 订单项表';
COMMENT ON TABLE queue_numbers IS '@spec O003-beverage-order 取餐号表';
```

---

## Summary

本数据模型设计涵盖了饮品订单创建与出品管理的核心业务实体：

1. **饮品管理**: Beverage（饮品）、BeverageSpec（规格）、BeverageRecipe（配方）
2. **订单管理**: BeverageOrder（订单）、BeverageOrderItem（订单项）、QueueNumber（取餐号）
3. **快照机制**: 订单项保存饮品和规格快照，确保历史订单不受菜单变更影响
4. **状态驱动**: 订单和取餐号采用明确的状态机模型，支持完整的业务流程
5. **BOM集成**: 配方设计支持与P003/P004库存管理集成，实现自动扣料
6. **性能优化**: 合理使用索引、JSON字段、外键约束，平衡查询性能和数据一致性

所有表结构、索引、约束、触发器已在迁移脚本中定义，可直接在Supabase PostgreSQL执行。

---

## 变更历史

| 版本 | 日期 | 变更说明 | 作者 |
|------|------|---------|------|
| 1.0.0 | 2025-12-27 | 初始版本，定义核心实体 | Claude |
| 1.1.0 | 2025-12-28 | 增强数据模型文档，完善快照机制、BOM集成、性能优化说明 | Claude |

---

**文档结束**
