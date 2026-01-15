# 小程序商品同步数据处理流程

> 版本: 1.1.0 | 更新日期: 2026-01-05

## 一、流程概述

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        商品同步完整数据流程                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │   飞书表格    │      │   Python     │      │   后端 API   │      │   飞书表格    │
  │  (运营填写)   │ ──▶  │   脚本处理    │ ──▶  │   数据写入   │ ──▶  │  (状态回写)   │
  └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
        │                      │                     │                     │
        │                      ▼                     ▼                     │
        │               ┌──────────────┐      ┌──────────────┐            │
        │               │  名称→ID转换  │      │  Supabase    │            │
        │               │  (API查询)   │      │   PostgreSQL  │            │
        │               └──────────────┘      └──────────────┘            │
        │                      │                                          │
        └──────────────────────┴──────────────────────────────────────────┘
                              ID回填到飞书
```

## 二、数据库表结构

### 2.1 涉及的数据表

| 表名 | 用途 | 主要字段 |
|------|------|---------|
| `skus` | SKU 主数据 | id, code, name, sku_type |
| `menu_category` | 菜单分类 | id, code, display_name |
| `channel_product_config` | 渠道商品配置 | id, sku_id, category_id, channel_price |

### 2.2 表结构详情

#### skus 表

```sql
CREATE TABLE skus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,    -- SKU编码（条码）
    name            VARCHAR(200) NOT NULL,          -- SKU名称
    spu_id          UUID NOT NULL,                  -- 关联SPU
    sku_type        VARCHAR(20) NOT NULL,           -- 类型: raw_material/packaging/finished_product/combo
    main_unit       VARCHAR(20) NOT NULL,           -- 主单位
    standard_cost   DECIMAL(12,2),                  -- 标准成本
    price           DECIMAL(12,2) DEFAULT 0,        -- 价格
    status          VARCHAR(20) DEFAULT 'enabled',  -- 状态
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### menu_category 表

```sql
CREATE TABLE menu_category (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL,           -- 分类编码 (ALCOHOL/COFFEE/BEVERAGE等)
    display_name    VARCHAR(50) NOT NULL,           -- 显示名称（经典特调/精品咖啡）
    sort_order      INTEGER NOT NULL DEFAULT 0,     -- 排序（越小越靠前）
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,  -- 是否可见
    is_default      BOOLEAN NOT NULL DEFAULT FALSE, -- 是否默认分类
    icon_url        TEXT,                           -- 图标URL
    description     TEXT,                           -- 描述
    version         BIGINT NOT NULL DEFAULT 0,      -- 乐观锁版本
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP                       -- 软删除时间
);
```

#### channel_product_config 表

```sql
CREATE TABLE channel_product_config (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id           UUID NOT NULL,                  -- 关联SKU (外键)
    channel_type     VARCHAR(50) NOT NULL DEFAULT 'MINI_PROGRAM',  -- 渠道类型
    display_name     VARCHAR(100),                   -- 渠道展示名称
    channel_category VARCHAR(50) NOT NULL DEFAULT 'OTHER',  -- 旧枚举（废弃）
    category_id      UUID,                           -- 菜单分类ID (外键 → menu_category.id)
    channel_price    BIGINT,                         -- 渠道价格（单位：分）
    main_image       TEXT,                           -- 主图URL
    detail_images    JSONB DEFAULT '[]',             -- 详情图数组
    description      TEXT,                           -- 描述
    specs            JSONB DEFAULT '[]',             -- 规格配置
    is_recommended   BOOLEAN NOT NULL DEFAULT FALSE, -- 是否推荐
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- 状态
    sort_order       INTEGER NOT NULL DEFAULT 0,     -- 排序
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMP,                      -- 软删除时间

    CONSTRAINT uq_sku_channel UNIQUE (sku_id, channel_type),
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES menu_category(id)
);

-- 索引
CREATE INDEX idx_channel_product_sku_id ON channel_product_config(sku_id);
CREATE INDEX idx_channel_product_category_id ON channel_product_config(category_id);
CREATE INDEX idx_channel_product_status ON channel_product_config(status);
```

## 三、飞书表格结构

### 3.1 表格配置

| 配置项 | 值 |
|--------|-----|
| Base App Token | `GgR7bLQDmaPTO8sOVz8cqCgPn6V` |
| Table ID | `tblWGityJYmuX5wf` |
| 表格 URL | https://j13juzq4tyn.feishu.cn/base/GgR7bLQDmaPTO8sOVz8cqCgPn6V |

