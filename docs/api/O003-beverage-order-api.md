# API 接口设计文档 - 饮品订单创建与出品管理

**Feature ID**: O003-beverage-order
**System**: 商品管理中台
**Module**: 订单管理 > 饮品订单
**Version**: 1.0.0
**Date**: 2025-12-28
**Status**: Approved

---

## 目录

1. [接口概述与规范](#接口概述与规范)
2. [C端用户API](#c端用户api)
3. [B端管理API](#b端管理api)
4. [错误码定义](#错误码定义)
5. [认证授权](#认证授权)
6. [数据模型](#数据模型)

---

## 1. 接口概述与规范

### 1.1 Base URL

| 环境 | Base URL |
|-----|----------|
| 本地开发 | `http://localhost:8080` |
| 测试环境 | `https://test-api.cinema.com` |
| 生产环境 | `https://api.cinema.com` |

### 1.2 通用请求Header

```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
Accept: application/json
```

### 1.3 统一响应格式

#### 成功响应 (2xx)

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-28T10:00:00Z",
  "message": "操作成功" // 可选
}
```

#### 列表响应

```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "timestamp": "2025-12-28T10:00:00Z"
}
```

#### 错误响应 (4xx/5xx)

```json
{
  "success": false,
  "error": "ORD_NTF_001",
  "message": "订单不存在",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

### 1.4 HTTP状态码

| 状态码 | 说明 | 使用场景 |
|-------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或Token无效 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable Entity | 业务逻辑错误(如库存不足) |
| 500 | Internal Server Error | 服务器内部错误 |

---

## 2. C端用户API

### 2.1 饮品菜单 API

#### GET /api/client/beverages

**功能**: 查询饮品菜单(按分类分组)

**权限**: `ROLE_CUSTOMER`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| category | String | 否 | 分类筛选 | `COFFEE` |
| status | String | 否 | 状态筛选 | `ACTIVE` (默认) |

**请求示例**:

```http
GET /api/client/beverages?category=COFFEE&status=ACTIVE
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "COFFEE": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "美式咖啡",
        "description": "经典美式咖啡,浓郁香醇",
        "category": "COFFEE",
        "basePrice": 15.00,
        "imageUrl": "https://storage.supabase.co/.../americano.jpg",
        "detailImages": [
          "https://storage.supabase.co/.../americano-detail-1.jpg",
          "https://storage.supabase.co/.../americano-detail-2.jpg"
        ],
        "nutritionInfo": {
          "calories": 5,
          "caffeine": "150mg",
          "sugar": "0g"
        },
        "status": "ACTIVE",
        "isRecommended": true,
        "sortOrder": 1
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "拿铁咖啡",
        "description": "香浓拿铁,奶香四溢",
        "category": "COFFEE",
        "basePrice": 18.00,
        "imageUrl": "https://storage.supabase.co/.../latte.jpg",
        "status": "ACTIVE",
        "isRecommended": false
      }
    ],
    "TEA": [ ... ]
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

---

#### GET /api/client/beverages/{id}

**功能**: 查询饮品详情(含规格)

**权限**: `ROLE_CUSTOMER`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | UUID | 是 | 饮品ID |

**请求示例**:

```http
GET /api/client/beverages/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "美式咖啡",
    "description": "经典美式咖啡,浓郁香醇",
    "category": "COFFEE",
    "basePrice": 15.00,
    "imageUrl": "https://storage.supabase.co/.../americano.jpg",
    "detailImages": [ ... ],
    "nutritionInfo": { ... },
    "specs": [
      {
        "specType": "SIZE",
        "options": [
          {
            "id": "spec-001",
            "specName": "小杯",
            "specCode": "small",
            "priceAdjustment": 0,
            "isDefault": true
          },
          {
            "id": "spec-002",
            "specName": "中杯",
            "specCode": "medium",
            "priceAdjustment": 3.00,
            "isDefault": false
          },
          {
            "id": "spec-003",
            "specName": "大杯",
            "specCode": "large",
            "priceAdjustment": 5.00,
            "isDefault": false
          }
        ]
      },
      {
        "specType": "TEMPERATURE",
        "options": [
          {
            "id": "spec-004",
            "specName": "热",
            "specCode": "hot",
            "priceAdjustment": 0,
            "isDefault": true
          },
          {
            "id": "spec-005",
            "specName": "冰",
            "specCode": "cold",
            "priceAdjustment": 0,
            "isDefault": false
          }
        ]
      },
      {
        "specType": "SWEETNESS",
        "options": [ ... ]
      },
      {
        "specType": "TOPPING",
        "options": [
          {
            "id": "spec-010",
            "specName": "珍珠",
            "specCode": "pearl",
            "priceAdjustment": 3.00,
            "isDefault": false
          }
        ]
      }
    ],
    "status": "ACTIVE"
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

**错误响应** (404 Not Found):

```json
{
  "success": false,
  "error": "BEV_NTF_001",
  "message": "饮品不存在",
  "details": {
    "beverageId": "550e8400-e29b-41d4-a716-446655440001"
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

---

### 2.2 订单管理 API

#### POST /api/client/beverage-orders

**功能**: 创建饮品订单

**权限**: `ROLE_CUSTOMER`

**请求Body**:

```json
{
  "userId": "user-550e8400-e29b-41d4-a716-446655440000",
  "storeId": "store-550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "beverageId": "550e8400-e29b-41d4-a716-446655440001",
      "beverageName": "美式咖啡",
      "beverageImageUrl": "https://storage.supabase.co/.../americano.jpg",
      "selectedSpecs": {
        "size": {
          "name": "大杯",
          "code": "large",
          "priceAdjustment": 5.00
        },
        "temperature": {
          "name": "热",
          "code": "hot",
          "priceAdjustment": 0
        },
        "sweetness": {
          "name": "半糖",
          "code": "half",
          "priceAdjustment": 0
        },
        "topping": {
          "name": "珍珠",
          "code": "pearl",
          "priceAdjustment": 3.00
        }
      },
      "quantity": 2,
      "unitPrice": 23.00,
      "subtotal": 46.00
    }
  ],
  "totalPrice": 46.00,
  "customerNote": "少冰,谢谢"
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|-----|------|------|------|---------|
| userId | UUID | 是 | 用户ID | NotNull |
| storeId | UUID | 是 | 门店ID | NotNull |
| items | Array | 是 | 订单项 | NotEmpty |
| items[].beverageId | UUID | 是 | 饮品ID | NotNull |
| items[].beverageName | String | 是 | 饮品名称快照 | NotBlank, MaxLength=100 |
| items[].selectedSpecs | Object | 是 | 规格快照 | NotNull |
| items[].quantity | Integer | 是 | 数量 | Min=1 |
| items[].unitPrice | Decimal | 是 | 单价快照 | Min=0 |
| items[].subtotal | Decimal | 是 | 小计 | Min=0, =unitPrice*quantity |
| totalPrice | Decimal | 是 | 订单总价 | Min=0, =sum(subtotal) |
| customerNote | String | 否 | 顾客备注 | MaxLength=500 |

**响应示例** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "BORDT202512281000001234",
    "queueNumber": "D042",
    "userId": "user-550e8400-e29b-41d4-a716-446655440000",
    "storeId": "store-550e8400-e29b-41d4-a716-446655440000",
    "status": "PENDING_PAYMENT",
    "totalPrice": 46.00,
    "items": [ ... ],
    "customerNote": "少冰,谢谢",
    "createdAt": "2025-12-28T10:00:00Z"
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

**错误响应** (400 Bad Request - 参数验证失败):

```json
{
  "success": false,
  "error": "ORD_VAL_002",
  "message": "订单数据验证失败",
  "details": {
    "errors": [
      {
        "field": "totalPrice",
        "message": "订单总价与订单项小计不一致"
      },
      {
        "field": "items[0].quantity",
        "message": "数量必须大于0"
      }
    ]
  },
  "timestamp": "2025-12-28T10:00:00Z"
}
```

---

#### POST /api/client/beverage-orders/{id}/pay

**功能**: Mock支付(500ms延迟,自动成功)

**权限**: `ROLE_CUSTOMER`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | UUID | 是 | 订单ID |

**请求示例**:

```http
POST /api/client/beverage-orders/order-550e8400-e29b-41d4-a716-446655440000/pay
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "BORDT202512281000001234",
    "status": "PENDING_PRODUCTION",
    "paymentMethod": "MOCK_WECHAT_PAY",
    "transactionId": "MOCK_1735380000500",
    "paidAt": "2025-12-28T10:00:01Z"
  },
  "timestamp": "2025-12-28T10:00:01Z"
}
```

**错误响应** (404 Not Found):

```json
{
  "success": false,
  "error": "ORD_NTF_001",
  "message": "订单不存在",
  "details": {
    "orderId": "order-550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2025-12-28T10:00:01Z"
}
```

---

#### GET /api/client/beverage-orders/{id}

**功能**: 查询订单详情

**权限**: `ROLE_CUSTOMER` (仅查看自己的订单)

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | UUID | 是 | 订单ID |

**请求示例**:

```http
GET /api/client/beverage-orders/order-550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "BORDT202512281000001234",
    "queueNumber": "D042",
    "userId": "user-550e8400-e29b-41d4-a716-446655440000",
    "storeId": "store-550e8400-e29b-41d4-a716-446655440000",
    "status": "PRODUCING",
    "totalPrice": 46.00,
    "paymentMethod": "MOCK_WECHAT_PAY",
    "transactionId": "MOCK_1735380000500",
    "paidAt": "2025-12-28T10:00:01Z",
    "productionStartTime": "2025-12-28T10:05:00Z",
    "completedAt": null,
    "deliveredAt": null,
    "items": [
      {
        "id": "item-001",
        "beverageName": "美式咖啡",
        "beverageImageUrl": "https://...",
        "selectedSpecs": { ... },
        "quantity": 2,
        "unitPrice": 23.00,
        "subtotal": 46.00
      }
    ],
    "customerNote": "少冰,谢谢",
    "createdAt": "2025-12-28T10:00:00Z",
    "updatedAt": "2025-12-28T10:05:00Z"
  },
  "timestamp": "2025-12-28T10:15:00Z"
}
```

---

#### GET /api/client/beverage-orders/my

**功能**: 查询我的订单历史(分页)

**权限**: `ROLE_CUSTOMER`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|-------|------|------|------|--------|
| status | String | 否 | 状态筛选 | 全部 |
| page | Integer | 否 | 页码(1-based) | 1 |
| pageSize | Integer | 否 | 每页数量 | 20 |

**请求示例**:

```http
GET /api/client/beverage-orders/my?status=COMPLETED&page=1&pageSize=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "order-001",
      "orderNumber": "BORDT202512281000001234",
      "queueNumber": "D042",
      "status": "DELIVERED",
      "totalPrice": 46.00,
      "paidAt": "2025-12-28T10:00:01Z",
      "completedAt": "2025-12-28T10:10:00Z",
      "deliveredAt": "2025-12-28T10:15:00Z",
      "items": [ ... ]
    },
    { ... }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "timestamp": "2025-12-28T11:00:00Z"
}
```

---

#### GET /api/client/queue-numbers/{orderId}

**功能**: 查询订单取餐号

**权限**: `ROLE_CUSTOMER`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| orderId | UUID | 是 | 订单ID |

**请求示例**:

```http
GET /api/client/queue-numbers/order-550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "queue-001",
    "queueNumber": "D042",
    "orderId": "order-550e8400-e29b-41d4-a716-446655440000",
    "storeId": "store-550e8400-e29b-41d4-a716-446655440000",
    "date": "2025-12-28",
    "sequence": 42,
    "status": "CALLED",
    "calledAt": "2025-12-28T10:10:05Z",
    "pickedAt": null,
    "createdAt": "2025-12-28T10:00:01Z"
  },
  "timestamp": "2025-12-28T10:15:00Z"
}
```

---

## 3. B端管理API

### 3.1 订单管理 API

#### GET /api/admin/beverage-orders/pending

**功能**: 查询待处理订单(轮询端点,8秒间隔)

**权限**: `ROLE_ADMIN`, `ROLE_STAFF`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| storeId | UUID | 是 | 门店ID | `store-550e...` |
| statuses | String | 否 | 状态筛选(逗号分隔) | `PENDING_PRODUCTION,PRODUCING` |

**请求示例**:

```http
GET /api/admin/beverage-orders/pending?storeId=store-550e8400-e29b-41d4-a716-446655440000&statuses=PENDING_PRODUCTION,PRODUCING
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": "order-001",
      "orderNumber": "BORDT202512281000001234",
      "queueNumber": "D042",
      "status": "PENDING_PRODUCTION",
      "totalPrice": 46.00,
      "paidAt": "2025-12-28T10:00:01Z",
      "items": [
        {
          "beverageName": "美式咖啡",
          "selectedSpecs": { ... },
          "quantity": 2
        }
      ],
      "customerNote": "少冰,谢谢",
      "createdAt": "2025-12-28T10:00:00Z"
    },
    { ... }
  ],
  "total": 5,
  "timestamp": "2025-12-28T10:15:00Z"
}
```

---

#### GET /api/admin/beverage-orders/{id}

**功能**: 查询订单详情(含BOM清单)

**权限**: `ROLE_ADMIN`, `ROLE_STAFF`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | UUID | 是 | 订单ID |

**请求示例**:

```http
GET /api/admin/beverage-orders/order-550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440000",
    "orderNumber": "BORDT202512281000001234",
    "queueNumber": "D042",
    "status": "PRODUCING",
    "totalPrice": 46.00,
    "items": [ ... ],
    "bomList": [
      {
        "materialName": "咖啡豆",
        "quantity": 40,
        "unit": "g",
        "currentStock": 500,
        "safetyStock": 200
      },
      {
        "materialName": "牛奶",
        "quantity": 400,
        "unit": "ml",
        "currentStock": 5000,
        "safetyStock": 2000
      }
    ],
    "productionStartTime": "2025-12-28T10:05:00Z",
    "createdAt": "2025-12-28T10:00:00Z"
  },
  "timestamp": "2025-12-28T10:15:00Z"
}
```

---

#### PUT /api/admin/beverage-orders/{id}/status

**功能**: 更新订单状态(触发BOM扣料/叫号)

**权限**: `ROLE_ADMIN`, `ROLE_STAFF`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | UUID | 是 | 订单ID |

**请求Body**:

```json
{
  "status": "PRODUCING",
  "operator": "admin-user-id",
  "reason": "开始制作"
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|-----|------|------|------|---------|
| status | Enum | 是 | 目标状态 | PENDING_PRODUCTION/PRODUCING/COMPLETED/DELIVERED/CANCELLED |
| operator | UUID | 否 | 操作人 | - |
| reason | String | 否 | 变更原因 | MaxLength=200 |

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "order-550e8400-e29b-41d4-a716-446655440000",
    "status": "PRODUCING",
    "productionStartTime": "2025-12-28T10:05:00Z",
    "bomDeductionResult": {
      "success": true,
      "totalMaterials": 3,
      "successCount": 3,
      "successItems": [
        {
          "materialName": "咖啡豆",
          "deductedQuantity": 40,
          "unit": "g"
        },
        { ... }
      ],
      "failureItems": []
    }
  },
  "timestamp": "2025-12-28T10:05:00Z"
}
```

**错误响应** (422 Unprocessable Entity - 库存不足):

```json
{
  "success": false,
  "error": "INV_NTF_001",
  "message": "库存不足,无法完成扣料",
  "details": {
    "insufficientItems": [
      {
        "materialName": "咖啡豆",
        "required": 40,
        "available": 10,
        "unit": "g"
      }
    ]
  },
  "timestamp": "2025-12-28T10:05:00Z"
}
```

---

#### POST /api/admin/beverage-orders/{id}/call

**功能**: 触发叫号通知(Mock语音播报)

**权限**: `ROLE_ADMIN`, `ROLE_STAFF`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| id | UUID | 是 | 订单ID |

**请求示例**:

```http
POST /api/admin/beverage-orders/order-550e8400-e29b-41d4-a716-446655440000/call
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "orderId": "order-550e8400-e29b-41d4-a716-446655440000",
    "queueNumber": "D042",
    "calledAt": "2025-12-28T10:10:05Z",
    "notificationSent": true
  },
  "timestamp": "2025-12-28T10:10:05Z"
}
```

---

### 3.2 统计分析 API

#### GET /api/admin/beverage-orders/statistics

**功能**: 查询营业统计(订单数量/销售额/热销饮品)

**权限**: `ROLE_ADMIN`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| storeId | UUID | 是 | 门店ID | - |
| startDate | Date | 否 | 开始日期 | `2025-12-01` |
| endDate | Date | 否 | 结束日期 | `2025-12-28` |
| period | Enum | 否 | 时间范围 | `today`/`week`/`month` |

**请求示例**:

```http
GET /api/admin/beverage-orders/statistics?storeId=store-550e...&period=today
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例** (200 OK):

```json
{
  "success": true,
  "data": {
    "period": "today",
    "startDate": "2025-12-28",
    "endDate": "2025-12-28",
    "totalOrders": 85,
    "totalRevenue": 3250.00,
    "averageOrderValue": 38.24,
    "orderStatusBreakdown": {
      "PENDING_PRODUCTION": 5,
      "PRODUCING": 3,
      "COMPLETED": 10,
      "DELIVERED": 67,
      "CANCELLED": 0
    },
    "topSellingBeverages": [
      {
        "beverageId": "550e8400-e29b-41d4-a716-446655440001",
        "beverageName": "美式咖啡",
        "salesCount": 45,
        "revenue": 900.00
      },
      {
        "beverageId": "550e8400-e29b-41d4-a716-446655440002",
        "beverageName": "拿铁咖啡",
        "salesCount": 30,
        "revenue": 720.00
      }
    ]
  },
  "timestamp": "2025-12-28T18:00:00Z"
}
```

---

#### GET /api/admin/beverage-orders/export

**功能**: 导出销售报表(Excel格式)

**权限**: `ROLE_ADMIN`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| storeId | UUID | 是 | 门店ID |
| startDate | Date | 是 | 开始日期 |
| endDate | Date | 是 | 结束日期 |

**请求示例**:

```http
GET /api/admin/beverage-orders/export?storeId=store-550e...&startDate=2025-12-01&endDate=2025-12-28
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应** (200 OK):

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="sales-report-2025-12-01-to-2025-12-28.xlsx"

[Binary Excel file]
```

**Excel内容**:

| 订单号 | 下单时间 | 饮品 | 数量 | 金额 | 状态 |
|-------|---------|------|------|------|------|
| BORDT202512281000001234 | 2025-12-28 10:00 | 美式咖啡(大杯/热) | 2 | 46.00 | 已交付 |
| ... | ... | ... | ... | ... | ... |

---

## 4. 错误码定义

详见 [contracts/error-codes.md](../../specs/O003-beverage-order/contracts/error-codes.md)

### 4.1 饮品模块错误码 (BEV_*)

| 错误码 | HTTP状态码 | 说明 | 触发场景 |
|-------|-----------|------|---------|
| BEV_NTF_001 | 404 | 饮品不存在 | 查询不存在的饮品ID |
| BEV_VAL_002 | 400 | 饮品规格无效 | 规格组合不存在或已下架 |
| BEV_BIZ_001 | 422 | 饮品已下架 | 下单时饮品状态不为ACTIVE |

### 4.2 订单模块错误码 (ORD_*)

| 错误码 | HTTP状态码 | 说明 | 触发场景 |
|-------|-----------|------|---------|
| ORD_NTF_001 | 404 | 订单不存在 | 查询不存在的订单ID |
| ORD_VAL_002 | 400 | 订单金额异常 | totalPrice != sum(subtotal) |
| ORD_BIZ_001 | 422 | 订单状态流转非法 | 状态机验证失败 |
| ORD_BIZ_002 | 422 | 订单已支付 | 重复支付 |
| ORD_BIZ_003 | 422 | 订单已取消 | 操作已取消订单 |

### 4.3 库存模块错误码 (INV_*)

| 错误码 | HTTP状态码 | 说明 | 触发场景 |
|-------|-----------|------|---------|
| INV_NTF_001 | 422 | 库存不足 | BOM扣料时库存不足 |
| INV_VAL_001 | 400 | 库存数量无效 | 扣减数量<=0 |

### 4.4 通用错误码 (CMN_*)

| 错误码 | HTTP状态码 | 说明 | 触发场景 |
|-------|-----------|------|---------|
| CMN_AUT_001 | 401 | 未认证 | Token缺失或无效 |
| CMN_PRM_001 | 403 | 无权限 | 角色不匹配 |
| CMN_VAL_001 | 400 | 参数验证失败 | Bean Validation失败 |
| CMN_SYS_001 | 500 | 系统内部错误 | 未捕获异常 |

---

## 5. 认证授权

⚠️ **MVP阶段认证策略**:
- **C端API** (`/api/client/**`): 完整JWT认证,需在请求头中携带有效Token
- **B端API** (`/api/admin/**`): Mock认证,无需Token,直接访问

### 5.1 JWT Token格式 (C端)

**请求头示例**:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token结构**:
```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user-uuid",
  "role": "CUSTOMER",
  "storeId": "store-uuid",
  "exp": 1735401600,
  "iat": 1735398000
}
```

### 5.2 角色权限矩阵

| API路径 | MVP阶段要求 | Phase 2要求 | 说明 |
|--------|------------|------------|------|
| **C端API** | | | |
| GET /api/client/beverages | JWT (CUSTOMER) | JWT (CUSTOMER) | 公开浏览无需认证 |
| POST /api/client/beverage-orders | JWT (CUSTOMER) | JWT (CUSTOMER) | 下单需认证 |
| GET /api/client/beverage-orders/my | JWT (CUSTOMER) | JWT (CUSTOMER) | 查看我的订单 |
| **B端API** | | | |
| GET /api/admin/beverage-orders/pending | ⚠️ **无需Token** | JWT (STAFF/ADMIN) | 待处理订单列表 |
| PUT /api/admin/beverage-orders/{id}/status | ⚠️ **无需Token** | JWT (STAFF/ADMIN) | 更新订单状态 |
| POST /api/admin/beverage-orders/{id}/call | ⚠️ **无需Token** | JWT (STAFF/ADMIN) | 叫号通知 |
| GET /api/admin/beverage-orders/statistics | ⚠️ **无需Token** | JWT (ADMIN) | 营业统计 |
| GET /api/admin/beverage-orders/export | ⚠️ **无需Token** | JWT (ADMIN) | 导出数据 |

⚠️ **B端API认证说明**:
- **MVP阶段**: 所有B端API均无需Token,前端直接调用即可
- **实现方式**: Spring Security配置允许`/api/admin/**`路径匿名访问
- **安全前提**: 假设B端管理后台在内网或受信任网络环境访问
- **Phase 2升级**: 实现完整的工作人员登录体系,STAFF角色可操作订单,ADMIN角色可查看统计和导出数据

---

## 6. 数据模型

### 6.1 Beverage (饮品)

```typescript
interface Beverage {
  id: string; // UUID
  name: string;
  description?: string;
  category: 'COFFEE' | 'TEA' | 'JUICE' | 'SMOOTHIE' | 'MILK_TEA' | 'OTHER';
  basePrice: number; // Decimal(10,2)
  imageUrl?: string;
  detailImages?: string[];
  nutritionInfo?: {
    calories?: number;
    caffeine?: string;
    sugar?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  isRecommended?: boolean;
  sortOrder?: number;
  createdAt: string; // ISO 8601
  updatedAt: string;
}
```

### 6.2 BeverageOrder (订单)

```typescript
interface BeverageOrder {
  id: string; // UUID
  orderNumber: string; // "BORDT202512281000001234"
  queueNumber: string; // "D042"
  userId: string; // UUID
  storeId: string; // UUID
  status: 'PENDING_PAYMENT' | 'PENDING_PRODUCTION' | 'PRODUCING' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';
  totalPrice: number; // Decimal(10,2)
  paymentMethod?: string; // "MOCK_WECHAT_PAY"
  transactionId?: string;
  paidAt?: string; // ISO 8601
  productionStartTime?: string;
  completedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  items: BeverageOrderItem[];
  customerNote?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 6.3 BeverageOrderItem (订单项)

```typescript
interface BeverageOrderItem {
  id: string; // UUID
  beverageId: string; // UUID
  beverageName: string; // 快照
  beverageImageUrl?: string; // 快照
  selectedSpecs: {
    [key: string]: {
      name: string;
      code: string;
      priceAdjustment: number;
    };
  }; // 规格快照
  quantity: number;
  unitPrice: number; // 单价快照(含规格调整)
  subtotal: number; // = unitPrice * quantity
}
```

### 6.4 QueueNumber (取餐号)

```typescript
interface QueueNumber {
  id: string; // UUID
  queueNumber: string; // "D042"
  orderId: string; // UUID
  storeId: string; // UUID
  date: string; // "2025-12-28"
  sequence: number; // 1-999
  status: 'PENDING' | 'CALLED' | 'PICKED';
  calledAt?: string; // ISO 8601
  pickedAt?: string;
  createdAt: string;
}
```

---

## 7. 附录

### 7.1 Postman集合

完整Postman集合: [O003-beverage-order.postman_collection.json](../../specs/O003-beverage-order/postman/O003-beverage-order.postman_collection.json)

### 7.2 OpenAPI规范

完整OpenAPI 3.0规范: [api.yaml](../../specs/O003-beverage-order/contracts/api.yaml)

---

**文档结束**
