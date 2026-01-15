# API Contracts Documentation

**Feature**: O003-beverage-order (饮品订单创建与出品管理)
**Version**: 1.0.0
**Date**: 2025-12-27
**Status**: Ready for Implementation

---

## 目录

1. [概述](#概述)
2. [API分组说明](#api分组说明)
3. [认证机制](#认证机制)
4. [错误码规范](#错误码规范)
5. [使用示例](#使用示例)
6. [集成说明](#集成说明)
7. [开发指南](#开发指南)

---

## 概述

本文档定义了饮品订单创建与出品管理功能的完整 API 契约，遵循 OpenAPI 3.0 规范。

### 功能范围

- **C端功能**：饮品菜单浏览、订单创建、Mock支付、订单查询、取餐号查询
- **B端功能**：订单接收、出品管理、BOM扣料、叫号通知
- **管理端功能**：饮品CRUD、规格配置、配方管理（仅后端API，无UI）

### 技术规范

- **API风格**: RESTful
- **数据格式**: JSON
- **认证方式**: JWT Bearer Token
- **响应标准**: 遵循 `.claude/rules/08-api-standards.md`
- **错误编号**: 遵循 R8.8 异常编号规范

---

## API分组说明

### 1. C端 - 饮品菜单 (Client - Beverages)

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/client/beverages` | GET | 获取饮品菜单列表（分类、分页） | 可选 |
| `/api/client/beverages/{id}` | GET | 获取饮品详情（含规格、营养信息） | 可选 |
| `/api/client/beverage-specs` | GET | 获取可选规格列表（全局） | 可选 |

**使用场景**:
- 顾客进入小程序，浏览饮品菜单
- 查看饮品详情，选择规格（大小、温度、甜度、配料）

---

### 2. C端 - 订单管理 (Client - Orders)

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/client/beverage-orders` | POST | 创建饮品订单 | 必需 |
| `/api/client/beverage-orders/{id}/pay` | POST | Mock支付订单（MVP） | 必需 |
| `/api/client/beverage-orders/{id}` | GET | 查询订单详情 | 必需 |
| `/api/client/beverage-orders/my` | GET | 我的订单列表（历史订单） | 必需 |

**使用场景**:
- 顾客选择饮品后创建订单
- Mock支付（点击按钮自动成功）
- 查询订单状态（轮询8秒）
- 查看历史订单

---

### 3. C端 - 取餐号查询 (Client - Queue)

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/client/queue-numbers/{orderId}` | GET | 查询取餐号和叫号状态 | 必需 |

**使用场景**:
- 支付成功后获取取餐号（D001-D999）
- 轮询查询叫号状态（是否已叫号）

---

### 4. B端 - 订单管理 (Admin - Orders)

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/admin/beverage-orders` | GET | B端订单列表（分页、筛选） | 必需 |
| `/api/admin/beverage-orders/pending` | GET | 待处理订单（轮询端点） | 必需 |
| `/api/admin/beverage-orders/{id}/status` | PUT | 更新订单状态 | 必需 |
| `/api/admin/beverage-orders/{id}/call` | POST | 叫号通知 | 必需 |
| `/api/admin/beverage-orders/{id}` | GET | B端订单详情（含BOM清单） | 必需 |
| `/api/admin/beverage-orders/{id}/deduct-inventory` | POST | BOM扣料（集成P003/P004） | 必需 |

**使用场景**:
- B端工作人员实时接收新订单（8秒轮询）
- 查看订单详情和BOM清单（所需原料）
- 标记订单状态：待制作 → 制作中 → 已完成 → 已交付
- 执行BOM扣料（自动扣减原料库存）
- 触发叫号通知（Mock语音 + 小程序推送）

---

### 5. 后端 - 饮品管理 (Admin - Beverages)

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/admin/beverages` | POST | 创建饮品 | 必需 |
| `/api/admin/beverages/{id}` | PUT | 更新饮品 | 必需 |
| `/api/admin/beverages/{id}` | DELETE | 删除/下架饮品 | 必需 |
| `/api/admin/beverage-specs` | POST | 添加饮品规格 | 必需 |
| `/api/admin/beverage-recipes` | POST | 配置饮品配方（BOM） | 必需 |

**使用场景**:
- 后端管理员通过 Supabase Studio 或 API 调试工具录入饮品数据
- MVP阶段不实现B端管理UI，仅提供API

---

## 认证机制

### JWT Bearer Token

所有需要认证的API都必须在请求头中包含JWT Token：

```http
Authorization: Bearer <JWT_TOKEN>
```

### Token获取

- 复用现有认证系统（U003-wechat-miniapp-login）
- Token由 `authService.ts` 管理
- Token过期时自动刷新（通过 `utils/request.ts`）

### Token示例

```typescript
// 前端自动附加Token
import { request } from '@/utils/request';

const response = await request({
  url: '/api/client/beverage-orders',
  method: 'POST',
  data: { storeId: 'xxx', items: [...] }
  // Token会自动附加到请求头
});
```

---

## 错误码规范

遵循 `.claude/rules/08-api-standards.md` 的 R8.8 异常编号规范。

### 错误码格式

```
<模块前缀>_<类别>_<序号>
```

- **模块前缀**: `ORD` (Order)、`BEV` (Beverage)、`CMN` (Common)
- **类别**: `VAL` (验证)、`NTF` (未找到)、`DUP` (重复)、`BIZ` (业务规则)、`SYS` (系统错误)
- **序号**: 001-999

### 订单模块错误码

| 错误码 | HTTP状态码 | 说明 | 示例场景 |
|--------|-----------|------|---------|
| `ORD_VAL_001` | 400 | 订单验证失败 | 订单至少包含一个饮品 |
| `ORD_VAL_002` | 400 | 规格选择无效 | 选择的规格不存在 |
| `ORD_VAL_003` | 422 | 库存不足 | 饮品或原料库存不足 |
| `ORD_NTF_001` | 404 | 订单不存在 | 订单ID无效 |
| `ORD_NTF_002` | 404 | 取餐号不存在 | 取餐号未生成 |
| `ORD_BIZ_001` | 422 | 订单状态不允许变更 | 已交付的订单无法返回制作中 |
| `ORD_BIZ_002` | 422 | BOM扣料失败 | 原料库存不足 |
| `ORD_DUP_001` | 409 | 重复支付 | 订单已支付 |
| `ORD_SYS_001` | 500 | 系统内部错误 | 服务器异常 |

### 饮品模块错误码

| 错误码 | HTTP状态码 | 说明 | 示例场景 |
|--------|-----------|------|---------|
| `BEV_NTF_001` | 404 | 饮品不存在 | 饮品ID无效 |
| `BEV_VAL_001` | 400 | 饮品数据验证失败 | 价格必须大于0 |

### 通用错误码

| 错误码 | HTTP状态码 | 说明 | 示例场景 |
|--------|-----------|------|---------|
| `CMN_VAL_001` | 400 | 请求参数验证失败 | 页码必须大于0 |
| `CMN_AUT_001` | 401 | 未认证 | Token缺失或无效 |
| `CMN_PRM_001` | 403 | 无权限 | 非管理员访问管理端API |

### 错误响应格式

```json
{
  "success": false,
  "error": "ORD_VAL_003",
  "message": "库存不足",
  "details": {
    "beverageId": "550e8400-e29b-41d4-a716-446655440000",
    "beverageName": "美式咖啡",
    "availableQuantity": 0
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

---

## 使用示例

### 示例 1: C端下单流程

#### Step 1: 获取饮品菜单

```http
GET /api/client/beverages?category=COFFEE HTTP/1.1
Host: api.cinema.com
```

**响应**:
```json
{
  "success": true,
  "data": {
    "COFFEE": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "美式咖啡",
        "description": "经典美式咖啡，浓郁香醇",
        "category": "COFFEE",
        "basePrice": 15.00,
        "imageUrl": "https://storage.supabase.co/.../americano.jpg",
        "status": "ACTIVE",
        "isRecommended": true
      }
    ]
  },
  "total": 10,
  "page": 1,
  "pageSize": 20,
  "timestamp": "2025-12-27T10:30:00Z"
}
```

#### Step 2: 查看饮品详情

```http
GET /api/client/beverages/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: api.cinema.com
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "美式咖啡",
    "specs": {
      "SIZE": [
        {
          "id": "spec-001",
          "specType": "SIZE",
          "specName": "小杯",
          "specCode": "small",
          "priceAdjustment": 0,
          "isDefault": true
        },
        {
          "id": "spec-002",
          "specType": "SIZE",
          "specName": "大杯",
          "specCode": "large",
          "priceAdjustment": 5.00,
          "isDefault": false
        }
      ],
      "TEMPERATURE": [...]
    }
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

#### Step 3: 创建订单

```http
POST /api/client/beverage-orders HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "storeId": "store-456",
  "items": [
    {
      "beverageId": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 2,
      "selectedSpecs": {
        "size": {
          "name": "大杯",
          "code": "large",
          "priceAdjustment": 5.00
        },
        "temperature": {
          "name": "冰",
          "code": "cold",
          "priceAdjustment": 0
        }
      }
    }
  ],
  "customerNote": "少冰，谢谢"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "orderNumber": "BORDT202512271430251234",
    "totalPrice": 40.00,
    "status": "PENDING_PAYMENT",
    "items": [...]
  },
  "timestamp": "2025-12-27T14:30:25Z"
}
```

#### Step 4: Mock支付

```http
POST /api/client/beverage-orders/order-123/pay HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "paymentMethod": "MOCK_WECHAT_PAY"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "orderId": "order-123",
    "orderNumber": "BORDT202512271430251234",
    "queueNumber": "D042",
    "status": "PENDING_PRODUCTION",
    "transactionId": "MOCK_1735291830000",
    "paidAt": "2025-12-27T14:30:30Z"
  },
  "timestamp": "2025-12-27T14:30:30Z"
}
```

#### Step 5: 轮询查询订单状态

```http
GET /api/client/beverage-orders/order-123 HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <JWT_TOKEN>
```

**前端实现（Taro）**:
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: order } = useQuery({
  queryKey: ['beverage-order', orderId],
  queryFn: () => fetchOrderDetail(orderId),
  refetchInterval: 8000, // 8秒轮询
  enabled: order?.status !== 'DELIVERED', // 终态停止轮询
});
```

---

### 示例 2: B端出品流程

#### Step 1: 轮询待处理订单

```http
GET /api/admin/beverage-orders/pending?storeId=store-456 HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**前端实现（React）**:
```typescript
import { useQuery } from '@tanstack/react-query';

const { data: orders } = useQuery({
  queryKey: ['beverage-orders', 'pending', storeId],
  queryFn: () => fetchPendingOrders(storeId),
  refetchInterval: 8000, // 8秒轮询
  refetchIntervalInBackground: false,
});
```

#### Step 2: 查看订单详情（含BOM清单）

```http
GET /api/admin/beverage-orders/order-123 HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "orderNumber": "BORDT202512271430251234",
    "items": [...],
    "bomList": [
      {
        "skuId": "sku-coffee-beans",
        "skuName": "咖啡豆",
        "quantity": 40,
        "unit": "g",
        "availableQuantity": 500
      },
      {
        "skuId": "sku-water",
        "skuName": "水",
        "quantity": 600,
        "unit": "ml",
        "availableQuantity": 5000
      }
    ]
  },
  "timestamp": "2025-12-27T14:30:50Z"
}
```

#### Step 3: 开始制作（自动BOM扣料）

```http
PUT /api/admin/beverage-orders/order-123/status HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "status": "PRODUCING"
}
```

**后端逻辑**:
1. 查询订单中所有饮品的配方
2. 计算所需原料总量
3. 调用 P003 库存查询API校验库存
4. 调用 P004 库存扣减API执行扣料（悲观锁）
5. 更新订单状态为 PRODUCING

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "status": "PRODUCING",
    "productionStartTime": "2025-12-27T14:31:00Z"
  },
  "timestamp": "2025-12-27T14:31:00Z"
}
```

#### Step 4: 完成制作

```http
PUT /api/admin/beverage-orders/order-123/status HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

#### Step 5: 触发叫号

```http
POST /api/admin/beverage-orders/order-123/call HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "queueNumber": "D042",
    "calledAt": "2025-12-27T14:35:10Z"
  },
  "message": "叫号成功，已通知顾客取餐",
  "timestamp": "2025-12-27T14:35:10Z"
}
```

**前端逻辑**:
- B端：显示"已叫号"状态，Mock语音播报（不实际播放音频）
- C端：小程序推送通知 + 震动提醒

#### Step 6: 顾客取餐

```http
PUT /api/admin/beverage-orders/order-123/status HTTP/1.1
Host: api.cinema.com
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "status": "DELIVERED"
}
```

---

## 集成说明

### 集成P003/P004库存管理

BOM扣料功能依赖现有库存管理模块：

#### 依赖的API

| API | 用途 | 提供方 |
|-----|------|--------|
| `GET /api/inventory/store/{storeId}/sku/{skuId}` | 查询单个原料库存 | P003-inventory-query |
| `POST /api/inventory/adjustments/deduct` | 批量扣减库存 | P004-inventory-adjustment |
| `GET /api/inventory/batch` | 批量查询库存（校验） | P003-inventory-query |

#### 数据依赖关系

```
beverage_recipes (饮品配方表)
  └─> recipe_ingredients (配方原料关联表)
        └─> skus (SKU主数据, 来自P001)
              └─> store_inventory (门店库存表, 来自P003)
