# O002 小程序菜单分类配置 API 接口文档

<!-- DOC-WRITER: AUTO-GENERATED START -->

**@spec O002-miniapp-menu-config**

| 项目 | 信息 |
|------|------|
| 版本 | 1.0.0 |
| 生成时间 | 2026-01-03 |
| 基础路径 | `/api` |
| 认证方式 | Bearer Token (JWT) |

---

## 1. 概述

本文档定义了小程序菜单分类配置功能的完整 API 接口，用于替代原有的硬编码 `ChannelCategory` 枚举，实现动态可配置的分类系统。

### 1.1 核心变更

- 新增 `menu_category` 表替代 `ChannelCategory` 枚举
- 商品表 `channel_product_config` 的 `channel_category` 字段改为外键 `category_id`
- 新增分类管理 API（B端）和分类列表 API（C端）

### 1.2 API 分类

| 分类 | 路径前缀 | 说明 |
|------|----------|------|
| B端管理 API | `/api/admin/menu-categories` | 管理员后台使用 |
| C端查询 API | `/api/client/menu-categories` | 小程序端使用 |
| 商品筛选 API | `/api/client/channel-products` | 按分类筛选商品 |

### 1.3 相关规格

- **O007-miniapp-menu-api**: 商品列表 API
- **O005-channel-product-config**: 渠道商品配置

---

## 2. 通用规范

### 2.1 认证方式

所有 B端 API 需要在请求头中携带 JWT Token：

```http
Authorization: Bearer <token>
```

### 2.2 响应格式

**成功响应**:

```json
{
  "success": true,
  "data": <数据对象或数组>,
  "timestamp": "2026-01-03T10:00:00Z"
}
```

**错误响应**:

```json
{
  "success": false,
  "error": "CAT_NTF_001",
  "message": "分类不存在",
  "details": {},
  "timestamp": "2026-01-03T10:00:00Z"
}
```

### 2.3 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 / 业务规则错误 |
| 401 | 未认证 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如编码重复） |
| 500 | 服务器内部错误 |

---

## 3. B端管理 API

### 3.1 获取分类列表

获取所有菜单分类，包括隐藏的分类和关联商品数量。

**请求**

```http
GET /api/admin/menu-categories?includeHidden=true&includeProductCount=true
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| includeHidden | boolean | 否 | true | 是否包含隐藏分类 |
| includeProductCount | boolean | 否 | true | 是否包含关联商品数量 |

**成功响应** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "code": "ALCOHOL",
      "displayName": "经典特调",
      "sortOrder": 1,
      "isVisible": true,
      "isDefault": false,
      "iconUrl": "https://cdn.example.com/icons/alcohol.png",
      "description": "鸡尾酒、威士忌、啤酒等",
      "productCount": 15,
      "createdAt": "2026-01-01T10:00:00Z",
      "updatedAt": "2026-01-03T08:30:00Z"
    },
    {
      "id": "uuid-002",
      "code": "COFFEE",
      "displayName": "精品咖啡",
      "sortOrder": 2,
      "isVisible": true,
      "isDefault": false,
      "iconUrl": "https://cdn.example.com/icons/coffee.png",
      "description": "拿铁、美式、卡布奇诺等",
      "productCount": 20,
      "createdAt": "2026-01-01T10:00:00Z",
      "updatedAt": "2026-01-01T10:00:00Z"
    }
  ],
  "timestamp": "2026-01-03T10:00:00Z"
}
```

---

### 3.2 创建分类

创建新的菜单分类。

**请求**

```http
POST /api/admin/menu-categories
Content-Type: application/json
```

**请求体**

```json
{
  "code": "SEASONAL",
  "displayName": "季节限定",
  "sortOrder": 3,
  "isVisible": true,
  "iconUrl": "https://cdn.example.com/icons/seasonal.png",
  "description": "季节性特别推荐商品"
}
```

