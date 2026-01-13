# O008 渠道商品分类迁移 - API 接口文档

**@spec O008-channel-product-category-migration**

**版本**: 1.0.0
**创建日期**: 2026-01-04
**作者**: Claude Code
**状态**: 已实现

---

## 1. 概述

本文档描述 O008 渠道商品分类迁移功能涉及的所有 API 接口。该迁移将 B端商品配置从硬编码的 `ChannelCategory` 枚举迁移到动态的 `MenuCategory`（基于 UUID 的 `categoryId`）。

### 1.1 变更摘要

| 变更项 | 变更前 | 变更后 |
|--------|--------|--------|
| 分类字段 | `channelCategory` (枚举) | `categoryId` (UUID) |
| 分类来源 | 硬编码枚举 | 动态 `menu_category` 表 |
| 分类查询 | 前端映射 | `GET /api/admin/menu-categories` |

### 1.2 基础信息

| 项目 | 值 |
|------|-----|
| 基础路径 | `http://localhost:8080/api` |
| 认证方式 | Bearer Token (JWT) |
| 响应格式 | JSON |
| 字符编码 | UTF-8 |

---

## 2. 通用响应格式

### 2.1 成功响应

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

### 2.2 分页响应

```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "totalElements": 100,
    "totalPages": 5,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

### 2.3 错误响应

```json
{
  "success": false,
  "error": "CHP_NTF_001",
  "message": "商品不存在",
  "details": { "id": "uuid" },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

### 2.4 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无内容） |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 3. B端管理接口 (Admin API)

### 3.1 获取商品配置列表

获取渠道商品配置列表，支持分页和筛选。

**请求**

```
GET /api/channel-products
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `channelType` | string | 否 | `MINI_PROGRAM` | 渠道类型 |
| `categoryId` | UUID | 否 | - | 分类 ID（O008 新增） |
| `status` | string | 否 | - | 商品状态 |
| `keyword` | string | 否 | - | 关键词搜索（商品名称） |
| `page` | integer | 否 | 1 | 页码 |
| `size` | integer | 否 | 20 | 每页数量 |

**channelType 枚举值**

| 值 | 说明 |
|-----|------|
| `MINI_PROGRAM` | 小程序 |
| `POS` | POS 终端 |
| `DELIVERY` | 外卖平台 |
| `ECOMMERCE` | 电商平台 |

**status 枚举值**

| 值 | 说明 |
|-----|------|
| `ACTIVE` | 上架 |
| `INACTIVE` | 下架 |
| `OUT_OF_STOCK` | 缺货 |

**请求示例**

```bash
curl -X GET "http://localhost:8080/api/channel-products?channelType=MINI_PROGRAM&categoryId=550e8400-e29b-41d4-a716-446655440000&page=1&size=20" \
  -H "Authorization: Bearer <token>"
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "skuId": "sku-uuid-here",
        "channelType": "MINI_PROGRAM",
        "displayName": "美式咖啡",
        "categoryId": "550e8400-e29b-41d4-a716-446655440000",
        "category": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "code": "coffee",
          "displayName": "咖啡",
          "sortOrder": 1,
          "isVisible": true,
          "isDefault": false,
          "iconUrl": "https://example.com/icon.png",
          "description": "各类咖啡饮品"
        },
        "channelPrice": 2800,
        "mainImage": "https://example.com/image.jpg",
        "detailImages": ["https://example.com/detail1.jpg"],
        "description": "精选阿拉比卡咖啡豆",
        "specs": [],
        "isRecommended": true,
        "status": "ACTIVE",
        "sortOrder": 1,
        "createdAt": "2026-01-04T10:00:00Z",
        "updatedAt": "2026-01-04T10:00:00Z",
        "sku": {
          "id": "sku-uuid-here",
          "skuCode": "SKU001",
          "skuName": "美式咖啡（中杯）",
          "price": 2500,
          "imageUrl": "https://example.com/sku.jpg"
        }
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

### 3.2 获取商品配置详情

获取单个渠道商品配置的详细信息。

**请求**

