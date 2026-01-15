# Data Model: 小程序购物车功能

**Feature**: O010-shopping-cart
**Created**: 2026-01-06
**Status**: Phase 1 Design

---

## 概述

本文档定义购物车功能的核心数据模型，包括 TypeScript 接口、数据验证规则和本地存储结构。购物车功能为纯前端实现，使用 Taro 本地存储持久化数据，不涉及后端 API 同步。

## 核心实体

### 1. CartProduct

**说明**: 购物车中存储的商品基本信息（Product 的子集）

```typescript
/**
 * @spec O010-shopping-cart
 * 购物车商品信息
 */
interface CartProduct {
  /** 商品唯一标识符 */
  id: string

  /** 商品名称 */
  name: string

  /** 商品价格（单位：分） */
  price: number

  /** 商品主图 URL */
  image: string

  /** 是否为推荐商品（可选） */
  isRecommended?: boolean
}
```

**字段说明**:
- `id`: 商品唯一标识符，用于购物车去重和数量更新
- `name`: 商品名称，显示在购物车列表中
- `price`: **必须以"分"为单位存储**，避免浮点数精度问题（如 28.00 元存储为 2800 分）
- `image`: 商品主图 URL，需要符合 Taro Image 组件要求（支持 HTTPS、相对路径、本地资源）
- `isRecommended`: 可选字段，用于标识推荐商品

**数据验证规则**:
```typescript
// 验证商品价格必须为正整数（分）
const isValidPrice = (price: number): boolean => {
  return Number.isInteger(price) && price > 0
}

// 验证商品 ID 非空
const isValidProductId = (id: string): boolean => {
  return typeof id === 'string' && id.trim().length > 0
}
```

---

### 2. CartItem

**说明**: 购物车中的单个条目，包含商品信息、数量和选项

```typescript
/**
 * @spec O010-shopping-cart
 * 购物车项
 */
interface CartItem {
  /** 商品信息 */
  product: CartProduct

  /** 购买数量（必须 > 0） */
  quantity: number

  /** 商品选项（如冰量、糖度） */
  selectedOptions?: Record<string, string>

  /** 是否为积分兑换商品（可选功能） */
  isRedemption?: boolean
}
```

**字段说明**:
- `product`: 关联的商品信息（CartProduct 类型）
- `quantity`: 购买数量，**必须为正整数**，数量减至 0 时自动从购物车移除
- `selectedOptions`: 商品选项，键值对格式（如 `{ "冰量": "少冰", "糖度": "半糖" }`）
  - 用于区分同一商品的不同配置
  - 未来可扩展为商品规格选择器
- `isRedemption`: 标识是否为积分兑换商品（暂不实现，预留字段）

**数据验证规则**:
```typescript
// 验证购物车项是否有效
const isValidCartItem = (item: CartItem): boolean => {
  return (
    item.product &&
    typeof item.product.id === 'string' &&
    typeof item.product.price === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    Number.isInteger(item.quantity)
  )
}
```

**去重逻辑**:
- 相同商品 ID + 相同选项组合 = 同一购物车项（累加数量）
- 不同选项组合 = 不同购物车项（分别计数）

```typescript
// 示例：同一商品不同选项
const cart: CartItem[] = [
  {
    product: { id: 'P001', name: '美式咖啡', price: 2800, image: 'url1' },
    quantity: 2,
    selectedOptions: { '糖度': '无糖', '冰量': '正常冰' }
  },
  {
    product: { id: 'P001', name: '美式咖啡', price: 2800, image: 'url1' },
    quantity: 1,
    selectedOptions: { '糖度': '半糖', '冰量': '少冰' }
  }
]
// 总件数：3（2 + 1），但属于不同配置的同一商品
```

---

### 3. Cart

**说明**: 购物车整体状态（计算值，非存储结构）

```typescript
/**
 * @spec O010-shopping-cart
 * 购物车（计算值）
 */
interface Cart {
  /** 购物车项列表 */
  items: CartItem[]

  /** 总件数（所有商品数量之和） */
  totalItems: number

  /** 小计（所有商品价格 * 数量之和，单位：分） */
  subtotal: number

  /** 购物车总金额（小计 - 优惠，单位：分） */
  cartTotal: number
}
```

**计算逻辑**:
```typescript
// 计算总件数
const calculateTotalItems = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

// 计算小计（分）
const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
}

// 计算总金额（分）- 当前版本无优惠功能，cartTotal = subtotal
const calculateCartTotal = (items: CartItem[]): number => {
  const subtotal = calculateSubtotal(items)
  const discount = 0  // 未来可扩展为优惠金额
  return subtotal - discount
}
```

