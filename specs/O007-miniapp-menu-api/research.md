# Research & Technical Decisions: 小程序菜单与商品API集成

**Feature**: O007-miniapp-menu-api
**Date**: 2026-01-03
**Researcher**: Implementation Planning Agent

## 研究目标

本研究旨在解决 miniapp-ordering-taro 前端与后端商品API集成的技术决策问题，包括：
1. 后端API现状调研与字段匹配度分析
2. 前端技术栈选型确认（Taro + React + TypeScript）
3. 状态管理方案设计（Zustand + TanStack Query）
4. 数据映射与转换策略
5. 错误处理与性能优化方案

---

## 决策1：后端API现状与可用性

### 研究问题
后端商品API是否已实现？是否满足前端需求？

### 调研结果

**API端点现状**（已100%实现）：

1. **商品列表API**
   - 端点：`GET /api/client/channel-products/mini-program`
   - Controller：`ChannelProductClientController.getMiniProgramProducts()`
   - 请求参数：`category?: ChannelCategory`（可选）
   - 响应格式：`ApiResponse<ChannelProductDTO[]>`
   - 特性：
     - ✅ 自动过滤 `status=ACTIVE` 和 `channelType=MINI_PROGRAM`
     - ✅ 三级排序：`isRecommended DESC, sortOrder ASC, createdAt DESC`
     - ✅ 支持按分类筛选（ALCOHOL/COFFEE/BEVERAGE/SNACK）
     - ❌ 不支持分页（返回所有匹配商品）

2. **DTO结构分析**
   ```typescript
   interface ChannelProductDTO {
     id: string                        // 商品ID (UUID)
     skuId: string                     // SKU ID
     channelCategory: ChannelCategory  // 分类枚举
     displayName: string               // 商品名称
     basePrice: number                 // 基础价格(分)
     mainImage: string                 // 主图URL (Supabase Storage)
     detailImages: string[]            // 详情图数组
     description: string               // 商品描述
     status: ChannelProductStatus      // ACTIVE/INACTIVE/OUT_OF_STOCK
     isRecommended: boolean            // 是否推荐
     sortOrder: number                 // 排序值
     stockStatus: string               // "IN_STOCK" (当前硬编码)
   }
   ```

3. **字段匹配度评估**

| 需求字段 | 后端字段 | 状态 | 处理方案 |
|---------|---------|------|---------|
| 商品ID | `id` | ✅ 完全匹配 | 直接使用 |
| 商品名称 | `displayName` | ✅ 完全匹配 | 直接使用 |
| 商品图片 | `mainImage` | ✅ 完全匹配 | 直接使用，需处理加载失败场景 |
| 商品标签 | `isRecommended` | ✅ 可用 | 转换为"推荐"角标显示 |
| 基础价格 | `basePrice` | ✅ 完全匹配 | 需转换：分→元（÷100） |
| 分类 | `channelCategory` | ✅ 完全匹配 | 需映射：枚举→中文名 |
| 上下架状态 | `status` | ✅ 完全匹配 | 后端已自动过滤ACTIVE |
| 可售渠道 | 固定MINI_PROGRAM | ✅ 完全匹配 | 后端已自动过滤 |
| 最小售卖单位 | ❌ 缺失 | ⚠️ 影响小 | 前端硬编码"份"或从SKU API获取 |

### 技术决策

**决策内容**：使用现有后端API，无需修改后端代码

**理由**：
1. 后端API已100%实现，字段匹配度高（8/9字段满足）
2. 缺失的"最小售卖单位"字段对核心功能影响小，可通过前端硬编码解决
3. 不支持分页的设计合理（商品总数有限，全量加载简化前端逻辑）
4. 三级排序逻辑符合产品需求（推荐优先→手动排序→最新）

