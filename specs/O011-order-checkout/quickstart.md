# Quickstart: 小程序订单确认与支付

**Feature**: O011-order-checkout
**Date**: 2026-01-06
**Prerequisites**: O010-shopping-cart 购物车功能已完成

## Quick Start

### 1. 环境准备

```bash
# 进入 Taro 项目目录
cd miniapp-ordering-taro

# 安装依赖（如果尚未安装）
npm install

# 启动 H5 开发服务器
npm run dev:h5
# 或启动微信小程序开发
npm run dev:weapp
```

### 2. 功能入口

1. 打开应用，进入菜单页
2. 添加商品到购物车
3. 点击购物车悬浮按钮打开购物车抽屉
4. 点击"立即支付"按钮进入订单确认页

### 3. 测试流程

```
购物车 ──[立即支付]──▶ 订单确认页 ──[确认支付]──▶ 支付方式抽屉
                            │                          │
                            │                    [选择支付方式]
                            │                          │
                            ▼                          ▼
                       [输入备注]              [支付加载动画 1.5s]
                                                       │
                                                       ▼
                                               支付成功页
                                              (订单号 + 取餐编号)
                                                       │
                                                [返回首页]
                                                       │
                                                       ▼
                                               菜单页（购物车已清空）
```

---

## Development Guide

### 文件创建清单

```bash
# 新增页面
miniapp-ordering-taro/src/pages/order-confirm/
├── index.tsx          # 订单确认页组件
├── index.less         # 页面样式
└── index.config.ts    # 页面配置

miniapp-ordering-taro/src/pages/order-success/
├── index.tsx          # 支付成功页组件
├── index.less         # 页面样式
└── index.config.ts    # 页面配置

# 新增组件
miniapp-ordering-taro/src/components/PaymentSheet/
├── index.tsx          # 支付方式选择抽屉
└── index.less         # 组件样式

# 新增服务和类型
miniapp-ordering-taro/src/services/orderService.ts   # 订单服务
miniapp-ordering-taro/src/types/order.ts             # 订单类型定义

# 更新文件
miniapp-ordering-taro/src/app.config.ts              # 路由注册
```

### 路由配置

更新 `app.config.ts`，添加新页面路由：

```typescript
export default defineAppConfig({
  pages: [
    'pages/menu/index',
    'pages/order/index',
    'pages/order-confirm/index',  // 新增
    'pages/order-success/index',  // 新增
  ],
  // ... 其他配置
})
```

### 类型定义

在 `src/types/order.ts` 中定义订单类型：

```typescript
/**
 * @spec O011-order-checkout
 */

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type PaymentMethod = 'WECHAT_PAY' | 'ALIPAY' | 'APPLE_PAY'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productSpec: string | null
  productImage: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  createdAt: string
}

export interface CinemaOrder {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  productTotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  paymentMethod: PaymentMethod | null
  paymentTime: string | null
  createdAt: string
  updatedAt: string
  version: number
  items: OrderItem[]
  pickupNumber: string
  remark: string
}
```

### 订单服务

在 `src/services/orderService.ts` 中实现核心函数：

```typescript
/**
 * @spec O011-order-checkout
 */
import Taro from '@tarojs/taro'
import type { CinemaOrder, OrderItem, PaymentMethod } from '../types/order'
import { OrderStatus } from '../types/order'
import type { CartItem } from '../types/cart'

// 生成 UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 生成订单号
export const generateOrderNumber = (): string => {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomStr = ''
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `ORD${dateStr}${randomStr}`
}

// 生成取餐编号
export const generatePickupNumber = (): string => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let counter = Taro.getStorageSync('pickupNumberCounter') || {
    date: today,
    letter: 'A',
    number: 0
  }

  if (counter.date !== today) {
    counter = { date: today, letter: 'A', number: 0 }
  }

  counter.number += 1

  if (counter.number > 999) {
    counter.number = 1
    counter.letter = String.fromCharCode(counter.letter.charCodeAt(0) + 1)
    if (counter.letter > 'Z') {
      counter.letter = 'A'
    }
  }

  Taro.setStorageSync('pickupNumberCounter', counter)
  return `${counter.letter}${counter.number.toString().padStart(3, '0')}`
}

// 购物车项转订单项
const convertCartToOrderItems = (
  cartItems: CartItem[],
  orderId: string
): OrderItem[] => {
  return cartItems.map(item => ({
    id: generateUUID(),
    orderId,
    productId: item.product.id,
    productName: item.product.name,
    productSpec: Object.entries(item.selectedOptions || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || null,
    productImage: item.product.image,
    quantity: item.quantity,
    unitPrice: item.product.price,
    subtotal: item.product.price * item.quantity,
    createdAt: new Date().toISOString()
  }))
}

// 创建订单
export const createOrder = (
  cartItems: CartItem[],
  totalAmount: number,
  paymentMethod: PaymentMethod,
  remark: string = ''
): CinemaOrder => {
  const orderId = generateUUID()
  const now = new Date().toISOString()

  const order: CinemaOrder = {
    id: orderId,
    orderNumber: generateOrderNumber(),
    userId: 'mock-user-001',
    status: OrderStatus.PAID,
    productTotal: totalAmount,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount,
    paymentMethod,
    paymentTime: now,
    createdAt: now,
    updatedAt: now,
    version: 1,
    items: convertCartToOrderItems(cartItems, orderId),
    pickupNumber: generatePickupNumber(),
    remark
  }

  return order
}

// 保存订单到本地存储
export const saveOrder = (order: CinemaOrder): void => {
  const orders: CinemaOrder[] = Taro.getStorageSync('orders') || []
  orders.unshift(order) // 最新订单在前
  Taro.setStorageSync('orders', orders)
}

// 获取本地订单列表
export const getOrders = (): CinemaOrder[] => {
  return Taro.getStorageSync('orders') || []
}
```

