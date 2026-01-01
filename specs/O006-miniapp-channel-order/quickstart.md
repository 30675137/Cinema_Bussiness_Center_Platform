# Quick Start Guide: 小程序渠道商品订单适配

**@spec O006-miniapp-channel-order**

本指南帮助开发者快速上手小程序渠道商品订单功能的开发。

## Prerequisites

在开始之前,确保你已经:

- [x] 安装 Node.js 18+
- [x] 安装微信开发者工具(用于小程序开发和调试)
- [x] 克隆项目代码仓库
- [x] 了解 Taro 4.1.9 框架基础
- [x] 了解 Zustand 状态管理
- [x] 阅读过 O003 和 O005 规格文档(了解订单流程和渠道商品架构)

## Environment Setup

### 1. 安装依赖

```bash
cd hall-reserve-taro
npm install
```

### 2. 配置环境变量

创建 `.env` 文件(如果不存在):

```bash
# API 基础 URL (本地开发)
TARO_APP_API_BASE_URL=http://localhost:8080

# Mock 数据开关 (可选,前期开发可使用 Mock)
TARO_APP_USE_MOCK=true
```

### 3. 启动开发服务器

#### 微信小程序开发

```bash
npm run dev:weapp
```

然后在微信开发者工具中打开 `dist` 目录,查看小程序效果。

#### H5 开发

```bash
npm run dev:h5
```

访问 http://localhost:10086 查看 H5 版本。

---

## Project Structure

### 文件组织

```
hall-reserve-taro/
├── src/
│   ├── types/
│   │   ├── channelProduct.ts        # ✨ 新增: 渠道商品类型定义
│   │   └── order.ts                 # 📝 修改: 订单类型(使用 channelProductId)
│   ├── services/
│   │   ├── channelProductService.ts # ✨ 新增: 渠道商品 API 调用
│   │   └── orderService.ts          # 📝 修改: 订单 API(使用新端点)
│   ├── stores/
│   │   ├── channelProductStore.ts   # ✨ 新增: 商品状态管理(可选)
│   │   └── orderCartStore.ts        # 📝 修改: 购物车(使用 channelProductId)
│   ├── pages/
│   │   ├── channel-product-menu/    # ✨ 新增: 渠道商品菜单页
│   │   ├── channel-product-detail/  # ✨ 新增: 渠道商品详情页
│   │   ├── order-cart/              # 📝 修改: 购物车页(适配新商品类型)
│   │   └── my-orders/               # ♻️  复用: O003 的订单列表/详情页
│   └── utils/
│       └── priceCalculator.ts       # ✨ 新增: 价格计算工具函数
```

**图例**:
- ✨ 新增文件
- 📝 修改文件
- ♻️  复用文件(无需修改)

---

## UI Prototype Migration

本项目需要将 `miniapp-ordering/` 文件夹中的原生微信小程序代码迁移到 Taro 框架。以下是迁移步骤和最佳实践。

### 第一步:分析原型结构

在开始编码前,先熟悉原型的页面结构和组件:

```bash
# 查看原型页面结构
ls miniapp-ordering/pages/

# 输出:
# menu-list/         - 菜单列表页
# product-detail/    - 商品详情页
# cart/              - 购物车页
# member/orders/     - 订单列表页
```

**关键文件映射**:

| 原型文件 | Taro 目标文件 | 说明 |
|---------|-------------|------|
| `miniapp-ordering/pages/menu-list/` | `hall-reserve-taro/src/pages/channel-product-menu/` | 菜单列表页 |
| `miniapp-ordering/pages/product-detail/` | `hall-reserve-taro/src/pages/channel-product-detail/` | 商品详情页 |
| `miniapp-ordering/pages/cart/` | `hall-reserve-taro/src/pages/order-cart/` | 购物车页 |
| `miniapp-ordering/pages/member/orders/` | `hall-reserve-taro/src/pages/member/my-orders/` | 订单列表页 |

### 第二步:提取样式变量

从原型中提取关键样式变量,统一管理在 Taro 项目中。

**创建样式变量文件** `hall-reserve-taro/src/styles/variables.scss`:

```scss
/**
 * @spec O006-miniapp-channel-order
 * 样式变量 - 从 miniapp-ordering 原型提取
 */

// 颜色变量
$color-primary: #FF6B35;        // 主色(橙红色,按钮、选中态)
$color-secondary: #F7931E;      // 辅助色(金黄色,推荐标签)
$color-text-primary: #333333;   // 主文本色
$color-text-secondary: #999999; // 辅助文本色
$color-bg-page: #F5F5F5;        // 页面背景色
$color-bg-card: #FFFFFF;        // 卡片背景色

// 字体变量
$font-size-xlarge: 32rpx;       // 大标题
$font-size-large: 28rpx;        // 小标题
$font-size-medium: 24rpx;       // 正文
$font-size-small: 20rpx;        // 辅助文字
$font-weight-bold: 600;         // 粗体
$font-weight-medium: 500;       // 中粗体
$line-height-base: 1.5;         // 行高

// 间距变量
$spacing-page: 24rpx;           // 页面边距
$spacing-card: 16rpx;           // 卡片间距
$spacing-inner: 32rpx;          // 组件内边距
$button-height: 88rpx;          // 按钮高度

// 圆角/阴影
$border-radius-card: 16rpx;     // 卡片圆角
$border-radius-button: 8rpx;    // 按钮圆角
$box-shadow-card: 0 4rpx 12rpx rgba(0,0,0,0.08);  // 卡片阴影
```

**使用样式变量**:

```less
// hall-reserve-taro/src/pages/channel-product-menu/index.less
@import '@/styles/variables.scss';

.product-card {
  background: $color-bg-card;
  border-radius: $border-radius-card;
  box-shadow: $box-shadow-card;
  padding: $spacing-inner;
  margin-bottom: $spacing-card;
}

.product-title {
  font-size: $font-size-large;
  color: $color-text-primary;
  font-weight: $font-weight-medium;
}

.product-price {
  font-size: $font-size-xlarge;
  color: $color-primary;
  font-weight: $font-weight-bold;
}
```

### 第三步:复制图片资源

将原型中的图片资源复制到 Taro 项目:

```bash
# 创建图片目录
mkdir -p hall-reserve-taro/src/assets/images

# 复制图片资源
cp miniapp-ordering/assets/*.png hall-reserve-taro/src/assets/images/

# 整理图片分类
mkdir -p hall-reserve-taro/src/assets/images/{icons,placeholders,categories}
```

**推荐的图片目录结构**:

```
hall-reserve-taro/src/assets/images/
├── icons/              # 操作图标
│   ├── cart.png
│   ├── cart-empty.png
│   ├── add.png
│   ├── minus.png
│   └── delete.png
├── categories/         # 分类图标
│   ├── coffee.png
│   ├── beverage.png
│   ├── snack.png
│   └── meal.png
├── orders/            # 订单状态图标
│   ├── pending.png
│   ├── completed.png
│   └── cancelled.png
└── placeholders/      # 占位图
    └── product.png
```

**图片引用示例**:

```typescript
// 引入图片
import iconCart from '@/assets/images/icons/cart.png'
import placeholderProduct from '@/assets/images/placeholders/product.png'

// 使用图片
<Image src={product.mainImage || placeholderProduct} />
<Image src={iconCart} className="cart-icon" />
```

### 第四步:对比原型重写页面

逐页对比原型,使用 Taro 重写 UI 组件。

**原型页面示例** (miniapp-ordering/pages/menu-list/index.wxml):
```xml
<!-- 原生小程序 WXML -->
<view class="menu-container">
  <view class="category-tabs">
    <view class="tab {{selectedCategory === 'COFFEE' ? 'active' : ''}}" bindtap="selectCategory" data-category="COFFEE">咖啡</view>
    <view class="tab {{selectedCategory === 'BEVERAGE' ? 'active' : ''}}" bindtap="selectCategory" data-category="BEVERAGE">饮料</view>
  </view>

  <scroll-view scroll-y class="product-list">
    <view class="product-card" wx:for="{{products}}" wx:key="id" bindtap="goToDetail" data-id="{{item.id}}">
      <image class="product-image" src="{{item.mainImage}}" mode="aspectFill" />
      <view class="product-info">
        <text class="product-name">{{item.displayName}}</text>
        <text class="product-price">¥{{item.basePrice / 100}}</text>
      </view>
    </view>
  </scroll-view>
</view>
```

