# Research: 订单模块迁移至渠道商品体系

**Spec**: O013-order-channel-migration  
**Date**: 2026-01-14  
**Status**: Complete

---

## 1. 现有订单数据模型分析

### 1.1 beverage_order_items 表结构

**当前外键约束**:
```sql
-- 来源: backend/src/main/resources/db/migration/V001__baseline_schema_2026_01_13.sql
CREATE TABLE IF NOT EXISTS beverage_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES beverage_orders(id) ON DELETE CASCADE,
    beverage_id UUID NOT NULL REFERENCES beverages(id) ON DELETE RESTRICT,  -- 问题外键
    beverage_name VARCHAR(100) NOT NULL,
    beverage_image_url TEXT,
    selected_specs JSONB NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    customer_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

**问题**: `beverage_id` 外键指向 `beverages` 表，但当前系统已切换到 `channel_product_config` 获取商品数据。

### 1.2 BeverageOrderService.createOrder() 逻辑

**当前实现** (backend/src/main/java/com/cinema/beverage/service/BeverageOrderService.java):

```java
// 当前实现：使用 skuId 查询 SKU 表
private BeverageOrderItem createOrderItem(BeverageOrder order, OrderItemRequest itemRequest) {
    Sku sku = skuRepository.findById(itemRequest.getSkuId())
            .orElseThrow(() -> new SkuNotFoundException(itemRequest.getSkuId()));
    
    return BeverageOrderItem.builder()
            .beverageId(sku.getId())  // 使用 beverage_id 字段存储 SKU ID
            .beverageName(sku.getName())
            .beverageImageUrl(null)
            .selectedSpecs(selectedSpecsJson)
            .quantity(itemRequest.getQuantity())
            .unitPrice(unitPrice)
            .subtotal(subtotal)
            .build();
}
```

**问题**: 
- `beverageId` 字段实际存储的是 SKU ID，但外键约束指向 `beverages` 表
- 无法获取 `channel_product_config` 的展示名称、图片等信息

### 1.3 O012 库存预占 BOM 展开

**数据流**:
```
CreateOrderRequest.items[].skuId 
  → BomExpansionService.expandBomBatch(skuIds)
  → InventoryReservationService.reserveInventory(orderId, storeId, materialQuantities)