**字段说明**:
- `items`: 购物车项数组，直接从 Zustand store 获取
- `totalItems`: **计算值**，用于显示浮动购物车按钮角标
- `subtotal`: **计算值**，用于购物车抽屉底部"小计"显示
- `cartTotal`: **计算值**，用于购物车抽屉底部"实付金额"显示

**注意**: Cart 接口**不存储到本地**，仅作为 Zustand store 的计算值返回。本地存储仅保存 `CartItem[]` 数组。

---

### 4. CartState

**说明**: Zustand 购物车状态管理 Store 接口

```typescript
/**
 * @spec O010-shopping-cart
 * Zustand 购物车状态管理
 */
interface CartState {
  // ========== 状态 ==========

  /** 购物车项列表 */
  cart: CartItem[]

  /** 购物车抽屉是否打开 */
  isCartOpen: boolean

  // ========== 动作 ==========

  /**
   * 添加商品到购物车
   * @param product 商品信息
   * @param quantity 数量（默认 1）
   * @param selectedOptions 商品选项（可选）
   */
  addToCart: (product: CartProduct, quantity?: number, selectedOptions?: Record<string, string>) => void

  /**
   * 更新商品数量（增量更新）
   * @param productId 商品 ID
   * @param delta 数量变化值（+1 或 -1）
   * @param selectedOptions 商品选项（可选，用于区分不同配置）
   */
  updateQuantity: (productId: string, delta: number, selectedOptions?: Record<string, string>) => void

  /**
   * 从购物车移除商品
   * @param productId 商品 ID
   * @param selectedOptions 商品选项（可选）
   */
  removeFromCart: (productId: string, selectedOptions?: Record<string, string>) => void

  /**
   * 清空购物车
   */
  clearCart: () => void

  /**
   * 切换购物车抽屉显示状态
   */
  toggleCartDrawer: () => void

  /**
   * 设置购物车抽屉显示状态
   * @param open 是否打开
   */
  setCartOpen: (open: boolean) => void

  // ========== 计算值（Selectors） ==========

  /**
   * 获取购物车总件数
   * @returns 所有商品数量之和
   */
  totalItems: () => number

  /**
   * 获取购物车小计（分）
   * @returns 所有商品价格 * 数量之和
   */
  subtotal: () => number

  /**
   * 获取购物车总金额（分）
   * @returns 小计 - 优惠金额
   */
  cartTotal: () => number

  /**
   * 获取指定商品的数量
   * @param productId 商品 ID
   * @param selectedOptions 商品选项（可选）
   * @returns 商品数量（不存在返回 0）
   */
  getProductQuantity: (productId: string, selectedOptions?: Record<string, string>) => number
}
```

**实现要点**:

1. **状态持久化**: 每次 `cart` 状态变更后，自动调用 `Taro.setStorageSync('cart', newCart)` 同步到本地存储

2. **选项匹配逻辑**:
```typescript
// 匹配商品 ID + 选项组合
const matchCartItem = (item: CartItem, productId: string, selectedOptions?: Record<string, string>): boolean => {
  if (item.product.id !== productId) return false
  if (!selectedOptions) return !item.selectedOptions || Object.keys(item.selectedOptions).length === 0
  return JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
}
```

3. **数量更新自动过滤**: `updateQuantity` 方法在数量减至 0 时自动移除该购物车项

4. **计算值使用 useMemo**: 在组件中使用 Zustand selectors 时，搭配 `useMemo` 优化性能

---

## 本地存储结构

### Storage Key

```typescript
const CART_STORAGE_KEY = 'cart'
```

### Storage Data Structure

**存储内容**: `CartItem[]` 数组

**示例数据**:
```json
[
  {
    "product": {
      "id": "P001",
      "name": "美式咖啡",
      "price": 2800,
      "image": "https://example.com/images/coffee.jpg",
      "isRecommended": true
    },
    "quantity": 2,
    "selectedOptions": {
      "糖度": "无糖",
      "冰量": "正常冰"
    }
  },
  {
    "product": {
      "id": "P002",
      "name": "拿铁咖啡",
      "price": 3200,
      "image": "https://example.com/images/latte.jpg"
    },
    "quantity": 1
  }
]
```

### 存储操作封装

