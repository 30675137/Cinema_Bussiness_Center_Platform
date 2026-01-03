# Data Model: 小程序菜单与商品API集成（阶段一）

**Feature**: [spec.md](./spec.md) | **Branch**: `O007-miniapp-menu-api` | **Date**: 2026-01-03

## 概述

本文档定义小程序菜单与商品API集成功能的核心数据模型，包括后端API响应结构、前端展示模型、状态管理模型等。

## 核心实体

### 1. ChannelProductDTO (后端API响应)

**来源**: 后端 Spring Boot API (`GET /api/channel-products`)

**用途**: 渠道商品配置完整数据模型

**TypeScript 类型定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 渠道商品配置DTO - 后端API响应模型
 */
export interface ChannelProductDTO {
  /** 渠道商品配置ID */
  id: string;

  /** 商品ID (SKU ID) */
  productId: string;

  /** 商品名称 */
  productName: string;

  /** 商品主图URL */
  mainImageUrl: string | null;

  /** 商品分类 */
  category: ChannelCategory;

  /** 售卖渠道 (H5_MENU: H5点单, MINI_PROGRAM_MENU: 小程序点单) */
  salesChannel: 'H5_MENU' | 'MINI_PROGRAM_MENU';

  /** 上下架状态 (ACTIVE: 上架, INACTIVE: 下架) */
  status: 'ACTIVE' | 'INACTIVE';

  /** 价格（单位：分） */
  priceInCents: number;

  /** 排序权重 (数字越小越靠前) */
  sortOrder: number;

  /** 商品标签列表 (如 ["新品", "热销"]) */
  tags?: string[];

  /** 库存状态 (AVAILABLE: 有库存, OUT_OF_STOCK: 缺货) */
  stockStatus?: 'AVAILABLE' | 'OUT_OF_STOCK';

  /** 创建时间 */
  createdAt?: string;

  /** 更新时间 */
  updatedAt?: string;
}
```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 | 示例值 |
|------|------|------|------|--------|
| `id` | string | ✅ | 渠道商品配置唯一标识 | "cp-001" |
| `productId` | string | ✅ | 关联的商品(SKU) ID | "sku-coffee-001" |
| `productName` | string | ✅ | 商品名称 | "美式咖啡" |
| `mainImageUrl` | string \| null | ✅ | 商品主图URL（可为null） | "https://cdn.example.com/coffee.jpg" |
| `category` | ChannelCategory | ✅ | 商品分类枚举 | "COFFEE" |
| `salesChannel` | enum | ✅ | 售卖渠道 | "MINI_PROGRAM_MENU" |
| `status` | enum | ✅ | 上下架状态 | "ACTIVE" |
| `priceInCents` | number | ✅ | 价格（单位：分） | 2500 (表示 ¥25.00) |
| `sortOrder` | number | ✅ | 排序权重 | 100 |
| `tags` | string[] | ❌ | 商品标签 | ["新品", "热销"] |
| `stockStatus` | enum | ❌ | 库存状态 | "AVAILABLE" |

### 2. ChannelCategory (商品分类枚举)

**来源**: 后端枚举定义

**用途**: 定义商品分类类型

**TypeScript 枚举定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 渠道商品分类枚举
 */
export enum ChannelCategory {
  /** 酒精类饮品 - 显示为"经典特调" */
  ALCOHOL = 'ALCOHOL',

  /** 咖啡类 - 显示为"精品咖啡" */
  COFFEE = 'COFFEE',

  /** 非酒精饮品 - 显示为"经典饮品" */
  BEVERAGE = 'BEVERAGE',

  /** 小食类 - 显示为"主厨小食" */
  SNACK = 'SNACK',

  /** 正餐类 - 显示为"精品餐食" */
  MEAL = 'MEAL',

  /** 其他类 - 显示为"其他商品" */
  OTHER = 'OTHER'
}

/**
 * @spec O007-miniapp-menu-api
 * 分类枚举到显示名称的映射
 */
export const CATEGORY_DISPLAY_NAMES: Record<ChannelCategory, string> = {
  [ChannelCategory.ALCOHOL]: '经典特调',
  [ChannelCategory.COFFEE]: '精品咖啡',
  [ChannelCategory.BEVERAGE]: '经典饮品',
  [ChannelCategory.SNACK]: '主厨小食',
  [ChannelCategory.MEAL]: '精品餐食',
  [ChannelCategory.OTHER]: '其他商品'
};
```

