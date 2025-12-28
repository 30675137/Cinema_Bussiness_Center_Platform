/**
 * @spec O003-beverage-order
 * 订单购物车状态管理 Store (Zustand + Taro Storage 持久化)
 */
import Taro from '@tarojs/taro'
import { create } from 'zustand'

/**
 * 购物车商品项
 */
export interface CartItem {
  /**
   * 饮品ID
   */
  beverageId: string

  /**
   * 饮品名称
   */
  beverageName: string

  /**
   * 饮品图片
   */
  beverageImageUrl: string

  /**
   * 选中的规格
   * 格式: { size: '大杯', temperature: '热', sweetness: '五分糖', topping: '珍珠' }
   */
  selectedSpecs: Record<string, string>

  /**
   * 数量
   */
  quantity: number

  /**
   * 单价（基础价格 + 规格调整价格）
   */
  unitPrice: number

  /**
   * 小计
   */
  subtotal: number

  /**
   * 顾客备注
   */
  customerNote?: string
}

/**
 * 订单购物车状态
 */
interface OrderCartState {
  /**
   * 购物车商品列表
   */
  items: CartItem[]

  /**
   * 门店ID
   */
  storeId: string | null

  /**
   * 订单备注
   */
  orderNote: string

  /**
   * 添加商品到购物车
   */
  addItem: (item: CartItem) => void

  /**
   * 更新商品数量
   */
  updateQuantity: (beverageId: string, specs: Record<string, string>, quantity: number) => void

  /**
   * 移除商品
   */
  removeItem: (beverageId: string, specs: Record<string, string>) => void

  /**
   * 清空购物车
   */
  clearCart: () => void

  /**
   * 设置门店ID
   */
  setStoreId: (storeId: string) => void

  /**
   * 设置订单备注
   */
  setOrderNote: (note: string) => void

  /**
   * 获取购物车总价
   */
  getTotalPrice: () => number

  /**
   * 获取购物车商品总数量
   */
  getTotalQuantity: () => number

  /**
   * 从本地存储加载购物车
   */
  loadFromStorage: () => void

  /**
   * 保存到本地存储
   */
  saveToStorage: () => void
}

/**
 * 本地存储key
 */
const CART_STORAGE_KEY = 'beverage_order_cart'

/**
 * 生成商品唯一key（用于判断是否为同一商品）
 */
const generateItemKey = (beverageId: string, specs: Record<string, string>): string => {
  const specsStr = Object.keys(specs)
    .sort()
    .map((key) => `${key}:${specs[key]}`)
    .join(',')
  return `${beverageId}|${specsStr}`
}

/**
 * 订单购物车状态管理 Store
 */
export const useOrderCartStore = create<OrderCartState>((set, get) => ({
  items: [],
  storeId: null,
  orderNote: '',

  addItem: (item) => {
    const state = get()
    const itemKey = generateItemKey(item.beverageId, item.selectedSpecs)

    // 检查是否已存在相同商品（相同饮品+相同规格）
    const existingItemIndex = state.items.findIndex(
      (i) => generateItemKey(i.beverageId, i.selectedSpecs) === itemKey
    )

    let newItems: CartItem[]

    if (existingItemIndex >= 0) {
      // 如果已存在，增加数量
      newItems = [...state.items]
      const existingItem = newItems[existingItemIndex]
      existingItem.quantity += item.quantity
      existingItem.subtotal = existingItem.unitPrice * existingItem.quantity
    } else {
      // 如果不存在，添加新商品
      newItems = [...state.items, item]
    }

    set({ items: newItems })
    get().saveToStorage()
  },

  updateQuantity: (beverageId, specs, quantity) => {
    const state = get()
    const itemKey = generateItemKey(beverageId, specs)

    const newItems = state.items.map((item) => {
      if (generateItemKey(item.beverageId, item.selectedSpecs) === itemKey) {
        return {
          ...item,
          quantity,
          subtotal: item.unitPrice * quantity,
        }
      }
      return item
    })

    set({ items: newItems })
    get().saveToStorage()
  },

  removeItem: (beverageId, specs) => {
    const state = get()
    const itemKey = generateItemKey(beverageId, specs)

    const newItems = state.items.filter(
      (item) => generateItemKey(item.beverageId, item.selectedSpecs) !== itemKey
    )

    set({ items: newItems })
    get().saveToStorage()
  },

  clearCart: () => {
    set({ items: [], storeId: null, orderNote: '' })
    get().saveToStorage()
  },

  setStoreId: (storeId) => {
    set({ storeId })
    get().saveToStorage()
  },

  setOrderNote: (note) => {
    set({ orderNote: note })
    get().saveToStorage()
  },

  getTotalPrice: () => {
    const state = get()
    return state.items.reduce((total, item) => total + item.subtotal, 0)
  },

  getTotalQuantity: () => {
    const state = get()
    return state.items.reduce((total, item) => total + item.quantity, 0)
  },

  loadFromStorage: () => {
    try {
      const cartData = Taro.getStorageSync(CART_STORAGE_KEY)
      if (cartData) {
        const parsed = JSON.parse(cartData)
        set({
          items: parsed.items || [],
          storeId: parsed.storeId || null,
          orderNote: parsed.orderNote || '',
        })
      }
    } catch (error) {
      console.error('加载购物车数据失败:', error)
    }
  },

  saveToStorage: () => {
    try {
      const state = get()
      const cartData = {
        items: state.items,
        storeId: state.storeId,
        orderNote: state.orderNote,
      }
      Taro.setStorageSync(CART_STORAGE_KEY, JSON.stringify(cartData))
    } catch (error) {
      console.error('保存购物车数据失败:', error)
    }
  },
}))

// 初始化时从本地存储加载
if (typeof window !== 'undefined') {
  useOrderCartStore.getState().loadFromStorage()
}
