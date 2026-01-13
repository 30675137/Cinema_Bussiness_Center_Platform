# 商品订单列表查看与管理 - API 设计文档

<!-- DOC-WRITER: AUTO-GENERATED START -->
**文档版本**: 1.0.0
**功能标识**: O001-product-order-list
**创建日期**: 2025-12-27
**API Base URL**: `http://localhost:8080/api`
**状态**: 已实现

---

## 文档变更历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2025-12-27 | 初始版本 - 3个核心 API 端点 |

---

## 1. API 概述

### 1.1 接口列表

| 接口 | 方法 | 路径 | 说明 | 用户故事 |
|------|------|------|------|---------|
| 订单列表查询 | GET | `/api/orders` | 查询订单列表,支持分页和筛选 | US1, US2 |
| 订单详情查询 | GET | `/api/orders/{id}` | 根据订单ID查询详情 | US3 |
| 更新订单状态 | PUT | `/api/orders/{id}/status` | 更新订单状态(发货/完成/取消) | US4 |

### 1.2 通用规范

#### 1.2.1 请求头

所有 API 请求需包含以下请求头:

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### 1.2.2 响应格式

**成功响应**:

```json
{
  "success": true,
  "data": <响应数据>,
  "message": "操作成功",
  "timestamp": "2025-12-27T15:00:00Z"
}
```

**列表响应**(包含分页信息):

```json
{
  "success": true,
  "data": [<数据数组>],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "message": "查询成功",
  "timestamp": "2025-12-27T15:00:00Z"
}
```

**错误响应**:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述信息",
  "details": {
    "field": "具体错误字段或详情"
  },
  "timestamp": "2025-12-27T15:00:00Z"
}
```

#### 1.2.3 HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|-------|------|---------|
| 200 | OK | 请求成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证(Token 无效或过期) |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突(如乐观锁冲突) |
| 422 | Unprocessable Entity | 业务规则校验失败 |
| 500 | Internal Server Error | 服务器内部错误 |

#### 1.2.4 错误码定义

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| ORD_NTF_001 | 404 | 订单不存在 |
| ORD_BIZ_001 | 422 | 无效的订单状态转换 |
| ORD_BIZ_002 | 409 | 订单乐观锁冲突 |
| ORD_VAL_001 | 400 | 取消订单必须提供取消原因 |
| CMN_AUT_001 | 401 | Token 无效或过期 |
| CMN_VAL_001 | 400 | 请求参数校验失败 |

---

## 2. API 详细设计

### 2.1 订单列表查询 (US1, US2)

#### 2.1.1 接口说明

查询商品订单列表,支持分页、排序和多维度筛选。

**接口标识**: `getOrders`
**用户故事**: US1(订单列表查看), US2(订单多维度筛选)

#### 2.1.2 请求定义

```http
GET /api/orders?status=PAID&startDate=2025-12-20&endDate=2025-12-27&search=13800138000&page=1&pageSize=20&sortBy=createdAt&sortOrder=DESC
```

**Query Parameters**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| status | String | 否 | - | 订单状态筛选(PENDING_PAYMENT, PAID, SHIPPED, COMPLETED, CANCELLED) |
| startDate | String(ISO 8601) | 否 | 30天前 | 起始日期(YYYY-MM-DD) |
| endDate | String(ISO 8601) | 否 | 今天 | 结束日期(YYYY-MM-DD) |
| search | String | 否 | - | 搜索关键字(订单号/用户名/手机号) |
| page | Integer | 否 | 1 | 页码(≥ 1) |
| pageSize | Integer | 否 | 20 | 每页数量(1-100) |
| sortBy | String | 否 | createdAt | 排序字段(createdAt, totalAmount) |
| sortOrder | String | 否 | DESC | 排序方向(ASC, DESC) |

**参数校验规则**:
- `page` ≥ 1
- `pageSize` 范围: 1-100
- `status` 必须是枚举值之一
- `startDate` ≤ `endDate`
- `startDate` 和 `endDate` 格式必须为 `YYYY-MM-DD`

#### 2.1.3 响应定义

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "orderNumber": "ORD20251227AB12CD",
      "user": {
        "id": "750e8400-e29b-41d4-a716-446655440001",
        "username": "张三",
        "phone": "138****8000"
      },
      "status": "PAID",
      "productTotal": 150.00,
      "shippingFee": 10.00,
      "discountAmount": 5.00,
      "totalAmount": 155.00,
      "productSummary": "爆米花×2, 可乐×1 等2件商品",
      "createdAt": "2025-12-27T10:30:00Z",
      "version": 1
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "message": "查询成功"
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String(UUID) | 订单ID |
| orderNumber | String | 订单号 |
| user.id | String(UUID) | 用户ID |
| user.username | String | 用户名 |
| user.phone | String | 手机号(已脱敏: 138****8000) |
| status | String | 订单状态 |
| productTotal | Number | 商品总额(元) |
| shippingFee | Number | 运费(元) |
| discountAmount | Number | 优惠金额(元) |
| totalAmount | Number | 实付金额(元) |
| productSummary | String | 商品摘要(前2个商品+总数) |
| createdAt | String(ISO 8601) | 创建时间 |
| version | Integer | 乐观锁版本号 |

**错误响应示例**:

```json
// HTTP 400 - 参数校验失败
{
  "success": false,
  "error": "CMN_VAL_001",
  "message": "请求参数校验失败",
  "details": {
    "page": "页码必须大于0",
    "pageSize": "每页数量必须在1-100之间"
  }
}
```

#### 2.1.4 请求示例

**cURL**:

```bash
curl -X GET "http://localhost:8080/api/orders?status=PAID&page=1&pageSize=20" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

