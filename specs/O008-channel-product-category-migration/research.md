# Research: B端商品配置 - 动态菜单分类集成

**@spec O008-channel-product-category-migration**

**Date**: 2026-01-04

## Research Questions

### Q1: 现有 ChannelCategory 枚举的使用范围

**研究目标**: 确定需要修改的文件和代码位置

**发现**:

| 文件 | 使用方式 | 修改内容 |
|------|---------|---------|
| `types/index.ts` | 枚举定义 + 类型引用 | 删除枚举，改用 `categoryId: string` |
| `components/ChannelProductBasicForm.tsx` | Select 选项渲染 | 改用 `useMenuCategories` 动态获取 |
| `components/ChannelProductFilter.tsx` | 筛选条件 | 改用动态分类列表 |
| `components/ChannelProductTable.tsx` | 分类名称显示 | 通过 `category_id` 关联查询显示名称 |
| `schemas/channelProductSchema.ts` | Zod 验证 | 改用 UUID 格式验证 |
| `services/channelProductService.ts` | API 请求/响应 | 使用 `categoryId` 字段 |
| `stores/useChannelProductStore.ts` | 状态管理 | 更新类型定义 |

**决定**: 上述 7 个文件需要修改
**理由**: 覆盖了 ChannelCategory 枚举的全部使用位置

---

### Q2: O002 MenuCategory API 和 Hook 的复用策略

**研究目标**: 确定如何复用 O002 已有的分类功能

**发现**:

O002 已提供的可复用资源：

```typescript
// 类型定义
import { MenuCategoryDTO } from '@/features/menu-category/types';

// 查询 Hook
import { useMenuCategories } from '@/features/menu-category/hooks/useMenuCategories';

// API 端点
// GET /api/admin/menu-categories - 获取分类列表
// 支持参数: includeHidden, includeProductCount
```

**Hook 特性**:
- `staleTime`: 5 分钟
- `refetchInterval`: 1 分钟
- 支持乐观更新

**决定**: 直接复用 `useMenuCategories` Hook，无需新建
**理由**:
- 保持一致的缓存策略
- 避免重复代码
- 分类数据变更时自动刷新

---

### Q3: 隐藏分类的处理逻辑

**研究目标**: 确定编辑商品时如何处理已隐藏的分类

**场景分析**:

| 场景 | 当前分类状态 | 操作 | 预期行为 |
|------|-------------|------|---------|
| 创建商品 | - | 选择分类 | 仅显示 `isVisible=true` 的分类 |
| 编辑商品 | 可见 | 打开表单 | 正常显示当前分类 |
| 编辑商品 | 已隐藏 | 打开表单 | 显示当前分类 + "(已隐藏)" 标记 |
| 编辑商品 | 已删除 | 打开表单 | 显示 "未知分类"，提示用户重新选择 |

**决定**:
1. 创建时：`useMenuCategories({ includeHidden: false })`
2. 编辑时：需要额外加载当前商品关联的分类（可能已隐藏）
3. 新增 `CategorySelect` 组件统一处理这两种场景

**理由**: 避免编辑商品时丢失已关联的隐藏分类

---

### Q4: 数据模型变更策略

**研究目标**: 确定 `ChannelProductConfig` 类型的变更方案

**当前结构**:
```typescript
export type ChannelProductConfig = {
  id: string;
  skuId: string;
  channelCategory: ChannelCategory;  // 删除
  // ... other fields
}
```

**目标结构**:
```typescript
export type ChannelProductConfig = {
  id: string;
  skuId: string;
  categoryId: string;  // UUID，关联 menu_category.id
  category?: MenuCategoryDTO;  // 可选，查询时 JOIN 返回
  // ... other fields
}
```

**决定**:
1. 删除 `channelCategory` 字段
2. 新增 `categoryId` 字段 (UUID)
3. 可选新增 `category` 字段（查询时返回关联的分类信息）

**理由**: 系统处于开发阶段，无需兼容旧数据

