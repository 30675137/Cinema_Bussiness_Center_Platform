# Data Model: 小程序订单确认与支付

**Feature**: O011-order-checkout
**Date**: 2026-01-06
**Status**: Complete

## Overview

本文档定义 C端小程序订单确认与支付功能的数据模型。核心原则是**复用 B端订单管理的数据结构**（`frontend/src/features/order-management/types/order.ts`），同时扩展 C端特有字段。

## Data Model Alignment

| C端实体 | B端对应 | 说明 |
|---------|---------|------|
| CinemaOrder | ProductOrder | 核心订单数据，扩展 pickupNumber, remark |
| OrderItem | OrderItem | 完全复用，无扩展 |
| OrderStatus | OrderStatus | 完全复用枚举值 |
| PaymentMethod | - | C端新增，定义支付方式常量 |

---

## Entities

### 1. CinemaOrder (影院订单)

复用 B端 `ProductOrder` 结构，扩展 C端特有字段。

```typescript
/**
 * @spec O011-order-checkout
 * 影院订单实体 - 复用 B端 ProductOrder 结构
 */
export interface CinemaOrder {
  // ========== B端核心字段（复用） ==========

  /** 订单ID，UUID 格式 */
  id: string

  /** 订单号，格式：ORD + YYYYMMDD + 随机字符（6位） */
  orderNumber: string

  /** 用户ID */
  userId: string

  /** 订单状态 */
  status: OrderStatus

  /** 商品总价（分） */
  productTotal: number

  /** 配送费（分），影院场景为 0 */
  shippingFee: number

  /** 折扣金额（分），当前版本为 0 */
  discountAmount: number

  /** 实付金额（分） */
  totalAmount: number

  /** 支付方式 */
  paymentMethod: PaymentMethod | null

  /** 支付时间，ISO 8601 格式 */
  paymentTime: string | null

  /** 创建时间，ISO 8601 格式 */
  createdAt: string

  /** 更新时间，ISO 8601 格式 */
  updatedAt: string

  /** 乐观锁版本号 */
  version: number

  /** 订单商品明细 */
  items: OrderItem[]

  // ========== C端扩展字段 ==========

  /** 取餐编号，格式：字母 + 3位数字（如 A088） */
  pickupNumber: string

  /** 订单备注，最多 100 字 */
  remark: string
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 来源 | 说明 |
|------|------|------|------|------|
| id | string | ✅ | 系统生成 | UUID 格式 |
| orderNumber | string | ✅ | 系统生成 | ORD20260106AB12CD |
| userId | string | ✅ | Mock | 当前版本使用固定值 "mock-user-001" |
| status | OrderStatus | ✅ | 系统设置 | 支付成功后为 PAID |
| productTotal | number | ✅ | 计算 | 所有商品小计之和（分） |
| shippingFee | number | ✅ | 固定 | 影院场景为 0 |
| discountAmount | number | ✅ | 计算 | 当前版本为 0 |
| totalAmount | number | ✅ | 计算 | productTotal - discountAmount |
| paymentMethod | PaymentMethod | ❌ | 用户选择 | 支付前为 null |
| paymentTime | string | ❌ | 系统记录 | 支付前为 null |
| createdAt | string | ✅ | 系统生成 | ISO 8601 格式 |
| updatedAt | string | ✅ | 系统生成 | ISO 8601 格式 |
| version | number | ✅ | 系统管理 | 乐观锁，初始值 1 |
| items | OrderItem[] | ✅ | 转换 | 从 CartItem 转换 |
| pickupNumber | string | ✅ | 系统生成 | A001-Z999 格式 |
| remark | string | ❌ | 用户输入 | 最多 100 字，默认空字符串 |

---

### 2. OrderItem (订单商品明细)

完全复用 B端 `OrderItem` 结构。

```typescript
/**
 * @spec O011-order-checkout
 * 订单商品明细 - 复用 B端 OrderItem 结构
 */
export interface OrderItem {
  /** 明细ID，UUID 格式 */
  id: string

  /** 关联订单ID */
  orderId: string

  /** 商品ID */
  productId: string

  /** 商品名称 */
  productName: string

  /** 商品规格，如 "大杯, 少冰" */
  productSpec: string | null

  /** 商品图片URL */
  productImage: string | null

  /** 购买数量 */
  quantity: number

  /** 单价（分） */
  unitPrice: number

  /** 小计（分）= unitPrice × quantity */
  subtotal: number

  /** 创建时间，ISO 8601 格式 */
  createdAt: string
}
```

**字段来源映射**（从 CartItem 转换）：

| OrderItem 字段 | CartItem 来源 | 转换规则 |
|---------------|--------------|---------|
| id | 系统生成 | UUID |
| orderId | 系统分配 | 创建订单时填充 |
| productId | item.product.id | 直接映射 |
| productName | item.product.name | 直接映射 |
| productSpec | item.selectedOptions | 格式化为字符串，如 "大杯, 少冰" |
| productImage | item.product.image | 直接映射 |
| quantity | item.quantity | 直接映射 |
| unitPrice | item.product.price | 直接映射（分） |
| subtotal | 计算 | unitPrice × quantity |
| createdAt | 系统生成 | ISO 8601 格式 |

---

### 3. OrderStatus (订单状态枚举)

完全复用 B端 `OrderStatus` 枚举。

```typescript
/**
 * @spec O011-order-checkout
 * 订单状态枚举 - 复用 B端定义
 */
export enum OrderStatus {
  /** 待支付 */
  PENDING_PAYMENT = 'PENDING_PAYMENT',