**JavaScript (Fetch)**:

```javascript
const response = await fetch('http://localhost:8080/api/orders?status=PAID&page=1&pageSize=20', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
const data = await response.json()
```

**TypeScript (Axios)**:

```typescript
import axios from 'axios'

const response = await axios.get('/api/orders', {
  params: {
    status: 'PAID',
    page: 1,
    pageSize: 20
  },
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

---

### 2.2 订单详情查询 (US3)

#### 2.2.1 接口说明

根据订单ID查询订单完整详情,包括订单基本信息、用户信息、商品列表、订单日志。

**接口标识**: `getOrderById`
**用户故事**: US3(订单详情查看)

#### 2.2.2 请求定义

```http
GET /api/orders/{id}
```

**Path Parameters**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String(UUID) | 是 | 订单ID |

**参数校验规则**:
- `id` 必须是有效的 UUID 格式

#### 2.2.3 响应定义

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "orderNumber": "ORD20251227AB12CD",
    "user": {
      "id": "750e8400-e29b-41d4-a716-446655440001",
      "username": "张三",
      "phone": "138****8000",
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "address": "xxx路123号"
    },
    "status": "PAID",
    "productTotal": 150.00,
    "shippingFee": 10.00,
    "discountAmount": 5.00,
    "totalAmount": 155.00,
    "shippingAddress": {
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "detail": "xxx路123号"
    },
    "paymentMethod": "WECHAT_PAY",
    "paymentTime": "2025-12-27T10:35:00Z",
    "shippedTime": null,
    "completedTime": null,
    "cancelledTime": null,
    "cancelReason": null,
    "createdAt": "2025-12-27T10:30:00Z",
    "updatedAt": "2025-12-27T10:35:00Z",
    "version": 2,
    "items": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440001",
        "productId": "850e8400-e29b-41d4-a716-446655440001",
        "productName": "爆米花",
        "productSpec": "中杯",
        "productImage": "https://example.com/images/popcorn.jpg",
        "quantity": 2,
        "unitPrice": 30.00,
        "subtotal": 60.00
      },
      {
        "id": "650e8400-e29b-41d4-a716-446655440002",
        "productId": "850e8400-e29b-41d4-a716-446655440002",
        "productName": "可乐",
        "productSpec": "500ml",
        "productImage": "https://example.com/images/cola.jpg",
        "quantity": 1,
        "unitPrice": 15.00,
        "subtotal": 15.00
      }
    ],
    "logs": [
      {
        "id": "950e8400-e29b-41d4-a716-446655440001",
        "action": "PAYMENT",
        "statusBefore": "PENDING_PAYMENT",
        "statusAfter": "PAID",
        "operatorId": "000e8400-e29b-41d4-a716-446655440000",
        "operatorName": "系统",
        "comments": "用户支付成功",
        "createdAt": "2025-12-27T10:35:00Z"
      },
      {
        "id": "950e8400-e29b-41d4-a716-446655440000",
        "action": "CREATE_ORDER",
        "statusBefore": null,
        "statusAfter": "PENDING_PAYMENT",
        "operatorId": "000e8400-e29b-41d4-a716-446655440000",
        "operatorName": "系统",
        "comments": "创建订单",
        "createdAt": "2025-12-27T10:30:00Z"
      }
    ]
  },
  "message": "查询成功"
}
```

**响应字段说明**:

详细字段说明见订单列表接口,额外字段:

| 字段 | 类型 | 说明 |
|------|------|------|
| shippingAddress | Object | 收货地址(JSON 对象) |
| items | Array | 订单商品项列表 |
| items[].productId | String(UUID) | 商品ID |
| items[].productName | String | 商品名称 |
| items[].productSpec | String | 商品规格 |
| items[].quantity | Integer | 购买数量 |
| items[].unitPrice | Number | 单价(元) |
| items[].subtotal | Number | 小计(元) |
| logs | Array | 订单日志列表 |
| logs[].action | String | 操作类型 |
| logs[].statusBefore | String | 变更前状态 |
| logs[].statusAfter | String | 变更后状态 |
| logs[].operatorName | String | 操作人姓名 |
| logs[].comments | String | 备注信息 |

**错误响应示例**:

```json
// HTTP 404 - 订单不存在
{
  "success": false,
  "error": "ORD_NTF_001",
  "message": "订单不存在",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440999"
  }
}
```

#### 2.2.4 请求示例

**cURL**:

```bash
curl -X GET "http://localhost:8080/api/orders/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

**JavaScript (Fetch)**:

```javascript
const orderId = '550e8400-e29b-41d4-a716-446655440001'
const response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
const data = await response.json()
```

---

### 2.3 更新订单状态 (US4)

#### 2.3.1 接口说明

更新订单状态(发货、完成、取消),支持乐观锁并发控制,记录操作日志。

**接口标识**: `updateOrderStatus`
**用户故事**: US4(订单状态管理)

#### 2.3.2 请求定义

```http
PUT /api/orders/{id}/status
Content-Type: application/json

{
  "status": "SHIPPED",
  "version": 2,
  "cancelReason": "用户要求取消"
}
```

**Path Parameters**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String(UUID) | 是 | 订单ID |

**Request Body**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | String | 是 | 目标状态(PAID, SHIPPED, COMPLETED, CANCELLED) |
| version | Integer | 是 | 当前版本号(用于乐观锁) |
| cancelReason | String | 条件必填 | 取消原因(状态为 CANCELLED 时必填) |

**参数校验规则**:
- `status` 必须是枚举值之一
- `version` 必须 ≥ 1
- `status` 为 `CANCELLED` 时,`cancelReason` 必填且不能为空

#### 2.3.3 响应定义

**成功响应** (HTTP 200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "orderNumber": "ORD20251227AB12CD",
    "status": "SHIPPED",
    "shippedTime": "2025-12-27T15:00:00Z",
    "version": 3,
    "user": {
      "id": "750e8400-e29b-41d4-a716-446655440001",
      "username": "张三",
      "phone": "138****8000"
    },
    "totalAmount": 155.00,
    "createdAt": "2025-12-27T10:30:00Z",
    "updatedAt": "2025-12-27T15:00:00Z"
  },
  "message": "订单状态更新成功"
}
```

**错误响应示例**:

```json
// HTTP 422 - 无效的状态转换
{
  "success": false,
  "error": "ORD_BIZ_001",
  "message": "无效的订单状态转换: COMPLETED → CANCELLED",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "currentStatus": "COMPLETED",
    "targetStatus": "CANCELLED"
  }
}
```

```json
// HTTP 409 - 乐观锁冲突
{
  "success": false,
  "error": "ORD_BIZ_002",
  "message": "订单已被其他人修改,请刷新后重试",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "expectedVersion": 2,
    "actualVersion": 3
  }
}
```

```json
// HTTP 400 - 取消原因缺失
{
  "success": false,
  "error": "ORD_VAL_001",
  "message": "取消订单必须提供取消原因",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

#### 2.3.4 状态转换规则

**允许的状态转换**:

```
PENDING_PAYMENT → PAID            (用户支付成功)
PENDING_PAYMENT → CANCELLED       (取消订单)
PAID → SHIPPED                    (标记发货)
PAID → CANCELLED                  (取消订单)
SHIPPED → COMPLETED               (标记完成)
```

**禁止的状态转换**:

```
COMPLETED → 任何状态              (已完成订单不可变更)
CANCELLED → 任何状态              (已取消订单不可变更)
SHIPPED → CANCELLED               (已发货订单不可取消)
任何跳跃式转换(如 PENDING_PAYMENT → SHIPPED)
```

#### 2.3.5 请求示例

**cURL - 标记发货**:

```bash
curl -X PUT "http://localhost:8080/api/orders/550e8400-e29b-41d4-a716-446655440001/status" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "version": 2
  }'
```

**cURL - 取消订单**:

```bash
curl -X PUT "http://localhost:8080/api/orders/550e8400-e29b-41d4-a716-446655440001/status" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED",
    "version": 2,
    "cancelReason": "用户要求取消"
  }'