**请求体字段说明**

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| code | string | ✅ | 1-50字符，`^[A-Z][A-Z0-9_]*$` | 分类编码（唯一，大写字母开头） |
| displayName | string | ✅ | 1-50字符 | 显示名称 |
| sortOrder | integer | 否 | ≥0 | 排序序号（默认为最后） |
| isVisible | boolean | 否 | - | 是否可见（默认 true） |
| iconUrl | string | 否 | URL 格式 | 图标 URL |
| description | string | 否 | ≤500字符 | 分类描述 |

**成功响应** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "uuid-new",
    "code": "SEASONAL",
    "displayName": "季节限定",
    "sortOrder": 3,
    "isVisible": true,
    "isDefault": false,
    "iconUrl": "https://cdn.example.com/icons/seasonal.png",
    "description": "季节性特别推荐商品",
    "productCount": 0,
    "createdAt": "2026-01-03T10:00:00Z",
    "updatedAt": "2026-01-03T10:00:00Z"
  },
  "timestamp": "2026-01-03T10:00:00Z"
}
```

**错误响应** `409 Conflict`

```json
{
  "success": false,
  "error": "CAT_DUP_001",
  "message": "分类编码已存在: SEASONAL",
  "details": {
    "code": "SEASONAL"
  },
  "timestamp": "2026-01-03T10:00:00Z"
}
```

---

### 3.3 获取分类详情

根据 ID 获取分类详情。

**请求**

```http
GET /api/admin/menu-categories/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | UUID | 分类 ID |

**成功响应** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "uuid-001",
    "code": "ALCOHOL",
    "displayName": "经典特调",
    "sortOrder": 1,
    "isVisible": true,
    "isDefault": false,
    "iconUrl": "https://cdn.example.com/icons/alcohol.png",
    "description": "鸡尾酒、威士忌、啤酒等",
    "productCount": 15,
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-01-03T08:30:00Z"
  },
  "timestamp": "2026-01-03T10:00:00Z"
}
```

**错误响应** `404 Not Found`

```json
{
  "success": false,
  "error": "CAT_NTF_001",
  "message": "分类不存在",
  "timestamp": "2026-01-03T10:00:00Z"
}
```

---

### 3.4 更新分类

更新菜单分类信息。

**请求**

```http
PUT /api/admin/menu-categories/{id}
Content-Type: application/json
```

**业务规则**:
- 默认分类（`isDefault=true`）不可隐藏
- `code` 字段不可修改

**请求体**

```json
{
  "displayName": "精品咖啡",
  "sortOrder": 2,
  "isVisible": true,
  "iconUrl": "https://cdn.example.com/icons/coffee-new.png",
  "description": "各种精品咖啡饮品"
}
```

**成功响应** `200 OK`

返回更新后的分类对象（结构同创建响应）。

---

### 3.5 删除分类

删除菜单分类，关联商品自动迁移到默认分类。

**请求**

```http
DELETE /api/admin/menu-categories/{id}?confirm=true
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| confirm | boolean | ✅ | 确认删除（必须为 true） |

**业务规则**:
- 默认分类（`isDefault=true`）不可删除
- 删除前需要确认（`confirm=true`）
- 关联商品自动迁移到"其他商品"分类
- 记录审计日志

**成功响应** `200 OK`

```json
{
  "success": true,
  "data": {
    "deletedCategoryId": "uuid-001",
    "deletedCategoryName": "季节限定",
    "affectedProductCount": 15,
    "targetCategoryId": "uuid-other",
    "targetCategoryName": "其他商品"
  },
  "message": "分类已删除，15 个商品已迁移到\"其他商品\"分类",
  "timestamp": "2026-01-03T10:00:00Z"
}
```

**错误响应** `400 Bad Request`

```json
{
  "success": false,
  "error": "CAT_BIZ_001",
  "message": "默认分类不能删除",
  "timestamp": "2026-01-03T10:00:00Z"
}
```

---

### 3.6 批量更新排序

