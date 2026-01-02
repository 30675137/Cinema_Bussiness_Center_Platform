# miniapp-ordering 后端 API 对接文档

**项目**: CineLounge 点餐小程序  
**版本**: v1.0  
**日期**: 2026-01-02  
**状态**: 设计中

---

## 📋 文档概述

本文档定义了 **miniapp-ordering 小程序需要调用的后端 API 接口清单**。文档基于后端 API 规格（`docs/api/unified-api-spec.md`）梳理了小程序端需要对接的接口，并提供前端集成方案。

**文档用途**:
- ✅ 明确小程序调用哪些后端 API
- ✅ 定义前端如何封装和调用这些 API
- ✅ 提供数据类型映射和转换规则
- ✅ 制定分阶段的 API 集成计划

---

## 🎯 集成目标

### 主要目标
1. **替换 Mock 数据**：将硬编码的 Mock 数据替换为真实 API 调用
2. **保持用户体验**：确保 API 集成后用户体验不降级
3. **分阶段实施**：优先实现核心功能，逐步完善增强功能
4. **错误处理**：完善的错误提示和降级方案

### 成功标准
- ✅ 商品数据从后端动态加载
- ✅ 订单创建和查询流程完整
- ✅ 支付流程可用（Mock 或真实）
- ✅ 错误情况有友好提示
- ✅ 加载状态有明确反馈

---

## 🏗️ 调用架构

### 小程序端（调用方）
- **框架**: React 19.2.3
- **构建工具**: Vite 6.2.0
- **HTTP 客户端**: 原生 fetch（或引入 axios）
- **状态管理**: React useState/useEffect
- **类型支持**: TypeScript 5.8.2

### 后端 API（被调用方）
- **基础 URL**: `http://localhost:8080/api`（开发环境）
- **认证方式**: Bearer Token (JWT)
- **响应格式**: 统一 JSON 格式
- **接口前缀**: C端接口统一使用 `/api/client/*` 路径

---

## 📊 小程序需要调用的后端 API

### ✅ Phase 1: 核心功能 API（5个）

| 序号 | 小程序调用的 API | 功能说明 | 优先级 | 后端状态 |
|-----|-----------------|---------|-------|----------|
| 1 | `GET /api/client/channel-products/mini-program` | 小程序获取商品列表 | P0 | ✅ 已实现 |
| 2 | `GET /api/client/channel-products/mini-program/{id}` | 小程序获取商品详情 | P0 | ✅ 已实现 |
| 3 | `POST /api/client/channel-product-orders` | 小程序创建订单 | P0 | ✅ 已实现 |
| 4 | `GET /api/client/channel-product-orders/my` | 小程序查询我的订单 | P0 | ✅ 已实现 |
| 5 | `GET /api/client/channel-product-orders/{id}` | 小程序获取订单详情 | P0 | ✅ 已实现 |

### 🔶 Phase 2: 待确认的 API（1个）

| 序号 | 小程序需要调用的 API | 功能说明 | 问题 | 后端状态 |
|-----|---------------------|---------|------|----------|
| 6 | `POST /api/client/channel-product-orders/{id}/pay` | 小程序发起订单支付 | 需确认后端是否实现 | 🔶 待确认 |

### ❌ Phase 3: 小程序需要但后端未实现的 API

| 功能分类 | 小程序需要调用的 API | 优先级 | 前端临时方案 |
|---------|---------------------|-------|-------------|
| 会员系统 | 会员信息、积分查询、积分获得/兑换 | P1 | 暂时保持 Mock |
| 优惠券 | 优惠券列表、应用优惠券 | P1 | 暂时保持 Mock |
| 积分商城 | 积分商品列表、积分兑换 | P2 | 暂时保持 Mock |
| 影厅管理 | 影厅列表、二维码扫描 | P2 | 暂时保持 Mock |
| AI 推荐 | AI 商品推荐 | P2 | 继续使用 Gemini API |

---

## 🔄 分阶段实施计划

### Phase 1: 核心功能集成（本阶段）

**目标**: 实现商品浏览和订单创建的完整流程

**集成范围**:
- ✅ 商品列表加载
- ✅ 商品详情展示
- ✅ 订单创建
- ✅ 订单查询

**保留 Mock**:
- 会员信息
- 优惠券
- 积分系统
- 影厅列表
- AI 推荐