```

#### 扣料流程

```java
@Transactional
public void startProduction(String orderId) {
    // 1. 获取订单中所有饮品的配方
    List<BeverageOrderItem> items = order.getItems();

    // 2. 计算所需原料总量
    Map<String, BigDecimal> ingredientRequirements = calculateIngredients(items);

    // 3. 悲观锁查询库存（FOR UPDATE）
    List<StoreInventory> inventories = inventoryRepository
        .findByStoreAndSkusForUpdate(order.getStoreId(), ingredientRequirements.keySet());

    // 4. 校验库存充足性
    validateInventorySufficiency(ingredientRequirements, inventories);

    // 5. 调用P004执行扣料
    inventoryAdjustmentService.deductInventory(
        order.getStoreId(),
        ingredientRequirements,
        "BOM_DEDUCTION",
        orderId // 关联订单号
    );

    // 6. 更新订单状态
    order.setStatus(OrderStatus.PRODUCING);
    orderRepository.save(order);
}
```

---

## 开发指南

### 前端开发

#### C端（Taro）

**项目路径**: `hall-reserve-taro/`

**关键文件**:
- `src/services/beverageService.ts` - 饮品API服务
- `src/services/beverageOrderService.ts` - 订单API服务
- `src/stores/beverageOrderStore.ts` - 订单状态管理（Zustand）
- `src/pages/beverage-menu/index.tsx` - 饮品菜单页
- `src/pages/beverage-order-detail/index.tsx` - 订单详情页

**API调用示例**:
```typescript
// src/services/beverageOrderService.ts
import { request } from '@/utils/request';
import type { BeverageOrderDTO, CreateBeverageOrderRequest } from '@/types/beverage';

