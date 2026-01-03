# Data Model: 小程序菜单配置（商品分类动态整合）

**Feature**: O002-miniapp-menu-config | **Branch**: `O002-miniapp-menu-config` | **Date**: 2026-01-03

## 概述

本文档定义小程序菜单配置功能的数据模型，**整合 `ChannelCategory` 枚举和 `MenuCategory` 表**，实现完全动态的商品分类管理。

### 设计目标

1. **统一分类来源**: 将硬编码的 `ChannelCategory` 枚举迁移到数据库表
2. **动态可配置**: 管理员可增删改排序分类，无需代码变更
3. **向后兼容**: 现有商品数据无缝迁移，API 保持兼容
4. **前后端一致**: 小程序从 API 获取分类列表，不再使用前端硬编码映射

---

## 核心实体关系

```
┌─────────────────────────────────────────────────────────────────────┐
│                         实体关系图                                    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────────────────┐
│   menu_category      │         │   channel_product_config         │
│   (菜单分类表)        │ 1    N  │   (渠道商品配置表)                 │
├──────────────────────┤ ◄────── ├──────────────────────────────────┤
│ id (PK)              │         │ id (PK)                          │
│ code (UNIQUE)        │         │ category_id (FK) ←───────────────┤
│ display_name         │         │ sku_id                           │
│ sort_order           │         │ display_name                     │
│ is_visible           │         │ channel_price                    │
│ is_default           │         │ status                           │
│ icon_url             │         │ ...                              │
│ description          │         └──────────────────────────────────┘
│ created_at           │
│ updated_at           │
│ created_by           │
│ updated_by           │
└──────────────────────┘

关系说明:
- menu_category 1:N channel_product_config (一个分类可有多个商品)
- 删除分类时，关联商品自动迁移到默认分类(is_default=true)
```

---

## 实体定义

### 1. MenuCategory（菜单分类）

**Purpose**: 代表小程序菜单中的商品分类，替代原 `ChannelCategory` 枚举

**数据库表定义**:

```sql
-- @spec O002-miniapp-menu-config
-- 菜单分类表
CREATE TABLE menu_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 分类编码（唯一，用于 API 查询和向后兼容）
    code VARCHAR(50) NOT NULL UNIQUE,

    -- 显示名称（中文）
    display_name VARCHAR(50) NOT NULL,

    -- 排序序号（数字越小越靠前）
    sort_order INTEGER NOT NULL DEFAULT 0,

    -- 是否可见（false 则小程序不显示）
    is_visible BOOLEAN NOT NULL DEFAULT true,

    -- 是否为默认分类（"其他"分类，不可删除）
    is_default BOOLEAN NOT NULL DEFAULT false,

    -- 图标 URL（可选）
    icon_url TEXT,

    -- 分类描述（可选）
    description TEXT,

    -- 审计字段
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID,  -- 关联 admin_user.id
    updated_by UUID,  -- 关联 admin_user.id

    -- 软删除
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- 约束
    CONSTRAINT chk_display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 50),
    CONSTRAINT chk_code_format CHECK (code ~ '^[A-Z][A-Z0-9_]*$')
);

-- 索引
CREATE INDEX idx_menu_category_sort_order ON menu_category(sort_order);
CREATE INDEX idx_menu_category_is_visible ON menu_category(is_visible) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_category_code ON menu_category(code) WHERE deleted_at IS NULL;

-- 确保只有一个默认分类
CREATE UNIQUE INDEX idx_menu_category_default ON menu_category(is_default)
WHERE is_default = true AND deleted_at IS NULL;

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_menu_category_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_menu_category_updated_at
    BEFORE UPDATE ON menu_category
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_category_timestamp();
```

**Java 实体类**:

```java
/**
 * @spec O002-miniapp-menu-config
 * 菜单分类实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "menu_category",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_menu_category_code", columnNames = {"code"})
    },
    indexes = {
        @Index(name = "idx_menu_category_sort_order", columnList = "sort_order"),
        @Index(name = "idx_menu_category_is_visible", columnList = "is_visible")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Where(clause = "deleted_at IS NULL")
public class MenuCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * 分类编码（唯一标识，如 "ALCOHOL", "COFFEE"）
     * 用于 API 查询和向后兼容
     */
    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code;

    /**
     * 显示名称（中文，如 "经典特调", "精品咖啡"）
     */
    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    /**
     * 排序序号（数字越小越靠前）
     */
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    /**
     * 是否可见（false 则小程序不显示）
     */
    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private Boolean isVisible = true;

    /**
     * 是否为默认分类（"其他"分类，不可删除）
     */
    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    /**
     * 图标 URL
     */
    @Column(name = "icon_url", columnDefinition = "TEXT")
    private String iconUrl;

    /**
     * 分类描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * 关联的商品数量（查询时计算）
     */
    @Transient
    private Integer productCount;

    /**
     * 是否已删除
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }

    /**
     * 软删除
     */
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
```