```
GET /api/channel-products/{id}
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 商品配置 ID |

**请求示例**

```bash
curl -X GET "http://localhost:8080/api/channel-products/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>"
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "skuId": "sku-uuid-here",
    "channelType": "MINI_PROGRAM",
    "displayName": "美式咖啡",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "coffee",
      "displayName": "咖啡",
      "sortOrder": 1,
      "isVisible": true,
      "isDefault": false
    },
    "channelPrice": 2800,
    "mainImage": "https://example.com/image.jpg",
    "detailImages": ["https://example.com/detail1.jpg"],
    "description": "精选阿拉比卡咖啡豆",
    "specs": [
      {
        "id": "spec-1",
        "type": "size",
        "name": "杯型",
        "required": true,
        "multiSelect": false,
        "options": [
          { "id": "opt-1", "name": "中杯", "priceAdjust": 0, "isDefault": true, "sortOrder": 1 },
          { "id": "opt-2", "name": "大杯", "priceAdjust": 300, "isDefault": false, "sortOrder": 2 }
        ]
      }
    ],
    "isRecommended": true,
    "status": "ACTIVE",
    "sortOrder": 1,
    "createdAt": "2026-01-04T10:00:00Z",
    "updatedAt": "2026-01-04T10:00:00Z"
  },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

**错误响应**

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `CHP_NTF_001` | 404 | 商品不存在 |

---

### 3.3 创建商品配置

创建新的渠道商品配置。

**请求**

```
POST /api/channel-products
```

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `skuId` | UUID | 是 | SKU ID |
| `categoryId` | UUID | 是 | 分类 ID（O008 新增，必填） |
| `channelType` | string | 否 | 渠道类型，默认 `MINI_PROGRAM` |
| `displayName` | string | 否 | 显示名称，最大 100 字符 |
| `channelPrice` | integer | 否 | 渠道价格（分） |
| `mainImage` | string | 否 | 主图 URL |
| `detailImages` | string[] | 否 | 详情图 URL 列表 |
| `description` | string | 否 | 商品描述，最大 500 字符 |
| `specs` | ChannelProductSpec[] | 否 | 规格列表 |
| `isRecommended` | boolean | 否 | 是否推荐，默认 false |
| `status` | string | 否 | 状态，默认 `INACTIVE` |
| `sortOrder` | integer | 否 | 排序序号，默认 0 |

**请求示例**

```bash
curl -X POST "http://localhost:8080/api/channel-products" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "skuId": "sku-uuid-here",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "美式咖啡",
    "channelPrice": 2800,
    "mainImage": "https://example.com/image.jpg",
    "description": "精选阿拉比卡咖啡豆",
    "isRecommended": true,
    "status": "ACTIVE"
  }'
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "skuId": "sku-uuid-here",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "美式咖啡",
    "channelPrice": 2800,
    "status": "ACTIVE",
    "createdAt": "2026-01-04T10:00:00Z",
    "updatedAt": "2026-01-04T10:00:00Z"
  },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

**错误响应**

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `CHP_VAL_001` | 400 | SKU ID 无效 |
| `CHP_VAL_002` | 400 | 分类 ID 无效 |
| `CHP_DUP_001` | 409 | 该 SKU 已存在渠道配置 |

---

### 3.4 更新商品配置

更新已存在的渠道商品配置。

**请求**

```
PUT /api/channel-products/{id}
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 商品配置 ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryId` | UUID | 否 | 分类 ID（O008 新增） |
| `displayName` | string | 否 | 显示名称 |
| `channelPrice` | integer | 否 | 渠道价格（分），可设为 null |
| `mainImage` | string | 否 | 主图 URL，可设为 null |
| `detailImages` | string[] | 否 | 详情图 URL 列表 |
| `description` | string | 否 | 商品描述，可设为 null |
| `specs` | ChannelProductSpec[] | 否 | 规格列表 |
| `isRecommended` | boolean | 否 | 是否推荐 |
| `status` | string | 否 | 状态 |
| `sortOrder` | integer | 否 | 排序序号 |

**请求示例**

```bash
curl -X PUT "http://localhost:8080/api/channel-products/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "new-category-uuid",
    "displayName": "美式咖啡（升级版）",
    "channelPrice": 3200
  }'
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "categoryId": "new-category-uuid",
    "displayName": "美式咖啡（升级版）",
    "channelPrice": 3200,
    "updatedAt": "2026-01-04T11:00:00Z"
  },
  "timestamp": "2026-01-04T11:00:00Z"
}
```

---

### 3.5 更新商品状态

快速更新商品的上架/下架状态。

**请求**

```
PATCH /api/channel-products/{id}/status
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 商品配置 ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 是 | 新状态：`ACTIVE` / `INACTIVE` / `OUT_OF_STOCK` |