### 3. ProductCard (前端展示模型)

**来源**: 前端视图层抽象

**用途**: 商品卡片组件的Props类型

**TypeScript 接口定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 商品卡片展示数据模型
 */
export interface ProductCard {
  /** 商品ID */
  id: string;

  /** 商品名称 */
  name: string;

  /** 商品图片URL */
  imageUrl: string;

  /** 价格文本（已格式化，如 "¥25" 或 "免费"） */
  priceText: string;

  /** 商品标签列表 */
  tags: string[];

  /** 最小售卖单位（如 "1杯"、"1份"） */
  minSalesUnit: string;

  /** 库存状态标识 */
  isAvailable: boolean;

  /** 商品分类 */
  category: ChannelCategory;
}
```

**数据转换逻辑**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 将后端DTO转换为前端ProductCard
 */
export const toProductCard = (dto: ChannelProductDTO): ProductCard => {
  return {
    id: dto.id,
    name: dto.productName,
    imageUrl: dto.mainImageUrl || '/images/placeholder.png',
    priceText: formatPrice(dto.priceInCents),
    tags: dto.tags || [],
    minSalesUnit: getMinSalesUnit(dto.category), // 前端映射规则
    isAvailable: dto.stockStatus !== 'OUT_OF_STOCK',
    category: dto.category
  };
};

/**
 * @spec O007-miniapp-menu-api
 * 根据分类获取最小售卖单位
 */
const getMinSalesUnit = (category: ChannelCategory): string => {
  const unitMap: Record<ChannelCategory, string> = {
    [ChannelCategory.ALCOHOL]: '1杯',
    [ChannelCategory.COFFEE]: '1杯',
    [ChannelCategory.BEVERAGE]: '1杯',
    [ChannelCategory.SNACK]: '1份',
    [ChannelCategory.MEAL]: '1份',
    [ChannelCategory.OTHER]: '1份'
  };
  return unitMap[category];
};
```

### 4. CategoryTab (分类导航项)

**来源**: 前端视图层抽象

**用途**: 分类导航Tab组件的数据模型

**TypeScript 接口定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 分类Tab导航项
 */
export interface CategoryTab {
  /** 分类枚举值 */
  key: ChannelCategory;

  /** 分类显示名称 */
  label: string;

  /** 该分类下的商品数量 */
  count?: number;

  /** 是否为当前激活Tab */
  isActive?: boolean;
}
```

**数据生成逻辑**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 生成分类Tab列表（按优先顺序）
 */
export const generateCategoryTabs = (
  products: ChannelProductDTO[]
): CategoryTab[] => {
  // Phase 1 优先显示的四个分类
  const priorityCategories: ChannelCategory[] = [
    ChannelCategory.ALCOHOL,   // 经典特调
    ChannelCategory.COFFEE,    // 精品咖啡
    ChannelCategory.BEVERAGE,  // 经典饮品
    ChannelCategory.SNACK      // 主厨小食
  ];

  // 统计每个分类的商品数量
  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<ChannelCategory, number>);

  // 生成Tab列表（只包含有商品的分类）
  return priorityCategories
    .filter(category => categoryCounts[category] > 0)
    .map(category => ({
      key: category,
      label: CATEGORY_DISPLAY_NAMES[category],
      count: categoryCounts[category]
    }));
};
```

## API 响应模型

### 5. ApiResponse<T> (统一响应格式)

**来源**: 后端全局响应标准 (规则 08-api-standards.md)

**用途**: 所有API接口的统一响应包装

**TypeScript 泛型接口**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * API统一成功响应格式
 */
export interface ApiResponse<T> {
  /** 请求成功标识 */
  success: true;

  /** 响应数据 */
  data: T;

  /** 响应时间戳 */
  timestamp: string;

  /** 可选消息 */
  message?: string;
}

/**
 * @spec O007-miniapp-menu-api
 * API统一错误响应格式
 */
export interface ApiErrorResponse {
  /** 请求失败标识 */
  success: false;

  /** 错误代码（如 "PRODUCT_NOT_FOUND"） */
  error: string;

  /** 错误消息 */
  message: string;

  /** 错误详情（可选） */
  details?: Record<string, any>;

  /** 响应时间戳 */
  timestamp: string;
}

