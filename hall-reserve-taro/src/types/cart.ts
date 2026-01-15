/**
 * @spec O010-shopping-cart
 * 购物车类型定义
 */

/**
 * 购物车商品信息 (Product 的子集)
 */
export interface CartProduct {
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

/**
 * 购物车项
 */
export interface CartItem {
  /** 商品信息 */
  product: CartProduct

  /** 购买数量（必须 > 0） */
  quantity: number

  /** 商品选项（如冰量、糖度） */
  selectedOptions?: Record<string, string>

  /** 是否为积分兑换商品（可选功能） */
  isRedemption?: boolean
}

/**
 * 购物车（计算值）
 */
export interface Cart {
  /** 购物车项列表 */
  items: CartItem[]

  /** 总件数（所有商品数量之和） */
  totalItems: number

  /** 小计（所有商品价格 * 数量之和，单位：分） */
  subtotal: number

  /** 购物车总金额（小计 - 优惠，单位：分） */
  cartTotal: number
}

/**
 * Zustand 购物车状态管理
 */
export interface CartState {
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