export const createBeverageOrder = async (
  data: CreateBeverageOrderRequest
): Promise<BeverageOrderDTO> => {
  return request({
    url: '/api/client/beverage-orders',
    method: 'POST',
    data,
  });
};

export const mockPayment = async (orderId: string): Promise<void> => {
  return request({
    url: `/api/client/beverage-orders/${orderId}/pay`,
    method: 'POST',
    data: { paymentMethod: 'MOCK_WECHAT_PAY' },
  });
};
```

**轮询实现**:
```typescript
// src/pages/beverage-order-detail/index.tsx
import { useQuery } from '@tanstack/react-query';

const BeverageOrderDetail = () => {
  const { id } = Taro.getCurrentInstance().router.params;

  const { data: order } = useQuery({
    queryKey: ['beverage-order', id],
    queryFn: () => fetchOrderDetail(id),
    refetchInterval: 8000,
    enabled: order?.status !== 'DELIVERED' && order?.status !== 'CANCELLED',
  });

  return <View>{/* UI */}</View>;
};
```

---

#### B端（React）

**项目路径**: `frontend/src/features/beverage-order/`

**关键文件**:
- `services/beverageOrderService.ts` - 订单API服务
- `hooks/usePendingOrders.ts` - 待处理订单轮询Hook
- `components/OrderList.tsx` - 订单列表组件
- `components/OrderDetail.tsx` - 订单详情组件

**轮询实现**:
```typescript
// frontend/src/features/beverage-order/hooks/usePendingOrders.ts
import { useQuery } from '@tanstack/react-query';