```

**JavaScript (Fetch)**:

```javascript
const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'SHIPPED',
    version: currentVersion
  })
})
const data = await response.json()
```

---

## 3. 数据类型定义

### 3.1 OrderStatus 枚举

订单状态枚举值:

| 枚举值 | 说明 | 显示文本 | 显示颜色 |
|--------|------|---------|---------|
| PENDING_PAYMENT | 待支付 | 待支付 | 橙色(#FA8C16) |
| PAID | 已支付 | 已支付 | 蓝色(#1677FF) |
| SHIPPED | 已发货 | 已发货 | 青色(#13C2C2) |
| COMPLETED | 已完成 | 已完成 | 绿色(#52C41A) |
| CANCELLED | 已取消 | 已取消 | 灰色(#8C8C8C) |

### 3.2 LogAction 枚举

订单日志操作类型:

| 枚举值 | 说明 |
|--------|------|
| CREATE_ORDER | 创建订单 |
| PAYMENT | 支付 |
| SHIP | 发货 |
| COMPLETE | 完成 |
| CANCEL | 取消 |
| SYSTEM_AUTO | 系统自动操作 |

### 3.3 TypeScript 类型定义

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

export interface ProductOrder {
  id: string
  orderNumber: string
  user: User
  status: OrderStatus
  productTotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  productSummary: string
  shippingAddress?: ShippingAddress
  paymentMethod?: string
  paymentTime?: string
  shippedTime?: string
  completedTime?: string
  cancelledTime?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
  version: number
  items?: OrderItem[]
  logs?: OrderLog[]
}

export interface User {
  id: string
  username: string
  phone: string // 已脱敏: 138****8000
  province?: string
  city?: string
  district?: string
  address?: string
}

export interface ShippingAddress {
  province: string
  city: string
  district: string
  detail: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productSpec?: string
  productImage?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderLog {
  id: string
  action: string
  statusBefore?: OrderStatus
  statusAfter?: OrderStatus
  operatorId: string
  operatorName: string
  comments?: string
  createdAt: string
}

export interface OrderQueryParams {
  status?: OrderStatus
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface UpdateStatusRequest {
  status: OrderStatus
  version: number
  cancelReason?: string
}
```

---

## 4. 错误处理

### 4.1 全局错误响应格式

