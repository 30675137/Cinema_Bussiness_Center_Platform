# API 升级文档：O005 → O006 小程序集成

**@spec O005-channel-product-config, O006-miniapp-channel-order**

**Version**: 1.0.0
**Date**: 2026-01-02
**Author**: Claude Code
**Status**: Draft

---

## 文档概述

本文档说明如何基于 O005（渠道商品配置）的后端 API 为 O006（小程序渠道订单管理）提供数据支持。O005 定义了 B端管理后台的渠道商品配置能力，O006 需要将这些配置数据暴露给小程序端，并支持订单创建和查询功能。

---

## 1. 架构关系

```
┌─────────────────────────────────────────────────────────────┐
│  O005: 渠道商品配置 (B端管理后台)                             │
│  - 管理员配置渠道商品（名称、图片、价格、规格）                 │
│  - 数据存储在 channel_product_config 表                      │
│  - API: /api/channel-products                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    数据源 (共享)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  O006: 小程序渠道订单管理 (C端小程序)                         │
│  - 顾客浏览商品、选择规格、下单                               │
│  - 读取 channel_product_config 数据                          │
│  - API: /api/client/channel-products (新增C端专用接口)        │
│       /api/client/channel-product-orders (新增订单接口)      │
└─────────────────────────────────────────────────────────────┘
```

**关键原则**:
- O005 和 O006 共享同一数据源（`channel_product_config` 表）
- O005 负责数据写入和管理（B端）
- O006 负责数据读取和订单创建（C端）
- 接口路径分离：B端使用 `/api/channel-products`，C端使用 `/api/client/channel-products`

---

## 2. 需要新增的 C端 API 接口

### 2.1 获取小程序商品列表

**端点**: `GET /api/client/channel-products/mini-program`

**用途**: 小程序首页展示商品列表（仅显示已上架商品）

**Query Parameters**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `category` | string | 否 | 商品分类筛选（ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER） |
| `keyword` | string | 否 | 搜索关键词（商品名称） |
| `page` | number | 否 | 页码（默认 1） |
| `size` | number | 否 | 每页数量（默认 20） |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "skuId": "uuid-sku-001",
      "displayName": "美式咖啡",
      "channelCategory": "COFFEE",
      "basePrice": 2800,
      "mainImage": "https://cdn.example.com/coffee.jpg",
      "isRecommended": true,
      "hasSpecs": true
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "timestamp": "2026-01-02T10:00:00Z"
}
```

**返回字段说明**:

| 字段 | 类型 | 说明 |
|-----|------|------|
| `id` | string | 渠道商品配置 ID |
| `skuId` | string | 关联的 SKU ID |
| `displayName` | string | 展示名称（优先使用 channel_product_config.display_name，为空则使用 skus.sku_name） |
| `channelCategory` | string | 商品分类 |
| `basePrice` | number | 基础价格（分），为 channel_product_config.channel_price 或 skus.price |
| `mainImage` | string | 主图 URL（优先使用 channel_product_config.main_image，为空则使用 skus.image_url） |
| `isRecommended` | boolean | 是否推荐 |
| `hasSpecs` | boolean | 是否有规格配置（specs 数组长度 > 0） |

**筛选规则**:
- 仅返回 `channel_type = 'MINI_PROGRAM'` 的商品
- 仅返回 `status = 'ACTIVE'` 的商品
- 仅返回 `deleted_at IS NULL` 的商品

**SQL 查询示例**:

```sql
SELECT
    cpc.id,
    cpc.sku_id,
    COALESCE(cpc.display_name, s.sku_name) AS display_name,
    cpc.channel_category,
    COALESCE(cpc.channel_price, s.price) AS base_price,
    COALESCE(cpc.main_image, s.image_url) AS main_image,
    cpc.is_recommended,
    CASE WHEN jsonb_array_length(cpc.specs) > 0 THEN true ELSE false END AS has_specs
FROM channel_product_config cpc
INNER JOIN skus s ON cpc.sku_id = s.id
WHERE cpc.channel_type = 'MINI_PROGRAM'
  AND cpc.status = 'ACTIVE'
  AND cpc.deleted_at IS NULL
  AND ($category IS NULL OR cpc.channel_category = $category)
  AND ($keyword IS NULL OR cpc.display_name ILIKE '%' || $keyword || '%' OR s.sku_name ILIKE '%' || $keyword || '%')