  /** 已支付（Mock 支付后直接进入此状态） */
  PAID = 'PAID',

  /** 已发货（影院场景对应"制作中"） */
  SHIPPED = 'SHIPPED',

  /** 已完成 */
  COMPLETED = 'COMPLETED',

  /** 已取消 */
  CANCELLED = 'CANCELLED',
}
```

**状态流转**（本 spec 范围）：

```
[创建订单] → PENDING_PAYMENT → [Mock支付成功] → PAID
```

> 注：SHIPPED, COMPLETED, CANCELLED 状态在本 spec 范围外，由后续功能处理。

---

### 4. PaymentMethod (支付方式)

C端新增，定义支付方式常量。

```typescript
/**
 * @spec O011-order-checkout
 * 支付方式类型
 */
export type PaymentMethod = 'WECHAT_PAY' | 'ALIPAY' | 'APPLE_PAY'

/**
 * 支付方式配置
 */
export interface PaymentOption {
  /** 支付方式标识 */
  method: PaymentMethod

  /** 显示名称 */
  label: string

  /** 图标路径 */
  icon: string
}

/**
 * 支付方式列表
 */
export const PAYMENT_OPTIONS: PaymentOption[] = [
  { method: 'WECHAT_PAY', label: '微信支付', icon: '/assets/icons/wechat-pay.svg' },
  { method: 'ALIPAY', label: '支付宝', icon: '/assets/icons/alipay.svg' },
  { method: 'APPLE_PAY', label: 'Apple Pay', icon: '/assets/icons/apple-pay.svg' },
]
```

---

### 5. PickupNumberCounter (取餐编号计数器)

用于本地存储的取餐编号计数器。

```typescript
/**
 * @spec O011-order-checkout
 * 取餐编号计数器 - 用于本地存储
 */
export interface PickupNumberCounter {
  /** 日期，格式 YYYYMMDD，用于每日重置 */
  date: string

  /** 当前字母 A-Z */
  letter: string

  /** 当前数字 1-999 */
  number: number
}
```

**存储位置**：`Taro.setStorageSync('pickupNumberCounter', counter)`

**重置规则**：
- 每日首次生成取餐编号时检查日期
- 日期变更时重置为 `{ date: 'YYYYMMDD', letter: 'A', number: 0 }`

---

## Local Storage Schema

### orders (订单列表)

```typescript
// Storage Key: 'orders'
// Type: CinemaOrder[]
// 最新订单在数组头部

const orders: CinemaOrder[] = Taro.getStorageSync('orders') || []
```

### pickupNumberCounter (取餐编号计数器)

```typescript
// Storage Key: 'pickupNumberCounter'
// Type: PickupNumberCounter

const counter: PickupNumberCounter = Taro.getStorageSync('pickupNumberCounter') || {
  date: '',
  letter: 'A',
  number: 0
}
```

---

## Validation Rules

### CinemaOrder 验证

| 字段 | 规则 |
|------|------|
| orderNumber | 必填，格式 `/^ORD\d{8}[A-Z0-9]{6}$/` |
| status | 必填，必须是 OrderStatus 枚举值 |
| productTotal | 必填，≥ 0 |
| totalAmount | 必填，≥ 0 |
| items | 必填，长度 ≥ 1 |
| pickupNumber | 必填，格式 `/^[A-Z]\d{3}$/` |
| remark | 可选，最大长度 100 |

### OrderItem 验证

| 字段 | 规则 |
|------|------|
| productId | 必填，非空字符串 |
| productName | 必填，非空字符串 |
| quantity | 必填，≥ 1 |
| unitPrice | 必填，≥ 0 |
| subtotal | 必填，= unitPrice × quantity |

---

## Type Definitions File

所有类型定义将放在 `miniapp-ordering-taro/src/types/order.ts`：

```typescript
/**
 * @spec O011-order-checkout
 * 订单相关类型定义
 *
 * 数据模型复用策略：
 * - CinemaOrder: 基于 B端 ProductOrder，扩展 pickupNumber, remark
 * - OrderItem: 完全复用 B端结构
 * - OrderStatus: 完全复用 B端枚举
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

export interface PickupNumberCounter {
  date: string
  letter: string
  number: number
}

export interface PaymentOption {
  method: PaymentMethod
  label: string
  icon: string
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { method: 'WECHAT_PAY', label: '微信支付', icon: '/assets/icons/wechat-pay.svg' },
  { method: 'ALIPAY', label: '支付宝', icon: '/assets/icons/alipay.svg' },
  { method: 'APPLE_PAY', label: 'Apple Pay', icon: '/assets/icons/apple-pay.svg' },
]
```

---

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CartItem[]    │ ──▶ │   OrderItem[]   │ ──▶ │  CinemaOrder    │
│   (cartStore)   │     │   (转换生成)     │     │  (本地存储)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       ▲                        │                       │
       │                        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  购物车页面     │     │  订单确认页     │     │  支付成功页     │
│  (O010)        │     │  (O011)         │     │  (O011)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Summary

| 实体 | 来源 | 扩展 | 存储 |
|------|------|------|------|
| CinemaOrder | B端 ProductOrder | pickupNumber, remark | Taro.setStorageSync('orders') |
| OrderItem | B端 OrderItem | 无 | 嵌入 CinemaOrder.items |
| OrderStatus | B端枚举 | 无 | 作为 status 字段值 |
| PaymentMethod | C端新增 | - | 作为 paymentMethod 字段值 |
| PickupNumberCounter | C端新增 | - | Taro.setStorageSync('pickupNumberCounter') |