所有错误响应统一使用以下格式:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "人类可读的错误描述",
  "details": {
    "field1": "具体错误信息",
    "field2": "具体错误信息"
  },
  "timestamp": "2025-12-27T15:00:00Z"
}
```

### 4.2 业务错误码详解

#### ORD_NTF_001 - 订单不存在

**HTTP 状态码**: 404
**触发条件**: 查询或更新不存在的订单
**处理建议**: 检查订单ID是否正确,或订单已被删除

```json
{
  "success": false,
  "error": "ORD_NTF_001",
  "message": "订单不存在",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440999"
  }
}
```

---

#### ORD_BIZ_001 - 无效的订单状态转换

**HTTP 状态码**: 422
**触发条件**: 尝试进行不允许的状态转换
**处理建议**: 检查当前订单状态,按照状态转换规则操作

```json
{
  "success": false,
  "error": "ORD_BIZ_001",
  "message": "无效的订单状态转换: COMPLETED → CANCELLED",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "currentStatus": "COMPLETED",
    "targetStatus": "CANCELLED"
  }
}
```

---

#### ORD_BIZ_002 - 订单乐观锁冲突

**HTTP 状态码**: 409
**触发条件**: 订单被其他用户同时修改
**处理建议**: 刷新页面获取最新数据后重试

```json
{
  "success": false,
  "error": "ORD_BIZ_002",
  "message": "订单已被其他人修改,请刷新后重试",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "expectedVersion": 2,
    "actualVersion": 3
  }
}
```

---

#### ORD_VAL_001 - 取消原因缺失

**HTTP 状态码**: 400
**触发条件**: 取消订单时未提供取消原因
**处理建议**: 填写取消原因后重试

```json
{
  "success": false,
  "error": "ORD_VAL_001",
  "message": "取消订单必须提供取消原因",
  "details": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

### 4.3 错误处理最佳实践

#### 前端错误处理示例

```typescript
import { message } from 'antd'

const updateOrderStatus = async (orderId: string, status: OrderStatus, version: number) => {
  try {
    const response = await orderService.updateOrderStatus(orderId, { status, version })
    message.success('订单状态更新成功')
    return response
  } catch (error) {
    if (error.response?.status === 409) {
      // 乐观锁冲突
      message.error('订单已被其他人修改,请刷新后重试')
      // 自动刷新数据
      queryClient.invalidateQueries(['order', orderId])
    } else if (error.response?.status === 422) {
      // 无效状态转换
      message.error(error.response.data.message || '无法执行此操作')
    } else {
      message.error('操作失败,请稍后重试')
    }
    throw error
  }
}
```

---

## 5. 认证与授权

### 5.1 JWT Token 认证

所有 API 接口需要在请求头中携带 JWT Token:

```http
Authorization: Bearer <JWT_TOKEN>
```

**Token 获取**: 通过登录接口 `/api/auth/login` 获取

**Token 有效期**: 24 小时

**Token 刷新**: 通过 `/api/auth/refresh` 接口刷新

### 5.2 权限控制(未来版本)

未来版本将支持基于角色的权限控制(RBAC):

| 角色 | 订单列表查询 | 订单详情查询 | 订单状态管理 |
|------|------------|------------|------------|
| 运营人员 | ✅ | ✅ | ✅ |
| 客服人员 | ✅ | ✅ | ❌ |
| 普通管理员 | ✅ | ✅ | ✅ |
| 超级管理员 | ✅ | ✅ | ✅ |

---

## 6. 性能与限流

### 6.1 性能指标

| 指标 | 目标值 |
|------|--------|
| 订单列表查询响应时间(P95) | < 1 秒 |
| 订单详情查询响应时间(P95) | < 500ms |
| 订单状态更新响应时间(P95) | < 500ms |
| 并发支持 | 100 TPS |

### 6.2 限流策略(未来版本)

未来版本将支持 API 限流:

| API 类型 | 限流规则 |
|---------|---------|
| 查询接口 | 100 次/分钟/用户 |
| 更新接口 | 30 次/分钟/用户 |

---

## 7. 测试数据

### 7.1 测试环境

**Base URL**: `http://localhost:8080/api`

**测试账号**:
- 用户名: `admin`
- 密码: `admin123`
- Token: 登录后获取

### 7.2 测试订单数据

系统预置了 3 条测试订单:

| 订单号 | 用户 | 状态 | 金额 | 创建时间 |
|--------|------|------|------|---------|
| ORD20251227AB12CD | 张三 | 已支付 | ¥155.00 | 2025-12-27 10:30 |
| ORD20251227EF34GH | 李四 | 已发货 | ¥180.00 | 2025-12-27 09:00 |
| ORD20251226IJ56KL | 王五 | 已完成 | ¥90.00 | 2025-12-26 15:00 |

### 7.3 Postman 集合

Postman Collection 下载地址: [待补充]

---

## 8. 常见问题 (FAQ)

### Q1: 为什么手机号显示为脱敏格式?

**A**: 出于用户隐私保护考虑,所有 API 返回的手机号默认脱敏显示为 `138****8000` 格式。未来版本将支持管理员角色查看完整手机号。

### Q2: 如何处理乐观锁冲突?

**A**: 当收到 HTTP 409 错误(ORD_BIZ_002)时,表示订单被其他用户同时修改。建议:
1. 提示用户"订单已被其他人修改,请刷新后重试"
2. 自动调用订单详情接口刷新数据
3. 用户确认最新数据后重新操作

### Q3: 订单状态更新后,列表数据何时刷新?

**A**: 前端使用 TanStack Query 管理数据,订单状态更新成功后会自动失效缓存(`invalidateQueries`),触发列表数据重新查询,确保数据一致性。

### Q4: 订单列表默认显示多久的订单?

**A**: 默认显示近 30 天订单。如需查看更早的订单,请使用时间范围筛选功能。

### Q5: 单次查询最多返回多少条订单?

**A**: 单次查询最多返回 100 条订单(pageSize 上限)。如需查看更多数据,请使用分页功能。

---

## 9. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2025-12-27 | 初始版本 - 订单列表查询、详情查询、状态更新 3 个接口 |

---

## 10. 相关文档

- [产品文档](/docs/product/order-management/O001-product-order-list.md)
- [技术设计文档 (TDD)](/docs/tdd/O001-product-order-list.md)
- [数据库设计文档](/docs/database/O001-product-order-list.md)
- [用户操作手册](/docs/manual/order-management/O001-product-order-list.md)
- [功能规格说明](/specs/O001-product-order-list/spec.md)

---

<!-- DOC-WRITER: AUTO-GENERATED END -->

**文档生成信息**:
- 生成工具: doc-writer skill v2.1.0
- 生成时间: 2025-12-27
- 数据来源: spec.md, plan.md, data-model.md, tasks.md