批量更新分类排序，用于拖拽排序功能。

**请求**

```http
PUT /api/admin/menu-categories/batch-sort
Content-Type: application/json
```

**请求体**

```json
{
  "items": [
    { "id": "uuid-002", "sortOrder": 1 },
    { "id": "uuid-001", "sortOrder": 2 },
    { "id": "uuid-003", "sortOrder": 3 }
  ]
}
```

**成功响应** `200 OK`

返回更新后的分类列表。

---

### 3.7 切换分类可见性

切换分类的可见性状态。

**请求**

```http
PATCH /api/admin/menu-categories/{id}/visibility?isVisible=false
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isVisible | boolean | ✅ | 是否可见 |

**业务规则**:
- 默认分类不可隐藏
- 隐藏分类后，小程序不显示该分类标签

**成功响应** `200 OK`

返回更新后的分类对象。

**错误响应** `400 Bad Request`

```json
{
  "success": false,
  "error": "CAT_BIZ_002",
  "message": "默认分类不能隐藏",
  "timestamp": "2026-01-03T10:00:00Z"
}
```

---

## 4. C端小程序 API

### 4.1 获取分类列表

获取所有可见的菜单分类，供小程序渲染分类标签栏。

**请求**

```http
GET /api/client/menu-categories
```

**业务规则**:
- 仅返回 `isVisible=true` 的分类
- 按 `sortOrder` 升序排列
- 包含每个分类的商品数量

**缓存策略**:
- 建议客户端缓存 5 分钟（staleTime）
- 支持 1 分钟后台轮询刷新

**成功响应** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-001",
      "code": "ALCOHOL",
      "displayName": "经典特调",
      "iconUrl": "https://cdn.example.com/icons/alcohol.png",
      "productCount": 15
    },
    {
      "id": "uuid-002",
      "code": "COFFEE",
      "displayName": "精品咖啡",
      "iconUrl": "https://cdn.example.com/icons/coffee.png",
      "productCount": 20
    },
    {
      "id": "uuid-003",
      "code": "BEVERAGE",
      "displayName": "经典饮品",
      "iconUrl": "https://cdn.example.com/icons/beverage.png",
      "productCount": 12
    },
    {
      "id": "uuid-004",
      "code": "SNACK",
      "displayName": "主厨小食",
      "iconUrl": "https://cdn.example.com/icons/snack.png",
      "productCount": 8
    }
  ],
  "timestamp": "2026-01-03T10:00:00Z"
}
```

---

### 4.2 获取商品列表（支持分类筛选）

获取小程序商品列表，支持通过分类 ID 或分类编码筛选。

**请求**

```http
GET /api/client/channel-products/mini-program?categoryId=uuid-002
```

或（向后兼容）：

```http
GET /api/client/channel-products/mini-program?category=COFFEE
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | UUID | 否 | 分类 ID（推荐使用） |
| category | string | 否 | 分类编码（向后兼容，如 `COFFEE`） |

> **注意**: 如果同时传入 `categoryId` 和 `category`，`categoryId` 优先。

**排序规则**:
- 推荐商品优先（`isRecommended=true`）
- 按 `sortOrder` 升序
- 按创建时间降序

**成功响应** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "cp-001",
      "skuId": "sku-001",
      "displayName": "美式咖啡",
      "basePrice": 2500,
      "mainImage": "https://cdn.example.com/coffee.jpg",
      "isRecommended": true,
      "sortOrder": 1,
      "status": "ACTIVE",
      "stockStatus": "IN_STOCK",
      "categoryId": "uuid-002",
      "category": {
        "id": "uuid-002",
        "code": "COFFEE",
        "displayName": "精品咖啡"
      }
    }
  ],
  "total": 20,
  "timestamp": "2026-01-03T10:00:00Z"
}
```

---

## 5. 数据模型