**请求示例**

```bash
curl -X PATCH "http://localhost:8080/api/channel-products/a1b2c3d4-e5f6-7890-abcd-ef1234567890/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "ACTIVE" }'
```

**响应示例**

```json
{
  "success": true,
  "data": null,
  "timestamp": "2026-01-04T11:00:00Z"
}
```

---

### 3.6 删除商品配置

软删除渠道商品配置。

**请求**

```
DELETE /api/channel-products/{id}
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 商品配置 ID |

**请求示例**

```bash
curl -X DELETE "http://localhost:8080/api/channel-products/a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer <token>"
```

**响应示例**

```json
{
  "success": true,
  "data": null,
  "timestamp": "2026-01-04T11:00:00Z"
}
```

---

### 3.7 上传商品图片

上传商品图片到 Supabase Storage。

**请求**

```
POST /api/channel-products/upload-image
```

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | 图片文件（multipart/form-data） |

**请求示例**

```bash
curl -X POST "http://localhost:8080/api/channel-products/upload-image" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

**响应示例**

```json
{
  "success": true,
  "data": "https://storage.supabase.co/v1/object/public/channel-products/image-uuid.jpg",
  "timestamp": "2026-01-04T11:00:00Z"
}
```

---

## 4. 菜单分类接口 (复用 O002)

### 4.1 获取菜单分类列表（管理端）

获取所有菜单分类，用于商品配置时的分类选择。

**请求**

```
GET /api/admin/menu-categories
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `includeHidden` | boolean | 否 | false | 是否包含隐藏分类 |
| `includeProductCount` | boolean | 否 | false | 是否包含商品数量统计 |

**请求示例**

```bash
curl -X GET "http://localhost:8080/api/admin/menu-categories?includeHidden=true" \
  -H "Authorization: Bearer <token>"
```

**响应示例**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "coffee",
      "displayName": "咖啡",
      "sortOrder": 1,
      "isVisible": true,
      "isDefault": false,
      "iconUrl": "https://example.com/coffee-icon.png",
      "description": "各类咖啡饮品",
      "productCount": 15
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "code": "tea",
      "displayName": "茶饮",
      "sortOrder": 2,
      "isVisible": true,
      "isDefault": false,
      "iconUrl": "https://example.com/tea-icon.png",
      "description": "各类茶饮",
      "productCount": 8
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "code": "hidden-category",
      "displayName": "已隐藏分类",
      "sortOrder": 99,
      "isVisible": false,
      "isDefault": false,
      "iconUrl": null,
      "description": null,
      "productCount": 2
    }
  ],
  "timestamp": "2026-01-04T10:00:00Z"
}
```

**使用场景**

| 场景 | includeHidden | 说明 |
|------|---------------|------|
| 创建商品 | `false` | 仅显示可见分类 |
| 编辑商品 | `true` | 显示所有分类（包含已隐藏，用于保持关联） |
| 分类筛选 | `false` | 仅显示可见分类 |

---

## 5. C端客户端接口 (Client API)

### 5.1 获取小程序商品列表

获取小程序渠道的商品列表，仅返回上架状态的商品。

**请求**