### 3.2 字段定义

#### 运营填写字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| 商品名称 | Text | ✅ | 小程序显示的商品名称 |
| SKU名称 | Text | ✅ | 关联系统 SKU 的名称 |
| 分类名称 | SingleSelect | ✅ | 商品所属菜单分类 |
| 渠道价格 | Number | ✅ | 小程序售价（元） |
| 主图URL | Url | ⬚ | 商品主图链接 |
| 详情图URL | Text | ⬚ | 商品详情图链接 |
| 商品描述 | Text | ⬚ | 商品描述文案 |
| 规格说明 | Text | ⬚ | 商品规格（如 500ml） |
| 是否推荐 | Checkbox | ⬚ | 是否显示推荐标签 |
| 排序权重 | Number | ⬚ | 排序值，越大越靠前 |
| 目标状态 | SingleSelect | ✅ | 草稿/上架/下架 |

#### 系统回填字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| SKU_ID | Text | **待添加** - 系统回填的 SKU UUID |
| 分类ID | Text | **待添加** - 系统回填的分类 UUID |
| 系统商品ID | Text | 创建成功后回填的渠道商品 ID |
| 同步状态 | SingleSelect | 待同步/已同步/失败 |
| 同步时间 | DateTime | 最后同步时间 |
| 错误信息 | Text | 同步失败时的错误描述 |

## 四、API 调用与 SQL 对照

### 4.1 查询 SKU

#### API 请求

```bash
GET /api/skus
```

#### 对应 SQL

```sql
-- 查询所有 SKU（默认分页）
SELECT id, code, name, spu_id, sku_type, main_unit,
       standard_cost, price, status, created_at, updated_at
FROM skus
WHERE 1=1
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- 按名称精确查询
SELECT id, code, name, sku_type, main_unit, price, status
FROM skus
WHERE name = '瓶装啤酒'
  AND status = 'enabled';
```

#### 验证 SQL

```sql
-- 验证 SKU 是否存在
SELECT id, name, code, sku_type
FROM skus
WHERE name = '瓶装啤酒';

-- 预期结果：
-- id: 550e8400-e29b-41d4-a716-446655440025
-- name: 瓶装啤酒
-- code: 6901234567025
-- sku_type: finished_product
```

### 4.2 查询菜单分类

#### API 请求

```bash
GET /api/admin/menu-categories
```

#### 对应 SQL

```sql
-- 查询所有菜单分类（排除已删除）
SELECT id, code, display_name, sort_order, is_visible,
       is_default, icon_url, description, version,
       created_at, updated_at
FROM menu_category
WHERE deleted_at IS NULL
ORDER BY sort_order ASC;

-- 按显示名称查询
SELECT id, code, display_name
FROM menu_category
WHERE display_name = '经典饮品'
  AND deleted_at IS NULL;
```

#### 验证 SQL

```sql
-- 验证分类是否存在
SELECT id, code, display_name, is_visible
FROM menu_category
WHERE display_name = '经典饮品'
  AND deleted_at IS NULL;

-- 预期结果：
-- id: fd02eba4-28f3-4db9-b944-c2e4421f493d
-- code: BEVERAGE
-- display_name: 经典饮品
-- is_visible: true
```

### 4.3 创建渠道商品

#### API 请求

```bash
POST /api/channel-products
Content-Type: application/json

{
  "sku_id": "550e8400-e29b-41d4-a716-446655440025",
  "category_id": "fd02eba4-28f3-4db9-b944-c2e4421f493d",
  "display_name": "青岛啤酒",
  "channel_price": 1800,
  "description": "青岛经典，观影必备",
  "is_recommended": false,
  "sort_order": 85,
  "status": "ACTIVE",
  "channel_type": "MINI_PROGRAM"
}
```

**⚠️ 重要：后端使用 snake_case 命名策略**

| 字段 | 类型 | 说明 |
|------|------|------|
| `sku_id` | UUID | SKU ID（必填） |
| `category_id` | UUID | 分类 ID（必填） |
| `display_name` | String | 显示名称 |
| `channel_price` | Long | 价格，**单位：分**（18元 = 1800） |
| `is_recommended` | Boolean | 是否推荐 |
| `sort_order` | Integer | 排序权重 |
| `status` | String | ACTIVE/INACTIVE/DRAFT |
| `channel_type` | String | 默认 MINI_PROGRAM |