### 5.1 MenuCategoryDTO（管理端）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✅ | 分类 ID |
| code | string | ✅ | 分类编码（唯一，大写字母开头） |
| displayName | string | ✅ | 显示名称（中文） |
| sortOrder | integer | ✅ | 排序序号（数字越小越靠前） |
| isVisible | boolean | ✅ | 是否可见 |
| isDefault | boolean | ✅ | 是否为默认分类（不可删除） |
| iconUrl | string | 否 | 图标 URL |
| description | string | 否 | 分类描述（最大500字符） |
| productCount | integer | 否 | 关联商品数量 |
| createdAt | datetime | 否 | 创建时间 |
| updatedAt | datetime | 否 | 更新时间 |

### 5.2 ClientMenuCategoryDTO（小程序端）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | UUID | ✅ | 分类 ID |
| code | string | ✅ | 分类编码 |
| displayName | string | ✅ | 显示名称 |
| iconUrl | string | 否 | 图标 URL |
| productCount | integer | 否 | 商品数量 |

### 5.3 ChannelProductDTO（商品）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 商品 ID |
| skuId | UUID | SKU ID |
| displayName | string | 商品名称 |
| basePrice | integer | 价格（分） |
| mainImage | string | 主图 URL |
| isRecommended | boolean | 是否推荐 |
| sortOrder | integer | 排序序号 |
| status | enum | 状态（ACTIVE, INACTIVE） |
| stockStatus | enum | 库存状态（IN_STOCK, OUT_OF_STOCK, LOW_STOCK） |
| categoryId | UUID | 分类 ID |
| category | object | 分类信息（嵌套） |

---

## 6. 错误码列表

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| CAT_NTF_001 | 404 | 分类不存在 |
| CAT_DUP_001 | 409 | 分类编码已存在 |
| CAT_VAL_001 | 400 | 分类编码格式错误（必须以大写字母开头，只能包含大写字母、数字和下划线） |
| CAT_BIZ_001 | 400 | 默认分类不能删除 |
| CAT_BIZ_002 | 400 | 默认分类不能隐藏 |
| UNAUTHORIZED | 401 | 未授权（请先登录） |

---

## 7. 前端集成指南

### 7.1 TanStack Query 示例

```typescript
// 获取分类列表
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menuCategories'],
    queryFn: () => menuCategoryService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 分钟
    refetchInterval: 60 * 1000, // 1 分钟后台刷新
  });
};

// 获取商品列表（按分类筛选）
export const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: () => productService.getProducts({ categoryId }),
  });
};
```

### 7.2 Zustand Store 示例

```typescript
interface MenuCategoryStore {
  selectedCategoryId: string | null;
  setSelectedCategory: (id: string | null) => void;
}

export const useMenuCategoryStore = create<MenuCategoryStore>((set) => ({
  selectedCategoryId: null,
  setSelectedCategory: (id) => set({ selectedCategoryId: id }),
}));
```

---

## 附录

### A. 初始分类数据

| code | displayName | sortOrder | isDefault |
|------|-------------|-----------|-----------|
| ALCOHOL | 经典特调 | 1 | false |
| COFFEE | 精品咖啡 | 2 | false |
| BEVERAGE | 经典饮品 | 3 | false |
| SNACK | 主厨小食 | 4 | false |
| MEAL | 精品餐食 | 5 | false |
| OTHER | 其他商品 | 6 | true |

### B. 相关文档

- [数据模型文档](../../specs/O002-miniapp-menu-config/data-model.md)
- [OpenAPI 规范](../../specs/O002-miniapp-menu-config/contracts/api.yaml)
- [运营操作指南](../../specs/O002-miniapp-menu-config/operator-guide.md)
- [功能验证文档](../../specs/O002-miniapp-menu-config/verification.md)

<!-- DOC-WRITER: AUTO-GENERATED END -->

---

**生成说明**:
- 本文档由 doc-writer 技能自动生成
- 所有 API 响应格式遵循项目 API 标准（`.claude/rules/08-api-standards.md`）
- 最后更新：2026-01-03