**Taro 重写版本** (hall-reserve-taro/src/pages/channel-product-menu/index.tsx):
```tsx
/**
 * @spec O006-miniapp-channel-order
 * 渠道商品菜单页 - 从 miniapp-ordering/pages/menu-list 迁移
 */
import Taro from '@tarojs/taro'
import { View, ScrollView, Image } from '@tarojs/components'
import { useState } from 'react'
import { useChannelProducts } from '@/hooks/useChannelProducts'
import { ChannelCategory } from '@/types/channelProduct'
import placeholderProduct from '@/assets/images/placeholders/product.png'
import './index.less'

const ChannelProductMenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | undefined>()
  const { data: products, isLoading } = useChannelProducts(selectedCategory)

  const handleCategorySelect = (category: ChannelCategory) => {
    setSelectedCategory(category)
  }

  const handleProductClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/channel-product-detail/index?id=${productId}` })
  }

  return (
    <View className="menu-container">
      {/* 分类标签栏 */}
      <View className="category-tabs">
        <View
          className={`tab ${selectedCategory === ChannelCategory.COFFEE ? 'active' : ''}`}
          onClick={() => handleCategorySelect(ChannelCategory.COFFEE)}
        >
          咖啡
        </View>
        <View
          className={`tab ${selectedCategory === ChannelCategory.BEVERAGE ? 'active' : ''}`}
          onClick={() => handleCategorySelect(ChannelCategory.BEVERAGE)}
        >
          饮料
        </View>
      </View>

      {/* 商品列表 */}
      <ScrollView scrollY className="product-list">
        {isLoading && <View className="loading">加载中...</View>}
        {products?.map(product => (
          <View
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product.id)}
          >
            <Image
              className="product-image"
              src={product.mainImage || placeholderProduct}
              mode="aspectFill"
            />
            <View className="product-info">
              <View className="product-name">{product.displayName}</View>
              <View className="product-price">¥{(product.basePrice / 100).toFixed(2)}</View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default ChannelProductMenuPage
```

**关键迁移点对照**:

| 原型代码 | Taro 替换 | 说明 |
|---------|---------|------|
| `<view>` | `<View>` | Taro 组件大写开头 |
| `<scroll-view>` | `<ScrollView>` | 同上 |
| `wx:for="{{products}}"` | `{products?.map(product => ...)}` | React map 渲染 |
| `bindtap="goToDetail"` | `onClick={() => handleProductClick()}` | React 事件处理 |
| `{{item.displayName}}` | `{product.displayName}` | JSX 表达式 |
| `wx.navigateTo()` | `Taro.navigateTo()` | Taro 统一 API |

### 第五步:验证 UI 一致性

完成页面重写后,对比验证 UI 表现:

1. **微信小程序端验证**:
   ```bash
   npm run dev:weapp
   # 在微信开发者工具中打开 dist 目录
   # 对比原型和 Taro 实现的截图
   ```

2. **H5 端验证**:
   ```bash
   npm run dev:h5
   # 访问 http://localhost:10086
   # 使用浏览器开发者工具模拟移动端设备
   ```

3. **检查清单**:
   - [ ] 布局结构与原型一致
   - [ ] 颜色、字体、间距与原型一致
   - [ ] 交互逻辑(点击、滚动、弹窗)与原型一致
   - [ ] 图片资源正常加载
   - [ ] 页面跳转正常
   - [ ] 小程序和 H5 两端表现一致

**调试技巧**:

```bash
# 使用微信开发者工具的真机调试功能
# 工具栏 → 预览 → 真机调试

# 对比截图(推荐工具: Beyond Compare, Kaleidoscope)
# 原型截图路径: miniapp-ordering/screenshots/
# Taro 实现截图: 在开发者工具中手动截图
```

---

## Development Workflow

### Step 1: 创建类型定义

首先定义 TypeScript 类型,确保前后端类型一致。

**文件**: `hall-reserve-taro/src/types/channelProduct.ts`

```typescript
/**
 * @spec O006-miniapp-channel-order
 * 渠道商品类型定义
 */

// 渠道分类枚举
export enum ChannelCategory {
  ALCOHOL = 'ALCOHOL',
  COFFEE = 'COFFEE',
  BEVERAGE = 'BEVERAGE',
  SNACK = 'SNACK',
  MEAL = 'MEAL',
  OTHER = 'OTHER'
}

// 规格类型枚举(7 种)
export enum SpecType {
  SIZE = 'SIZE',
  TEMPERATURE = 'TEMPERATURE',
  SWEETNESS = 'SWEETNESS',
  TOPPING = 'TOPPING',
  SPICINESS = 'SPICINESS',
  SIDE = 'SIDE',
  COOKING = 'COOKING'
}

// 渠道商品 DTO
export interface ChannelProductDTO {
  id: string
  skuId: string
  channelType: 'MINI_PROGRAM'
  channelCategory: ChannelCategory
  displayName: string
  basePrice: number
  mainImage: string
  detailImages: string[]
  status: 'ACTIVE' | 'INACTIVE'
  isRecommended: boolean
  sortOrder: number
}

// 完整定义见 data-model.md
```

---

### Step 2: 实现 API 服务层

使用 Taro.request 封装 API 调用。

**文件**: `hall-reserve-taro/src/services/channelProductService.ts`

```typescript
/**
 * @spec O006-miniapp-channel-order
 * 渠道商品 API 服务
 */
import Taro from '@tarojs/taro'
import type { ChannelProductDTO, ChannelProductSpecDTO } from '../types/channelProduct'

const API_BASE = process.env.TARO_APP_API_BASE_URL || 'http://localhost:8080'

// 获取商品列表
export const fetchChannelProducts = async (category?: ChannelCategory) => {
  const res = await Taro.request<{ success: boolean; data: ChannelProductDTO[] }>({
    url: `${API_BASE}/api/client/channel-products/mini-program`,
    method: 'GET',
    data: category ? { category } : {},
    header: {
      Authorization: `Bearer ${Taro.getStorageSync('userToken')}`
    }
  })

  if (!res.data.success) {
    throw new Error('Failed to fetch channel products')
  }

  return res.data.data
}

// 获取商品详情
export const fetchChannelProductDetail = async (id: string) => {
  // 实现类似逻辑
}

// 获取商品规格
export const fetchChannelProductSpecs = async (id: string) => {
  // 实现类似逻辑
}
```

**关键点**:
- 使用 `Taro.request` 而非 `fetch`(多端兼容)
- 从 `Taro.getStorageSync('userToken')` 获取认证 Token
- 错误处理:检查 `success` 字段

---

### Step 3: 使用 TanStack Query

使用 TanStack Query 管理服务器状态,提供缓存和重试能力。

**文件**: `hall-reserve-taro/src/hooks/useChannelProducts.ts`

```typescript
/**
 * @spec O006-miniapp-channel-order
 * 渠道商品查询 Hook
 */
import { useQuery } from '@tanstack/react-query'
import { fetchChannelProducts } from '../services/channelProductService'
import type { ChannelCategory } from '../types/channelProduct'

export const useChannelProducts = (category?: ChannelCategory) => {
  return useQuery({
    queryKey: ['channel-products', 'mini-program', category],
    queryFn: () => fetchChannelProducts(category),
    staleTime: 5 * 60 * 1000, // 5 分钟缓存
    gcTime: 10 * 60 * 1000,   // 10 分钟后清除未使用缓存
    retry: 3                   // 失败自动重试 3 次
  })
}
```

**使用示例**:

```typescript
const ProductListPage = () => {
  const { data: products, isLoading, error } = useChannelProducts()

  if (isLoading) return <Loading />
  if (error) return <ErrorView message={error.message} />

  return (
    <View>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </View>
  )
}
```

---

### Step 4: 实现购物车 Store

使用 Zustand 管理购物车状态。

**文件**: `hall-reserve-taro/src/stores/orderCartStore.ts`

```typescript
/**
 * @spec O006-miniapp-channel-order
 * 购物车 Store
 */
import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { CartItem, ChannelProductDTO, SelectedSpec, SpecType } from '../types/channelProduct'
import { calculateUnitPrice } from '../utils/priceCalculator'

interface CartStore {
  items: CartItem[]
  totalQuantity: number
  totalPrice: number

  addItem: (product: ChannelProductDTO, selectedSpecs: Record<SpecType, SelectedSpec>) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  removeItem: (cartItemId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  get totalQuantity() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  get totalPrice() {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0)
  },

  addItem: (product, selectedSpecs) => {
    const unitPrice = calculateUnitPrice(product.basePrice, selectedSpecs)
    const newItem: CartItem = {
      cartItemId: uuid(),
      channelProductId: product.id,
      productName: product.displayName,
      productImage: product.mainImage,
      basePrice: product.basePrice,
      selectedSpecs,
      quantity: 1,
      unitPrice,
      subtotal: unitPrice
    }
    set(state => ({ items: [...state.items, newItem] }))
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId)
      return
    }
    set(state => ({
      items: state.items.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity, subtotal: item.unitPrice * quantity }
          : item
      )
    }))
  },

  removeItem: (cartItemId) => {
    set(state => ({ items: state.items.filter(item => item.cartItemId !== cartItemId) }))
  },

  clearCart: () => set({ items: [] })
}))
```

---

### Step 5: 实现商品菜单页

**文件**: `hall-reserve-taro/src/pages/channel-product-menu/index.tsx`

```typescript
/**
 * @spec O006-miniapp-channel-order
 * 渠道商品菜单页
 */