**TypeScript 类型定义**:

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 DTO
 */
export interface MenuCategoryDTO {
  /** 分类 ID */
  id: string;

  /** 分类编码（如 "ALCOHOL", "COFFEE"）*/
  code: string;

  /** 显示名称（如 "经典特调"）*/
  displayName: string;

  /** 排序序号 */
  sortOrder: number;

  /** 是否可见 */
  isVisible: boolean;

  /** 是否为默认分类 */
  isDefault: boolean;

  /** 图标 URL */
  iconUrl?: string;

  /** 分类描述 */
  description?: string;

  /** 关联商品数量 */
  productCount?: number;

  /** 创建时间 */
  createdAt?: string;

  /** 更新时间 */
  updatedAt?: string;
}

/**
 * @spec O002-miniapp-menu-config
 * 创建分类请求
 */
export interface CreateMenuCategoryRequest {
  code: string;           // 必填，唯一编码
  displayName: string;    // 必填，显示名称
  sortOrder?: number;     // 可选，默认 0
  isVisible?: boolean;    // 可选，默认 true
  iconUrl?: string;       // 可选
  description?: string;   // 可选
}

/**
 * @spec O002-miniapp-menu-config
 * 更新分类请求
 */
export interface UpdateMenuCategoryRequest {
  displayName?: string;
  sortOrder?: number;
  isVisible?: boolean;
  iconUrl?: string;
  description?: string;
}

/**
 * @spec O002-miniapp-menu-config
 * 批量更新排序请求
 */
export interface BatchUpdateSortOrderRequest {
  items: Array<{
    id: string;
    sortOrder: number;
  }>;
}
```

---

### 2. ChannelProductConfig（渠道商品配置）- 修改

**变更说明**: 将 `channel_category` 枚举字段改为 `category_id` 外键

**数据库表修改**:

```sql
-- @spec O002-miniapp-menu-config
-- Step 1: 添加新的外键字段
ALTER TABLE channel_product_config
ADD COLUMN category_id UUID;

-- Step 2: 创建外键约束
ALTER TABLE channel_product_config
ADD CONSTRAINT fk_channel_product_category
FOREIGN KEY (category_id) REFERENCES menu_category(id)
ON DELETE SET NULL;  -- 删除分类时设为 NULL，由业务逻辑处理迁移

-- Step 3: 创建索引
CREATE INDEX idx_channel_product_category_id ON channel_product_config(category_id);

-- Step 4: 数据迁移后，删除旧的枚举字段（见迁移脚本）
-- ALTER TABLE channel_product_config DROP COLUMN channel_category;
```

**Java 实体类修改**:

```java
/**
 * @spec O002-miniapp-menu-config
 * 渠道商品配置实体（修改版）
 */
@Entity
@Table(name = "channel_product_config")
public class ChannelProductConfig {

    // ... 其他字段保持不变 ...

    /**
     * 商品分类（外键关联 menu_category）
     * 替代原 channel_category 枚举
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private MenuCategory category;

    /**
     * 分类 ID（用于 DTO 映射）
     */
    @Column(name = "category_id", insertable = false, updatable = false)
    private UUID categoryId;

    // 移除旧的枚举字段
    // @Enumerated(EnumType.STRING)
    // @Column(name = "channel_category", nullable = false, length = 50)
    // private ChannelCategory channelCategory;
}
```

**DTO 修改**:

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 渠道商品 DTO（修改版）
 */
export interface ChannelProductDTO {
  id: string;
  productId: string;
  productName: string;
  mainImageUrl: string | null;

  /** 分类 ID（替代原 category 枚举）*/
  categoryId: string;

  /** 分类信息（嵌套返回）*/
  category: {
    id: string;
    code: string;
    displayName: string;
  };

  salesChannel: 'H5_MENU' | 'MINI_PROGRAM_MENU';
  status: 'ACTIVE' | 'INACTIVE';
  priceInCents: number;
  sortOrder: number;
  tags?: string[];
  stockStatus?: 'AVAILABLE' | 'OUT_OF_STOCK';
}
```

---