/**
 * @spec O007-miniapp-menu-api
 * 分页列表响应格式
 */
export interface PagedApiResponse<T> {
  success: true;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  message?: string;
  timestamp: string;
}
```

### 6. ProductListParams (API请求参数)

**来源**: 前端API Service层

**用途**: 商品列表查询参数模型

**TypeScript 接口定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 商品列表查询参数
 */
export interface ProductListParams {
  /** 商品分类（可选，不传则返回所有分类） */
  category?: ChannelCategory;

  /** 售卖渠道 (固定为 MINI_PROGRAM_MENU) */
  salesChannel: 'MINI_PROGRAM_MENU';

  /** 上下架状态（可选，不传则返回所有状态） */
  status?: 'ACTIVE' | 'INACTIVE';

  /** 分页参数：页码（从1开始） */
  page?: number;

  /** 分页参数：每页条数（默认20） */
  pageSize?: number;

  /** 排序字段（可选，默认按 sortOrder 升序） */
  sortBy?: 'sortOrder' | 'createdAt' | 'priceInCents';

  /** 排序方向（可选，默认 ASC） */
  sortOrder?: 'ASC' | 'DESC';
}
```

## 状态管理模型

### 7. ProductListState (Zustand客户端状态)

**来源**: 前端 Zustand Store

**用途**: 管理商品列表页面的UI状态

**TypeScript 接口定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 商品列表页面客户端状态
 */
export interface ProductListState {
  /** 当前选中的分类 */
  selectedCategory: ChannelCategory | null;

  /** 切换选中分类 */
  setSelectedCategory: (category: ChannelCategory | null) => void;

  /** 搜索关键词（Phase 2功能） */
  searchKeyword: string;

  /** 设置搜索关键词 */
  setSearchKeyword: (keyword: string) => void;

  /** 重置所有状态 */
  reset: () => void;
}

/**
 * @spec O007-miniapp-menu-api
 * Zustand Store 实现示例
 */
import { create } from 'zustand';

export const useProductListStore = create<ProductListState>((set) => ({
  selectedCategory: null,
  searchKeyword: '',

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  reset: () => set({ selectedCategory: null, searchKeyword: '' })
}));
```

### 8. TanStack Query Keys (服务器状态缓存键)

**来源**: 前端 TanStack Query配置

**用途**: 定义API数据缓存键规范

**TypeScript 常量定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * TanStack Query 缓存键工厂函数
 */
export const productQueryKeys = {
  /** 所有商品查询的基础键 */
  all: ['channel-products'] as const,

  /** 按分类筛选的商品列表 */
  byCategory: (category: ChannelCategory | null) =>
    [...productQueryKeys.all, 'category', category] as const,

  /** 按参数查询的商品列表 */
  list: (params: ProductListParams) =>
    [...productQueryKeys.all, 'list', params] as const,

  /** 单个商品详情 */
  detail: (id: string) =>
    [...productQueryKeys.all, 'detail', id] as const
};
```

## 工具类型

### 9. PriceFormatOptions (价格格式化配置)

**来源**: 前端工具函数

**用途**: 配置价格显示格式

**TypeScript 接口定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 价格格式化配置选项
 */
export interface PriceFormatOptions {
  /** 是否显示小数位（默认 false，显示整数） */
  showDecimals?: boolean;

  /** 是否显示货币符号（默认 true） */
  showCurrency?: boolean;

  /** 价格为0时的显示文本（默认 "免费"） */
  freeText?: string;
}
```

### 10. ApiError (自定义错误类)

**来源**: 前端错误处理层

**用途**: 封装API错误信息

**TypeScript 类定义**:

```typescript
/**
 * @spec O007-miniapp-menu-api
 * API错误封装类
 */
export class ApiError extends Error {
  /** 错误代码 */
  code: string;

  /** HTTP状态码 */
  statusCode: number;

  /** 错误详情 */
  details?: Record<string, any>;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  /** 判断是否为网络错误 */
  isNetworkError(): boolean {
    return this.statusCode >= 500 || this.code === 'NETWORK_ERROR';
  }

