# O002-miniapp-menu-config 数据模型

**@spec O002-miniapp-menu-config**

本文档定义小程序菜单分类配置的完整数据模型，包括数据库表结构、DTO 定义、类型系统和验证规则。

---

## 目录

1. [数据库表结构](#1-数据库表结构)
2. [后端 DTO 定义](#2-后端-dto-定义)
3. [前端类型系统](#3-前端类型系统)
4. [Zod 验证Schema](#4-zod-验证schema)
5. [错误码规范](#5-错误码规范)
6. [数据字典](#6-数据字典)

---

## 1. 数据库表结构

### 1.1 menu_category（菜单分类表）

| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `id` | UUID | PRIMARY KEY | `gen_random_uuid()` | 分类主键 |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE | - | 分类编码（大写字母开头） |
| `display_name` | VARCHAR(50) | NOT NULL | - | 显示名称（中文） |
| `sort_order` | INTEGER | NOT NULL | - | 排序序号（越小越靠前） |
| `is_visible` | BOOLEAN | NOT NULL | `true` | 是否可见（小程序） |
| `is_default` | BOOLEAN | NOT NULL | `false` | 是否为默认分类 |
| `icon_url` | VARCHAR(500) | NULLABLE | `NULL` | 图标 URL |
| `description` | VARCHAR(500) | NULLABLE | `NULL` | 分类描述 |
| `version` | BIGINT | NOT NULL | `0` | 乐观锁版本号 |
| `deleted_at` | TIMESTAMP | NULLABLE | `NULL` | 软删除标记（NULL=未删除） |
| `created_at` | TIMESTAMP | NOT NULL | `CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | TIMESTAMP | NOT NULL | `CURRENT_TIMESTAMP` | 更新时间 |

**索引**:
- `idx_menu_category_code`: `code` 字段唯一索引
- `idx_menu_category_sort_order`: `sort_order` 字段索引
- `idx_menu_category_is_visible`: `is_visible` 字段索引

**业务规则**:
- `code` 必须唯一，格式为 `^[A-Z][A-Z0-9_]{1,49}$`
- `is_default=true` 的分类不可删除、不可隐藏
- 软删除：`deleted_at` 不为 NULL 表示已删除
- 乐观锁：更新时必须携带 `version` 字段

**初始数据**（V3__Insert_default_menu_categories.sql）:
```sql
INSERT INTO menu_category (code, display_name, sort_order, is_visible, is_default)
VALUES
  ('OTHER', '其他商品', 999, true, true),  -- 默认分类
  ('ALCOHOL', '经典特调', 10, true, false),
  ('BEVERAGE', '经典饮品', 20, true, false),
  ('COFFEE', '精品咖啡', 30, true, false),
  ('SNACK', '主厨小食', 40, true, false);
```

---

### 1.2 channel_product_config（渠道商品配置表）- 变更部分

**新增字段**:
| 字段名 | 类型 | 约束 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `category_id` | UUID | FOREIGN KEY REFERENCES `menu_category(id)` | - | 关联分类 ID |

**外键约束**:
```sql
CONSTRAINT fk_channel_product_category
  FOREIGN KEY (category_id) REFERENCES menu_category(id)
```

**数据迁移**（V4__Migrate_channel_category_to_category_id.sql）:
```sql
-- 1. 添加 category_id 字段
ALTER TABLE channel_product_config ADD COLUMN category_id UUID;

-- 2. 迁移旧枚举值到新分类 ID
UPDATE channel_product_config AS cp
SET category_id = (
  SELECT id FROM menu_category WHERE code = cp.channel_category::TEXT
)
WHERE cp.channel_category IS NOT NULL;

-- 3. 添加外键约束
ALTER TABLE channel_product_config
  ADD CONSTRAINT fk_channel_product_category
  FOREIGN KEY (category_id) REFERENCES menu_category(id);
```

---

### 1.3 category_audit_log（分类审计日志表）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 日志主键 |
| `category_id` | UUID | NULLABLE | 分类 ID（删除时可为 NULL） |
| `category_code` | VARCHAR(50) | NOT NULL | 分类编码 |
| `operation_type` | VARCHAR(20) | NOT NULL | 操作类型（DELETE, BATCH_SORT） |
| `affected_products` | INTEGER | NOT NULL DEFAULT 0 | 影响商品数量 |
| `operation_data` | JSONB | NULLABLE | 操作详情（JSON） |
| `created_at` | TIMESTAMP | NOT NULL | 操作时间 |

**索引**:
- `idx_audit_category_id`: `category_id` 字段索引
- `idx_audit_operation_type`: `operation_type` 字段索引

**审计策略**（FR-011）:
- **DELETE**: 记录删除的分类、影响商品数、目标迁移分类
- **BATCH_SORT**: 记录排序前后的分类顺序

---

## 2. 后端 DTO 定义

### 2.1 MenuCategoryDTO（分类详情 DTO）

```java
/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 DTO（B端管理后台）
 */
public class MenuCategoryDTO {
    private UUID id;                  // 分类 ID
    private String code;              // 分类编码
    private String displayName;       // 显示名称
    private Integer sortOrder;        // 排序序号
    private Boolean isVisible;        // 是否可见
    private Boolean isDefault;        // 是否为默认分类
    private String iconUrl;           // 图标 URL
    private String description;       // 分类描述
    private Long version;             // 乐观锁版本号
    private Integer productCount;     // 关联商品数量（动态查询）
    private LocalDateTime createdAt;  // 创建时间
    private LocalDateTime updatedAt;  // 更新时间
}
```

---

### 2.2 ClientMenuCategoryDTO（客户端分类 DTO）

```java
/**
 * @spec O002-miniapp-menu-config
 * 小程序端分类 DTO（精简版）
 */
public class ClientMenuCategoryDTO {
    private UUID id;                  // 分类 ID
    private String code;              // 分类编码
    private String displayName;       // 显示名称
    private String iconUrl;           // 图标 URL
    private Integer productCount;     // 商品数量
}
```

---

### 2.3 CreateMenuCategoryRequest（创建分类请求）

```java
/**
 * @spec O002-miniapp-menu-config
 * 创建分类请求 DTO
 */
public class CreateMenuCategoryRequest {
    @NotBlank(message = "分类编码不能为空")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]*$", message = "编码必须以大写字母开头")
    @Size(min = 1, max = 50, message = "编码长度必须在1-50字符之间")
    private String code;

    @NotBlank(message = "显示名称不能为空")
    @Size(min = 1, max = 50, message = "显示名称长度必须在1-50字符之间")
    private String displayName;

    private Integer sortOrder;        // 可选，默认为最大值+10

    private Boolean isVisible;        // 可选，默认 true

    @Size(max = 500, message = "图标URL长度不能超过500字符")
    private String iconUrl;

    @Size(max = 500, message = "描述长度不能超过500字符")
    private String description;
}
```

---

### 2.4 UpdateMenuCategoryRequest（更新分类请求）

```java
/**
 * @spec O002-miniapp-menu-config
 * 更新分类请求 DTO（部分字段更新）
 */
public class UpdateMenuCategoryRequest {
    @NotNull(message = "版本号不能为空，用于检测并发编辑冲突")
    private Long version;             // 乐观锁版本号（必需）

    @Size(min = 1, max = 50, message = "显示名称长度必须在1-50字符之间")
    private String displayName;

    private Integer sortOrder;

    private Boolean isVisible;

    @Size(max = 500, message = "图标URL长度不能超过500字符")
    private String iconUrl;

    @Size(max = 500, message = "描述长度不能超过500字符")
    private String description;
}
```

---

### 2.5 BatchUpdateSortOrderRequest（批量排序请求）

```java
/**
 * @spec O002-miniapp-menu-config
 * 批量更新排序请求
 */
public class BatchUpdateSortOrderRequest {
    @NotEmpty(message = "排序项不能为空")
    private List<SortOrderItem> items;

    public static class SortOrderItem {
        @NotNull(message = "分类ID不能为空")
        private UUID id;

        @NotNull(message = "排序序号不能为空")
        @Min(value = 0, message = "排序序号不能为负数")
        private Integer sortOrder;
    }
}
```

---

### 2.6 DeleteCategoryResponse（删除分类响应）

```java
/**
 * @spec O002-miniapp-menu-config
 * 删除分类响应 DTO
 */
public class DeleteCategoryResponse {
    private UUID deletedCategoryId;       // 删除的分类 ID
    private String deletedCategoryName;   // 删除的分类名称
    private Integer affectedProductCount; // 影响商品数量
    private UUID targetCategoryId;        // 目标迁移分类 ID
    private String targetCategoryName;    // 目标迁移分类名称
}
```

---

## 3. 前端类型系统

### 3.1 TypeScript 类型定义

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 前端 TypeScript 类型定义
 */

// 菜单分类 DTO（B端）
export interface MenuCategoryDTO {
  id: string;                   // UUID 字符串
  code: string;                 // 分类编码
  displayName: string;          // 显示名称
  sortOrder: number;            // 排序序号
  isVisible: boolean;           // 是否可见
  isDefault: boolean;           // 是否为默认分类
  iconUrl?: string | null;      // 图标 URL
  description?: string | null;  // 分类描述
  version: number;              // 乐观锁版本号
  productCount?: number;        // 商品数量
  createdAt: string;            // ISO 8601 时间字符串
  updatedAt: string;            // ISO 8601 时间字符串
}

// 客户端分类 DTO（C端）
export interface ClientMenuCategoryDTO {
  id: string;
  code: string;
  displayName: string;
  iconUrl?: string | null;
  productCount: number;
}

// 创建分类请求
export interface CreateMenuCategoryRequest {
  code: string;
  displayName: string;
  sortOrder?: number;
  isVisible?: boolean;
  iconUrl?: string;
  description?: string;
}

// 更新分类请求
export interface UpdateMenuCategoryRequest {
  version: number;              // 必需
  displayName?: string;
  sortOrder?: number;
  isVisible?: boolean;
  iconUrl?: string;
  description?: string;
}

// 批量排序请求
export interface BatchUpdateSortOrderRequest {
  items: Array<{
    id: string;
    sortOrder: number;
  }>;
}

// 删除分类响应
export interface DeleteCategoryData {
  deletedCategoryId: string;
  deletedCategoryName: string;
  affectedProductCount: number;
  targetCategoryId?: string | null;
  targetCategoryName?: string | null;
}

// 表单模式
export type CategoryFormMode = 'create' | 'edit';
```

---

## 4. Zod 验证Schema

### 4.1 Zod Schema 定义

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 前端 Zod 验证 Schema
 */
import { z } from 'zod';

// 分类编码验证（大写字母开头，允许数字和下划线）
export const categoryCodeSchema = z
  .string()
  .min(1, '分类编码不能为空')
  .max(50, '分类编码长度不能超过50字符')
  .regex(/^[A-Z][A-Z0-9_]*$/, '编码必须以大写字母开头，只能包含大写字母、数字和下划线');

// 显示名称验证
export const displayNameSchema = z
  .string()
  .min(1, '显示名称不能为空')
  .max(50, '显示名称长度不能超过50字符');

// 排序序号验证
export const sortOrderSchema = z
  .number()
  .int('排序序号必须为整数')
  .min(0, '排序序号不能为负数')
  .max(9999, '排序序号不能超过9999')
  .optional();

// 图标 URL 验证
export const iconUrlSchema = z
  .string()
  .url('请输入有效的 URL 地址')
  .max(500, 'URL 长度不能超过500字符')
  .optional()
  .or(z.literal(''));

// 描述验证
export const descriptionSchema = z
  .string()
  .max(500, '描述长度不能超过500字符')
  .optional()
  .or(z.literal(''));

// 创建分类 Schema
export const createMenuCategorySchema = z.object({
  code: categoryCodeSchema,
  displayName: displayNameSchema,
  sortOrder: sortOrderSchema,
  isVisible: z.boolean().optional(),
  iconUrl: iconUrlSchema,
  description: descriptionSchema,
});

// 更新分类 Schema
export const updateMenuCategorySchema = z.object({
  version: z.number().int('版本号必须为整数').min(0, '版本号不能为负数'),
  displayName: displayNameSchema.optional(),
  sortOrder: sortOrderSchema,
  isVisible: z.boolean().optional(),
  iconUrl: iconUrlSchema,
  description: descriptionSchema,
});

// 批量排序 Schema
export const batchUpdateSortOrderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid('分类ID格式错误'),
      sortOrder: z.number().int('排序序号必须为整数').min(0, '排序序号不能为负数'),
    })
  ).min(1, '至少需要一个排序项'),
});
```

---

## 5. 错误码规范

### 5.1 错误码格式

**格式**: `CAT_<类别>_<序号>`
- `CAT`: 菜单分类模块前缀
- `<类别>`: 3 个大写字母（VAL=验证, NTF=未找到, DUP=重复, BIZ=业务规则, SYS=系统错误）
- `<序号>`: 3 位数字（001-999）

### 5.2 错误码清单

| 错误码 | HTTP 状态码 | 消息 | 说明 |
|--------|------------|------|------|
| `CAT_NTF_001` | 404 | 分类不存在 | 请求的分类 ID 在数据库中未找到 |
| `CAT_DUP_001` | 409 | 分类编码已存在 | 创建分类时 code 字段重复 |
| `CAT_VAL_001` | 400 | 分类编码格式错误 | code 必须以大写字母开头，只能包含大写字母、数字和下划线 |
| `CAT_VAL_002` | 400 | 显示名称不能为空 | displayName 字段为空或仅包含空格 |
| `CAT_VAL_003` | 400 | 创建分类失败 | 通用创建验证错误 |
| `CAT_VAL_004` | 400 | 批量排序失败 | 批量排序请求格式或数据错误 |
| `CAT_BIZ_001` | 422 | 默认分类不能删除 | isDefault=true 的分类不允许删除操作 |
| `CAT_BIZ_002` | 422 | 默认分类不能隐藏 | isDefault=true 的分类不允许设置 isVisible=false |
| `CAT_CONFLICT_001` | 409 | 数据已被其他用户修改，请刷新后重试 | 乐观锁冲突，version 字段不匹配 |
| `CAT_SYS_001` | 500 | 系统未配置默认分类 | 系统缺少 isDefault=true 的分类记录 |

---

## 6. 数据字典

### 6.1 分类编码约定

| 编码 | 显示名称 | 说明 | 排序序号 | 是否默认 |
|------|---------|------|---------|---------|
| `OTHER` | 其他商品 | 默认分类，用于未分类商品 | 999 | ✅ 是 |
| `ALCOHOL` | 经典特调 | 鸡尾酒、威士忌、啤酒等 | 10 | ❌ 否 |
| `BEVERAGE` | 经典饮品 | 软饮、果汁、茶饮等 | 20 | ❌ 否 |
| `COFFEE` | 精品咖啡 | 拿铁、美式、卡布奇诺等 | 30 | ❌ 否 |
| `SNACK` | 主厨小食 | 爆米花、薯条、坚果等 | 40 | ❌ 否 |

**自定义分类示例**:
- `SEASONAL` - 季节限定
- `COMBO` - 组合套餐
- `HEALTHY` - 健康轻食
- `DESSERT` - 甜品系列

---

### 6.2 操作类型字典（审计日志）

| 操作类型 | 说明 | 记录内容 |
|---------|------|---------|
| `DELETE` | 删除分类 | 删除的分类、影响商品数、目标迁移分类 |
| `BATCH_SORT` | 批量排序 | 排序前后的分类顺序（JSON 数组） |

**operation_data 示例**:

**DELETE 操作**:
```json
{
  "deletedCategory": {
    "id": "uuid-001",
    "code": "SEASONAL",
    "displayName": "季节限定"
  },
  "affectedProducts": 15,
  "targetCategory": {
    "id": "uuid-other",
    "code": "OTHER",
    "displayName": "其他商品"
  }
}
```

**BATCH_SORT 操作**:
```json
{
  "before": [
    {"id": "uuid-001", "sortOrder": 10},
    {"id": "uuid-002", "sortOrder": 20}
  ],
  "after": [
    {"id": "uuid-002", "sortOrder": 10},
    {"id": "uuid-001", "sortOrder": 20}
  ]
}
```

---

## 附录

### A. 数据库迁移脚本列表

| 迁移脚本 | 说明 | 执行顺序 |
|---------|------|---------|
| `V2__Create_menu_category_table.sql` | 创建 menu_category 表 | 1 |
| `V3__Insert_default_menu_categories.sql` | 插入初始分类数据 | 2 |
| `V4__Migrate_channel_category_to_category_id.sql` | 迁移 channel_product_config.category_id | 3 |
| `V5__Create_category_audit_log_table.sql` | 创建审计日志表 | 4 |

---

### B. 参考文档

- **OpenAPI 规范**: `specs/O002-miniapp-menu-config/contracts/api.yaml`
- **实施计划**: `specs/O002-miniapp-menu-config/plan.md`
- **任务分解**: `specs/O002-miniapp-menu-config/tasks.md`
- **快速入门**: `specs/O002-miniapp-menu-config/quickstart.md`

---

**版本**: 1.0.0
**最后更新**: 2026-01-04
**维护者**: Cinema Business Center Platform Team