ORDER BY cpc.sort_order ASC, cpc.created_at DESC
LIMIT $size OFFSET ($page - 1) * $size;
```

---

### 2.2 获取商品详情（含规格）

**端点**: `GET /api/client/channel-products/mini-program/{id}`

**用途**: 小程序商品详情页，显示完整信息和规格选项

**Path Parameters**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `id` | string | 是 | 渠道商品配置 ID |

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-001",
    "skuId": "uuid-sku-001",
    "displayName": "美式咖啡",
    "channelCategory": "COFFEE",
    "basePrice": 2800,
    "mainImage": "https://cdn.example.com/coffee.jpg",
    "detailImages": [
      "https://cdn.example.com/coffee-1.jpg",
      "https://cdn.example.com/coffee-2.jpg"
    ],
    "description": "精选阿拉比卡咖啡豆，香气浓郁",
    "specs": [
      {
        "id": "spec-001",
        "type": "SIZE",
        "name": "大小",
        "required": true,
        "multiSelect": false,
        "options": [
          {
            "id": "opt-001",
            "name": "小杯",
            "priceAdjustment": -300,
            "isDefault": false,
            "sortOrder": 1
          },
          {
            "id": "opt-002",
            "name": "中杯",
            "priceAdjustment": 0,
            "isDefault": true,
            "sortOrder": 2
          },
          {
            "id": "opt-003",
            "name": "大杯",
            "priceAdjustment": 500,
            "isDefault": false,
            "sortOrder": 3
          }
        ]
      },
      {
        "id": "spec-002",
        "type": "TEMPERATURE",
        "name": "温度",
        "required": true,
        "multiSelect": false,
        "options": [
          {
            "id": "opt-004",
            "name": "热",
            "priceAdjustment": 0,
            "isDefault": true,
            "sortOrder": 1
          },
          {
            "id": "opt-005",
            "name": "冷",
            "priceAdjustment": 0,
            "isDefault": false,
            "sortOrder": 2
          }
        ]
      }
    ],
    "isRecommended": true
  },
  "timestamp": "2026-01-02T10:00:00Z"
}
```

**规格字段说明**:

| 字段 | 类型 | 说明 |
|-----|------|------|
| `specs` | array | 规格配置数组（直接从 channel_product_config.specs JSONB 读取） |
| `specs[].type` | string | 规格类型（SIZE/TEMPERATURE/SWEETNESS/TOPPING/SPICINESS/SIDE/COOKING） |
| `specs[].required` | boolean | 是否必选 |
| `specs[].multiSelect` | boolean | 是否可多选（如配料可多选） |
| `specs[].options[].priceAdjustment` | number | 价格调整（分），正数加价，负数减价 |

**最终价格计算公式**:

```typescript
finalPrice = basePrice + Σ(selectedSpec.priceAdjustment)
```

**示例**:
- 基础价格: 2800 分（28 元）
- 选择"大杯" (+500 分)
- 选择"热" (+0 分)
- 选择"加珍珠" (+200 分)
- **最终价格**: 2800 + 500 + 0 + 200 = **3500 分（35 元）**

---

### 2.3 获取商品规格详情（单独接口，可选）

**端点**: `GET /api/client/channel-products/mini-program/{id}/specs`