**替代方案考虑**：
- 方案A：修改后端DTO，添加`minSalesUnit`字段 → 被拒绝（增加后端开发工作量，价值不高）
- 方案B：前端调用SKU API获取单位信息 → 被拒绝（增加网络请求，影响性能）
- 方案C：前端硬编码"份" → **采纳**（简单高效，满足当前需求）

---

## 决策2：分类名称映射策略

### 研究问题
如何映射后端枚举（ALCOHOL/COFFEE/BEVERAGE/SNACK）到设计稿中文名（经典特调/精品咖啡/经典饮品/主厨小食）？

### 调研结果

**后端分类枚举定义**：
```java
public enum ChannelCategory {
    ALCOHOL,    // 酒：鸡尾酒、威士忌、啤酒等
    COFFEE,     // 咖啡：拿铁、美式、卡布奇诺等
    BEVERAGE,   // 饮料：果汁、奶茶、汽水等
    SNACK,      // 小食：薯条、爆米花、坚果等
    MEAL,       // 餐品：汉堡、套餐、沙拉等
    OTHER       // 其他商品
}
```

**设计稿分类名称**：
- 全部
- 经典特调（ALCOHOL）
- 精品咖啡（COFFEE）
- 经典饮品（BEVERAGE）
- 主厨小食（SNACK）

### 技术决策

**决策内容**：在前端维护映射字典，使用Record类型确保类型安全

**实现方案**：
```typescript
// src/utils/categoryMapping.ts

export enum ChannelCategory {
  ALCOHOL = 'ALCOHOL',
  COFFEE = 'COFFEE',
  BEVERAGE = 'BEVERAGE',
  SNACK = 'SNACK',
  MEAL = 'MEAL',
  OTHER = 'OTHER'
}

export const CATEGORY_DISPLAY_NAMES: Record<ChannelCategory, string> = {
  [ChannelCategory.ALCOHOL]: '经典特调',
  [ChannelCategory.COFFEE]: '精品咖啡',
  [ChannelCategory.BEVERAGE]: '经典饮品',
  [ChannelCategory.SNACK]: '主厨小食',
  [ChannelCategory.MEAL]: '精品餐食',
  [ChannelCategory.OTHER]: '其他商品'
}

export const getCategoryDisplayName = (category: ChannelCategory): string => {
  return CATEGORY_DISPLAY_NAMES[category] || '未知分类'
}
```

**理由**：
1. **类型安全**：使用TypeScript的`Record<K, V>`确保所有枚举值都有对应的中文名
2. **可维护性**：集中管理映射关系，修改时只需更新一处
3. **可扩展性**：新增分类时，TypeScript会提示补充映射
4. **性能优化**：O(1)查找复杂度

**替代方案考虑**：
- 方案A：后端返回中文名 → 被拒绝（后端是通用API，不应耦合特定前端显示逻辑）
- 方案B：使用switch-case → 被拒绝（代码冗长，缺少类型检查）
- 方案C：使用Map对象 → 被拒绝（不如Record类型安全）

---

## 决策3：价格格式化策略

### 研究问题
如何将后端返回的价格（单位：分）转换为前端显示的格式（单位：元）？

### 调研结果

**后端价格格式**：
- 字段：`basePrice: number`
- 单位：分（cents）
- 示例：2800（表示28元）
- 原因：使用整数避免浮点数精度问题

**前端显示需求**：
- 格式：`¥28` 或 `¥28.00`
- 特殊情况：价格为0时显示"免费"

### 技术决策

**决策内容**：创建价格格式化工具函数，支持多种显示格式