export const usePendingOrders = (storeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['beverage-orders', 'pending', storeId],
    queryFn: () => fetchPendingOrders(storeId),
    refetchInterval: enabled ? 8000 : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
};
```

---

### 后端开发

#### 项目路径

`backend/src/main/java/com/cinema/order/`

#### 目录结构

```
backend/src/main/java/com/cinema/order/
├── controller/
│   ├── BeverageController.java           # C端饮品API
│   ├── BeverageOrderController.java      # C端订单API
│   └── admin/
│       ├── BeverageAdminController.java  # 后端饮品管理API
│       └── BeverageOrderAdminController.java # B端订单管理API
├── service/
│   ├── BeverageService.java
│   ├── BeverageOrderService.java
│   ├── BeverageRecipeService.java
│   └── QueueNumberService.java
├── repository/
│   ├── BeverageRepository.java
│   ├── BeverageOrderRepository.java
│   └── QueueNumberRepository.java
├── domain/
│   ├── Beverage.java
│   ├── BeverageOrder.java
│   └── QueueNumber.java
├── dto/
│   ├── BeverageDTO.java
│   ├── BeverageOrderDTO.java
│   └── request/
│       └── CreateBeverageOrderRequest.java
└── exception/
    ├── OrderNotFoundException.java
    └── InsufficientInventoryException.java