**用途**: 单独获取商品规格（优化性能，若列表页也需要规格预览）

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "spec-001",
      "type": "SIZE",
      "name": "大小",
      "required": true,
      "multiSelect": false,
      "options": [
        {
          "id": "opt-001",
          "name": "小杯",
          "priceAdjustment": -300,
          "isDefault": false,
          "sortOrder": 1
        }
      ]
    }
  ],
  "timestamp": "2026-01-02T10:00:00Z"
}
```

**说明**: 此接口为可选，若小程序详情页已通过 `/api/client/channel-products/mini-program/{id}` 获取完整数据，则无需此接口。

---

### 2.4 创建小程序订单

**端点**: `POST /api/client/channel-product-orders`

**用途**: 顾客在小程序下单

**Request Body**:

```json
{
  "storeId": "uuid-store-001",
  "hallId": "uuid-hall-001",
  "sessionTime": "2026-01-02T14:30:00Z",
  "items": [
    {
      "channelProductId": "uuid-001",
      "quantity": 2,
      "selectedSpecs": {
        "SIZE": {
          "specId": "spec-001",
          "optionId": "opt-003",
          "optionName": "大杯",
          "priceAdjustment": 500
        },
        "TEMPERATURE": {
          "specId": "spec-002",
          "optionId": "opt-004",
          "optionName": "热",
          "priceAdjustment": 0
        },
        "TOPPING": {
          "specId": "spec-003",
          "optionId": "opt-007",
          "optionName": "珍珠",
          "priceAdjustment": 200
        }
      }
    }
  ],
  "contactName": "张三",
  "contactPhone": "13800138000",
  "deliveryMethod": "SELF_PICKUP",
  "notes": "少冰"
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `storeId` | string | 是 | 门店 ID |
| `hallId` | string | 是 | 影厅 ID |
| `sessionTime` | string | 是 | 场次时间（ISO 8601 格式） |
| `items` | array | 是 | 订单项数组 |
| `items[].channelProductId` | string | 是 | 渠道商品配置 ID |
| `items[].quantity` | number | 是 | 数量 |
| `items[].selectedSpecs` | object | 否 | 选中的规格（键为 SpecType，值为选项详情） |
| `contactName` | string | 是 | 联系人姓名 |
| `contactPhone` | string | 是 | 联系电话 |
| `deliveryMethod` | string | 是 | 取货方式（SELF_PICKUP/DELIVERY） |
| `notes` | string | 否 | 订单备注 |

**Response**:

```json
{
  "success": true,
  "data": {
    "orderId": "uuid-order-001",
    "orderNumber": "MP202601020001",
    "totalAmount": 7000,
    "status": "PENDING_PAYMENT",
    "createdAt": "2026-01-02T10:00:00Z",
    "items": [
      {
        "id": "uuid-item-001",
        "productName": "美式咖啡",
        "productImage": "https://cdn.example.com/coffee.jpg",
        "basePrice": 2800,
        "selectedSpecs": {
          "SIZE": {
            "specId": "spec-001",
            "optionId": "opt-003",
            "optionName": "大杯",
            "priceAdjustment": 500
          },
          "TEMPERATURE": {
            "specId": "spec-002",
            "optionId": "opt-004",
            "optionName": "热",
            "priceAdjustment": 0
          },
          "TOPPING": {
            "specId": "spec-003",
            "optionId": "opt-007",
            "optionName": "珍珠",
            "priceAdjustment": 200
          }
        },
        "unitPrice": 3500,
        "quantity": 2,
        "subtotal": 7000
      }
    ]
  },
  "timestamp": "2026-01-02T10:00:00Z"
}
```

**价格计算逻辑**:

```typescript
// 单项价格 = basePrice + Σ(priceAdjustment)
unitPrice = 2800 + 500 + 0 + 200 = 3500

// 小计 = unitPrice × quantity
subtotal = 3500 × 2 = 7000

// 订单总额 = Σ(items[].subtotal)
totalAmount = 7000
```

**订单状态流转**:

```
PENDING_PAYMENT (待支付)
    ↓
PAID (已支付)
    ↓
PREPARING (备餐中)
    ↓
READY (待取餐)
    ↓
COMPLETED (已完成)

或者:
PENDING_PAYMENT → CANCELLED (已取消)
```

**Mock 支付流程**（O006 规格要求）:
- O006 小程序原型不集成真实支付
- 创建订单后自动标记为 `PAID` 状态
- 前端调用创建订单接口 → 后端直接返回 `status: 'PAID'`

---

### 2.5 查询我的订单列表

**端点**: `GET /api/client/channel-product-orders/my`

**用途**: 小程序"我的订单"页面

**Query Parameters**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `status` | string | 否 | 订单状态筛选 |
| `page` | number | 否 | 页码（默认 1） |
| `size` | number | 否 | 每页数量（默认 10） |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "orderId": "uuid-order-001",
      "orderNumber": "MP202601020001",
      "totalAmount": 7000,
      "status": "PAID",
      "createdAt": "2026-01-02T10:00:00Z",
      "items": [
        {
          "productName": "美式咖啡",
          "productImage": "https://cdn.example.com/coffee.jpg",
          "unitPrice": 3500,
          "quantity": 2,
          "subtotal": 7000,
          "specsDescription": "大杯 / 热 / 珍珠"
        }
      ],
      "deliveryMethod": "SELF_PICKUP",
      "storeName": "万达影城中关村店"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 10,
  "timestamp": "2026-01-02T10:00:00Z"
}
```

**字段说明**:

| 字段 | 类型 | 说明 |
|-----|------|------|
| `specsDescription` | string | 规格描述字符串（如"大杯 / 热 / 珍珠"），后端拼接生成 |

---

### 2.6 查询订单详情

**端点**: `GET /api/client/channel-product-orders/{orderId}`

**用途**: 小程序订单详情页

**Path Parameters**:

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| `orderId` | string | 是 | 订单 ID |

**Response**:

```json
{
  "success": true,
  "data": {
    "orderId": "uuid-order-001",
    "orderNumber": "MP202601020001",
    "totalAmount": 7000,
    "status": "PAID",
    "createdAt": "2026-01-02T10:00:00Z",
    "paidAt": "2026-01-02T10:00:05Z",
    "items": [
      {
        "id": "uuid-item-001",
        "productName": "美式咖啡",
        "productImage": "https://cdn.example.com/coffee.jpg",
        "basePrice": 2800,
        "selectedSpecs": {
          "SIZE": {
            "optionName": "大杯",
            "priceAdjustment": 500
          },
          "TEMPERATURE": {
            "optionName": "热",
            "priceAdjustment": 0
          },
          "TOPPING": {
            "optionName": "珍珠",
            "priceAdjustment": 200
          }
        },
        "unitPrice": 3500,
        "quantity": 2,
        "subtotal": 7000
      }
    ],
    "contactName": "张三",
    "contactPhone": "138****8000",
    "deliveryMethod": "SELF_PICKUP",
    "notes": "少冰",
    "storeName": "万达影城中关村店",
    "hallName": "1号厅",
    "sessionTime": "2026-01-02T14:30:00Z"
  },
  "timestamp": "2026-01-02T10:00:00Z"
}
```

---

## 3. 数据模型映射

### 3.1 前后端字段映射表

| O005 后端字段 (channel_product_config) | O006 前端字段 (ChannelProductDTO) | 说明 |
|---------------------------------------|----------------------------------|------|
| `id` | `id` | 商品 ID |
| `sku_id` | `skuId` | SKU ID |
| `COALESCE(display_name, skus.sku_name)` | `displayName` | 展示名称 |
| `channel_category` | `channelCategory` | 商品分类 |
| `COALESCE(channel_price, skus.price)` | `basePrice` | 基础价格 |
| `COALESCE(main_image, skus.image_url)` | `mainImage` | 主图 |
| `detail_images` | `detailImages` | 详情图数组 |
| `description` | `description` | 商品描述 |
| `specs` | `specs` | 规格配置（JSONB → JSON Array） |
| `is_recommended` | `isRecommended` | 是否推荐 |
| `status` | `status` | 商品状态 |

### 3.2 规格数据结构对比

**后端存储 (JSONB)**:

```json
[
  {
    "id": "spec-001",
    "type": "SIZE",
    "name": "大小",
    "required": true,
    "multiSelect": false,
    "options": [
      {
        "id": "opt-001",
        "name": "小杯",
        "priceAdjust": -300,
        "isDefault": false,
        "sortOrder": 1
      }
    ]
  }
]
```

**前端使用 (TypeScript)**:

```typescript
interface ChannelProductSpecDTO {
  id: string;
  type: SpecType;  // 枚举
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: SpecOptionDTO[];
}

