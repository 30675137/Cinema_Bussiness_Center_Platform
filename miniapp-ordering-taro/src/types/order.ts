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