import Taro from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import { useChannelProducts } from '../../hooks/useChannelProducts'
import { ChannelCategory } from '../../types/channelProduct'
import { ProductCard } from '../../components/ProductCard'
import { CategoryTabs } from '../../components/CategoryTabs'
import './index.less'

const ChannelProductMenuPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | undefined>()
  const { data: products, isLoading, error } = useChannelProducts(selectedCategory)

  const handleProductClick = (productId: string) => {
    Taro.navigateTo({ url: `/pages/channel-product-detail/index?id=${productId}` })
  }

  return (
    <View className="channel-product-menu">
      {/* 分类标签栏 */}
      <CategoryTabs
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      {/* 商品列表 */}
      <ScrollView scrollY className="product-list">
        {isLoading && <Loading />}
        {error && <ErrorView message={error.message} />}
        {products?.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleProductClick(product.id)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default ChannelProductMenuPage
```

**样式文件**: `index.less`

```less
/**
 * @spec O006-miniapp-channel-order
 */
.channel-product-menu {
  min-height: 100vh;
  background: #f5f5f5;

  .product-list {
    height: calc(100vh - 100rpx);
    padding: 24rpx;
  }
}
```

---

### Step 6: 实现商品详情页

**文件**: `hall-reserve-taro/src/pages/channel-product-detail/index.tsx`

**关键功能**:
- 显示商品详情(名称、主图、详情图、描述、价格)
- 规格选择器(支持 7 种规格类型)
- 实时价格计算
- 必选规格验证
- 加入购物车

**参考**: O003 的 `beverage-detail` 页面实现模式

---

### Step 7: 测试流程

#### 单元测试

```bash
npm run test
```

**测试文件示例**: `src/utils/priceCalculator.test.ts`

```typescript
/**
 * @spec O006-miniapp-channel-order
 */
import { describe, it, expect } from 'vitest'
import { calculateUnitPrice } from './priceCalculator'
import { SpecType } from '../types/channelProduct'

describe('Price Calculator', () => {
  it('should calculate correct unit price with multiple specs', () => {
    const basePrice = 2800 // 28元
    const selectedSpecs = {
      [SpecType.SIZE]: { priceAdjustment: 500 },      // 大杯 +5元
      [SpecType.TEMPERATURE]: { priceAdjustment: 0 }, // 热 +0元
      [SpecType.TOPPING]: { priceAdjustment: 300 }    // 加珍珠 +3元
    }

    const result = calculateUnitPrice(basePrice, selectedSpecs)
    expect(result).toBe(3600) // 28 + 5 + 3 = 36元
  })

  it('should handle negative price adjustment (discount)', () => {
    const basePrice = 2800
    const selectedSpecs = {
      [SpecType.SIZE]: { priceAdjustment: -300 } // 小杯 -3元
    }

    const result = calculateUnitPrice(basePrice, selectedSpecs)
    expect(result).toBe(2500) // 28 - 3 = 25元
  })
})
```

#### 微信开发者工具调试

1. 打开微信开发者工具
2. 导入项目(`dist` 目录)
3. 在"真机调试"中测试完整流程:
   - 浏览商品列表
   - 查看商品详情
   - 选择规格
   - 加入购物车
   - 提交订单
   - Mock 支付
   - 查看订单状态

---

## Common Tasks

### 添加新的规格类型

如果需要支持新的规格类型(如"份量"、"酱料"):

1. 在 `SpecType` 枚举中添加新类型
2. 更新规格选择器组件,支持新类型的 UI 展示
3. 确保价格计算逻辑兼容新规格
4. 更新单元测试

### 调试 API 请求

```bash
# 在 .env 中启用日志
LOG_LEVEL=debug

# 在代码中打印请求
console.log('API Request:', { url, method, data })
console.log('API Response:', res.data)
```

### 使用 Mock 数据开发

如果后端 API 尚未ready,可以使用 Mock 数据:

**文件**: `src/mocks/channelProducts.ts`

```typescript
export const mockChannelProducts = [
  {
    id: 'mock-001',
    displayName: '美式咖啡',
    basePrice: 2800,
    channelCategory: 'COFFEE',
    // ... 其他字段
  }
]
```

在服务层中使用:

```typescript
export const fetchChannelProducts = async () => {
  if (process.env.TARO_APP_USE_MOCK === 'true') {
    return mockChannelProducts
  }
  // 真实 API 调用
}
```

---

## Troubleshooting

### 问题: Token 过期导致 401 错误

**解决方案**: 实现 Token 自动刷新逻辑

```typescript
// src/utils/request.ts
const handleTokenExpired = async () => {
  const refreshToken = Taro.getStorageSync('refreshToken')
  const res = await Taro.request({
    url: '/api/auth/refresh',
    method: 'POST',
    data: { refreshToken }
  })
  Taro.setStorageSync('userToken', res.data.accessToken)
  return res.data.accessToken
}
```

### 问题: 图片加载失败

**原因**: 微信小程序对图片域名有白名单限制

**解决方案**:
1. 在微信公众平台配置服务器域名(需要 HTTPS)
2. 开发阶段:在开发者工具中"详情→本地设置→不校验合法域名"

### 问题: 样式在 H5 和小程序表现不一致

**解决方案**: 使用 Taro 条件编译

```less
.product-card {
  padding: 24rpx;

  /* 小程序专属样式 */
  /* #ifdef WEAPP */
  border-radius: 16rpx;
  /* #endif */

  /* H5 专属样式 */
  /* #ifdef H5 */
  border-radius: 8px;
  /* #endif */
}
```

---

## Next Steps

完成开发后,继续以下步骤:

1. **运行完整测试套件**: `npm run test`
2. **运行代码检查**: `npm run lint`
3. **构建生产版本**: `npm run build:weapp` / `npm run build:h5`
4. **创建 Pull Request**: 提交代码审查
5. **更新文档**: 如有新增功能,更新 spec.md 和 data-model.md

---

## References

- [Taro 官方文档](https://docs.taro.zone/)
- [TanStack Query 文档](https://tanstack.com/query/latest)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [O003 规格文档](../../O003-beverage-order/spec.md)
- [O005 规格文档](../../O005-channel-product-config/spec.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api.yaml)

---

**Happy Coding! 🎉**

如有问题,请联系团队或查看项目 Wiki。
