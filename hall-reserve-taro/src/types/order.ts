/**
 * @spec O003-beverage-order, O006-miniapp-channel-order
 * 订单相关类型定义
 */

import { SelectedSpec as ChannelSelectedSpec } from './channelProduct'

// 从 beverage.ts 重新导出订单相关类型 (O003)
export type {
  OrderItemDTO,
  CreateOrderRequest,
  OrderStatus as BeverageOrderStatus,
  BeverageOrderDTO,
  SelectedSpec,
} from './beverage'

// 别名，与 hook 中的命名保持一致
export type CreateBeverageOrderRequest = import('./beverage').CreateOrderRequest

/**
 * @spec O006-miniapp-channel-order
 * 渠道商品订单相关类型定义
 */

/**
 * 购物车项(前端状态)
 */
export interface CartItem {
  cartItemId: string              // 购物车项唯一ID (UUID)
  channelProductId: string        // 渠道商品ID
  displayName: string             // 商品名称
  mainImage: string               // 商品主图
  basePrice: number               // 基础价格(分)
  selectedSpecs: ChannelSelectedSpec[]   // 用户选择的规格
  unitPrice: number               // 单价(基础价+规格调整,分)
  quantity: number                // 数量
  subtotal: number                // 小计(unitPrice * quantity,分)
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',   // 待支付
  PENDING = 'PENDING',                   // 待制作
  PREPARING = 'PREPARING',               // 制作中
  READY = 'READY',                       // 已完成
  DELIVERED = 'DELIVERED',               // 已交付
  CANCELLED = 'CANCELLED'                // 已取消
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  UNPAID = 'UNPAID',       // 未支付
  PAID = 'PAID',           // 已支付
  REFUNDED = 'REFUNDED'    // 已退款
}

/**
 * 渠道商品订单项 DTO
 */
export interface ChannelProductOrderItemDTO {
  channelProductId: string        // 渠道商品ID (替代 beverageId)
  displayName: string             // 商品名称
  mainImage: string               // 商品主图
  basePrice: number               // 基础价格(分)
  selectedSpecs: ChannelSelectedSpec[]   // 选择的规格
  unitPrice: number               // 单价(分)
  quantity: number                // 数量
  subtotal: number                // 小计(分)
}

/**
 * 创建渠道商品订单请求 DTO
 */
export interface CreateChannelProductOrderDTO {
  items: ChannelProductOrderItemDTO[]  // 订单项列表
  totalAmount: number                  // 订单总金额(分)
  paymentMethod: 'MOCK'                // 支付方式(MVP阶段仅支持MOCK)
  note?: string                        // 备注
}

/**
 * 渠道商品订单 DTO - 订单列表/详情
 */
export interface ChannelProductOrderDTO {
  id: string                            // 订单ID
  orderNumber: string                   // 订单号
  userId: string                        // 用户ID
  items: ChannelProductOrderItemDTO[]   // 订单项列表
  totalAmount: number                   // 订单总金额(分)
  status: OrderStatus                   // 订单状态
  paymentStatus: PaymentStatus          // 支付状态
  paymentMethod: string                 // 支付方式
  paymentTime?: string                  // 支付时间(ISO 8601)
  pickupNumber?: string                 // 取餐号
  estimatedTime?: number                // 预计制作时间(分钟)
  note?: string                         // 备注
  createdAt: string                     // 创建时间(ISO 8601)
  updatedAt: string                     // 更新时间(ISO 8601)
}

/**
 * 订单列表查询参数
 */
export interface OrderListQuery {
  page?: number                   // 页码(默认1)
  pageSize?: number               // 每页数量(默认10)
  status?: OrderStatus            // 订单状态筛选
}

/**
 * 订单列表响应
 */
export interface OrderListResponse {
  items: ChannelProductOrderDTO[] // 订单列表
  total: number                   // 总数
  page: number                    // 当前页
  pageSize: number                // 每页数量
}
