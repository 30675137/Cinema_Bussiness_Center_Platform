# API Contracts: O012 订单库存预占

本目录包含 O012-order-inventory-reservation 规格的API契约定义。

---

## Files

- **`api.yaml`**: OpenAPI 3.0规范，定义了订单创建、取消、预占查询的HTTP接口契约

---

## Core APIs

### 1. POST `/api/v1/orders` - 创建订单（集成库存预占）

**功能**: 创建饮品订单或场次预订订单，自动执行库存预占

**集成点**: 
- O003-beverage-order（饮品订单）
- U001-hall-reservation（场次预订）

**复用P005服务**:
```java
InventoryReservationService.reserveInventory(orderId, storeId, items)
```

**请求示例**:
```json
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer <JWT>

{
  "storeId": "123e4567-e89b-12d3-a456-426614174000",
  "customerId": "456e7890-e89b-12d3-a456-426614174001",
  "items": [
    {
      "skuId": "789e0123-e89b-12d3-a456-426614174002",
      "quantity": 2,
      "unit": "杯"
    }
  ],
  "orderType": "BEVERAGE",
  "channel": "MINIAPP"
}
```

**成功响应（201 Created）**:
```json
{
  "code": "0000",
  "message": "订单创建成功",
  "data": {
    "orderId": "abcd1234-e89b-12d3-a456-426614174004",
    "orderNo": "ORD20260114123456",
    "status": "PENDING_PAYMENT",
    "totalAmount": 58.00,
    "reservationStatus": "RESERVED",
    "reservedItems": [
      {
        "skuId": "789e0123-e89b-12d3-a456-426614174002",
        "skuName": "拿铁咖啡",
        "reservedQty": 2,
        "unit": "杯"
      }
    ],
    "reservationExpiry": "2026-01-14T13:04:56Z"
  }
}
```

**库存不足错误（409 Conflict）**:
```json
{
  "code": "ORD_BIZ_002",
  "message": "库存不足，无法完成下单",
  "details": {
    "shortageItems": [
      {
        "skuId": "789e0123-e89b-12d3-a456-426614174002",
        "skuName": "拿铁咖啡",
        "requiredQty": 2,
        "availableQty": 1,
        "unit": "杯"
      }
    ]
  }
}
```

---

### 2. POST `/api/v1/orders/{orderId}/cancel` - 取消订单（释放库存）

**功能**: 取消订单并自动释放已预占的库存

**复用P005服务**:
```java
InventoryReservationService.releaseReservation(orderId)
```

**请求示例**:
```bash
POST /api/v1/orders/abcd1234-e89b-12d3-a456-426614174004/cancel
Authorization: Bearer <JWT>
```

**成功响应（200 OK）**:
```json
{
  "code": "0000",
  "message": "订单取消成功",
  "data": {
    "orderId": "abcd1234-e89b-12d3-a456-426614174004",
    "status": "CANCELLED",
    "cancelledAt": "2026-01-14T12:45:00Z",
    "releasedItems": [
      {
        "skuId": "789e0123-e89b-12d3-a456-426614174002",
        "releasedQty": 2,
        "unit": "杯"
      }
    ]
  }
}
```

---

### 3. GET `/api/v1/reservations` - 查询预占记录（审计）

**功能**: 查询库存预占记录，支持多维度筛选

**查询参数**:
- `orderId`: 订单ID（精确匹配）
- `storeId`: 门店ID（精确匹配）
- `status`: 预占状态（ACTIVE | CANCELLED | EXPIRED | FULFILLED）
- `createdAfter`: 创建时间起始
- `createdBefore`: 创建时间截止
- `page`: 页码（默认1）
- `pageSize`: 每页记录数（默认20，最大100）

**请求示例**:
```bash
GET /api/v1/reservations?orderId=abcd1234-e89b-12d3-a456-426614174004&status=ACTIVE
Authorization: Bearer <JWT>
```

**成功响应（200 OK）**:
```json
{
  "code": "0000",
  "message": "查询成功",
  "data": {
    "total": 5,
    "page": 1,
    "pageSize": 20,
    "items": [
      {
        "id": "res-001",
        "orderId": "abcd1234-e89b-12d3-a456-426614174004",
        "storeId": "123e4567-e89b-12d3-a456-426614174000",
        "skuId": "789e0123-e89b-12d3-a456-426614174002",
        "skuName": "拿铁咖啡",
        "reservedQty": 2,
        "unit": "杯",
        "status": "ACTIVE",
        "createdAt": "2026-01-14T12:34:56Z",
        "notes": null
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `0000` | 成功 | 200/201 |
| `ORD_BIZ_001` | 订单参数验证失败 | 400 |
| `ORD_BIZ_002` | 库存不足，无法完成下单 | 409 |
| `ORD_BIZ_003` | 门店未配置或不存在 | 400 |
| `ORD_BIZ_004` | BOM配方缺失或不完整 | 400 |
| `ORD_BIZ_005` | 订单状态不允许取消 | 400 |

---

## Integration Guide

### Java Client (Spring Boot)

```java
/**
 * @spec O012-order-inventory-reservation
 * 订单服务集成库存预占API
 */
@Service
public class BeverageOrderService {
    