interface SpecOptionDTO {
  id: string;
  name: string;
  priceAdjustment: number;  // 注意：后端字段名 priceAdjust，前端统一为 priceAdjustment
  isDefault: boolean;
  sortOrder: number;
}
```

**字段名差异**:
- 后端: `priceAdjust`
- 前端: `priceAdjustment`

**解决方案**: 后端 API 响应时将 `priceAdjust` 映射为 `priceAdjustment`，或前端适配器层处理。

---

## 4. 后端需要调整的地方

### 4.1 新增 C端专用 Controller

**文件**: `backend/src/main/java/com/cinema/channelproduct/controller/ClientChannelProductController.java`

**路径前缀**: `/api/client`

**关键逻辑**:

```java
/**
 * @spec O005-channel-product-config, O006-miniapp-channel-order
 * C端小程序专用接口
 */
@RestController
@RequestMapping("/api/client/channel-products")
public class ClientChannelProductController {

    @Autowired
    private ChannelProductService channelProductService;

    /**
     * 获取小程序商品列表（仅返回已上架商品）
     */
    @GetMapping("/mini-program")
    public ResponseEntity<ApiResponse<PagedResponse<ChannelProductDTO>>> getActiveProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String keyword,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        // 固定筛选条件：channel_type = MINI_PROGRAM, status = ACTIVE
        ChannelProductQueryParams params = ChannelProductQueryParams.builder()
            .channelType(ChannelType.MINI_PROGRAM)
            .status(ChannelProductStatus.ACTIVE)
            .channelCategory(category)
            .keyword(keyword)
            .page(page)
            .size(size)
            .build();