**预计时间**: 2-3 天

---

### Phase 2: 支付功能（待确认）

**目标**: 确认并集成支付接口

**待办事项**:
1. 检查 O006 OpenAPI 规格中是否定义支付接口
2. 如果有，集成支付接口
3. 如果没有，继续使用 Mock 支付或复用饮品订单支付接口

**预计时间**: 1-2 天

---

### Phase 3: 会员系统（待开发）

**目标**: 开发会员相关 API 并集成

**需要开发的 API**:
- `GET /api/client/member/profile` - 会员信息
- `GET /api/client/member/points` - 积分查询
- `POST /api/client/member/points/earn` - 积分获得
- `POST /api/client/member/points/redeem` - 积分兑换

**预计时间**: 5-7 天（含后端开发）

---

### Phase 4: 优惠券系统（待开发）

**目标**: 开发优惠券相关 API 并集成

**需要开发的 API**:
- `GET /api/client/coupons/available` - 可用优惠券
- `POST /api/client/orders/{id}/apply-coupon` - 应用优惠券

**预计时间**: 3-5 天（含后端开发）

---

## 🛠️ 前端 API 调用实现方案

### 1. 封装 HTTP 客户端

**目的**: 统一小程序调用后端 API 的方式

**创建文件**: `src/services/apiClient.ts`

```typescript
// 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// HTTP 客户端封装
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = new Headers(options.headers);

    // 添加认证头
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // 添加 Content-Type
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 处理统一响应格式
      if (data.success === false) {
        throw new Error(data.message || '请求失败');
      }

      return data.data || data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(endpoint + query, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

---

### 2. 封装商品 API 调用

**目的**: 小程序通过此服务调用后端商品相关 API

**创建文件**: `src/services/productService.ts`

```typescript
import { apiClient } from './apiClient';
import { Product, CategoryType } from '../types';

export interface ChannelProduct {
  id: string;
  skuId: string;
  channelType: 'MINI_PROGRAM';
  channelCategory: string;
  displayName: string;
  basePrice: number;
  mainImage: string;
  detailImages: string[];
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isRecommended: boolean;
  sortOrder: number;
  specTypes: Array<{
    specType: string;
    isRequired: boolean;
    allowMultiple: boolean;
    options: Array<{
      optionName: string;
      priceAdjustment: number;
    }>;
  }>;
}

export interface ProductListResponse {
  products: ChannelProduct[];
  total: number;
  page: number;
  pageSize: number;
}

// 分类映射
const CATEGORY_MAP: Record<CategoryType, string> = {
  [CategoryType.ALCOHOL]: 'ALCOHOL',
  [CategoryType.COFFEE]: 'COFFEE',
  [CategoryType.BEVERAGE]: 'BEVERAGE',
  [CategoryType.SNACK]: 'SNACK',
  [CategoryType.REWARDS]: '', // 积分兑换不是分类
};

// 小程序调用后端获取商品列表
export async function getProducts(
  category?: CategoryType,
  page: number = 1,
  size: number = 20
): Promise<Product[]> {
  try {
    const params: any = { page, size };
    
    if (category && category !== CategoryType.REWARDS) {
      params.category = CATEGORY_MAP[category];
    }

    // 调用后端 API: GET /api/client/channel-products/mini-program
    const response = await apiClient.get<ProductListResponse>(
      '/client/channel-products/mini-program',
      params
    );

    // 转换为前端 Product 类型
    return response.products.map(mapChannelProductToProduct);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // 降级：返回 Mock 数据
    return getFallbackProducts(category);
  }
}

// 小程序调用后端获取商品详情
export async function getProductDetail(id: string): Promise<Product | null> {
  try {
    // 调用后端 API: GET /api/client/channel-products/mini-program/{id}
    const product = await apiClient.get<ChannelProduct>(
      `/client/channel-products/mini-program/${id}`
    );

    return mapChannelProductToProduct(product);
  } catch (error) {
    console.error('Failed to fetch product detail:', error);
    return null;
  }
}