    @Autowired
    private InventoryReservationService reservationService; // P005已有
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Transactional
    public OrderCreationResponse createOrder(OrderCreationRequest request) {
        // Step 1: 验证订单数据
        validateOrderRequest(request);
        
        // Step 2: 调用库存预占服务（P005已实现）
        Map<UUID, BigDecimal> items = extractSkuQuantities(request.getItems());
        List<InventoryReservation> reservations = reservationService.reserveInventory(
            null, // orderId暂时为null，稍后更新
            request.getStoreId(),
            items
        );
        
        // Step 3: 创建订单记录
        BeverageOrder order = createOrderEntity(request);
        orderRepository.save(order);
        
        // Step 4: 更新预占记录的订单ID
        updateReservationOrderId(reservations, order.getId());
        
        // Step 5: 返回订单创建结果
        return buildResponse(order, reservations);
    }
    
    @Transactional
    public void cancelOrder(UUID orderId) {
        // Step 1: 验证订单状态
        BeverageOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        if (!order.isCancellable()) {
            throw new OrderNotCancellableException(order.getStatus());
        }
        
        // Step 2: 释放库存预占（P005已实现）
        reservationService.releaseReservation(orderId);
        
        // Step 3: 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        orderRepository.save(order);
    }
}
```

### TypeScript Client (React/Taro)

```typescript
/**
 * @spec O012-order-inventory-reservation
 * 前端调用订单创建API（含库存预占）
 */
import { request } from '@/utils/request';

export interface OrderCreationRequest {
  storeId: string;
  customerId: string;
  items: Array<{
    skuId: string;
    quantity: number;
    unit: string;
  }>;
  orderType: 'BEVERAGE' | 'HALL_RESERVATION';
  channel?: 'MINIAPP' | 'WEB' | 'POS';
  notes?: string;
}

export interface OrderCreationResponse {
  code: string;
  message: string;
  data: {
    orderId: string;
    orderNo: string;
    status: string;
    totalAmount: number;
    reservationStatus: 'RESERVED' | 'PARTIAL_RESERVED' | 'FAILED';
    reservedItems: Array<{
      skuId: string;
      skuName: string;
      reservedQty: number;
      unit: string;
    }>;
    reservationExpiry: string;
  };
}

// 创建订单（集成库存预占）
export async function createOrderWithReservation(
  req: OrderCreationRequest
): Promise<OrderCreationResponse> {
  return request<OrderCreationResponse>({
    url: '/api/v1/orders',
    method: 'POST',
    data: req,
  });
}

// 取消订单（释放库存）
export async function cancelOrder(orderId: string): Promise<void> {
  return request({
    url: `/api/v1/orders/${orderId}/cancel`,
    method: 'POST',
  });
}

// 查询预占记录
export async function queryReservations(params: {
  orderId?: string;
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'FULFILLED';
  page?: number;
  pageSize?: number;
}) {
  return request({
    url: '/api/v1/reservations',
    method: 'GET',
    params,
  });
}
```

---

## Testing

### Postman Collection

导入 OpenAPI 规范到 Postman:
```bash
# 文件路径
/Users/lining/qoder/Cinema_Bussiness_Center_Platform/specs/O012-order-inventory-reservation/contracts/api.yaml

# 或通过CLI导入
postman import api.yaml
```

### cURL Examples

```bash
# 1. 创建订单（库存预占）
curl -X POST https://ops.cfilmcloud.com/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "storeId": "123e4567-e89b-12d3-a456-426614174000",
    "customerId": "456e7890-e89b-12d3-a456-426614174001",
    "items": [
      {
        "skuId": "789e0123-e89b-12d3-a456-426614174002",
        "quantity": 2,
        "unit": "杯"
      }
    ],
    "orderType": "BEVERAGE",
    "channel": "MINIAPP"
  }'

# 2. 取消订单（释放库存）
curl -X POST "https://ops.cfilmcloud.com/api/v1/orders/abcd1234-e89b-12d3-a456-426614174004/cancel" \
  -H "Authorization: Bearer <JWT>"

# 3. 查询预占记录
curl -X GET "https://ops.cfilmcloud.com/api/v1/reservations?orderId=abcd1234-e89b-12d3-a456-426614174004&status=ACTIVE" \
  -H "Authorization: Bearer <JWT>"
```

---

## Validation Rules

### 订单创建请求验证

- `storeId`: 必填，UUID格式，门店必须存在且启用
- `customerId`: 必填，UUID格式，顾客必须存在
- `items`: 必填，至少1个商品
  - `skuId`: 必填，UUID格式，SKU必须存在且启用
  - `quantity`: 必填，大于0，精度支持小数点后3位
  - `unit`: 必填，长度1-20字符
- `orderType`: 必填，枚举值 `BEVERAGE` 或 `HALL_RESERVATION`
- `channel`: 可选，枚举值 `MINIAPP`、`WEB`、`POS`，默认 `MINIAPP`
- `notes`: 可选，最大500字符

### 库存预占业务规则

1. **库存充足性检查**: `available_qty >= required_qty`
2. **BOM完整性检查**: 成品SKU必须配置完整的BOM配方
3. **门店配置检查**: 门店必须启用且配置库存管理
4. **预占过期时间**: 创建后30分钟自动过期（由定时任务处理）
5. **并发控制**: 使用行级锁 `SELECT FOR UPDATE` 防止超卖

---

## Change Log

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-14 | Initial API contract for O012 |

---

## Related Specs

- **P005-bom-inventory-deduction**: 库存预占基础服务实现
- **O003-beverage-order**: 饮品订单服务（集成点）
- **U001-hall-reservation**: 场次预订服务（集成点）
- **P001-sku-master-data**: SKU主数据管理