**实现方案**：
```typescript
// src/utils/priceFormatter.ts

export interface PriceFormatOptions {
  showDecimals?: boolean;      // 是否显示小数位，默认false
  showCurrency?: boolean;      // 是否显示货币符号，默认true
  freeText?: string;           // 价格为0时的文本，默认"免费"
}

/**
 * 将价格从分转换为元并格式化
 * @param priceInCents 价格（分）
 * @param options 格式化选项
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (
  priceInCents: number,
  options: PriceFormatOptions = {}
): string => {
  const {
    showDecimals = false,
    showCurrency = true,
    freeText = '免费'
  } = options;

  // 处理价格为0的情况
  if (priceInCents === 0) {
    return freeText;
  }

  // 转换为元
  const priceInYuan = priceInCents / 100;

  // 格式化小数位
  const formattedPrice = showDecimals
    ? priceInYuan.toFixed(2)
    : Math.floor(priceInYuan).toString();

  // 添加货币符号
  return showCurrency ? `¥${formattedPrice}` : formattedPrice;
}

// 便捷函数
export const formatPriceSimple = (priceInCents: number): string => {
  return formatPrice(priceInCents, { showDecimals: false });
}

export const formatPriceDetailed = (priceInCents: number): string => {
  return formatPrice(priceInCents, { showDecimals: true });
}
```

**单元测试用例**：
```typescript
describe('formatPrice', () => {
  it('应该将2800分格式化为¥28', () => {
    expect(formatPrice(2800)).toBe('¥28');
  });

  it('应该将2850分格式化为¥28（不显示小数）', () => {
    expect(formatPrice(2850, { showDecimals: false })).toBe('¥28');
  });

  it('应该将2850分格式化为¥28.50（显示小数）', () => {
    expect(formatPrice(2850, { showDecimals: true })).toBe('¥28.50');
  });

  it('应该将0分格式化为"免费"', () => {
    expect(formatPrice(0)).toBe('免费');
  });

  it('应该支持自定义免费文本', () => {
    expect(formatPrice(0, { freeText: '¥0' })).toBe('¥0');
  });
});
```

**理由**：
1. **精度保证**：使用整数运算避免浮点数精度问题
2. **灵活性**：通过options参数支持多种显示格式
3. **用户友好**：价格为0时自动显示"免费"
4. **可测试性**：纯函数，便于编写单元测试

---

## 决策4：状态管理架构

### 研究问题
如何设计前端状态管理架构，平衡客户端状态和服务器状态？

### 调研结果

**状态分类**：
1. **客户端状态**（UI状态，不需要持久化）
   - 当前选中的分类（selectedCategory）
   - 加载状态（isLoading）
   - 错误状态（error）

2. **服务器状态**（来自后端API，需缓存）
   - 商品列表数据（products）
   - API请求状态（loading/success/error）

**技术栈约束**：
- 必须使用Zustand管理客户端状态
- 必须使用TanStack Query管理服务器状态

### 技术决策

**决策内容**：使用Zustand + TanStack Query的组合方案

**架构设计**：

```typescript
// ============ 客户端状态 (Zustand) ============
// src/stores/productMenuStore.ts

import { create } from 'zustand';
import { ChannelCategory } from '@/types/channelProduct';

interface ProductMenuState {
  // 状态
  selectedCategory: ChannelCategory | null;  // null表示"全部"

  // 动作
  setSelectedCategory: (category: ChannelCategory | null) => void;
  resetCategory: () => void;
}

export const useProductMenuStore = create<ProductMenuState>((set) => ({
  selectedCategory: null,  // 默认选中"全部"

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  resetCategory: () => set({ selectedCategory: null })
}));


// ============ 服务器状态 (TanStack Query) ============
// src/hooks/useProducts.ts

import { useQuery } from '@tanstack/react-query';
import { ChannelCategory, ChannelProductDTO } from '@/types/channelProduct';
import { getProductList } from '@/services/channelProductService';

export const useProducts = (category?: ChannelCategory | null) => {
  return useQuery({
    queryKey: ['products', category],  // category变化时自动重新请求
    queryFn: () => getProductList(category || undefined),  // null转为undefined
    staleTime: 5 * 60 * 1000,  // 5分钟缓存时间
    cacheTime: 10 * 60 * 1000,  // 10分钟保留时间
    retry: 3,  // 失败自动重试3次
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),  // 指数退避
  });
};


// ============ 使用示例 ============
// src/pages/menu/index.tsx

import { useProductMenuStore } from '@/stores/productMenuStore';
import { useProducts } from '@/hooks/useProducts';

export const MenuPage = () => {
  const { selectedCategory, setSelectedCategory } = useProductMenuStore();
  const { data: products, isLoading, error, refetch } = useProducts(selectedCategory);

  // 用户点击分类
  const handleCategoryClick = (category: ChannelCategory | null) => {
    setSelectedCategory(category);  // Zustand更新UI状态
    // TanStack Query自动检测queryKey变化并重新请求
  };

  // 用户点击重试
  const handleRetry = () => {
    refetch();  // TanStack Query重新请求
  };

  return (/* UI组件 */);
};
```

