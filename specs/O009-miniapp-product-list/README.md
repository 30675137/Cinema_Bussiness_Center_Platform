# O009 - 小程序商品列表功能

**@spec O009-miniapp-product-list**

## 功能概述

Taro 小程序商品列表功能，支持商品展示、分类筛选、无限滚动分页、错误处理和详情跳转。

## 技术栈

- **框架**: Taro 4.1.9 + React 18.3.1 + TypeScript 5.4.0
- **状态管理**: Zustand 4.5.5 (客户端状态) + TanStack Query 5.90.12 (服务器状态)
- **样式**: SCSS Modules
- **测试**: Vitest 4.0.15 + Testing Library

## 目录结构

```
hall-reserve-taro/src/
├── components/
│   ├── ProductCard/              # 商品卡片组件
│   │   ├── __tests__/
│   │   │   ├── ProductCard.test.tsx
│   │   │   └── ProductCard-interaction.test.tsx
│   │   ├── index.tsx
│   │   └── index.module.scss
│   ├── ProductList/              # 商品列表组件
│   │   ├── __tests__/
│   │   │   └── ProductList.test.tsx
│   │   ├── index.tsx
│   │   └── index.module.scss
│   └── CategoryTabs/             # 分类标签组件
│       ├── __tests__/
│       │   └── CategoryTabs.test.tsx
│       ├── index.tsx
│       └── index.module.scss
├── hooks/
│   └── useProducts.ts            # 商品数据 Hook (useInfiniteQuery)
├── pages/
│   ├── product-list/             # 商品列表页面
│   │   ├── index.tsx
│   │   ├── index.config.ts
│   │   └── index.module.scss
│   └── product-detail/           # 商品详情页面（占位）
│       ├── index.tsx
│       ├── index.config.ts
│       └── index.module.scss
├── services/
│   └── productService.ts         # 商品 API 服务
├── stores/
│   └── productMenuStore.ts       # 商品菜单状态管理
└── types/
    └── product.ts                # 商品类型定义
```

## 核心功能

### 1. 商品列表展示

- 双列网格布局，支持商品图片、名称、价格显示
- 推荐商品置顶排序（isRecommended + sortOrder）
- 推荐标签徽章显示

### 2. 分类筛选

- 水平滚动分类标签（包含"全部"选项）
- 点击分类筛选商品列表
- 状态持久化（Zustand + productMenuStore）

### 3. 无限滚动分页

- 基于 TanStack Query useInfiniteQuery
- 点击"加载更多"按钮触发
- 显示加载状态和"已加载全部商品"提示

### 4. 错误处理

- 友好的错误提示（网络错误、超时、服务器错误、404等）
- 重试按钮支持重新加载

### 5. 商品详情跳转

- 点击商品卡片跳转到详情页
- 传递商品ID参数（/pages/product-detail/index?id={productId}）
- 点击反馈效果（缩放 + 背景色变化）

## 使用方法

### 1. 安装依赖

```bash
cd hall-reserve-taro
npm install
```

### 2. 开发模式

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:weapp
```

### 3. 构建生产版本

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:weapp
```

### 4. 运行测试

```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:coverage
```

## 组件 API

### ProductCard

商品卡片组件，展示单个商品信息。

**Props:**

```typescript
interface ProductCardProps {
  id: string              // 商品ID
  name: string            // 商品名称
  price: string           // 格式化价格（如"¥ 38.00"）
  imageUrl: string        // 商品图片URL
  isRecommended?: boolean // 是否推荐商品
  badge?: string          // 推荐标签文本
  onClick?: () => void    // 点击回调
}
```

**示例:**

```tsx
import ProductCard from '@/components/ProductCard'

<ProductCard
  id="prod-001"
  name="经典爆米花套餐"
  price="¥ 38.00"
  imageUrl="https://example.com/popcorn.jpg"
  isRecommended={true}
  badge="推荐"
  onClick={() => console.log('Clicked')}
/>
```

### ProductList

商品列表组件，支持无限滚动分页。

**Props:**