### 3. CategoryAuditLog（分类操作审计日志）

**Purpose**: 记录分类配置的所有变更操作

**数据库表定义**:

```sql
-- @spec O002-miniapp-menu-config
-- 分类操作审计日志表
CREATE TABLE category_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 操作的分类 ID
    category_id UUID NOT NULL,

    -- 操作类型
    action VARCHAR(20) NOT NULL,  -- CREATE, UPDATE, DELETE, REORDER

    -- 操作前数据快照（JSON）
    before_data JSONB,

    -- 操作后数据快照（JSON）
    after_data JSONB,

    -- 变更详情描述
    change_description TEXT,

    -- 受影响的商品数量（删除分类时）
    affected_product_count INTEGER DEFAULT 0,

    -- 操作人
    operator_id UUID,
    operator_name VARCHAR(100),

    -- 操作时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- IP 地址
    ip_address VARCHAR(45)
);

-- 索引
CREATE INDEX idx_category_audit_log_category_id ON category_audit_log(category_id);
CREATE INDEX idx_category_audit_log_action ON category_audit_log(action);
CREATE INDEX idx_category_audit_log_created_at ON category_audit_log(created_at);
```

---

## 数据迁移方案

### 迁移脚本

```sql
-- @spec O002-miniapp-menu-config
-- 数据迁移脚本：从 ChannelCategory 枚举迁移到 menu_category 表

-- ============================================
-- Step 1: 插入初始分类数据（基于 O007 的 4 个核心分类 + 扩展）
-- ============================================

INSERT INTO menu_category (id, code, display_name, sort_order, is_visible, is_default, created_at, updated_at) VALUES
-- O007 核心分类
(gen_random_uuid(), 'ALCOHOL',  '经典特调', 1, true, false, NOW(), NOW()),
(gen_random_uuid(), 'COFFEE',   '精品咖啡', 2, true, false, NOW(), NOW()),
(gen_random_uuid(), 'BEVERAGE', '经典饮品', 3, true, false, NOW(), NOW()),
(gen_random_uuid(), 'SNACK',    '主厨小食', 4, true, false, NOW(), NOW()),
-- 扩展分类
(gen_random_uuid(), 'MEAL',     '精品餐食', 5, true, false, NOW(), NOW()),
(gen_random_uuid(), 'OTHER',    '其他商品', 99, true, true, NOW(), NOW());  -- is_default = true

-- ============================================
-- Step 2: 更新 channel_product_config 的 category_id
-- ============================================

-- 为每个商品设置对应的 category_id
UPDATE channel_product_config cp
SET category_id = mc.id
FROM menu_category mc
WHERE cp.channel_category::text = mc.code
  AND cp.category_id IS NULL;

-- 验证迁移结果
SELECT
    cp.channel_category AS old_category,
    mc.code AS new_category_code,
    mc.display_name AS new_category_name,
    COUNT(*) AS product_count
FROM channel_product_config cp
LEFT JOIN menu_category mc ON cp.category_id = mc.id
GROUP BY cp.channel_category, mc.code, mc.display_name
ORDER BY mc.sort_order;

-- ============================================
-- Step 3: 处理未匹配的商品（迁移到默认分类）
-- ============================================

UPDATE channel_product_config
SET category_id = (SELECT id FROM menu_category WHERE is_default = true LIMIT 1)
WHERE category_id IS NULL;

-- ============================================
-- Step 4: 设置 category_id 为 NOT NULL（迁移完成后）
-- ============================================

-- 验证所有商品都有分类
SELECT COUNT(*) FROM channel_product_config WHERE category_id IS NULL;
-- 应该返回 0

-- 设置非空约束
ALTER TABLE channel_product_config
ALTER COLUMN category_id SET NOT NULL;

-- ============================================
-- Step 5: 删除旧的枚举字段（可选，建议保留一段时间）
-- ============================================

-- 保留旧字段作为备份，可在确认无问题后删除
-- ALTER TABLE channel_product_config DROP COLUMN channel_category;
```

### 回滚脚本

```sql
-- @spec O002-miniapp-menu-config
-- 回滚脚本（如需回退到枚举方案）

-- Step 1: 恢复 channel_category 枚举字段
ALTER TABLE channel_product_config
ADD COLUMN channel_category VARCHAR(50);

-- Step 2: 从 menu_category 恢复数据
UPDATE channel_product_config cp
SET channel_category = mc.code
FROM menu_category mc
WHERE cp.category_id = mc.id;

-- Step 3: 移除外键约束和字段
ALTER TABLE channel_product_config DROP CONSTRAINT fk_channel_product_category;
ALTER TABLE channel_product_config DROP COLUMN category_id;

-- Step 4: 删除 menu_category 表
DROP TABLE IF EXISTS category_audit_log;
DROP TABLE IF EXISTS menu_category;
```