        PagedResponse<ChannelProductDTO> result = channelProductService.queryProducts(params);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 获取商品详情（含规格）
     */
    @GetMapping("/mini-program/{id}")
    public ResponseEntity<ApiResponse<ChannelProductDetailDTO>> getProductDetail(
        @PathVariable String id
    ) {
        ChannelProductDetailDTO detail = channelProductService.getProductDetail(id);
        if (detail == null || !ChannelProductStatus.ACTIVE.equals(detail.getStatus())) {
            return ResponseEntity.status(404)
                .body(ApiResponse.failure("PRODUCT_NOT_FOUND", "商品不存在或已下架"));
        }
        return ResponseEntity.ok(ApiResponse.success(detail));
    }
}
```

### 4.2 字段名映射 (priceAdjust → priceAdjustment)

**Service 层处理**:

```java
public ChannelProductDetailDTO getProductDetail(String id) {
    ChannelProductConfig config = repository.findById(UUID.fromString(id))
        .orElseThrow(() -> new NotFoundException("商品不存在"));

    // 读取 JSONB specs 并映射字段名
    List<ChannelProductSpecDTO> specs = objectMapper.readValue(
        config.getSpecs().toString(),
        new TypeReference<List<ChannelProductSpec>>() {}
    ).stream()
        .map(this::mapSpecToDTO)  // 字段名映射
        .collect(Collectors.toList());

    return ChannelProductDetailDTO.builder()
        .id(config.getId().toString())
        .specs(specs)
        // ... 其他字段
        .build();
}

private ChannelProductSpecDTO mapSpecToDTO(ChannelProductSpec spec) {
    return ChannelProductSpecDTO.builder()
        .id(spec.getId())
        .type(spec.getType())
        .name(spec.getName())
        .required(spec.isRequired())
        .multiSelect(spec.isMultiSelect())
        .options(spec.getOptions().stream()
            .map(opt -> SpecOptionDTO.builder()
                .id(opt.getId())
                .name(opt.getName())
                .priceAdjustment(opt.getPriceAdjust())  // 映射字段名
                .isDefault(opt.isDefault())
                .sortOrder(opt.getSortOrder())
                .build())
            .collect(Collectors.toList()))
        .build();
}
```

### 4.3 订单创建逻辑

**Controller**: `ClientChannelProductOrderController.java`

```java
/**
 * @spec O006-miniapp-channel-order
 * 小程序订单管理
 */
@RestController
@RequestMapping("/api/client/channel-product-orders")
public class ClientChannelProductOrderController {

    @Autowired
    private ChannelProductOrderService orderService;