---

## Testing Guide

### 单元测试用例

```typescript
// __tests__/services/orderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateOrderNumber,
  generatePickupNumber,
  createOrder
} from '../../src/services/orderService'

describe('orderService', () => {
  describe('generateOrderNumber', () => {
    it('应该生成 ORD + 日期 + 6位随机字符格式的订单号', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toMatch(/^ORD\d{8}[A-Z0-9]{6}$/)
    })

    it('应该生成唯一的订单号', () => {
      const orderNumbers = new Set()
      for (let i = 0; i < 100; i++) {
        orderNumbers.add(generateOrderNumber())
      }
      expect(orderNumbers.size).toBe(100)
    })
  })

  describe('generatePickupNumber', () => {
    beforeEach(() => {
      // Mock Taro storage
      vi.mock('@tarojs/taro', () => ({
        getStorageSync: vi.fn(),
        setStorageSync: vi.fn()
      }))
    })

    it('应该生成 字母 + 3位数字格式的取餐编号', () => {
      const pickupNumber = generatePickupNumber()
      expect(pickupNumber).toMatch(/^[A-Z]\d{3}$/)
    })
  })

  describe('createOrder', () => {
    it('应该正确创建订单', () => {
      const cartItems = [{
        product: { id: 'p1', name: '可乐', price: 1000, image: '' },
        quantity: 2,
        selectedOptions: { size: '大杯' }
      }]

      const order = createOrder(cartItems, 2000, 'WECHAT_PAY', '少冰')

      expect(order.orderNumber).toMatch(/^ORD/)
      expect(order.pickupNumber).toMatch(/^[A-Z]\d{3}$/)
      expect(order.totalAmount).toBe(2000)
      expect(order.paymentMethod).toBe('WECHAT_PAY')
      expect(order.remark).toBe('少冰')
      expect(order.items).toHaveLength(1)
    })
  })
})
```

### 手动测试检查项

- [ ] 购物车抽屉点击"立即支付"跳转到订单确认页
- [ ] 订单确认页正确显示商品列表和金额
- [ ] 备注输入框字数限制为 100 字
- [ ] 点击"确认支付"弹出支付方式选择抽屉
- [ ] 选择支付方式后显示加载动画
- [ ] 1.5 秒后跳转到支付成功页
- [ ] 支付成功页显示订单号和取餐编号
- [ ] 点击"返回首页"清空购物车并跳转
- [ ] 订单数据正确保存到本地存储

---

## Common Issues

### 1. 页面跳转失败

**问题**: `navigateTo` 跳转报错 "页面不存在"

**解决**: 检查 `app.config.ts` 是否正确注册了新页面路由

```typescript
// app.config.ts
pages: [
  // ...
  'pages/order-confirm/index',  // 确保路径正确
  'pages/order-success/index',
]
```

### 2. 购物车数据读取失败

**问题**: 订单确认页无法读取购物车数据

**解决**: 确认 `cartStore` 正确导出，且使用 `useCartStore` Hook

```typescript
import { useCartStore } from '../../stores/cartStore'

const OrderConfirm = () => {
  const cart = useCartStore(state => state.cart)
  const cartTotal = useCartStore(state => state.cartTotal())
  // ...
}
```

### 3. 取餐编号重复

**问题**: 同一天生成了重复的取餐编号

**解决**: 检查 `pickupNumberCounter` 存储和读取逻辑，确保计数器正确自增

### 4. 样式兼容性问题

**问题**: 微信小程序和 H5 样式不一致

**解决**: 使用 `rpx` 单位，避免使用不兼容的 CSS 属性

```less
// 推荐
.container {
  padding: 32rpx;
  font-size: 28rpx;
}

// 避免
.container {
  padding: calc(16px * 2);  // calc 在部分平台有限制
}
```

---

## Related Documents

- [spec.md](./spec.md) - 功能规格
- [plan.md](./plan.md) - 实施计划
- [research.md](./research.md) - 研究决策
- [data-model.md](./data-model.md) - 数据模型
- [O010-shopping-cart](../O010-shopping-cart/) - 依赖的购物车功能
