# Research: 小程序订单确认与支付

**Feature**: O011-order-checkout
**Date**: 2026-01-06
**Status**: Complete

## Research Tasks

本 spec 为纯前端 Mock 实现，无需后端 API 调用，研究重点为：
1. Taro 页面导航最佳实践
2. 订单数据模型复用策略
3. Mock 支付流程设计
4. 取餐编号生成算法

---

## 1. Taro 页面导航最佳实践

### 研究问题
如何在 Taro 中实现订单流程的页面跳转（购物车 → 订单确认 → 支付成功 → 首页）？

### 决策
使用 Taro 原生导航 API，根据不同场景选择合适的跳转方式：

| 场景 | API | 原因 |
|------|-----|------|
| 购物车 → 订单确认页 | `Taro.navigateTo()` | 保留页面栈，允许用户返回 |
| 订单确认页 → 支付成功页 | `Taro.redirectTo()` | 替换当前页，防止用户返回到订单确认页 |
| 支付成功页 → 首页 | `Taro.reLaunch()` | 清空页面栈，重置应用状态 |

### 理由
1. `navigateTo` 保留页面栈，用户可按返回键回到购物车继续修改
2. `redirectTo` 替换当前页，支付成功后用户不应返回订单确认页重复支付
3. `reLaunch` 清空所有页面，配合 `clearCart()` 实现完整的订单流程重置

### 考虑的替代方案
- 使用 `switchTab` 跳转到订单 Tab - 被拒绝，因为订单确认页和支付成功页不是 TabBar 页面
- 使用全局状态控制页面显示 - 被拒绝，过于复杂，不符合 Taro 页面导航规范

---

## 2. 订单数据模型复用策略

### 研究问题
如何复用 B端订单管理的 `ProductOrder` 模型，同时支持 C端特有字段？

### 决策
在 C端创建独立的类型定义文件，复用 B端核心字段，扩展 C端特有字段：

```typescript
// miniapp-ordering-taro/src/types/order.ts

// 复用 B端 OrderStatus 枚举
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// 复用 B端 OrderItem 结构
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

// 基于 B端 ProductOrder 扩展 C端特有字段
export interface CinemaOrder {
  // B端核心字段
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  productTotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  paymentMethod: 'WECHAT_PAY' | 'ALIPAY' | 'APPLE_PAY' | null
  paymentTime: string | null
  createdAt: string
  updatedAt: string
  version: number
  items: OrderItem[]

  // C端特有字段
  pickupNumber: string   // 取餐编号，如 "A088"
  remark: string         // 订单备注，最多 100 字
}
```

### 理由
1. 字段命名和类型与 B端完全一致，便于后续系统集成
2. 使用 `CinemaOrder` 命名明确标识为 C端影院订单
3. C端特有字段（pickupNumber, remark）作为扩展，不影响 B端核心结构

### 考虑的替代方案
- 直接引用 B端类型定义文件 - 被拒绝，C端和 B端项目分离，不应产生跨项目依赖
- 使用 TypeScript 继承 extends - 被拒绝，B端类型不在同一项目中
- 定义完全独立的类型 - 被拒绝，会导致 C端和 B端数据结构不一致

---

## 3. Mock 支付流程设计

### 研究问题
如何设计纯前端 Mock 支付流程，模拟真实支付体验？

### 决策
采用三阶段 Mock 流程：

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  支付方式   │ ──▶  │  支付加载   │ ──▶  │  支付成功   │
│  选择抽屉   │      │  动画遮罩   │      │  页面跳转   │
└─────────────┘      └─────────────┘      └─────────────┘
   用户选择           setTimeout          redirectTo
   支付方式           1500ms              success page