**理由**：
1. **职责分离**：Zustand管理UI状态，TanStack Query管理API数据
2. **自动缓存**：切换分类后再切回，TanStack Query自动使用缓存（5分钟内）
3. **自动重试**：网络错误时自动重试3次，使用指数退避策略
4. **响应式更新**：queryKey变化时自动重新请求，无需手动触发
5. **类型安全**：完整的TypeScript类型定义

**性能优化**：
- 使用`staleTime`减少不必要的请求
- 使用`cacheTime`保留数据避免重复加载
- 指数退避策略避免网络拥塞

---

## 决策5：错误处理策略

### 研究问题
如何处理API请求失败、网络超时、Token过期等错误场景？

### 调研结果

**错误类型分析**：
1. **网络错误**：网络断开、请求超时
2. **认证错误**：Token过期（401）
3. **服务器错误**：500错误、数据格式错误
4. **业务错误**：分类无商品、商品已下架

### 技术决策

**决策内容**：分层错误处理策略

**实现方案**：

```typescript
// ============ API服务层错误处理 ============
// src/services/channelProductService.ts

import Taro from '@tarojs/taro';
import { ChannelCategory, ChannelProductDTO } from '@/types/channelProduct';

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getProductList = async (
  category?: ChannelCategory
): Promise<ChannelProductDTO[]> => {
  try {
    const response = await Taro.request({
      url: '/api/client/channel-products/mini-program',
      method: 'GET',
      data: category ? { category } : {},
      header: {
        'Authorization': `Bearer ${getToken()}`
      },
      timeout: 10000  // 10秒超时
    });

    // 检查响应状态
    if (response.statusCode === 401) {
      // Token过期，尝试刷新
      await refreshToken();
      // 重新请求
      return getProductList(category);
    }

    if (response.statusCode !== 200) {
      throw new ApiError(
        response.statusCode,
        response.data.message || 'API请求失败',
        response.data
      );
    }

    // 检查响应格式
    if (!response.data.success) {
      throw new ApiError(
        response.statusCode,
        response.data.message || '服务器返回错误',
        response.data
      );
    }

    return response.data.data;
  } catch (error: any) {
    // 网络错误
    if (error.errMsg?.includes('timeout')) {
      throw new ApiError(0, '网络超时，请检查网络后重试');
    }
    if (error.errMsg?.includes('network')) {
      throw new ApiError(0, '网络已断开，请检查网络连接');
    }
    // 重新抛出ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    // 未知错误
    throw new ApiError(0, '请求失败，请稍后重试', error);
  }
};


// ============ UI层错误处理 ============
// src/components/ProductList/index.tsx

import { useProducts } from '@/hooks/useProducts';

export const ProductList = () => {
  const { data, isLoading, error, refetch } = useProducts(category);

  // 加载状态
  if (isLoading) {
    return <SkeletonScreen />;
  }

  // 错误状态
  if (error) {
    const apiError = error as ApiError;
    return (
      <ErrorState
        message={getErrorMessage(apiError)}
        onRetry={refetch}
      />
    );
  }

  // 空状态
  if (!data || data.length === 0) {
    return <EmptyState message="暂无商品" />;
  }

  // 正常渲染
  return (/* 商品列表 */);
};

// 错误消息映射
const getErrorMessage = (error: ApiError): string => {
  if (error.code === 0) {
    return error.message;  // 网络错误直接使用消息
  }
  if (error.code === 500) {
    return '服务异常，请稍后重试';
  }
  return error.message || '加载失败，请重试';
};
```

