/**
 * @spec O006-miniapp-channel-order
 * 订单类型定义
 */

import type { SpecType, SelectedSpec } from './productSpec'

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // 待支付
  PENDING_PREPARE = 'PENDING_PREPARE', // 待制作
  PREPARING = 'PREPARING', // 制作中
  COMPLETED = 'COMPLETED', // 已完成
  DELIVERED = 'DELIVERED', // 已交付
  CANCELLED = 'CANCELLED', // 已取消
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  UNPAID = 'UNPAID', // 未支付
  PAID = 'PAID', // 已支付
  REFUNDED = 'REFUNDED', // 已退款
}

/**
 * 订单项 DTO
 *
 * @description 订单中的一个商品项(含规格快照)
 */
export interface OrderItemDTO {
  /** 订单项 ID */
  id: string

  /** 所属订单 ID */
  orderId: string

  /** 渠道商品 ID */
  channelProductId: string

  /** 商品名称快照 */
  productNameSnapshot: string

  /** 规格快照 */
  selectedSpecsSnapshot: Record<SpecType, SelectedSpec>

  /** 数量 */
  quantity: number

  /** 单价快照 */
  unitPriceSnapshot: number

  /** 小计 */
  subtotal: number
}

/**
 * 渠道商品订单 DTO
 *
 * @description 代表一笔渠道商品订单
 *
 * @validation
 * - orderNumber: 非空字符串,格式 `CP + YYYYMMDD + 序号`
 * - queueNumber: 非空字符串,格式 `[A-Z][0-9]{3}`
 * - items: 非空数组,至少包含一个订单项
 * - totalPrice: 必须等于所有订单项小计之和
 *
 * @businessRules
 * - 订单创建后生成唯一订单号和取餐号
 * - 订单状态流转: 待支付 → 待制作 → 制作中 → 已完成 → 已交付
 * - 支付使用 Mock 实现(点击支付按钮自动成功)
 * - 订单项包含商品名称/规格/价格快照,避免商品配置变更影响历史订单
 */
export interface ChannelProductOrderDTO {
  /** 订单 ID */
  id: string

  /** 订单号(如 CP202601010001) */
  orderNumber: string

  /** 取餐号(如 A001) */
  queueNumber: string

  /** 用户 ID */
  userId: string

  /** 订单状态 */
  status: OrderStatus

  /** 订单项列表 */
  items: OrderItemDTO[]

  /** 总价(单位:分) */
  totalPrice: number

  /** 支付状态 */
  paymentStatus: PaymentStatus

  /** 支付时间(ISO 8601) */
  paymentTime?: string

  /** 创建时间(ISO 8601) */
  createdAt: string

  /** 更新时间(ISO 8601) */
  updatedAt: string
}

/**
 * 创建订单请求 DTO
 *
 * @description 用于提交订单创建请求到后端 API
 */
export interface CreateChannelProductOrderDTO {
  items: {
    /** 渠道商品 ID */
    channelProductId: string

    /** 选中的规格 */
    selectedSpecs: Record<SpecType, SelectedSpec>

    /** 数量 */
    quantity: number

    /** 单价 */
    unitPrice: number
  }[]
}

/**
 * 订单状态显示名称映射
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待支付',
  [OrderStatus.PENDING_PREPARE]: '待制作',
  [OrderStatus.PREPARING]: '制作中',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.DELIVERED]: '已交付',
  [OrderStatus.CANCELLED]: '已取消',
}

/**
 * 支付状态显示名称映射
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: '未支付',
  [PaymentStatus.PAID]: '已支付',
  [PaymentStatus.REFUNDED]: '已退款',
}

/**
 * 订单状态主题色映射(用于 UI 展示)
 */
export const ORDER_STATUS_THEME: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'warning',
  [OrderStatus.PENDING_PREPARE]: 'primary',
  [OrderStatus.PREPARING]: 'primary',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'default',
}

/**
 * 检查订单是否可以取消
 */
export const canCancelOrder = (order: ChannelProductOrderDTO): boolean => {
  return (
    order.status === OrderStatus.PENDING_PAYMENT ||
    order.status === OrderStatus.PENDING_PREPARE
  )
}

/**
 * 检查订单是否可以支付
 */
export const canPayOrder = (order: ChannelProductOrderDTO): boolean => {
  return (
    order.status === OrderStatus.PENDING_PAYMENT &&
    order.paymentStatus === PaymentStatus.UNPAID
  )
}

/**
 * 检查订单是否已完成
 */
export const isOrderCompleted = (order: ChannelProductOrderDTO): boolean => {
  return (
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.DELIVERED
  )
}

/**
 * 获取订单状态的下一个状态(用于状态流转)
 */
export const getNextOrderStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  const statusFlow: Record<OrderStatus, OrderStatus | null> = {
    [OrderStatus.PENDING_PAYMENT]: OrderStatus.PENDING_PREPARE,
    [OrderStatus.PENDING_PREPARE]: OrderStatus.PREPARING,
    [OrderStatus.PREPARING]: OrderStatus.COMPLETED,
    [OrderStatus.COMPLETED]: OrderStatus.DELIVERED,
    [OrderStatus.DELIVERED]: null,
    [OrderStatus.CANCELLED]: null,
  }

  return statusFlow[currentStatus] ?? null
}