// 数据映射函数
function mapChannelProductToProduct(cp: ChannelProduct): Product {
  return {
    id: cp.id,
    name: cp.displayName,
    price: cp.basePrice / 100, // 后端是分，前端是元
    image: cp.mainImage,
    description: cp.description || '',
    category: mapBackendCategory(cp.channelCategory),
    pointsPrice: undefined, // 积分价格需要从其他接口获取
    options: cp.specTypes.map(spec => ({
      name: spec.specType,
      choices: spec.options.map(opt => opt.optionName),
    })),
  };
}

// 后端分类映射到前端
function mapBackendCategory(backendCategory: string): CategoryType {
  switch (backendCategory) {
    case 'ALCOHOL':
      return CategoryType.ALCOHOL;
    case 'COFFEE':
      return CategoryType.COFFEE;
    case 'BEVERAGE':
      return CategoryType.BEVERAGE;
    case 'SNACK':
      return CategoryType.SNACK;
    default:
      return CategoryType.BEVERAGE;
  }
}

// 降级方案：返回 Mock 数据
function getFallbackProducts(category?: CategoryType): Product[] {
  // 从 constants.tsx 导入 PRODUCTS
  // 这里保持原有的 Mock 数据作为降级方案
  return [];
}
```

---

### 3. 封装订单 API 调用

**目的**: 小程序通过此服务调用后端订单相关 API

**创建文件**: `src/services/orderService.ts`

```typescript
import { apiClient } from './apiClient';
import { CartItem } from '../types';

export interface CreateOrderRequest {
  items: Array<{
    channelProductId: string;
    quantity: number;
    selectedSpecs: Record<string, string[]>;
  }>;
  remark?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  pickupNumber: string;
  status: 'PENDING_PAYMENT' | 'PENDING_PRODUCTION' | 'IN_PRODUCTION' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  items: Array<{
    channelProductId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    selectedSpecs: Record<string, string[]>;
  }>;
  createdAt: string;
  updatedAt: string;
}

// 小程序调用后端创建订单
export async function createOrder(cart: CartItem[]): Promise<OrderResponse> {
  const request: CreateOrderRequest = {
    items: cart.map(item => ({
      channelProductId: item.product.id,
      quantity: item.quantity,
      selectedSpecs: item.selectedOptions,
    })),
  };

  try {
    // 调用后端 API: POST /api/client/channel-product-orders
    const order = await apiClient.post<OrderResponse>(
      '/api/client/channel-product-orders',
      request
    );
    return order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error('订单创建失败，请重试');
  }
}

// 小程序调用后端查询我的订单列表
export async function getMyOrders(
  page: number = 1,
  pageSize: number = 10,
  status?: string
): Promise<{ orders: OrderResponse[]; total: number }> {
  try {
    const params: any = { page, pageSize };
    if (status) {
      params.status = status;
    }

    // 调用后端 API: GET /api/client/channel-product-orders/my
    const response = await apiClient.get<{
      orders: OrderResponse[];
      total: number;
    }>('/api/client/channel-product-orders/my', params);

    return response;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return { orders: [], total: 0 };
  }
}

// 小程序调用后端获取订单详情
export async function getOrderDetail(orderId: string): Promise<OrderResponse | null> {
  try {
    // 调用后端 API: GET /api/client/channel-product-orders/{id}
    const order = await apiClient.get<OrderResponse>(
      `/api/client/channel-product-orders/${orderId}`
    );
    return order;
  } catch (error) {
    console.error('Failed to fetch order detail:', error);
    return null;
  }
}

// 小程序调用支付接口（待后端实现）
export async function mockPayOrder(orderId: string): Promise<boolean> {
  try {
    // TODO: 等待后端实现支付接口
    // 预期调用: POST /api/client/channel-product-orders/{id}/pay
    // 暂时使用 Mock
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error('Payment failed:', error);
    return false;
  }
}
```

---

### 4. 错误处理策略

**创建文件**: `src/services/errorHandler.ts`

```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        return '请先登录';
      case 403:
        return '权限不足';
      case 404:
        return '资源不存在';
      case 409:
        return '操作冲突，请刷新后重试';
      case 500:
        return '服务器错误，请稍后重试';
      default:
        return error.message || '请求失败';
    }
  }

  if (error.message) {
    return error.message;
  }

  return '未知错误，请重试';
}
```

---

### 5. 加载状态管理

**创建 Hook**: `src/hooks/useApiRequest.ts`

```typescript
import { useState, useCallback } from 'react';
import { handleApiError } from '../services/errorHandler';