**理由**：
1. **分层处理**：API层处理网络/认证错误，UI层处理显示逻辑
2. **自动重试**：Token过期自动刷新并重试
3. **用户友好**：错误消息清晰明确，提供重试按钮
4. **可测试性**：自定义ApiError便于单元测试

---

## 决策6：性能优化策略

### 研究问题
如何优化商品列表的加载性能和用户体验？

### 调研结果

**性能瓶颈**：
1. **图片加载**：商品主图数量多，影响首屏渲染
2. **分类切换**：频繁切换分类导致重复请求
3. **列表渲染**：100个商品卡片同时渲染可能卡顿

### 技术决策

**决策内容**：多层次性能优化策略

**实现方案**：

```typescript
// ============ 1. 分类切换防抖 ============
// src/components/CategoryTabs/index.tsx

import { useMemo } from 'react';
import { debounce } from 'lodash-es';

export const CategoryTabs = () => {
  const { setSelectedCategory } = useProductMenuStore();

  // 防抖处理，300ms延迟
  const handleCategoryChange = useMemo(
    () => debounce((category: ChannelCategory | null) => {
      setSelectedCategory(category);
    }, 300),
    [setSelectedCategory]
  );

  return (/* 分类标签 */);
};


// ============ 2. 图片懒加载 ============
// src/components/ProductCard/index.tsx

import Taro from '@tarojs/taro';
import { useState, useEffect, useRef } from 'react';

export const ProductCard = ({ product }: { product: ChannelProductDTO }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用IntersectionObserver实现懒加载
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !imageSrc) {
            setImageSrc(product.mainImage);
          }
        });
      },
      { rootMargin: '100px' }  // 提前100px开始加载
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [product.mainImage, imageSrc]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <View ref={cardRef}>
      {imageError || !imageSrc ? (
        <Image src="/assets/images/placeholder-product.png" />
      ) : (
        <Image src={imageSrc} onError={handleImageError} />
      )}
      {/* 其他内容 */}
    </View>
  );
};


// ============ 3. TanStack Query缓存优化 ============
// src/hooks/useProducts.ts

export const useProducts = (category?: ChannelCategory | null) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: () => getProductList(category || undefined),
    staleTime: 5 * 60 * 1000,  // 5分钟内复用缓存
    cacheTime: 10 * 60 * 1000,  // 10分钟保留缓存
    // 预加载策略
    keepPreviousData: true,  // 切换分类时保留上一次数据，避免闪烁
  });
};


// ============ 4. 虚拟列表（可选，商品数>50时启用） ============
// src/components/ProductList/index.tsx

import { VirtualList } from '@tarojs/components';

export const ProductList = ({ products }: { products: ChannelProductDTO[] }) => {
  // 商品数量>50时使用虚拟列表
  if (products.length > 50) {
    return (
      <VirtualList
        height={Taro.getSystemInfoSync().windowHeight}
        itemData={products}
        itemCount={products.length}
        itemSize={200}  // 每个商品卡片高度
        width="100%"
      >
        {({ data, index }) => <ProductCard product={data[index]} />}
      </VirtualList>
    );
  }

  // 商品数量<=50时普通渲染
  return products.map(product => (
    <ProductCard key={product.id} product={product} />
  ));
};
```

**性能指标**：
- 首屏加载时间：≤2秒（20个商品）
- 分类切换：≤1秒（使用缓存≤500ms）
- 图片懒加载：减少50%初始网络请求
- 防抖优化：避免300ms内的重复请求

---

## 决策7：代码组织结构