```typescript
/**
 * @spec O010-shopping-cart
 * 购物车本地存储工具
 */

import Taro from '@tarojs/taro'
import type { CartItem } from '@/types/cart'

const CART_STORAGE_KEY = 'cart'

/**
 * 保存购物车到本地存储
 */
export const saveCart = (cart: CartItem[]): void => {
  try {
    Taro.setStorageSync(CART_STORAGE_KEY, cart)
  } catch (error) {
    console.error('Failed to save cart:', error)
  }
}

/**
 * 从本地存储加载购物车
 * @returns 购物车项数组（如果加载失败或数据无效，返回空数组）
 */
export const loadCart = (): CartItem[] => {
  try {
    const cart = Taro.getStorageSync(CART_STORAGE_KEY)

    // 验证数据结构
    if (!Array.isArray(cart)) {
      console.warn('Invalid cart data structure, resetting to empty cart')
      return []
    }

    // 过滤无效项
    const validItems = cart.filter(item =>
      item.product &&
      typeof item.product.id === 'string' &&
      typeof item.product.price === 'number' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    )

    // 如果有无效项被过滤，更新存储
    if (validItems.length !== cart.length) {
      console.warn(`Filtered ${cart.length - validItems.length} invalid cart items`)
      saveCart(validItems)
    }

    return validItems
  } catch (error) {
    console.error('Failed to load cart:', error)
    return []
  }
}

/**
 * 清空购物车本地存储
 */
export const clearCart = (): void => {
  try {
    Taro.removeStorageSync(CART_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear cart:', error)
  }
}
```

---

## 价格格式化

### 价格显示规则

- **存储格式**: 整数（分）
- **显示格式**: 字符串（元）
- **转换逻辑**: `价格（元） = 价格（分） / 100`

### 格式化函数

```typescript
/**
 * @spec O010-shopping-cart
 * 价格格式化工具（复用 O009）
 */

/**
 * 将价格从"分"转换为"元"并格式化为字符串
 * @param priceInCents 价格（分）
 * @returns 格式化后的价格字符串（如 "¥28" 或 "¥28.50"）
 */
export const formatPrice = (priceInCents: number): string => {
  if (!Number.isInteger(priceInCents) || priceInCents < 0) {
    console.warn(`Invalid price: ${priceInCents}`)
    return '¥0'
  }

  const yuan = priceInCents / 100

  // 如果是整数（如 2800 分 = 28 元），显示为 "¥28"
  if (yuan % 1 === 0) {
    return `¥${yuan}`
  }

  // 如果有小数（如 2850 分 = 28.50 元），显示为 "¥28.50"
  return `¥${yuan.toFixed(2)}`
}
```

**示例**:
```typescript
formatPrice(2800)  // "¥28"
formatPrice(2850)  // "¥28.50"
formatPrice(100)   // "¥1"
formatPrice(0)     // "¥0"
formatPrice(-100)  // "¥0" (无效价格)
```

---

## 数据流图

```
用户操作
  ↓
UI 组件
  ↓
Zustand Actions (addToCart, updateQuantity, removeFromCart)
  ↓
更新 cart 状态
  ↓
Taro.setStorageSync('cart', newCart) ← 持久化到本地存储
  ↓
Zustand Selectors (totalItems, cartTotal) ← 计算值更新
  ↓
UI 自动重新渲染（React 响应式更新）
```

---

## 数据验证规则汇总

| 验证项 | 规则 | 错误处理 |
|--------|------|---------|
| 商品 ID | 非空字符串 | 过滤掉无效项 |
| 商品价格 | 正整数（分） | 过滤掉无效项 |
| 购买数量 | 正整数 | 过滤掉无效项 |
| 购物车数组 | Array 类型 | 重置为空数组 |
| 本地存储读取失败 | try-catch | 返回空数组 |

---

## 扩展点

### 未来可能的扩展（不在当前 Spec 范围内）

1. **优惠券/折扣计算**:
   - 扩展 `Cart` 接口增加 `discount` 字段
   - 修改 `cartTotal` 计算逻辑：`subtotal - discount`

2. **积分抵扣**:
   - 使用 `CartItem.isRedemption` 标识积分兑换商品
   - 增加积分抵扣计算逻辑

3. **库存校验**:
   - 在结算时调用后端 API 校验库存
   - 购物车本地数据不校验库存

4. **商品规格选择器**:
   - 扩展 `selectedOptions` 支持复杂规格（如颜色+尺寸组合）
   - 增加规格价格差异计算

5. **购物车同步到后端**:
   - 增加后端 API 接口存储用户购物车
   - 实现多端同步（小程序 + H5 + App）

---

## 参考文档

- **Spec 文档**: `specs/O010-shopping-cart/spec.md`
- **Plan 文档**: `specs/O010-shopping-cart/plan.md`
- **UI 原型**: `/Users/lining/qoder/ui_demo/Cinema_Bussiness_Cente_UI_DEMO/wechat-multi-entertainment-ordering`
- **O009 价格格式化**: `hall-reserve-taro/src/utils/priceFormatter.ts` (复用)

---

**Created by**: Claude Code
**Branch**: O010-shopping-cart
**Phase**: Phase 1 - Design & Contracts