```

**实现细节**：

1. **支付方式选择抽屉** (PaymentSheet 组件)
   - 从底部滑出的半透明抽屉
   - 支付方式列表：微信支付、支付宝、Apple Pay
   - 每个选项显示图标 + 名称
   - 点击遮罩或取消按钮关闭

2. **支付加载动画**
   - 全屏半透明遮罩
   - 居中显示加载图标（旋转动画）
   - 文字提示："支付中..."
   - 使用 CSS animation 实现

3. **支付成功处理**
   - setTimeout 1500ms 后执行
   - 生成订单数据（订单号 + 取餐编号）
   - 保存到本地存储
   - 使用 redirectTo 跳转到成功页

### 理由
1. 1.5 秒延迟模拟真实支付 SDK 的等待时间，给用户明确的支付进行中反馈
2. 100% 成功率简化 Mock 逻辑，当前版本不考虑失败场景
3. 支付方式选择增加交互仪式感，更接近真实支付体验

### 考虑的替代方案
- 直接点击支付按钮跳转成功页 - 被拒绝，缺乏支付过程的仪式感
- 随机成功/失败结果 - 被拒绝，增加测试复杂度，当前版本不需要
- 使用 Taro.showLoading - 被拒绝，样式不可定制，无法实现品牌化设计

---

## 4. 取餐编号生成算法

### 研究问题
如何生成唯一的取餐编号，支持每日重置和高并发场景？

### 决策
采用 "字母 + 3 位数字" 格式，通过本地存储计数器管理：

```typescript
interface PickupNumberCounter {
  date: string    // 日期 YYYYMMDD，用于每日重置
  letter: string  // 当前字母 A-Z
  number: number  // 当前数字 1-999
}

// 生成规则：
// 1. 检查日期，新的一天重置计数器
// 2. 数字自增，超过 999 切换到下一个字母
// 3. 字母超过 Z 循环回 A（理论上每天可生成 26 × 999 = 25,974 个编号）

// 输出示例：A001, A002, ..., A999, B001, B002, ..., Z999, A001（循环）
```

### 理由
1. 字母 + 数字组合便于口头报号和柜台辨识
2. 每日重置避免编号无限增长，符合影院单日运营场景
3. 26 × 999 的容量足够单店单日订单量
4. 本地存储方案无需后端支持，符合 Mock 实现要求

### 考虑的替代方案
- 纯数字编号（如 001-999）- 被拒绝，当日订单超过 999 时无法扩展
- UUID 作为取餐编号 - 被拒绝，太长，不便于口头报号
- 时间戳 + 随机数 - 被拒绝，不够简洁，用户难以记忆

---

## 5. 购物车与订单数据转换

### 研究问题
如何将 CartItem 转换为 OrderItem，保持数据一致性？

### 决策
在 orderService 中实现转换函数：

```typescript
// CartItem (O010) → OrderItem (O011)
const convertCartToOrderItems = (cartItems: CartItem[]): OrderItem[] => {
  return cartItems.map((item, index) => ({
    id: generateUUID(),
    orderId: '', // 创建订单时填充
    productId: item.product.id,
    productName: item.product.name,
    productSpec: formatSelectedOptions(item.selectedOptions), // "大杯, 少冰"
    productImage: item.product.image,
    quantity: item.quantity,
    unitPrice: item.product.price,
    subtotal: item.product.price * item.quantity,
    createdAt: new Date().toISOString()
  }))
}
```

### 理由
1. 明确的字段映射，避免类型不匹配
2. selectedOptions 转换为 productSpec 字符串，便于展示
3. 保留商品图片便于订单详情页展示（后续功能）

---

## Summary

| 研究项 | 决策 | 关键点 |
|-------|------|-------|
| 页面导航 | 使用 navigateTo/redirectTo/reLaunch 组合 | 根据场景选择合适的导航 API |
| 数据模型 | 复用 B端结构 + C端扩展字段 | CinemaOrder 类型定义 |
| Mock 支付 | 三阶段流程 + 1.5s 延迟 | PaymentSheet 组件 |
| 取餐编号 | 字母+3位数字，每日重置 | 本地存储计数器 |
| 数据转换 | CartItem → OrderItem 映射函数 | selectedOptions → productSpec |

**所有 NEEDS CLARIFICATION 已解决，可进入 Phase 1 设计阶段。**