### 研究问题
前端代码应如何组织以确保可维护性和可扩展性？

### 技术决策

**决策内容**：按功能模块组织，遵循Atomic Design原则

**目录结构**：

```
miniapp-ordering-taro/
├── src/
│   ├── types/                      # TypeScript类型定义
│   │   ├── channelProduct.ts       # 商品相关类型
│   │   └── common.ts               # 通用类型
│   │
│   ├── utils/                      # 工具函数
│   │   ├── categoryMapping.ts     # 分类映射
│   │   ├── priceFormatter.ts      # 价格格式化
│   │   └── request.ts             # 请求封装
│   │
│   ├── services/                   # API服务
│   │   └── channelProductService.ts
│   │
│   ├── stores/                     # Zustand状态管理
│   │   └── productMenuStore.ts
│   │
│   ├── hooks/                      # 自定义Hooks
│   │   └── useProducts.ts         # TanStack Query封装
│   │
│   ├── components/                 # 通用组件
│   │   ├── CategoryTabs/          # 分类标签组件
│   │   │   ├── index.tsx
│   │   │   └── index.module.scss
│   │   ├── ProductCard/           # 商品卡片组件
│   │   │   ├── index.tsx
│   │   │   └── index.module.scss
│   │   ├── ProductList/           # 商品列表组件
│   │   │   ├── index.tsx
│   │   │   └── index.module.scss
│   │   ├── SkeletonScreen/        # 骨架屏
│   │   ├── ErrorState/            # 错误状态
│   │   └── EmptyState/            # 空状态
│   │
│   ├── pages/                      # 页面
│   │   └── menu/                  # 菜单页
│   │       ├── index.tsx
│   │       └── index.module.scss
│   │
│   └── assets/                     # 静态资源
│       └── images/
│           └── placeholder-product.png
```

**组件职责划分**：
- **CategoryTabs**：分类标签栏，管理分类选择
- **ProductCard**：商品卡片，显示单个商品信息
- **ProductList**：商品列表容器，处理加载/错误/空状态
- **SkeletonScreen/ErrorState/EmptyState**：通用UI状态组件

---

## 研究总结

### 关键技术决策汇总

| 决策项 | 选择方案 | 理由 |
|-------|---------|------|
| 后端API | 使用现有API，无需修改 | API已100%实现，字段匹配度高 |
| 分类映射 | 前端维护Record映射字典 | 类型安全，易维护，解耦前后端 |
| 价格格式化 | 工具函数+单元测试 | 精度保证，灵活配置，可测试 |
| 状态管理 | Zustand + TanStack Query | 职责分离，自动缓存，响应式更新 |
| 错误处理 | 分层处理+自定义ApiError | 用户友好，可测试，自动重试 |
| 性能优化 | 防抖+懒加载+缓存+虚拟列表 | 减少请求，优化渲染，提升体验 |
| 代码组织 | 按功能模块+Atomic Design | 可维护，可扩展，职责清晰 |

### 风险与缓解措施

**风险1：后端API性能问题**
- 风险：100个商品全量返回，响应时间可能>1秒
- 缓解：阶段一性能测试，如不满足要求则在阶段二添加分页支持

**风险2：图片加载慢**
- 风险：Supabase Storage图片加载慢影响用户体验
- 缓解：图片懒加载+占位图+CDN加速（后续优化）

**风险3：网络环境差**
- 风险：小程序在弱网环境下体验差
- 缓解：自动重试+离线提示+缓存策略

### 未解决问题

1. **最小售卖单位**：当前采用硬编码"份"方案，后续可考虑从SKU API获取
2. **分页支持**：当前不支持分页，如商品数量>100需要后端添加分页参数
3. **图片优化**：未实现图片压缩和多尺寸适配，后续可优化

---

**研究完成日期**：2026-01-03
**审核状态**：待审核
**下一步**：生成data-model.md和contracts/api.yaml