    /**
     * 创建订单（Mock 支付，直接标记为已支付）
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChannelProductOrderDTO>> createOrder(
        @RequestBody @Valid CreateOrderRequest request
    ) {
        ChannelProductOrderDTO order = orderService.createOrder(request);

        // O006 规格要求：Mock 支付，直接标记为已支付
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());

        return ResponseEntity.ok(ApiResponse.success(order));
    }

    /**
     * 查询我的订单列表
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<OrderListItemDTO>>> getMyOrders(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        // 从 JWT token 获取用户 ID
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        PagedResponse<OrderListItemDTO> orders = orderService.getMyOrders(userId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * 查询订单详情
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDetailDTO>> getOrderDetail(
        @PathVariable String orderId
    ) {
        OrderDetailDTO detail = orderService.getOrderDetail(orderId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }
}
```

### 4.4 价格计算封装

**Service 层工具方法**:

```java
/**
 * 计算订单项最终价格
 */
public long calculateItemPrice(
    long basePrice,
    Map<String, SelectedSpec> selectedSpecs
) {
    long totalAdjustment = selectedSpecs.values().stream()
        .mapToLong(SelectedSpec::getPriceAdjustment)
        .sum();

    return basePrice + totalAdjustment;
}

/**
 * 生成规格描述字符串
 * 示例: "大杯 / 热 / 珍珠"
 */
public String generateSpecsDescription(Map<String, SelectedSpec> selectedSpecs) {
    return selectedSpecs.values().stream()
        .map(SelectedSpec::getOptionName)
        .collect(Collectors.joining(" / "));
}
```

---

## 5. API 契约变更清单

### 5.1 新增接口

| 端点 | 方法 | 说明 | 版本 |
|-----|------|------|------|
| `/api/client/channel-products/mini-program` | GET | 获取小程序商品列表 | v1.0 |
| `/api/client/channel-products/mini-program/{id}` | GET | 获取商品详情 | v1.0 |
| `/api/client/channel-products/mini-program/{id}/specs` | GET | 获取商品规格（可选） | v1.0 |
| `/api/client/channel-product-orders` | POST | 创建订单 | v1.0 |
| `/api/client/channel-product-orders/my` | GET | 查询我的订单 | v1.0 |
| `/api/client/channel-product-orders/{orderId}` | GET | 查询订单详情 | v1.0 |

### 5.2 现有接口无需修改

O005 定义的 B端管理接口（`/api/channel-products`）无需修改，保持独立。

---

## 6. 数据库 Schema 调整

### 6.1 需要新增订单表

**表名**: `channel_product_orders`

**Schema**:

```sql
CREATE TABLE channel_product_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID,  -- 用户 ID（小程序用户）
    store_id UUID NOT NULL,
    hall_id UUID NOT NULL,
    session_time TIMESTAMP NOT NULL,
    total_amount BIGINT NOT NULL,  -- 订单总额（分）
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    contact_name VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    delivery_method VARCHAR(20) NOT NULL,
    notes TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON channel_product_orders(user_id);
CREATE INDEX idx_orders_status ON channel_product_orders(status);
CREATE INDEX idx_orders_order_number ON channel_product_orders(order_number);
```

**表名**: `channel_product_order_items`

**Schema**:

```sql
CREATE TABLE channel_product_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES channel_product_orders(id) ON DELETE CASCADE,
    channel_product_id UUID NOT NULL,  -- 渠道商品配置 ID
    product_name VARCHAR(100) NOT NULL,
    product_image TEXT,
    base_price BIGINT NOT NULL,
    selected_specs JSONB DEFAULT '{}',  -- 选中的规格快照
    unit_price BIGINT NOT NULL,
    quantity INT NOT NULL,
    subtotal BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON channel_product_order_items(order_id);
```

### 6.2 `selected_specs` JSONB 结构

```json
{
  "SIZE": {
    "specId": "spec-001",
    "optionId": "opt-003",
    "optionName": "大杯",
    "priceAdjustment": 500
  },
  "TEMPERATURE": {
    "specId": "spec-002",
    "optionId": "opt-004",
    "optionName": "热",
    "priceAdjustment": 0
  }
}
```

---

## 7. 测试用例

### 7.1 商品列表接口测试

**测试场景**: 获取小程序商品列表，仅返回已上架商品

**请求**:

```bash
GET /api/client/channel-products/mini-program?category=COFFEE&page=1&size=20
```

**预期响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "displayName": "美式咖啡",
      "channelCategory": "COFFEE",
      "basePrice": 2800,
      "mainImage": "https://cdn.example.com/coffee.jpg",
      "isRecommended": true,
      "hasSpecs": true
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 20
}
```

**验证点**:
- ✅ 仅返回 `status = 'ACTIVE'` 的商品
- ✅ 仅返回 `channel_type = 'MINI_PROGRAM'` 的商品
- ✅ `displayName` 优先使用 `channel_product_config.display_name`，为空则使用 `skus.sku_name`
- ✅ `basePrice` 优先使用 `channel_product_config.channel_price`，为空则使用 `skus.price`

### 7.2 商品详情接口测试

**测试场景**: 获取商品详情，包含完整规格配置

**请求**:

```bash
GET /api/client/channel-products/mini-program/uuid-001
```

**预期响应**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-001",
    "displayName": "美式咖啡",
    "specs": [
      {
        "id": "spec-001",
        "type": "SIZE",
        "name": "大小",
        "required": true,
        "multiSelect": false,
        "options": [
          {
            "id": "opt-003",
            "name": "大杯",
            "priceAdjustment": 500,
            "isDefault": false,
            "sortOrder": 3
          }
        ]
      }
    ]
  }
}
```

**验证点**:
- ✅ `specs` 数组正确解析 JSONB
- ✅ `priceAdjust` → `priceAdjustment` 字段名映射正确
- ✅ 商品已下架时返回 404

### 7.3 创建订单接口测试

**测试场景**: 创建订单，Mock 支付，直接标记为已支付

**请求**:

```bash
POST /api/client/channel-product-orders
Content-Type: application/json

