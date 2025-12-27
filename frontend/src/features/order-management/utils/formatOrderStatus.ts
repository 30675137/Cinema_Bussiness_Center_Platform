/**
 * @spec O001-product-order-list
 * 订单状态格式化工具函数
 */

import { OrderStatus } from '../types/order'

export interface OrderStatusConfig {
  label: string
  color: 'default' | 'processing' | 'success' | 'error' | 'warning'
  description: string
}

/**
 * 订单状态配置映射
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  [OrderStatus.PENDING_PAYMENT]: {
    label: '待支付',
    color: 'default',
    description: '订单已创建，等待用户支付'
  },
  [OrderStatus.PAID]: {
    label: '已支付',
    color: 'processing',
    description: '订单已支付，等待发货'
  },
  [OrderStatus.SHIPPED]: {
    label: '已发货',
    color: 'processing',
    description: '订单已发货，等待用户确认收货'
  },
  [OrderStatus.COMPLETED]: {
    label: '已完成',
    color: 'success',
    description: '订单已完成'
  },
  [OrderStatus.CANCELLED]: {
    label: '已取消',
    color: 'error',
    description: '订单已取消'
  }
}

/**
 * 格式化订单状态为中文标签
 */
export const formatOrderStatus = (status: OrderStatus): string => {
  return ORDER_STATUS_CONFIG[status]?.label || status
}

/**
 * 获取订单状态颜色
 */
export const getOrderStatusColor = (status: OrderStatus): OrderStatusConfig['color'] => {
  return ORDER_STATUS_CONFIG[status]?.color || 'default'
}

/**
 * 获取订单状态描述
 */
export const getOrderStatusDescription = (status: OrderStatus): string => {
  return ORDER_STATUS_CONFIG[status]?.description || ''
}

/**
 * 判断订单状态是否可以取消
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  return status === OrderStatus.PENDING_PAYMENT || status === OrderStatus.PAID
}

/**
 * 判断订单状态是否可以发货
 */
export const canShipOrder = (status: OrderStatus): boolean => {
  return status === OrderStatus.PAID
}

/**
 * 判断订单状态是否可以完成
 */
export const canCompleteOrder = (status: OrderStatus): boolean => {
  return status === OrderStatus.SHIPPED
}