#### 对应 SQL

```sql
-- 创建渠道商品
INSERT INTO channel_product_config (
    id,
    sku_id,
    category_id,
    channel_type,
    display_name,
    channel_category,
    channel_price,
    description,
    is_recommended,
    sort_order,
    status,
    specs,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440025',  -- sku_id
    'fd02eba4-28f3-4db9-b944-c2e4421f493d',  -- category_id
    'MINI_PROGRAM',
    '青岛啤酒',
    'OTHER',        -- channel_category 默认值（废弃字段）
    1800,           -- 18元 = 1800分
    '青岛经典，观影必备',
    FALSE,
    85,
    'ACTIVE',
    '[]'::jsonb,
    NOW(),
    NOW()
)
RETURNING id, display_name, status;
```

#### 验证 SQL

```sql
-- 创建后验证商品是否存在
SELECT
    cpc.id,
    cpc.display_name,
    cpc.channel_price / 100.0 AS price_yuan,  -- 转换为元
    cpc.status,
    s.name AS sku_name,
    mc.display_name AS category_name
FROM channel_product_config cpc
LEFT JOIN skus s ON cpc.sku_id = s.id
LEFT JOIN menu_category mc ON cpc.category_id = mc.id
WHERE cpc.sku_id = '550e8400-e29b-41d4-a716-446655440025'
  AND cpc.deleted_at IS NULL;

-- 预期结果：
-- id: ca5c779a-e6b5-4db9-953d-4c59d5a43bcf
-- display_name: 青岛啤酒
-- price_yuan: 18.00
-- status: ACTIVE
-- sku_name: 瓶装啤酒
-- category_name: 经典饮品
```

### 4.4 查询渠道商品列表

#### API 请求

```bash
GET /api/channel-products
```

#### 对应 SQL

```sql
-- 查询所有渠道商品（带关联信息）
SELECT
    cpc.id,
    cpc.sku_id,
    cpc.channel_type,
    cpc.display_name,
    cpc.category_id,
    cpc.channel_price,
    cpc.is_recommended,
    cpc.status,
    cpc.sort_order,
    cpc.created_at,
    -- SKU 信息
    s.code AS sku_code,
    s.name AS sku_name,
    -- 分类信息
    mc.code AS category_code,
    mc.display_name AS category_name
FROM channel_product_config cpc
LEFT JOIN skus s ON cpc.sku_id = s.id
LEFT JOIN menu_category mc ON cpc.category_id = mc.id
WHERE cpc.deleted_at IS NULL
ORDER BY cpc.sort_order DESC, cpc.created_at DESC
LIMIT 20 OFFSET 0;
```

### 4.5 更新商品状态

#### API 请求

```bash
PATCH /api/channel-products/{id}/status
Content-Type: application/json

{
  "status": "INACTIVE"
}
```

#### 对应 SQL

```sql
-- 更新商品状态（下架）
UPDATE channel_product_config
SET status = 'INACTIVE',
    updated_at = NOW()
WHERE id = 'ca5c779a-e6b5-4db9-953d-4c59d5a43bcf'
  AND deleted_at IS NULL
RETURNING id, display_name, status;
```

## 五、完整同步流程