---

### Q5: CategorySelect 组件设计

**研究目标**: 设计可复用的分类选择组件

**Props 设计**:
```typescript
interface CategorySelectProps {
  /** 当前选中的分类 ID */
  value?: string;

  /** 选中变化回调 */
  onChange?: (categoryId: string) => void;

  /** 模式：创建（仅显示可见分类）或编辑（包含当前分类） */
  mode: 'create' | 'edit';

  /** 编辑模式下，当前商品关联的分类（可能已隐藏） */
  currentCategory?: MenuCategoryDTO;

  /** 是否禁用 */
  disabled?: boolean;

  /** 占位文本 */
  placeholder?: string;
}
```

**功能特性**:
1. 支持搜索/过滤
2. 按 `sortOrder` 排序
3. 隐藏分类显示 "(已隐藏)" 标记
4. 加载状态和错误处理
5. 刷新按钮

**决定**: 新增 `CategorySelect` 组件
**理由**: 统一创建和编辑页面的分类选择行为，提高代码复用性

---

## Technology Best Practices

### TanStack Query 缓存策略

```typescript
// 复用 O002 的查询 Key 结构
export const menuCategoryKeys = {
  all: ['menuCategories'] as const,
  lists: () => [...menuCategoryKeys.all, 'list'] as const,
  list: (params) => [...menuCategoryKeys.lists(), params] as const,
};

// 商品保存成功后刷新分类商品数量
queryClient.invalidateQueries({ queryKey: menuCategoryKeys.lists() });
```

### Zod 验证 Schema

```typescript
// categoryId 验证
const categoryIdSchema = z
  .string()
  .uuid('请选择有效的分类');

// 创建请求 schema
export const createChannelProductSchema = z.object({
  skuId: z.string().uuid(),
  categoryId: categoryIdSchema,
  // ... other fields
});
```

### Ant Design Select 配置

```typescript
<Select
  showSearch
  placeholder="请选择分类"
  optionFilterProp="label"
  filterOption={(input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  }
  options={categories.map(cat => ({
    value: cat.id,
    label: cat.isVisible ? cat.displayName : `${cat.displayName} (已隐藏)`,
  }))}
/>
```

---

## Alternatives Considered

### Alternative 1: 保留 channelCategory 枚举，新增 categoryId

**方案**: 同时保留两个字段，运行时判断使用哪个

**拒绝原因**:
- 增加代码复杂度
- 用户已确认系统处于开发阶段，无需兼容旧数据

### Alternative 2: 创建独立的分类 API 端点

**方案**: 为商品配置创建专用的分类 API `/api/admin/channel-product-categories`

**拒绝原因**:
- 重复功能，O002 已提供完整的分类 API
- 增加后端维护成本

### Alternative 3: 在 ChannelProductBasicForm 中直接使用 useMenuCategories

**方案**: 不封装 CategorySelect 组件，直接在表单中调用 Hook

**拒绝原因**:
- 创建和编辑页面需要不同的隐藏分类处理逻辑
- 封装组件提高复用性和可测试性

---

## Summary of Decisions

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 分类数据获取 | 复用 `useMenuCategories` | 避免重复代码，统一缓存策略 |
| 数据模型变更 | 删除旧字段，新增 `categoryId` | 开发阶段无需兼容 |
| 隐藏分类处理 | 编辑时显示 "(已隐藏)" | 避免丢失关联 |
| 组件设计 | 新增 `CategorySelect` | 统一选择行为，提高复用 |
| 验证 Schema | 使用 Zod UUID 验证 | 类型安全，友好错误提示 |

---

## Open Questions (Resolved)

1. ~~是否需要兼容旧数据？~~ → 不需要，直接删除旧字段
2. ~~后端 API 是否需要修改？~~ → 不需要，仅修改前端调用参数
3. ~~分类被删除后商品如何处理？~~ → 后端自动迁移到默认分类（O002 已实现）