```

**关键发现**: BOM 展开使用 SKU ID，与 `channel_product_config` 通过 `sku_id` 字段关联。

---

## 2. 渠道商品配置数据模型

### 2.1 channel_product_config 表结构

```sql
-- 来源: backend/src/main/resources/db/migration/V001__baseline_schema_2026_01_13.sql
CREATE TABLE public.channel_product_config (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    sku_id UUID NOT NULL,                          -- 关联 SKU
    channel_type VARCHAR(50) DEFAULT 'MINI_PROGRAM',
    display_name VARCHAR(100),                     -- 渠道展示名称
    channel_category VARCHAR(50) NOT NULL,
    channel_price BIGINT,                          -- 渠道价格（分）
    main_image TEXT,                               -- 主图 URL
    detail_images JSONB,
    description TEXT,
    specs JSONB,                                   -- 规格配置 JSON
    is_recommended BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    sort_order INTEGER DEFAULT 0,
    category_id UUID REFERENCES menu_category(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### 2.2 ChannelProductConfig.specs JSON 结构

```json
[
  {
    "id": "spec-uuid",
    "type": "SIZE",
    "name": "规格",
    "required": true,
    "multiSelect": false,
    "options": [
      { "id": "opt-1", "name": "中杯", "priceAdjust": 0, "isDefault": true, "sortOrder": 0 },
      { "id": "opt-2", "name": "大杯", "priceAdjust": 300, "isDefault": false, "sortOrder": 1 }
    ]
  }
]
```

### 2.3 从 channelProductId 获取 SKU 和 BOM

**查询路径**:
```
channel_product_config.id (channelProductId)
  → channel_product_config.sku_id 
  → skus.id
  → bom_components.finished_product_id = skus.id
  → 获取 BOM 物料清单
```

**代码实现路径**:
```java
// 1. 通过 channelProductId 查询 ChannelProductConfig
ChannelProductConfig config = channelProductRepository.findById(channelProductId);

// 2. 获取关联的 SKU ID
UUID skuId = config.getSkuId();

// 3. 使用 SKU ID 进行 BOM 展开（复用现有逻辑）
bomExpansionService.expandBomBatch(List.of(skuId));
```

---

## 3. 前端数据流分析

### 3.1 miniapp-ordering-taro 购物车数据结构

**当前购物车 Store** (miniapp-ordering-taro/src/store/):
```typescript
interface CartItem {
  skuId: string;           // 当前使用 SKU ID
  name: string;
  price: number;
  quantity: number;
  selectedSpecs: Record<string, string>;
  imageUrl?: string;
}
```

**迁移后**:
```typescript
interface CartItem {
  channelProductId: string;  // 改为 channelProductId
  skuId: string;             // 保留用于库存查询
  name: string;              // 使用 displayName
  price: number;             // 使用 channelPrice
  quantity: number;
  selectedSpecs: Record<string, SpecOption>;
  imageUrl?: string;         // 使用 mainImage
}
```

### 3.2 下单请求参数

**当前请求** (`POST /api/client/beverage-orders`):
```json
{
  "storeId": "uuid",
  "items": [
    {
      "skuId": "sku-uuid",
      "quantity": 2,
      "selectedSpecs": {}
    }
  ],
  "customerNote": "备注"
}
```

**迁移后** (`POST /api/client/orders`):
```json
{
  "storeId": "uuid",
  "items": [
    {
      "channelProductId": "channel-product-uuid",
      "quantity": 2,
      "selectedSpecs": {
        "SIZE": { "id": "opt-1", "name": "大杯", "priceAdjust": 300 }
      }
    }
  ],
  "customerNote": "备注"
}
```

### 3.3 订单详情数据源

**当前**: 从 `beverage_order_items.beverage_name/beverage_image_url` 获取  
**迁移后**: 从 `beverage_order_items.product_snapshot` JSON 字段获取，包含完整商品快照

---

## 4. 迁移决策

### Decision 1: 数据库迁移策略

**选择**: 新增 `channel_product_id` 字段，逐步废弃 `beverage_id`

**Rationale**: 
- 保持向后兼容，避免破坏现有订单查询
- 系统未上线，无历史数据迁移压力

**Alternatives Rejected**:
- 直接重命名 `beverage_id` → `channel_product_id`: 需要修改大量代码，风险较高
- 使用视图抽象: 增加复杂度，不必要

### Decision 2: API 路径策略

**选择**: 重命名为 `/api/client/orders`

**Rationale**:
- 名称更通用，不再局限于 "beverage"
- 符合 clarification 会议决定

**Alternatives Rejected**:
- 保持 `/api/client/beverage-orders`: 名称与实际功能不匹配

### Decision 3: 商品快照存储

**选择**: 使用 `product_snapshot JSONB` 字段存储完整商品快照

**Rationale**:
- 确保历史订单不受商品变更影响
- 包含名称、价格、图片、规格等完整信息

**JSON Structure**:
```json
{
  "channelProductId": "uuid",
  "displayName": "拿铁咖啡",
  "mainImage": "https://...",
  "channelPrice": 2800,
  "selectedSpecs": [
    { "type": "SIZE", "name": "大杯", "priceAdjust": 300 }
  ],
  "sku": {
    "id": "sku-uuid",
    "code": "SKU001",
    "name": "拿铁咖啡"
  }
}
```

### Decision 4: O012 测试更新策略

**选择**: 更新现有 O012 测试，增加 `channel_product_config` 创建步骤

**Rationale**:
- 保留测试场景完整性
- 符合 clarification 会议决定

---

## 5. 依赖分析

### 上游依赖

| 功能 | 状态 | 说明 |
|------|------|------|
| O005-channel-product-config | ✅ 已完成 | 渠道商品配置 CRUD |
| P001-sku-master-data | ✅ 已完成 | SKU 主数据 |
| O012-order-inventory-reservation | ✅ 已完成 | 需同步更新测试 |

### 下游影响

| 功能 | 影响 | 处理方式 |
|------|------|---------|
| miniapp-ordering-taro | 需适配 | 本次迁移范围 |
| hall-reserve-taro | 不处理 | Out of Scope |
| B端订单管理 | 需适配 | 本次迁移范围 |

---

## 6. 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 外键约束删除失败 | 低 | 高 | 先删除约束，再删除表 |
| 前端数据结构不兼容 | 中 | 中 | 渐进式迁移，保留兼容字段 |
| O012 测试失败 | 中 | 低 | 先更新测试数据，再验证 |
| 编译错误 | 低 | 中 | 分模块逐步删除 |

---

## Summary

本次迁移的核心是将订单模块从旧的 `beverages` 表体系迁移到新的 `channel_product_config` 体系。主要变更：

1. **数据库**: 新增 `channel_product_id` 和 `product_snapshot` 字段
2. **后端 API**: 路径从 `/api/client/beverage-orders` 改为 `/api/client/orders`
3. **前端**: 购物车和下单使用 `channelProductId`
4. **测试**: O012 Setup 增加 `channel_product_config` 创建步骤
5. **清理**: 删除 5 个冗余表和 10+ 个冗余类文件