{
  "storeId": "uuid-store-001",
  "hallId": "uuid-hall-001",
  "sessionTime": "2026-01-02T14:30:00Z",
  "items": [
    {
      "channelProductId": "uuid-001",
      "quantity": 2,
      "selectedSpecs": {
        "SIZE": {
          "specId": "spec-001",
          "optionId": "opt-003",
          "optionName": "大杯",
          "priceAdjustment": 500
        }
      }
    }
  ],
  "contactName": "张三",
  "contactPhone": "13800138000",
  "deliveryMethod": "SELF_PICKUP"
}
```

**预期响应**:

```json
{
  "success": true,
  "data": {
    "orderId": "uuid-order-001",
    "orderNumber": "MP202601020001",
    "totalAmount": 7000,
    "status": "PAID",
    "paidAt": "2026-01-02T10:00:05Z",
    "items": [
      {
        "unitPrice": 3500,
        "quantity": 2,
        "subtotal": 7000
      }
    ]
  }
}
```

**验证点**:
- ✅ 订单状态自动标记为 `PAID`
- ✅ `unitPrice = basePrice + Σ(priceAdjustment)` 计算正确
- ✅ `subtotal = unitPrice × quantity` 计算正确
- ✅ `totalAmount = Σ(items[].subtotal)` 计算正确
- ✅ `selected_specs` JSONB 正确存储

---

## 8. 前端集成示例 (TypeScript)

### 8.1 API Service

```typescript
/** @spec O006-miniapp-channel-order */

import Taro from '@tarojs/taro';

const API_BASE_URL = 'http://localhost:8080/api/client';

export const channelProductApi = {
  // 获取商品列表
  async getProducts(params: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) {
    const response = await Taro.request({
      url: `${API_BASE_URL}/channel-products/mini-program`,
      method: 'GET',
      data: params,
    });
    return response.data;
  },

  // 获取商品详情
  async getProductDetail(id: string) {
    const response = await Taro.request({
      url: `${API_BASE_URL}/channel-products/mini-program/${id}`,
      method: 'GET',
    });
    return response.data;
  },
};

export const orderApi = {
  // 创建订单
  async createOrder(data: CreateOrderRequest) {
    const response = await Taro.request({
      url: `${API_BASE_URL}/channel-product-orders`,
      method: 'POST',
      data,
    });
    return response.data;
  },

  // 查询我的订单
  async getMyOrders(params: { status?: string; page?: number; size?: number }) {
    const response = await Taro.request({
      url: `${API_BASE_URL}/channel-product-orders/my`,
      method: 'GET',
      data: params,
    });
    return response.data;
  },

  // 查询订单详情
  async getOrderDetail(orderId: string) {
    const response = await Taro.request({
      url: `${API_BASE_URL}/channel-product-orders/${orderId}`,
      method: 'GET',
    });
    return response.data;
  },
};
```

### 8.2 价格计算示例

```typescript
/** @spec O006-miniapp-channel-order */

export function calculateUnitPrice(
  basePrice: number,
  selectedSpecs: Record<string, SelectedSpec>
): number {
  const totalAdjustment = Object.values(selectedSpecs).reduce(
    (sum, spec) => sum + spec.priceAdjustment,
    0
  );
  return basePrice + totalAdjustment;
}