### 5.1 流程图

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 1: 读取飞书待同步记录                                               │
│  ────────────────────────────────────────────────────────────────────   │
│  飞书 MCP: bitable_v1_appTableRecord_search                             │
│  筛选条件: 同步状态 = "待同步"                                            │
│                                                                          │
│  返回数据:                                                                │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 商品名称: 青岛啤酒                                               │     │
│  │ SKU名称: 瓶装啤酒                                                │     │
│  │ 分类名称: 经典饮品                                               │     │
│  │ 渠道价格: 18                                                    │     │
│  │ 目标状态: 上架                                                   │     │
│  │ record_id: recv7oXGtJwvY5                                       │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 2: 查询 SKU ID                                                    │
│  ────────────────────────────────────────────────────────────────────   │
│  API: GET /api/skus                                                     │
│  SQL: SELECT id FROM skus WHERE name = '瓶装啤酒';                       │
│                                                                          │
│  ✅ 找到: sku_id = "550e8400-e29b-41d4-a716-446655440025"               │
│  ❌ 未找到: 记录错误，跳转 Step 6 (失败处理)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 3: 查询分类 ID                                                    │
│  ────────────────────────────────────────────────────────────────────   │
│  API: GET /api/admin/menu-categories                                    │
│  SQL: SELECT id FROM menu_category WHERE display_name = '经典饮品';      │
│                                                                          │
│  ✅ 找到: category_id = "fd02eba4-28f3-4db9-b944-c2e4421f493d"          │
│  ❌ 未找到: 尝试模糊匹配或记录错误                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 4: 回填 ID 到飞书（可选，需添加字段）                               │
│  ────────────────────────────────────────────────────────────────────   │
│  飞书 MCP: bitable_v1_appTableRecord_update                             │
│                                                                          │
│  更新字段:                                                               │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ SKU_ID: 550e8400-e29b-41d4-a716-446655440025                   │     │
│  │ 分类ID: fd02eba4-28f3-4db9-b944-c2e4421f493d                   │     │
│  └────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 5: 创建渠道商品                                                    │
│  ────────────────────────────────────────────────────────────────────   │
│  API: POST /api/channel-products                                        │
│  SQL: INSERT INTO channel_product_config (...) VALUES (...);            │
│                                                                          │
│  请求体（snake_case 格式）:                                               │
│  {                                                                       │
│    "sku_id": "550e8400-e29b-41d4-a716-446655440025",                    │
│    "category_id": "fd02eba4-28f3-4db9-b944-c2e4421f493d",               │
│    "display_name": "青岛啤酒",                                           │
│    "channel_price": 1800,    ← 单位：分（18元 × 100）                    │
│    "status": "ACTIVE",                                                   │
│    "channel_type": "MINI_PROGRAM"                                        │
│  }                                                                       │
│                                                                          │
│  ✅ 成功: 获取 系统商品ID，跳转 Step 6 (成功处理)                         │
│  ❌ 失败: 记录错误信息，跳转 Step 6 (失败处理)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Step 6: 回写同步结果到飞书                                              │
│  ────────────────────────────────────────────────────────────────────   │
│  飞书 MCP: bitable_v1_appTableRecord_update                             │
│                                                                          │
│  成功时更新:                          失败时更新:                         │
│  ┌─────────────────────────┐         ┌─────────────────────────┐        │
│  │ 同步状态: 已同步         │         │ 同步状态: 失败          │        │
│  │ 系统商品ID: cp-xxx       │         │ 错误信息: SKU不存在     │        │
│  │ 同步时间: 2026-01-05     │         │ 同步时间: 2026-01-05    │        │
│  └─────────────────────────┘         └─────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 六、实际执行记录（青岛啤酒）

### 6.1 Step 1: 查询飞书记录

```json
// 飞书 MCP 请求
{
  "path": {"app_token": "GgR7bLQDmaPTO8sOVz8cqCgPn6V", "table_id": "tblWGityJYmuX5wf"},
  "data": {"filter": {"conditions": [{"field_name": "商品名称", "operator": "contains", "value": ["青岛啤酒"]}]}}
}

// 返回
{
  "record_id": "recv7oXGtJwvY5",
  "fields": {
    "商品名称": "青岛啤酒",
    "SKU名称": "瓶装啤酒",
    "分类名称": "特调饮品",  // ⚠️ 原始值，系统中不存在
    "渠道价格": 18,
    "目标状态": "上架"
  }
}
```

### 6.2 Step 2: 查询 SKU ID

```bash
# API 请求
curl -s "http://localhost:8080/api/skus"

# 结果
✅ SKU_ID: 550e8400-e29b-41d4-a716-446655440025
   SKU_NAME: 瓶装啤酒
```

```sql
-- 验证 SQL
SELECT id, name, code FROM skus WHERE name = '瓶装啤酒';
-- 结果: 550e8400-e29b-41d4-a716-446655440025 | 瓶装啤酒 | 6901234567025
```

### 6.3 Step 3: 查询分类 ID（发现问题）

```bash
# API 请求
curl -s "http://localhost:8080/api/admin/menu-categories"

# 结果
⚠️ "特调饮品" 不存在于系统分类中

# 可用分类:
- 经典特调 (ALCOHOL)
- 精品咖啡 (COFFEE)
- 经典饮品 (BEVERAGE) ← 选择此项
- 主厨小食 (SNACK)
```