```

#### API实现示例

```java
/**
 * @spec O003-beverage-order
 * C端饮品订单API控制器
 */
@RestController
@RequestMapping("/api/client/beverage-orders")
public class BeverageOrderController {

    @Autowired
    private BeverageOrderService orderService;

    /**
     * 创建饮品订单
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BeverageOrderDTO>> createOrder(
        @Valid @RequestBody CreateBeverageOrderRequest request
    ) {
        BeverageOrder order = orderService.createOrder(request);
        BeverageOrderDTO dto = orderService.toDTO(order);
        return ResponseEntity.status(201).body(ApiResponse.success(dto));
    }

    /**
     * Mock支付
     */
    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Map<String, Object>>> payOrder(
        @PathVariable String id
    ) {
        BeverageOrder order = orderService.markAsPaid(id);
        Map<String, Object> result = Map.of(
            "orderId", order.getId(),
            "orderNumber", order.getOrderNumber(),
            "queueNumber", order.getQueueNumber().getQueueNumber(),
            "status", order.getStatus(),
            "transactionId", "MOCK_" + System.currentTimeMillis(),
            "paidAt", order.getPaidAt()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
```

---

### TypeScript类型定义

**前端类型定义示例**:

```typescript
// frontend/src/types/beverage.ts

/**
 * @spec O003-beverage-order
 * 饮品订单相关类型定义
 */

export interface BeverageDTO {
  id: string;
  name: string;
  description?: string;
  category: 'COFFEE' | 'TEA' | 'JUICE' | 'SMOOTHIE' | 'MILK_TEA' | 'OTHER';
  basePrice: number;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BeverageSpecDTO {
  id: string;
  specType: 'SIZE' | 'TEMPERATURE' | 'SWEETNESS' | 'TOPPING';
  specName: string;
  specCode: string;
  priceAdjustment: number;
  isDefault: boolean;
}

export interface SelectedSpec {
  name: string;
  code: string;
  priceAdjustment: number;
}

export interface CreateBeverageOrderRequest {
  storeId: string;
  items: {
    beverageId: string;
    quantity: number;
    selectedSpecs: Record<string, SelectedSpec>;
  }[];
  customerNote?: string;
}

export interface BeverageOrderDTO {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  totalPrice: number;
  status: 'PENDING_PAYMENT' | 'PENDING_PRODUCTION' | 'PRODUCING' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';
  queueNumber?: string;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  productionStartTime?: string;
  completedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  customerNote?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueueNumberDTO {
  id: string;
  queueNumber: string;
  orderId: string;
  storeId: string;
  date: string;
  sequence: number;
  status: 'PENDING' | 'CALLED' | 'PICKED';
  calledAt?: string;
  pickedAt?: string;
  createdAt: string;
}
```

---

## 附录

### OpenAPI规范文件

完整的API规范请参阅 `api.yaml` 文件。

### 工具推荐

- **API测试**: Postman、Insomnia、Thunder Client
- **文档预览**: Swagger UI、Redoc
- **代码生成**: OpenAPI Generator

### 相关文档

- `spec.md` - 功能规格说明
- `data-model.md` - 数据模型定义
- `research.md` - 技术研究决策

---

**文档维护**: 本文档由 Claude Code 生成，遵循项目宪章规范。如有疑问或需要更新，请联系开发团队。
