# Quickstart: B端商品配置 - 动态菜单分类集成

**@spec O008-channel-product-category-migration**

**Date**: 2026-01-04

## 概述

本功能将 B端商品配置页面从硬编码的 `ChannelCategory` 枚举改为使用动态的 `MenuCategory` 数据。

## 快速开始

### 1. 启动开发环境

```bash
# 启动前端开发服务器
cd frontend
npm run dev
```

### 2. 访问商品配置页面

- 商品列表：http://localhost:3000/channel-products
- 创建商品：http://localhost:3000/channel-products/create
- 编辑商品：http://localhost:3000/channel-products/:id/edit

## 核心变更

### 类型变更

**Before**:
```typescript
import { ChannelCategory } from '../types';

const product: ChannelProductConfig = {
  channelCategory: ChannelCategory.COFFEE,  // 枚举
  // ...
};
```

**After**:
```typescript
const product: ChannelProductConfig = {
  categoryId: 'uuid-002',  // UUID，关联 menu_category.id
  category: {              // 可选，查询时返回
    id: 'uuid-002',
    code: 'COFFEE',
    displayName: '精品咖啡',
    // ...
  },
  // ...
};
```

### 组件使用

**CategorySelect 组件**:

```tsx
import { CategorySelect } from '../components/CategorySelect';

// 创建商品时
<Form.Item name="categoryId" label="商品分类" required>
  <CategorySelect mode="create" />
</Form.Item>

// 编辑商品时
<Form.Item name="categoryId" label="商品分类" required>
  <CategorySelect
    mode="edit"
    currentCategory={product.category}
  />
</Form.Item>
```

### Hook 使用

```tsx
import { useMenuCategories } from '@/features/menu-category/hooks/useMenuCategories';

// 获取可见分类（创建时使用）
const { data: categories, isLoading } = useMenuCategories({
  includeHidden: false,
});

// 获取所有分类（编辑时使用）
const { data: allCategories } = useMenuCategories({
  includeHidden: true,
});
```

## 文件修改清单

### 需要修改的文件

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `types/index.ts` | 修改 | 删除 ChannelCategory 枚举，新增 categoryId 字段 |
| `components/ChannelProductBasicForm.tsx` | 修改 | 使用 CategorySelect 组件 |
| `components/ChannelProductFilter.tsx` | 修改 | 使用动态分类列表筛选 |
| `components/ChannelProductTable.tsx` | 修改 | 显示分类名称（通过 category 关联） |
| `schemas/channelProductSchema.ts` | 修改 | 使用 UUID 验证 categoryId |
| `services/channelProductService.ts` | 修改 | 使用 categoryId 字段 |
| `stores/useChannelProductStore.ts` | 修改 | 更新类型定义 |

### 需要新增的文件

| 文件 | 说明 |
|------|------|
| `components/CategorySelect.tsx` | 封装分类选择组件 |
| `hooks/useChannelProductCategories.ts` | （可选）商品分类选择专用 Hook |

## 验证步骤

### 功能验证

1. **创建商品**
   - [ ] 分类下拉框显示动态分类列表
   - [ ] 仅显示可见分类
   - [ ] 支持搜索/过滤
   - [ ] 提交成功后 categoryId 正确保存

2. **编辑商品**
   - [ ] 分类下拉框正确回填当前分类
   - [ ] 如果当前分类已隐藏，显示 "(已隐藏)" 标记
   - [ ] 更新分类后保存成功

3. **商品列表**
   - [ ] 正确显示分类名称
   - [ ] 分类筛选功能正常

### 单元测试

```bash
# 运行测试
cd frontend
npm run test:unit

# 运行特定测试
npm run test:unit -- CategorySelect
```

## 常见问题

### Q1: 分类下拉框为空

**原因**: O002 菜单分类 API 未启动或 Mock 数据未配置

**解决**:
1. 检查 MSW handlers 是否包含 `/api/admin/menu-categories` mock
2. 确保 Mock 数据中有 `isVisible: true` 的分类

### Q2: 编辑时分类显示 "未知分类"

**原因**: 商品关联的分类已被删除

**解决**:
1. 检查 `product.categoryId` 是否有效
2. 后端应在删除分类时自动迁移商品到默认分类

### Q3: TypeScript 类型报错

**原因**: 类型定义未更新

**解决**:
```bash
# 重启 TypeScript 服务
# VSCode: Cmd+Shift+P -> TypeScript: Restart TS Server
```

## 相关文档

- [spec.md](./spec.md) - 功能规格
- [data-model.md](./data-model.md) - 数据模型
- [contracts/api.yaml](./contracts/api.yaml) - API 契约
- O002 菜单分类文档: `specs/O002-miniapp-menu-config/`