// 使用示例
const basePrice = 2800; // 28 元
const selectedSpecs = {
  SIZE: { priceAdjustment: 500 },      // 大杯 +5 元
  TEMPERATURE: { priceAdjustment: 0 }, // 热 +0 元
  TOPPING: { priceAdjustment: 200 },   // 珍珠 +2 元
};

const unitPrice = calculateUnitPrice(basePrice, selectedSpecs);
// 结果: 3500 分 (35 元)
```

---

## 9. 迁移检查清单

- [ ] **后端开发**:
  - [ ] 新增 `ClientChannelProductController.java`
  - [ ] 实现商品列表筛选逻辑（仅返回 ACTIVE 商品）
  - [ ] 实现字段名映射（priceAdjust → priceAdjustment）
  - [ ] 新增 `ClientChannelProductOrderController.java`
  - [ ] 实现订单创建逻辑（Mock 支付）
  - [ ] 实现价格计算封装方法
  - [ ] 创建订单表迁移脚本

- [ ] **API 测试**:
  - [ ] 测试商品列表接口（筛选规则）
  - [ ] 测试商品详情接口（规格数据）
  - [ ] 测试创建订单接口（价格计算）
  - [ ] 测试查询订单列表接口
  - [ ] 测试订单详情接口

- [ ] **前端集成**:
  - [ ] 创建 API Service 层
  - [ ] 实现商品列表页
  - [ ] 实现商品详情页（规格选择器）
  - [ ] 实现购物车页
  - [ ] 实现订单创建流程
  - [ ] 实现订单列表页
  - [ ] 实现订单详情页

- [ ] **文档更新**:
  - [ ] 更新 O005 data-model.md（新增订单表）
  - [ ] 更新 O006 contracts/api.yaml
  - [ ] 生成 API 接口文档（Swagger/OpenAPI）

---

## 10. 常见问题 FAQ

### Q1: 为什么不直接复用 O005 的 `/api/channel-products` 接口？

**A**: 分离 B端管理接口和 C端小程序接口有以下优点：
- **权限隔离**: B端接口需要管理员权限，C端接口仅需用户身份认证
- **筛选规则不同**: C端接口固定筛选 `status = ACTIVE`，B端接口需要查看所有状态
- **数据字段差异**: C端接口仅返回必要字段，减少数据传输量
- **接口稳定性**: B端接口变更不影响 C端，反之亦然

### Q2: 为什么字段名不统一（priceAdjust vs priceAdjustment）？

**A**: 这是历史设计遗留问题。为保持 API 一致性，建议：
- **后端统一使用 `priceAdjustment`**（更符合 Java 命名规范）
- **前端统一使用 `priceAdjustment`**
- **数据库 JSONB 中使用 `priceAdjust`**（兼容现有数据）
- **Service 层做字段名映射**

### Q3: Mock 支付是否需要调用支付网关？

**A**: O006 规格明确要求 Mock 支付，不集成真实支付。实现方式：
- 创建订单时直接设置 `status = 'PAID'`
- 设置 `paid_at = NOW()`
- 前端无需调用支付接口，直接显示"支付成功"

### Q4: 订单创建后如何通知商家？

**A**: 不在 O006 范围内，未来扩展可考虑：
- WebSocket 实时推送
- 短信通知
- POS 机订单打印

---

## 11. 总结

本文档定义了 O005 后端 API 如何支持 O006 小程序集成的完整方案，包括：

1. **新增 6 个 C端 API 接口**（商品列表、详情、订单创建、订单查询）
2. **字段名映射策略**（priceAdjust → priceAdjustment）
3. **Mock 支付流程**（自动标记为已支付）
4. **价格计算逻辑**（basePrice + Σ规格调整）
5. **订单数据模型**（新增 2 张订单表）

**实施顺序**:
1. 数据库迁移（创建订单表）
2. 后端接口开发（C端专用 Controller）
3. API 测试验证
4. 前端集成开发

**预计工作量**: 后端 3-5 天，前端 5-7 天，测试 2-3 天。

---

**变更历史**:

| 版本 | 日期 | 作者 | 变更说明 |
|-----|------|------|---------|
| 1.0.0 | 2026-01-02 | Claude Code | 初始版本 |

---

**审核人**: ___________ | **批准日期**: ___________