```sql
-- 验证 SQL
SELECT id, code, display_name FROM menu_category WHERE deleted_at IS NULL;
-- 结果：无 "特调饮品"，需要修正为 "经典饮品"
```

### 6.4 Step 4: 修正分类名称

```json
// 飞书 MCP 更新
{
  "path": {"app_token": "...", "table_id": "...", "record_id": "recv7oXGtJwvY5"},
  "data": {"fields": {"分类名称": "经典饮品"}}
}
// ✅ 成功
```

### 6.5 Step 5: 创建渠道商品

**第一次尝试（失败）**：使用 camelCase

```bash
# ❌ 错误请求
curl -X POST "http://localhost:8080/api/channel-products" \
  -d '{"skuId":"...", "categoryId":"...", "basePrice":18.00}'

# 错误响应
{"success":false,"error":"DATABASE_ERROR","message":"数据访问失败"}
```

**第二次尝试（成功）**：使用 snake_case

```bash
# ✅ 正确请求
curl -X POST "http://localhost:8080/api/channel-products" \
  -H "Content-Type: application/json" \
  -d '{
    "sku_id": "550e8400-e29b-41d4-a716-446655440025",
    "category_id": "fd02eba4-28f3-4db9-b944-c2e4421f493d",
    "display_name": "青岛啤酒",
    "channel_price": 1800,
    "description": "青岛经典，观影必备",
    "is_recommended": false,
    "sort_order": 85,
    "status": "ACTIVE",
    "channel_type": "MINI_PROGRAM"
  }'

# 成功响应
{
  "success": true,
  "data": {
    "id": "ca5c779a-e6b5-4db9-953d-4c59d5a43bcf",
    "display_name": "青岛啤酒",
    "channel_price": 1800,
    "status": "ACTIVE"
  }
}
```

```sql
-- 验证 SQL
SELECT id, display_name, channel_price / 100.0 AS price_yuan, status
FROM channel_product_config
WHERE id = 'ca5c779a-e6b5-4db9-953d-4c59d5a43bcf';

-- 结果:
-- ca5c779a-e6b5-4db9-953d-4c59d5a43bcf | 青岛啤酒 | 18.00 | ACTIVE
```

### 6.6 Step 6: 回写同步状态

```json
// 飞书 MCP 更新
{
  "path": {"record_id": "recv7oXGtJwvY5"},
  "data": {
    "fields": {
      "同步状态": "已同步",
      "系统商品ID": "ca5c779a-e6b5-4db9-953d-4c59d5a43bcf",
      "同步时间": 1736080247000,
      "错误信息": ""
    }
  }
}
// ✅ 成功
```

## 七、错误分析与解决

### 7.1 DATABASE_ERROR 根因分析

**问题现象**：调用 `POST /api/channel-products` 返回 `DATABASE_ERROR`

**根本原因**：**字段命名策略不匹配**

后端 DTO 使用 `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)`，
必须使用 **snake_case** 格式，而不是 camelCase。

**错误请求 vs 正确请求对比**：

```diff
- 错误（camelCase）:
{
-  "skuId": "550e8400-...",
-  "categoryId": "fd02eba4-...",
-  "basePrice": 18.00,
-  "displayName": "青岛啤酒",
-  "isRecommended": false,
-  "sortOrder": 85
}

+ 正确（snake_case）:
{
+  "sku_id": "550e8400-...",
+  "category_id": "fd02eba4-...",
+  "channel_price": 1800,
+  "display_name": "青岛啤酒",
+  "is_recommended": false,
+  "sort_order": 85
}
```

### 7.2 价格单位错误

| 错误 | 正确 |
|------|------|
| `basePrice: 18.00` | `channel_price: 1800` |
| 单位：元 | 单位：分 |

**转换公式**：`channel_price = price_yuan × 100`

### 7.3 字段名称映射表

| 飞书/脚本字段 | API 字段 (snake_case) | 数据库字段 |
|--------------|----------------------|-----------|
| skuId | `sku_id` | sku_id |
| categoryId | `category_id` | category_id |
| displayName | `display_name` | display_name |
| basePrice (元) | `channel_price` (分) | channel_price |
| isRecommended | `is_recommended` | is_recommended |
| sortOrder | `sort_order` | sort_order |
| status | `status` | status |
| channel | `channel_type` | channel_type |

## 八、数据验证 SQL 汇总

### 8.1 验证 SKU 是否存在