---

## API 设计

### B端管理 API

```yaml
# @spec O002-miniapp-menu-config
# 菜单分类管理 API

# 获取分类列表（管理后台）
GET /api/admin/menu-categories
Query Parameters:
  - includeHidden: boolean (是否包含隐藏分类，默认 true)
  - includeProductCount: boolean (是否包含商品数量，默认 true)
Response:
  success: true
  data: MenuCategoryDTO[]

# 获取单个分类
GET /api/admin/menu-categories/{id}
Response:
  success: true
  data: MenuCategoryDTO

# 创建分类
POST /api/admin/menu-categories
Request Body: CreateMenuCategoryRequest
Response:
  success: true
  data: MenuCategoryDTO

# 更新分类
PUT /api/admin/menu-categories/{id}
Request Body: UpdateMenuCategoryRequest
Response:
  success: true
  data: MenuCategoryDTO

# 删除分类
DELETE /api/admin/menu-categories/{id}
Query Parameters:
  - confirm: boolean (确认删除，必须为 true)
Response:
  success: true
  data:
    deletedCategoryId: string
    affectedProductCount: number
    targetCategoryId: string (商品迁移目标分类)

# 批量更新排序
PUT /api/admin/menu-categories/batch-sort
Request Body: BatchUpdateSortOrderRequest
Response:
  success: true
  data: MenuCategoryDTO[]

# 切换可见性
PATCH /api/admin/menu-categories/{id}/visibility
Request Body:
  isVisible: boolean
Response:
  success: true
  data: MenuCategoryDTO
```

### C端小程序 API

```yaml
# @spec O002-miniapp-menu-config
# 小程序菜单分类 API

# 获取可见分类列表（小程序用）
GET /api/client/menu-categories
Response:
  success: true
  data:
    - id: "uuid-1"
      code: "ALCOHOL"
      displayName: "经典特调"
      iconUrl: "https://..."
      productCount: 15
    - id: "uuid-2"
      code: "COFFEE"
      displayName: "精品咖啡"
      iconUrl: "https://..."
      productCount: 20
    # ... 按 sort_order 排序

# 获取指定分类的商品列表
GET /api/client/channel-products/mini-program
Query Parameters:
  - categoryId: string (分类 ID，可选)
  - categoryCode: string (分类编码，可选，向后兼容)
Response:
  success: true
  data: ChannelProductDTO[]
  total: number
```

---

## 状态管理（前端）

### Zustand Store

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 Store（小程序端）
 */
import { create } from 'zustand';

