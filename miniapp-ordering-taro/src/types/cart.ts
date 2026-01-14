/**
 * @spec O010-shopping-cart
 * @spec O013-order-channel-migration
 * 购物车数据类型定义
 */

/**
 * 购物车商品数据
 * @spec O013: id 对应 channelProductId
 */
export interface CartProduct {
  /** 渠道商品ID (channelProductId) */
  id: string
  /** 商品名称 */
  name: string
  /** 商品价格（分） */
  price: number
  /** 商品图片 */
  image: string
  /** SKU ID (可选，用于向后兼容) */
  skuId?: string
}

/**
 * 购物车项（包含商品和数量）
 */
export interface CartItem {
  /** 商品信息 */
  product: CartProduct
  /** 数量 */
  quantity: number
  /** 选项（如"冰量: 少冰"，"糖度: 半糖"） */
  selectedOptions: Record<string, string>
}

/**
 * 购物车数据（用于存储）
 */
export interface Cart {
  /** 购物车项列表 */
  items: CartItem[]
  /** 最后更新时间戳（毫秒），用于7天过期检查 */
  timestamp: number
}

/**
 * 购物车状态（Zustand Store）
 */
export interface CartState {
  /** 购物车数据 */
  cart: Cart

  /** 购物车抽屉是否打开 */
  isCartOpen: boolean

  // ========== Actions ==========

  /**
   * 添加商品到购物车
   * @param product 商品信息
   * @param selectedOptions 选项（可选）
   */
  addToCart: (product: CartProduct, selectedOptions?: Record<string, string>) => void

  /**
   * 更新商品数量
   * @param productId 商品ID
   * @param delta 数量变化（+1 或 -1）
   */
  updateQuantity: (productId: string, delta: number) => void

  /**
   * 从购物车移除商品
   * @param productId 商品ID
   */
  removeFromCart: (productId: string) => void

  /**
   * 清空购物车
   */
  clearCart: () => void

  /**
   * 切换购物车抽屉状态
   */
  toggleCartDrawer: () => void

  // ========== Selectors ==========

  /**
   * 获取购物车商品总件数
   */
  totalItems: () => number

  /**
   * 获取购物车总金额（分）
   */
  cartTotal: () => number

  /**
   * 获取购物车小计（分）
   */
  subtotal: () => number
}