```sql
SELECT id, name, code, sku_type, status
FROM skus
WHERE name = '瓶装啤酒'
  AND status = 'enabled';
```

### 8.2 验证分类是否存在

```sql
SELECT id, code, display_name, is_visible
FROM menu_category
WHERE display_name = '经典饮品'
  AND deleted_at IS NULL;
```

### 8.3 验证商品是否创建成功

```sql
SELECT
    cpc.id,
    cpc.display_name,
    cpc.channel_price / 100.0 AS price_yuan,
    cpc.status,
    s.name AS sku_name,
    mc.display_name AS category_name,
    cpc.created_at
FROM channel_product_config cpc
LEFT JOIN skus s ON cpc.sku_id = s.id
LEFT JOIN menu_category mc ON cpc.category_id = mc.id
WHERE cpc.display_name = '青岛啤酒'
  AND cpc.deleted_at IS NULL;
```

### 8.4 查询所有渠道商品

```sql
SELECT
    cpc.id,
    cpc.display_name AS 商品名称,
    cpc.channel_price / 100.0 AS 价格_元,
    cpc.status AS 状态,
    s.name AS SKU名称,
    mc.display_name AS 分类,
    cpc.is_recommended AS 推荐,
    cpc.sort_order AS 排序
FROM channel_product_config cpc
LEFT JOIN skus s ON cpc.sku_id = s.id
LEFT JOIN menu_category mc ON cpc.category_id = mc.id
WHERE cpc.deleted_at IS NULL
ORDER BY cpc.sort_order DESC, cpc.created_at DESC;
```

### 8.5 按分类统计商品数量

```sql
SELECT
    mc.display_name AS 分类,
    COUNT(cpc.id) AS 商品数量
FROM menu_category mc
LEFT JOIN channel_product_config cpc
    ON mc.id = cpc.category_id
    AND cpc.deleted_at IS NULL
WHERE mc.deleted_at IS NULL
GROUP BY mc.id, mc.display_name
ORDER BY mc.sort_order;
```

## 九、脚本文件说明

### 9.1 目录结构

```
.claude/skills/ops-expert/scripts/channel_product/
├── config.py              # 配置：后端 API 地址
├── api_client.py          # API 封装：SKU/分类/商品接口
├── feishu_helper.py       # 飞书数据格式转换
├── sync_products.py       # 主流程：同步商品
├── batch_update_status.py # 批量上架/下架
├── query_status.py        # 同步状态查询
└── create_table.py        # 创建飞书表格
```

### 9.2 api_client.py 关键方法

```python
class ChannelProductAPI:

    def build_create_request(
        self,
        sku_id: str,
        category_id: str,
        display_name: str,
        price_yuan: float,  # 输入元，自动转分
        ...
    ) -> Dict:
        """构建创建商品请求体（自动转换为正确格式）"""
        return {
            "sku_id": sku_id,
            "category_id": category_id,
            "display_name": display_name,
            "channel_price": int(price_yuan * 100),  # 元 → 分
            "is_recommended": is_recommended,
            "sort_order": sort_order,
            "status": status,
            "channel_type": "MINI_PROGRAM"
        }
```

## 十、常见问题与解决

### Q1: 分类 API 返回 500 错误

**原因**：API 路径错误

| 错误路径 | 正确路径 |
|---------|---------|
| `/api/menu-categories` | `/api/admin/menu-categories` |

### Q2: 飞书分类名称与系统不匹配

**解决方案**：
1. 在飞书表格中使用 SingleSelect 限制选项
2. 选项值与系统 `menu_category.display_name` 保持一致
3. 同步脚本中增加模糊匹配逻辑

### Q3: DATABASE_ERROR (字段命名策略)

**根因**：后端使用 `@JsonNaming(SnakeCaseStrategy.class)`

**解决**：所有字段使用 snake_case 格式

### Q4: 价格显示异常

**根因**：价格单位错误

| 字段 | 单位 | 示例 |
|------|------|------|
| 飞书 "渠道价格" | 元 | 18 |
| API `channel_price` | 分 | 1800 |
| 数据库 `channel_price` | 分 | 1800 |

**转换**：`channel_price = 渠道价格 × 100`

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| 1.0.0 | 2026-01-05 | 初始版本 |
| 1.1.0 | 2026-01-05 | 修复 snake_case 错误；添加 SQL 验证语句；添加数据库表结构 |