```typescript
interface ProductListProps {
  categoryId?: string | null  // 分类ID筛选（null=全部商品）
  onProductClick?: (productId: string) => void  // 商品点击回调
  onLoadMore?: () => void     // 加载更多回调
}
```

**示例:**

```tsx
import ProductList from '@/components/ProductList'

<ProductList
  categoryId="cat-001"
  onProductClick={(id) => Taro.navigateTo({ url: `/pages/product-detail/index?id=${id}` })}
  onLoadMore={() => console.log('Loading more')}
/>
```

### CategoryTabs

分类标签组件，水平滚动。

**Props:**

```typescript
interface CategoryTabsProps {
  categories: Array<{ id: string; name: string }>  // 分类列表
  selectedId: string | null                        // 当前选中ID
  onSelect: (id: string | null) => void           // 选择回调
}
```

**示例:**

```tsx
import CategoryTabs from '@/components/CategoryTabs'

<CategoryTabs
  categories={[
    { id: '1', name: '爆米花' },
    { id: '2', name: '饮料' },
  ]}
  selectedId="1"
  onSelect={(id) => console.log('Selected:', id)}
/>
```

## 数据流

### 商品数据查询

```typescript
// hooks/useProducts.ts
import { useInfiniteQuery } from '@tanstack/react-query'

export const useInfiniteProducts = ({ categoryId }: { categoryId?: string | null }) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', categoryId],
    queryFn: ({ pageParam = 1 }) => fetchProducts({ categoryId, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 2 * 60 * 1000, // 2分钟缓存
  })
}
```

### 分类状态管理

```typescript
// stores/productMenuStore.ts
import { create } from 'zustand'

export const useProductMenuStore = create<ProductMenuState>((set) => ({
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}))
```

## 性能优化

### 1. 组件优化

- ProductCard 使用 React.memo 避免不必要重渲染
- 商品排序使用 useMemo 缓存
- 回调函数使用 useCallback 缓存

### 2. 图片优化

- 使用 `lazyLoad` 属性延迟加载
- `mode="aspectFill"` 保持纵横比

### 3. 数据缓存

- TanStack Query 自动缓存查询结果
- staleTime 设置为 2 分钟

## 测试覆盖率

```bash
npm run test:coverage
```

**目标覆盖率:** ≥ 80%

- ProductCard 组件: 17 测试用例
- ProductList 组件: 14 测试用例
- CategoryTabs 组件: 10 测试用例
- useProducts Hook: 12 测试用例

## 兼容性

### 微信小程序

- 基础库版本: ≥ 2.10.0
- 已测试机型: iPhone 13, Android 小米

### H5

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

## 常见问题

### Q: 为什么商品列表不刷新？

A: TanStack Query 有 2 分钟的 staleTime 缓存。如需强制刷新，使用下拉刷新或调用 `refetch()`。

### Q: 如何修改每页加载数量？

A: 修改 `services/productService.ts` 中的 `PAGE_SIZE` 常量。

### Q: 推荐商品排序规则是什么？

A: 推荐商品优先（isRecommended = true），相同推荐状态按 sortOrder 升序。

### Q: 如何添加新的分类？

A: 后端添加分类数据后，前端会自动通过 `useCategories()` Hook 获取并显示。

## 相关文档

- [技术规格文档](./spec.md)
- [实现计划](./plan.md)
- [任务分解](./tasks.md)
- [快速开始](./quickstart.md)
- [API 接口文档](./contracts/api.yaml)

## Git 提交历史

```bash
# Phase 3: 商品列表展示
bd6d5dc - feat(O009): Phase 4 - 分类筛选功能完成

# Phase 5: 分页加载
71dcea1 - feat(O009): Phase 5 - 分页加载功能完成

# Phase 6: 错误处理
f43926f - feat(O009): Phase 6 - 错误处理增强完成

# Phase 7: 详情跳转
530a632 - feat(O009): Phase 7 - 商品详情跳转完成
```

## 开发团队

- 前端开发: Claude Code
- 测试: 自动化测试 (Vitest + Testing Library)

## 许可证

MIT
