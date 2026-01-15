/**
 * @spec O011-order-checkout
 * @spec O012-order-inventory-reservation
 * @spec O013-order-channel-migration
 * 订单服务 - 核心函数
 */
import Taro from '@tarojs/taro'
import type { CinemaOrder, OrderItem, PaymentMethod, PickupNumberCounter } from '../types/order'
import { OrderStatus } from '../types/order'
import type { CartItem } from '../types/cart'

/**
 * O012: 库存不足错误响应
 */
export interface InsufficientInventoryError {
  code: 'ORD_BIZ_002'
  message: string
  details: {
    shortageItems: Array<{
      skuId: string
      skuName: string
      requiredQty: number
      availableQty: number
      unit: string
    }>
  }
}

/**
 * O013: 商品快照接口
 * 下单时保存的商品信息快照
 */
export interface ProductSnapshot {
  snapshotAt: string
  channelProduct: {
    id: string
    displayName: string
    channelPrice: number
    imageUrl?: string
  }
  sku: {
    id: string
    name: string
    basePrice: number
  }
  selectedSpecs?: Record<string, string>
  effectivePrice: number
}

/**
 * O012: 订单创建响应
 */
export interface OrderCreationResponse {
  code: string
  message: string
  data: {
    orderId: string
    orderNumber: string
    status: string
    totalAmount: number
    reservationStatus?: 'RESERVED' | 'PARTIAL_RESERVED' | 'FAILED'
    reservedItems?: Array<{
      skuId: string
      skuName: string
      reservedQty: number
      unit: string
    }>
    reservationExpiry?: string
  }
}

/**
 * 生成 UUID v4
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成订单号
 * 格式：ORD + YYYYMMDD + 6位随机字符
 * 示例：ORD20260106AB12CD
 */
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

/**
 * 生成取餐编号
 * 格式：字母 + 3位数字（A001-Z999）
 * 每日重置，字母循环使用 A-Z
 */
export const generatePickupNumber = (): string => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  let counter: PickupNumberCounter = Taro.getStorageSync('pickupNumberCounter') || {
    date: today,
    letter: 'A',
    number: 0,
  }

  // 如果是新的一天，重置计数器
  if (counter.date !== today) {
    counter = { date: today, letter: 'A', number: 0 }
  }

  // 数字自增
  counter.number += 1

  // 如果数字超过999，切换到下一个字母
  if (counter.number > 999) {
    counter.number = 1
    counter.letter = String.fromCharCode(counter.letter.charCodeAt(0) + 1)
    if (counter.letter > 'Z') {
      counter.letter = 'A' // 循环回 A
    }
  }

  // 保存计数器
  Taro.setStorageSync('pickupNumberCounter', counter)

  // 返回格式化的取餐编号
  return `${counter.letter}${counter.number.toString().padStart(3, '0')}`
}

/**
 * 将购物车项转换为订单项
 */
export const convertCartToOrderItems = (
  cartItems: CartItem[],
  orderId: string
): OrderItem[] => {
  return cartItems.map((item) => ({
    id: generateUUID(),
    orderId,
    productId: item.product.id,
    productName: item.product.name,
    productSpec:
      Object.entries(item.selectedOptions || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') || null,
    productImage: item.product.image,
    quantity: item.quantity,
    unitPrice: item.product.price,
    subtotal: item.product.price * item.quantity,
    createdAt: new Date().toISOString(),
  }))
}

/**
 * 创建订单
 */
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
    remark,
  }

  return order
}

/**
 * 保存订单到本地存储
 */
export const saveOrder = (order: CinemaOrder): void => {
  const orders: CinemaOrder[] = Taro.getStorageSync('orders') || []
  orders.unshift(order) // 最新订单在前
  Taro.setStorageSync('orders', orders)
}

/**
 * 获取本地订单列表
 */
export const getOrders = (): CinemaOrder[] => {
  return Taro.getStorageSync('orders') || []
}

/**
 * O012 & O013: 创建订单并预占库存（调用后端API）
 * API Path: POST /api/client/orders (O013 新路径)
 * 
 * @param request 订单创建请求
 * @returns 订单创建响应
 * @throws InsufficientInventoryError 库存不足时抛出
 */
export const createOrderWithReservation = async (
  request: {
    storeId: string
    items: Array<{
      /** @spec O013 使用 channelProductId 替代 beverageId */
      channelProductId: string
      quantity: number
      selectedSpecs?: Record<string, string>
    }>
    customerNote?: string
  }
): Promise<OrderCreationResponse> => {
  try {
    // @spec O013: API 路径变更 /api/client/beverage-orders -> /api/client/orders
    const response = await Taro.request({
      url: `${process.env.TARO_APP_API_BASE_URL || 'http://localhost:8080'}/api/client/orders`,
      method: 'POST',
      data: request,
      header: {
        'Content-Type': 'application/json',
      },
    })

    if (response.statusCode === 201) {
      return response.data as OrderCreationResponse
    } else if (response.statusCode === 409) {
      // 库存不足
      throw response.data as InsufficientInventoryError
    } else {
      throw new Error(response.data.message || '创建订单失败')
    }
  } catch (error: any) {
    console.error('createOrderWithReservation error:', error)
    throw error
  }
}

/**
 * O012 & O013: 取消订单并释放预占（调用后端API）
 * API Path: POST /api/client/orders/{orderId}/cancel (O013 新路径)
 * 
 * @param orderId 订单ID
 * @param cancelReason 取消原因
 */
export const cancelOrderWithRelease = async (
  orderId: string,
  cancelReason?: string
): Promise<void> => {
  try {
    // @spec O013: API 路径变更
    const response = await Taro.request({
      url: `${process.env.TARO_APP_API_BASE_URL || 'http://localhost:8080'}/api/client/orders/${orderId}/cancel`,
      method: 'POST',
      data: {
        reason: cancelReason || '用户取消',
      },
      header: {
        'Content-Type': 'application/json',
      },
    })

    if (response.statusCode !== 200) {
      throw new Error(response.data.message || '取消订单失败')
    }
  } catch (error: any) {
    console.error('cancelOrderWithRelease error:', error)
    throw error
  }
}