```
GET /api/client/channel-products/mini-program
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `categoryId` | UUID | 否 | 分类 ID 筛选（优先级最高） |
| `category` | string | 否 | 分类编码筛选（支持新编码和旧枚举值） |

**筛选优先级**

1. 如果提供 `categoryId`，按 UUID 精确筛选
2. 如果提供 `category`，按分类编码筛选
3. 如果都不提供，返回所有上架商品

**请求示例**

```bash
# 按分类 ID 筛选
curl -X GET "http://localhost:8080/api/client/channel-products/mini-program?categoryId=550e8400-e29b-41d4-a716-446655440000"

# 按分类编码筛选
curl -X GET "http://localhost:8080/api/client/channel-products/mini-program?category=coffee"
```

**响应示例**

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "skuId": "sku-uuid-here",
      "categoryId": "550e8400-e29b-41d4-a716-446655440000",
      "category": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "code": "coffee",
        "displayName": "咖啡"
      },
      "displayName": "美式咖啡",
      "basePrice": 2800,
      "mainImage": "https://example.com/image.jpg",
      "detailImages": ["https://example.com/detail1.jpg"],
      "description": "精选阿拉比卡咖啡豆",
      "status": "ACTIVE",
      "isRecommended": true,
      "sortOrder": 1,
      "stockStatus": "IN_STOCK"
    }
  ],
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

### 5.2 获取小程序商品详情

获取单个小程序商品的详细信息。

**请求**

```
GET /api/client/channel-products/mini-program/{id}
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 商品 ID |

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "skuId": "sku-uuid-here",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "coffee",
      "displayName": "咖啡"
    },
    "displayName": "美式咖啡",
    "basePrice": 2800,
    "mainImage": "https://example.com/image.jpg",
    "detailImages": ["https://example.com/detail1.jpg", "https://example.com/detail2.jpg"],
    "description": "精选阿拉比卡咖啡豆，口感醇厚",
    "status": "ACTIVE",
    "isRecommended": true,
    "sortOrder": 1,
    "stockStatus": "IN_STOCK",
    "specs": [
      {
        "id": "spec-1",
        "type": "size",
        "name": "杯型",
        "required": true,
        "multiSelect": false,
        "options": [
          { "id": "opt-1", "name": "中杯", "priceAdjust": 0, "isDefault": true, "sortOrder": 1 },
          { "id": "opt-2", "name": "大杯", "priceAdjust": 300, "isDefault": false, "sortOrder": 2 }
        ]
      }
    ]
  },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

### 5.3 获取小程序商品规格

获取商品的规格配置列表。

**请求**