export function useApiRequest<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
}
```

---

## 🔧 环境配置

### 环境变量配置

**创建文件**: `.env`

```env
# API 配置
VITE_API_BASE_URL=http://localhost:8080/api

# Gemini API (保持原有)
VITE_GEMINI_API_KEY=your_api_key_here

# 开发模式
VITE_USE_MOCK_DATA=false
```

**开发环境**: `.env.development`
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=true
```

**生产环境**: `.env.production`
```env
VITE_API_BASE_URL=https://api.cinema-platform.com/api
VITE_USE_MOCK_DATA=false
```

---

## 📝 数据类型映射

### 后端 → 前端类型映射

| 后端字段 | 前端字段 | 转换说明 |
|---------|---------|---------|
| `basePrice` (分) | `price` (元) | 除以 100 |
| `displayName` | `name` | 直接映射 |
| `mainImage` | `image` | 直接映射 |
| `channelCategory` | `category` | 枚举映射 |
| `specTypes` | `options` | 结构转换 |

### 分类枚举映射

| 前端枚举 | 后端枚举 | 中文名称 |
|---------|---------|---------|
| `ALCOHOL` | `ALCOHOL` | 经典特调 |
| `COFFEE` | `COFFEE` | 精品咖啡 |
| `BEVERAGE` | `BEVERAGE` | 清爽饮品 |
| `SNACK` | `SNACK` | 主厨小食 |

---

## 🧪 测试策略

### API 测试清单

- [ ] 商品列表加载成功
- [ ] 商品列表按分类筛选
- [ ] 商品列表分页加载
- [ ] 商品详情加载成功
- [ ] 订单创建成功
- [ ] 订单列表加载成功
- [ ] 订单详情加载成功
- [ ] 网络错误降级到 Mock 数据
- [ ] 401 错误跳转登录
- [ ] 500 错误友好提示

### 手动测试步骤

1. **商品浏览测试**
   - 启动应用，查看商品列表是否正常加载
   - 切换分类，验证筛选功能
   - 点击商品，查看详情页

2. **订单创建测试**
   - 添加商品到购物车
   - 提交订单，验证创建成功
   - 检查订单号和取餐号生成

3. **订单查询测试**
   - 查看订单列表
   - 点击订单查看详情
   - 验证订单状态正确

---

## 🚨 风险与应对

### 风险1: API 不稳定
**影响**: 用户无法正常使用  
**应对**: 
- 实现降级方案，API 失败时使用 Mock 数据
- 显示友好的错误提示
- 添加重试机制

### 风险2: 认证失效
**影响**: 所有请求返回 401  
**应对**:
- 实现 token 自动刷新机制
- 认证失败时引导用户重新登录
- 本地保存认证状态

### 风险3: 数据格式不匹配
**影响**: 前端渲染错误  
**应对**:
- 严格的类型检查
- 数据转换层统一处理
- 添加数据验证

---

## 📈 性能优化

### 缓存策略
- 商品列表缓存 5 分钟
- 商品详情缓存 10 分钟
- 订单列表不缓存（实时性要求高）

### 请求优化
- 图片使用 CDN 加速
- 列表分页加载
- 防抖/节流处理搜索

---

## 📚 参考文档

1. **API 规格文档**: `docs/api/unified-api-spec.md`
2. **O006 规格**: `specs/O006-miniapp-channel-order/spec.md`
3. **原型代码**: `miniapp-ordering/App.tsx`

---

## 🔄 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|-----|------|---------|------|
| 2026-01-02 | v1.0 | 初始版本 | - |

---

## ✅ 下一步行动

### 立即执行
1. [ ] 创建 `apiClient.ts` 基础封装
2. [ ] 实现 `productService.ts` 商品服务
3. [ ] 实现 `orderService.ts` 订单服务
4. [ ] 配置环境变量
5. [ ] 修改 `App.tsx` 集成真实 API

### 待确认
1. [ ] 确认支付接口是否存在
2. [ ] 确认认证流程（JWT token 获取方式）
3. [ ] 确认后端 API 是否已部署

### 后续迭代
1. [ ] 开发会员系统 API
2. [ ] 开发优惠券系统 API
3. [ ] 开发积分商城 API
4. [ ] 集成真实支付接口

---

**文档维护**: 随着实施进展，本文档将持续更新
