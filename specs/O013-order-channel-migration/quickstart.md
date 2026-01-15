# Quickstart: 订单模块迁移至渠道商品体系

**Spec**: O013-order-channel-migration  
**Date**: 2026-01-14

---

## Prerequisites

在开始实施前，请确保以下条件满足：

### 1. 数据库环境

```bash
# 确保 PostgreSQL 运行
docker compose up -d postgres

# 验证 channel_product_config 表存在且有数据
psql -U cinema -d cinema_dev -c "SELECT COUNT(*) FROM channel_product_config;"
```

### 2. 后端服务

```bash
cd backend
mvn clean install -DskipTests
```

### 3. 依赖功能已完成

- [x] O005-channel-product-config: 渠道商品配置
- [x] P001-sku-master-data: SKU 主数据
- [x] O007-miniapp-menu-api: 小程序菜单 API
- [x] O010-shopping-cart: 购物车功能

---

## Quick Verification

### Step 1: 执行数据库迁移

```bash
# 应用迁移脚本
cd backend
mvn flyway:migrate

# 验证 beverage_order_items 表结构更新
psql -U cinema -d cinema_dev -c "\d beverage_order_items"

# 应该看到新字段: channel_product_id, sku_id, product_snapshot
```

### Step 2: 启动后端服务

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Step 3: 测试创建订单 API

```bash
# 1. 获取可用的渠道商品
curl -s http://localhost:8080/api/client/menus?storeId=00000000-0000-0000-0000-000000000099 | jq '.data[0]'

# 2. 创建订单 (使用 channelProductId)
curl -X POST http://localhost:8080/api/client/orders \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "storeId": "00000000-0000-0000-0000-000000000099",
    "items": [
      {
        "channelProductId": "<CHANNEL_PRODUCT_ID>",
        "quantity": 1,
        "selectedSpecs": {
          "SIZE": {
            "optionId": "opt-001",
            "optionName": "中杯",
            "priceAdjust": 0
          }
        }
      }
    ]
  }'

# 3. 验证响应
# - 订单 ID 应该返回
# - 订单项包含 channelProductId 和 productSnapshot
```

### Step 4: 验证旧表已删除

```bash
# 验证 beverages 表不存在
psql -U cinema -d cinema_dev -c "SELECT 1 FROM beverages LIMIT 1;" 2>&1 | grep -q "does not exist" && echo "OK: beverages table deleted"

# 验证 beverage_specs 表不存在
psql -U cinema -d cinema_dev -c "SELECT 1 FROM beverage_specs LIMIT 1;" 2>&1 | grep -q "does not exist" && echo "OK: beverage_specs table deleted"
```

---

## API Changes Summary

### Breaking Changes

| Before | After |
|--------|-------|
| `POST /api/client/beverage-orders` | `POST /api/client/orders` |
| `GET /api/client/beverage-orders/{id}` | `GET /api/client/orders/{id}` |
| Request: `skuId` / `beverageId` | Request: `channelProductId` |

### Request Body Change

**Before (O012)**:
```json
{
  "storeId": "uuid",
  "items": [
    {
      "skuId": "uuid",
      "quantity": 1,
      "selectedSpecs": {"size": "大杯"}
    }
  ]
}
```

**After (O013)**:
```json
{
  "storeId": "uuid",
  "items": [
    {
      "channelProductId": "uuid",
      "quantity": 1,
      "selectedSpecs": {
        "SIZE": {
          "optionId": "opt-001",
          "optionName": "大杯",
          "priceAdjust": 300
        }
      }
    }
  ]
}
```

---

## Frontend Integration (miniapp-ordering-taro)

### 1. 购物车数据结构更新

```typescript
// src/store/cart.ts

interface CartItem {
  // Before: skuId or beverageId
  // After:
  channelProductId: string;
  channelProduct: ChannelProduct;  // 完整商品信息
  selectedSpecs: Record<string, SelectedSpecOption>;
  quantity: number;
}
```

### 2. 下单请求更新

```typescript
// src/api/order.ts

export const createOrder = async (params: CreateOrderParams) => {
  return request.post('/api/client/orders', {  // 新路径
    storeId: params.storeId,
    items: params.items.map(item => ({
      channelProductId: item.channelProductId,  // 新字段
      quantity: item.quantity,
      selectedSpecs: item.selectedSpecs,
    })),
  });
};
```

### 3. 订单详情展示更新

```typescript
// 订单项现在包含 productSnapshot，可直接显示
const orderItem = {
  productName: item.productName,           // 从快照
  productImageUrl: item.productImageUrl,   // 从快照
  selectedSpecs: item.selectedSpecs,
  unitPrice: item.unitPrice,
  quantity: item.quantity,
};
```

---

## Testing Checklist

### Postman/API Tests

- [ ] `POST /api/client/orders` - 创建订单成功
- [ ] `POST /api/client/orders` - 商品不存在返回 404
- [ ] `POST /api/client/orders` - 商品已下架返回 400
- [ ] `POST /api/client/orders` - 库存不足返回 409
- [ ] `GET /api/client/orders/{id}` - 查询订单详情
- [ ] `GET /api/client/orders/my` - 查询我的订单列表
- [ ] `POST /api/client/orders/{id}/cancel` - 取消订单

### E2E Tests (miniapp-ordering-taro)

- [ ] 浏览菜单 → 加入购物车 → 提交订单 → 查看订单详情
- [ ] 商品规格选择正确计算价格
- [ ] 订单详情正确显示商品快照信息

### O012 Postman Tests Update

需要更新 `specs/O012-order-inventory-reservation/postman/` 中的测试：

1. Setup 增加 `Create channel_product_config` 步骤
2. 将所有 `skuId` 改为 `channelProductId`
3. 将 API 路径从 `/api/client/beverage-orders` 改为 `/api/client/orders`

---

## Rollback Plan

如果迁移失败，可以回滚：

```bash
# 1. 恢复数据库备份
pg_restore -U cinema -d cinema_dev backup_before_o013.dump

# 2. 切换到之前的代码分支
git checkout O012-order-inventory-reservation

# 3. 重新部署后端
cd backend && mvn clean install && mvn spring-boot:run
```

---

## Files to Modify

### Backend

| File | Change |
|------|--------|
| `BeverageOrderItem.java` | Add `channelProductId`, `skuId`, `productSnapshot` fields |
| `BeverageOrderService.java` | Update order creation logic |
| `BeverageOrderController.java` | Change API path to `/api/client/orders` |
| `CreateOrderRequest.java` | Change `skuId` to `channelProductId` |
| `Beverage*.java` | Delete (entity, repository, service) |
| `V*.sql` | Migration scripts |

### Frontend (miniapp-ordering-taro)

| File | Change |
|------|--------|
| `src/store/cart.ts` | Use `channelProductId` |
| `src/api/order.ts` | Update API path and request body |
| `src/pages/order/detail.tsx` | Use `productSnapshot` for display |

---

## Support

遇到问题？检查：

1. **外键错误**: 确保 `channel_product_config` 表中有对应记录
2. **编译错误**: 删除 Beverage 相关类后需要清理所有引用
3. **测试失败**: 确保 O012 Postman 测试已更新

查看完整规格：[spec.md](./spec.md)  
查看数据模型：[data-model.md](./data-model.md)  
查看 API 契约：[contracts/api.yaml](./contracts/api.yaml)
