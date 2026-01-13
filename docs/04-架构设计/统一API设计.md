# 统一 API 接口文档

**生成时间**: 2026-01-04
**扫描范围**: specs/ (共 8 个 spec)
**API 总数**: 42 个端点

---

## 目录

- [SKU 管理模块](#sku-管理模块) (8 个端点)
- [门店管理模块](#门店管理模块) (4 个端点)
- [渠道商品配置模块](#渠道商品配置模块) (9 个端点)
- [菜单分类管理模块](#菜单分类管理模块) (9 个端点)
- [小程序订单模块](#小程序订单模块) (6 个端点)
- [商品列表查询模块](#商品列表查询模块) (1 个端点)
- [分类迁移模块](#分类迁移模块) (5 个端点)

---

## SKU 管理模块

**Spec**: P001-sku-master-data
**描述**: SKU 主数据管理，支持原料、包材、成品、套餐四种类型

### API 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/skus` | 获取 SKU 列表（分页查询） | 是 |
| POST | `/api/skus` | 创建 SKU | 是 |
| GET | `/api/skus/{id}` | 获取 SKU 详情 | 是 |
| PUT | `/api/skus/{id}` | 更新 SKU | 是 |
| DELETE | `/api/skus/{id}` | 删除 SKU（软删除） | 是 |
| GET | `/api/skus/{id}/bom` | 获取成品 SKU 的 BOM 配置 | 是 |
| PUT | `/api/skus/{id}/bom` | 更新成品 SKU 的 BOM 配置 | 是 |
| GET | `/api/skus/{id}/combo-items` | 获取套餐 SKU 的子项配置 | 是 |
| PUT | `/api/skus/{id}/combo-items` | 更新套餐 SKU 的子项配置 | 是 |
| POST | `/api/skus/{id}/recalculate-cost` | 手动重新计算标准成本 | 是 |
| POST | `/api/skus/{id}/validate-store-scope` | 验证门店范围可用性 | 是 |

### 核心数据模型

**SKU 类型枚举**:
- `raw_material` - 原料
- `packaging` - 包材
- `finished_product` - 成品
- `combo` - 套餐

**SKU 状态枚举**:
- `active` - 启用
- `inactive` - 停用
- `discontinued` - 已停产

---

## 门店管理模块

**Spec**: S022-store-crud
**描述**: 门店 CRUD 操作，支持乐观锁版本控制

### API 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/stores` | 创建新门店 | 是 |
| PUT | `/api/stores/{id}` | 更新门店信息 | 是 |
| DELETE | `/api/stores/{id}` | 删除门店 | 是 |
| PATCH | `/api/stores/{id}/status` | 切换门店状态 | 是 |

### 核心数据模型

**门店状态枚举**:
- `ACTIVE` - 营业中
- `INACTIVE` - 暂停营业

**更新请求必填字段**:
- `version` - 乐观锁版本号（防止并发冲突）

---

## 渠道商品配置模块

**Spec**: O005-channel-product-config
**描述**: B端渠道商品配置管理和 C端小程序商品展示

### B端管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/channel-products` | 查询渠道商品列表 | 是 |
| POST | `/api/channel-products` | 创建渠道商品配置 | 是 |
| GET | `/api/channel-products/{id}` | 查询单个商品详情 | 是 |
| PUT | `/api/channel-products/{id}` | 更新商品配置 | 是 |
| DELETE | `/api/channel-products/{id}` | 删除商品配置（软删除） | 是 |
| PATCH | `/api/channel-products/{id}/status` | 更新商品状态 | 是 |
| GET | `/api/skus/finished-products` | 获取可选 SKU 成品列表 | 是 |

### C端小程序接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/client/channel-products/mini-program` | 获取小程序商品列表 | 是 |
| GET | `/api/client/channel-products/mini-program/{id}` | 获取商品详情 | 是 |

### 核心数据模型

**商品状态枚举**:
- `ACTIVE` - 上架
- `INACTIVE` - 下架
- `OUT_OF_STOCK` - 缺货

**渠道类型枚举**:
- `MINI_PROGRAM` - 小程序

---

## 菜单分类管理模块

**Spec**: O002-miniapp-menu-config
**描述**: 小程序菜单分类的完整 CRUD API，替代原 ChannelCategory 枚举为动态可配置系统

### B端管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/admin/menu-categories` | 获取分类列表（管理后台） | 是 |
| POST | `/api/admin/menu-categories` | 创建分类 | 是 |
| GET | `/api/admin/menu-categories/{id}` | 获取分类详情 | 是 |
| PUT | `/api/admin/menu-categories/{id}` | 更新分类 | 是 |
| DELETE | `/api/admin/menu-categories/{id}` | 删除分类（商品迁移到默认分类） | 是 |
| PUT | `/api/admin/menu-categories/batch-sort` | 批量更新排序 | 是 |
| PATCH | `/api/admin/menu-categories/{id}/visibility` | 切换分类可见性 | 是 |

### C端小程序接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/client/menu-categories` | 获取可见分类列表 | 否 |
| GET | `/api/client/channel-products/mini-program` | 获取商品列表（支持分类筛选） | 否 |

### 核心数据模型

**分类字段**:
- `id` - UUID
- `code` - 分类编码（唯一，大写字母开头）
- `displayName` - 显示名称
- `sortOrder` - 排序序号
- `isVisible` - 是否可见
- `isDefault` - 是否默认分类（不可删除）
- `iconUrl` - 图标 URL
- `productCount` - 关联商品数量

**错误码**:
- `CAT_NTF_001` - 分类不存在 (404)
- `CAT_DUP_001` - 分类编码已存在 (409)
- `CAT_VAL_001` - 分类编码格式错误 (400)
- `CAT_BIZ_001` - 默认分类不能删除 (400)
- `CAT_BIZ_002` - 默认分类不能隐藏 (400)

---

## 小程序订单模块

**Spec**: O006-miniapp-channel-order
**描述**: 小程序端渠道商品订单相关 API

### C端订单接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/client/channel-products/mini-program` | 获取小程序渠道商品列表 | 是 |
| GET | `/api/client/channel-products/mini-program/{id}` | 获取渠道商品详情 | 是 |
| GET | `/api/client/channel-products/mini-program/{id}/specs` | 获取渠道商品规格列表 | 是 |
| POST | `/api/client/channel-product-orders` | 创建渠道商品订单 | 是 |
| GET | `/api/client/channel-product-orders/my` | 查询我的订单列表 | 是 |
| GET | `/api/client/channel-product-orders/{id}` | 获取订单详情 | 是 |

### 核心数据模型

**订单状态枚举**:
- `PENDING_PAYMENT` - 待支付
- `PENDING_PREPARE` - 待制作
- `PREPARING` - 制作中
- `COMPLETED` - 已完成
- `DELIVERED` - 已送达
- `CANCELLED` - 已取消

**支付状态枚举**:
- `UNPAID` - 未支付
- `PAID` - 已支付
- `REFUNDED` - 已退款

**规格类型枚举**:
- `SIZE` - 杯型
- `TEMPERATURE` - 温度
- `SWEETNESS` - 甜度
- `TOPPING` - 加料
- `SPICINESS` - 辣度
- `SIDE` - 配菜
- `COOKING` - 烹饪方式

---

## 商品列表查询模块

**Spec**: O007-miniapp-menu-api
**描述**: 小程序点餐功能的商品列表与分类菜单 API

### API 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/channel-products` | 查询渠道商品列表（支持分类、渠道、状态筛选） | 否 |

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `category` | string | 否 | 商品分类（ALCOHOL/COFFEE/BEVERAGE/SNACK/MEAL/OTHER） |
| `salesChannel` | string | 是 | 售卖渠道（MINI_PROGRAM_MENU/H5_MENU） |
| `status` | string | 否 | 上下架状态（ACTIVE/INACTIVE） |
| `page` | integer | 否 | 页码（默认 1） |
| `pageSize` | integer | 否 | 每页条数（默认 20，最大 100） |
| `sortBy` | string | 否 | 排序字段（sortOrder/createdAt/priceInCents） |
| `sortOrder` | string | 否 | 排序方向（ASC/DESC） |

### 核心数据模型

**分类枚举**:
- `ALCOHOL` - 经典特调
- `COFFEE` - 精品咖啡
- `BEVERAGE` - 经典饮品
- `SNACK` - 主厨小食
- `MEAL` - 精品餐食
- `OTHER` - 其他商品

**库存状态枚举**:
- `AVAILABLE` - 有库存
- `OUT_OF_STOCK` - 缺货

---

## 分类迁移模块

**Spec**: O008-channel-product-category-migration
**描述**: B端商品配置 API 变更，将 channelCategory 枚举改为 categoryId UUID

### B端管理接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/admin/channel-products` | 获取商品配置列表（支持 categoryId 筛选） | 是 |
| POST | `/api/admin/channel-products` | 创建商品配置（使用 categoryId） | 是 |
| GET | `/api/admin/channel-products/{id}` | 获取商品配置详情 | 是 |
| PUT | `/api/admin/channel-products/{id}` | 更新商品配置 | 是 |
| DELETE | `/api/admin/channel-products/{id}` | 删除商品配置 | 是 |

### 变更说明

**字段变更**:
- `channelCategory` (枚举) → `categoryId` (UUID)
- 新增 `category` 对象字段（关联的分类信息）

**复用接口**:
- `GET /api/admin/menu-categories` - 获取菜单分类列表（复用 O002 API）

---

## 统一响应格式

所有 API 遵循统一的响应格式规范：

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

### 列表响应

```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "timestamp": "2026-01-04T10:00:00Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述",
  "details": { ... },
  "timestamp": "2026-01-04T10:00:00Z"
}
```

---

## 认证方式

所有需要认证的 API 使用 JWT Bearer Token：

```
Authorization: Bearer <token>
```

---

## HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无返回内容） |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

---

**文档版本**: 1.0.0
**生成工具**: doc-writer skill `/doc scan api`