interface MenuCategoryState {
  // State
  categories: MenuCategoryDTO[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: MenuCategoryDTO[]) => void;
  selectCategory: (categoryId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMenuCategoryStore = create<MenuCategoryState>((set) => ({
  categories: [],
  selectedCategoryId: null,
  isLoading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  selectCategory: (categoryId) => set({ selectedCategoryId: categoryId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({
    categories: [],
    selectedCategoryId: null,
    isLoading: false,
    error: null
  })
}));
```

### TanStack Query

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 菜单分类 Query Keys
 */
export const menuCategoryQueryKeys = {
  all: ['menu-categories'] as const,
  list: () => [...menuCategoryQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...menuCategoryQueryKeys.all, 'detail', id] as const,
  products: (categoryId: string | null) =>
    ['channel-products', 'category', categoryId] as const,
};

/**
 * @spec O002-miniapp-menu-config
 * 获取分类列表 Hook
 */
export const useMenuCategories = () => {
  return useQuery({
    queryKey: menuCategoryQueryKeys.list(),
    queryFn: () => fetchMenuCategories(),
    staleTime: 5 * 60 * 1000,  // 5 分钟缓存
    refetchInterval: 60 * 1000, // 1 分钟轮询
  });
};

/**
 * @spec O002-miniapp-menu-config
 * 获取分类商品列表 Hook
 */
export const useProductsByCategory = (categoryId: string | null) => {
  return useQuery({
    queryKey: menuCategoryQueryKeys.products(categoryId),
    queryFn: () => fetchProductsByCategory(categoryId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};
```

---

## 业务规则

### 删除分类逻辑

```java
/**
 * @spec O002-miniapp-menu-config
 * 删除分类业务逻辑
 */
@Service
public class MenuCategoryService {

    @Transactional
    public DeleteCategoryResult deleteCategory(UUID categoryId, UUID operatorId) {
        MenuCategory category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new NotFoundException("CATEGORY_NOT_FOUND"));

        // 检查是否为默认分类
        if (category.getIsDefault()) {
            throw new BusinessException("CANNOT_DELETE_DEFAULT_CATEGORY",
                "默认分类不可删除");
        }

        // 获取默认分类
        MenuCategory defaultCategory = categoryRepository.findByIsDefaultTrue()
            .orElseThrow(() -> new SystemException("DEFAULT_CATEGORY_NOT_FOUND"));

        // 统计受影响的商品数量
        int affectedCount = productRepository.countByCategoryId(categoryId);

        // 迁移商品到默认分类
        if (affectedCount > 0) {
            productRepository.updateCategoryId(categoryId, defaultCategory.getId());
        }

        // 软删除分类
        category.softDelete();
        categoryRepository.save(category);

        // 记录审计日志
        auditLogService.logCategoryDeletion(category, affectedCount, operatorId);

        return new DeleteCategoryResult(categoryId, affectedCount, defaultCategory.getId());
    }
}
```

### 排序规则

1. **排序值越小越靠前**: `sort_order` 升序排列
2. **新增分类默认排最后**: 自动分配 `MAX(sort_order) + 1`
3. **拖拽排序**: 批量更新所有分类的 `sort_order`
4. **默认分类排最后**: `is_default=true` 的分类 `sort_order` 建议设为 99

### 可见性规则

1. **隐藏分类**: 小程序不显示该分类标签，但已关联的商品仍可通过搜索访问
2. **默认分类不可隐藏**: `is_default=true` 的分类 `is_visible` 必须为 `true`
3. **隐藏后商品处理**: 商品仍属于该分类，但不在菜单中按分类浏览

---

## 向后兼容策略

### API 兼容

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 支持旧的 category 枚举参数
 */
// 旧 API（保持兼容）
GET /api/client/channel-products/mini-program?category=COFFEE

// 新 API（推荐使用）
GET /api/client/channel-products/mini-program?categoryId=uuid-xxx
GET /api/client/channel-products/mini-program?categoryCode=COFFEE
```

### 前端兼容

```typescript
/**
 * @spec O002-miniapp-menu-config
 * 分类映射辅助函数（向后兼容）
 */

// 旧的硬编码映射（废弃，仅用于过渡期）
const LEGACY_CATEGORY_MAP = {
  'ALCOHOL': '经典特调',
  'COFFEE': '精品咖啡',
  'BEVERAGE': '经典饮品',
  'SNACK': '主厨小食',
  'MEAL': '精品餐食',
  'OTHER': '其他商品',
};

// 新的动态获取（推荐）
const getCategoryDisplayName = (
  categories: MenuCategoryDTO[],
  categoryId: string
): string => {
  const category = categories.find(c => c.id === categoryId);
  return category?.displayName || '未知分类';
};

// 通过 code 查找（兼容旧逻辑）
const getCategoryByCode = (
  categories: MenuCategoryDTO[],
  code: string
): MenuCategoryDTO | undefined => {
  return categories.find(c => c.code === code);
};
```

---

## 验证规则

| 字段 | 规则 | 错误码 |
|------|------|--------|
| `code` | 非空，1-50字符，大写字母开头，只含大写字母/数字/下划线 | `INVALID_CATEGORY_CODE` |
| `displayName` | 非空，1-50字符 | `INVALID_DISPLAY_NAME` |
| `sortOrder` | 整数，≥ 0 | `INVALID_SORT_ORDER` |
| `iconUrl` | 可选，有效 URL，长度 ≤ 500 | `INVALID_ICON_URL` |
| `description` | 可选，长度 ≤ 500 | `INVALID_DESCRIPTION` |
| 唯一性 | `code` 必须唯一 | `DUPLICATE_CATEGORY_CODE` |
| 默认分类 | 不可删除，不可隐藏 | `CANNOT_MODIFY_DEFAULT_CATEGORY` |

---

## 版本历史

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| 1.0.0 | 2026-01-03 | 初始版本，整合 ChannelCategory 枚举和 MenuCategory 表 |

---

**相关文档**:
- [Feature Specification](./spec.md)
- [O007 数据模型](../O007-miniapp-menu-api/data-model.md)
- [API 契约](./contracts/api.yaml)