```
GET /api/client/channel-products/mini-program/{id}/specs
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 商品 ID |

**响应示例**

```json
{
  "success": true,
  "data": [
    {
      "id": "spec-1",
      "type": "size",
      "name": "杯型",
      "required": true,
      "multiSelect": false,
      "options": [
        { "id": "opt-1", "name": "中杯", "priceAdjust": 0, "isDefault": true, "sortOrder": 1 },
        { "id": "opt-2", "name": "大杯", "priceAdjust": 300, "isDefault": false, "sortOrder": 2 }
      ]
    },
    {
      "id": "spec-2",
      "type": "sugar",
      "name": "糖度",
      "required": true,
      "multiSelect": false,
      "options": [
        { "id": "opt-3", "name": "正常糖", "priceAdjust": 0, "isDefault": true, "sortOrder": 1 },
        { "id": "opt-4", "name": "少糖", "priceAdjust": 0, "isDefault": false, "sortOrder": 2 },
        { "id": "opt-5", "name": "无糖", "priceAdjust": 0, "isDefault": false, "sortOrder": 3 }
      ]
    }
  ],
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

## 6. 数据模型

### 6.1 ChannelProductConfig

渠道商品配置实体。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 主键 |
| `skuId` | UUID | 是 | 关联 SKU ID |
| `channelType` | ChannelType | 是 | 渠道类型 |
| `displayName` | string | 否 | 显示名称 |
| `categoryId` | UUID | 是 | 分类 ID（O008 新增） |
| `category` | MenuCategoryDTO | 否 | 分类信息（查询时返回） |
| `channelPrice` | integer | 否 | 渠道价格（分） |
| `mainImage` | string | 否 | 主图 URL |
| `detailImages` | string[] | 否 | 详情图列表 |
| `description` | string | 否 | 商品描述 |
| `specs` | ChannelProductSpec[] | 否 | 规格列表 |
| `isRecommended` | boolean | 是 | 是否推荐 |
| `status` | ChannelProductStatus | 是 | 商品状态 |
| `sortOrder` | integer | 是 | 排序序号 |
| `createdAt` | datetime | 是 | 创建时间 |
| `updatedAt` | datetime | 是 | 更新时间 |
| `deletedAt` | datetime | 否 | 删除时间（软删除） |

### 6.2 MenuCategoryDTO

菜单分类 DTO。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | UUID | 是 | 主键 |
| `code` | string | 是 | 分类编码（唯一） |
| `displayName` | string | 是 | 显示名称 |
| `sortOrder` | integer | 是 | 排序序号 |
| `isVisible` | boolean | 是 | 是否可见 |
| `isDefault` | boolean | 是 | 是否默认分类 |
| `iconUrl` | string | 否 | 图标 URL |
| `description` | string | 否 | 分类描述 |
| `productCount` | integer | 否 | 商品数量（可选返回） |

### 6.3 ChannelProductSpec

商品规格配置。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 规格 ID |
| `type` | string | 是 | 规格类型（size, sugar, temperature 等） |
| `name` | string | 是 | 规格名称 |
| `required` | boolean | 是 | 是否必选 |
| `multiSelect` | boolean | 是 | 是否多选 |
| `options` | SpecOption[] | 是 | 选项列表 |

### 6.4 SpecOption

规格选项。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 选项 ID |
| `name` | string | 是 | 选项名称 |
| `priceAdjust` | integer | 是 | 价格调整（分） |
| `isDefault` | boolean | 是 | 是否默认选中 |
| `sortOrder` | integer | 是 | 排序序号 |

---

## 7. 错误码参考

### 7.1 渠道商品模块 (CHP)

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `CHP_NTF_001` | 404 | 商品不存在 |
| `CHP_VAL_001` | 400 | SKU ID 无效 |
| `CHP_VAL_002` | 400 | 分类 ID 无效 |
| `CHP_VAL_003` | 400 | 请求参数验证失败 |
| `CHP_DUP_001` | 409 | 该 SKU 已存在渠道配置 |
| `CHP_BIZ_001` | 422 | 商品状态不允许此操作 |

### 7.2 菜单分类模块 (CAT)

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `CAT_NTF_001` | 404 | 分类不存在 |
| `CAT_VAL_001` | 400 | 分类编码已存在 |

---

## 8. 接口变更记录

### v1.0.0 (2026-01-04)

**O008-channel-product-category-migration 迁移变更**

| 接口 | 变更类型 | 说明 |
|------|---------|------|
| `GET /api/channel-products` | 参数变更 | 新增 `categoryId` 参数，替代 `channelCategory` |
| `POST /api/channel-products` | 字段变更 | 新增 `categoryId` 字段（必填），删除 `channelCategory` |
| `PUT /api/channel-products/{id}` | 字段变更 | 新增 `categoryId` 字段（可选） |
| `GET /api/client/channel-products/mini-program` | 参数变更 | 新增 `categoryId` 参数 |
| 响应体 | 结构变更 | 新增 `categoryId` 和 `category` 对象 |

---

## 9. 附录

### 9.1 相关文档

- 规格文档: `specs/O008-channel-product-category-migration/spec.md`
- 数据模型: `specs/O008-channel-product-category-migration/data-model.md`
- OpenAPI 规范: `specs/O008-channel-product-category-migration/contracts/api.yaml`
- 验证文档: `specs/O008-channel-product-category-migration/verification.md`

### 9.2 依赖接口

| 接口 | 来源规格 | 说明 |
|------|---------|------|
| `GET /api/admin/menu-categories` | O002 | 获取菜单分类列表 |
| `GET /api/client/menu-categories` | O002 | 获取客户端菜单分类 |

---

**文档状态**: 已完成
**最后更新**: 2026-01-04