  /** 判断是否为认证错误 */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'UNAUTHORIZED';
  }

  /** 获取用户友好的错误提示 */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return '网络连接失败，请检查网络后重试';
    }
    if (this.isAuthError()) {
      return '登录已过期，请重新登录';
    }
    return this.message || '操作失败，请稍后重试';
  }
}
```

## 数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│                         数据流向                                 │
└─────────────────────────────────────────────────────────────────┘

后端 Spring Boot API
       │
       │ GET /api/channel-products?category=COFFEE&salesChannel=MINI_PROGRAM_MENU
       ↓
  ApiResponse<ChannelProductDTO[]>
       │
       │ TanStack Query (自动缓存、重试、轮询)
       ↓
  useProducts Hook (React组件层)
       │
       │ toProductCard() 数据转换
       ↓
  ProductCard[] (前端展示模型)
       │
       │ 渲染到UI
       ↓
  ProductList Component
       │
       ├─→ CategoryTabs (分类导航)
       │     └─→ onClick → Zustand.setSelectedCategory()
       │
       └─→ ProductCard (商品卡片)
             └─→ onClick → 导航到商品详情页 (Phase 2)

Zustand客户端状态
  selectedCategory → 触发 TanStack Query 重新请求
  searchKeyword → 触发防抖搜索 (Phase 2)
```

## 类型安全保证

### 11. 类型守卫函数

**用途**: 运行时类型检查

```typescript
/**
 * @spec O007-miniapp-menu-api
 * 判断是否为有效的分类枚举值
 */
export function isValidCategory(value: any): value is ChannelCategory {
  return Object.values(ChannelCategory).includes(value);
}

/**
 * @spec O007-miniapp-menu-api
 * 判断是否为成功响应
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T> | ApiErrorResponse
): response is ApiResponse<T> {
  return response.success === true;
}

/**
 * @spec O007-miniapp-menu-api
 * 判断商品是否可售
 */
export function isProductAvailable(product: ChannelProductDTO): boolean {
  return (
    product.status === 'ACTIVE' &&
    product.stockStatus !== 'OUT_OF_STOCK'
  );
}
```

## Zod数据验证Schema

**用途**: 运行时数据验证（符合规则09-quality-standards.md安全标准）

```typescript
import { z } from 'zod';

/**
 * @spec O007-miniapp-menu-api
 * ChannelProductDTO Zod验证Schema
 */
export const ChannelProductDTOSchema = z.object({
  id: z.string().min(1, '商品ID不能为空'),
  productId: z.string().min(1, '商品ID不能为空'),
  productName: z.string().min(1, '商品名称不能为空').max(100, '商品名称过长'),
  mainImageUrl: z.string().url('图片URL格式错误').nullable(),
  category: z.nativeEnum(ChannelCategory, { errorMap: () => ({ message: '无效的商品分类' }) }),
  salesChannel: z.enum(['H5_MENU', 'MINI_PROGRAM_MENU']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  priceInCents: z.number().int('价格必须为整数').min(0, '价格不能为负数'),
  sortOrder: z.number().int('排序值必须为整数').min(0),
  tags: z.array(z.string()).optional(),
  stockStatus: z.enum(['AVAILABLE', 'OUT_OF_STOCK']).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

/**
 * @spec O007-miniapp-menu-api
 * 验证后端API响应数据
 */
export const validateProductDTO = (data: unknown): ChannelProductDTO => {
  return ChannelProductDTOSchema.parse(data);
};

/**
 * @spec O007-miniapp-menu-api
 * 批量验证商品列表
 */
export const validateProductList = (data: unknown): ChannelProductDTO[] => {
  return z.array(ChannelProductDTOSchema).parse(data);
};
```

## 数据约束规则

| 实体 | 字段 | 约束规则 |
|------|------|---------|
| ChannelProductDTO | productName | 长度 1-100 字符 |
| ChannelProductDTO | priceInCents | ≥ 0，整数 |
| ChannelProductDTO | sortOrder | ≥ 0，整数 |
| ChannelProductDTO | mainImageUrl | 必须是有效URL或null |
| ProductListParams | page | ≥ 1 |
| ProductListParams | pageSize | 1-100 之间 |
| CategoryTab | count | ≥ 0 |

## 版本历史

| 版本 | 日期 | 修改内容 |
|------|------|---------|
| 1.0.0 | 2026-01-03 | 初始版本，定义Phase 1核心数据模型 |

---

**相关文档**:
- [Feature Specification](./spec.md)
- [Technical Research](./research.md)
- [API Contracts](./contracts/api.yaml)
