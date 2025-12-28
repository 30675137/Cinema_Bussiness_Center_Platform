/**
 * @spec O003-beverage-order
 * 饮品状态管理 Store (Zustand)
 */
import { create } from 'zustand'

/**
 * 饮品数据类型
 */
export interface Beverage {
  id: string
  name: string
  description: string
  category: string
  imageUrl: string
  detailImages: string[]
  basePrice: number
  nutritionInfo?: string
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  isRecommended: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * 饮品详情数据类型
 */
export interface BeverageDetail extends Beverage {
  specs: BeverageSpec[]
}

/**
 * 饮品规格数据类型
 */
export interface BeverageSpec {
  id: string
  beverageId: string
  specType: 'SIZE' | 'TEMPERATURE' | 'SWEETNESS' | 'TOPPING'
  specName: string
  priceAdjustment: number
  sortOrder: number
}

/**
 * 饮品状态
 */
interface BeverageState {
  /**
   * 当前选中的分类
   */
  selectedCategory: string | null

  /**
   * 当前查看的饮品详情
   */
  currentBeverage: BeverageDetail | null

  /**
   * 设置选中的分类
   */
  setSelectedCategory: (category: string | null) => void

  /**
   * 设置当前饮品详情
   */
  setCurrentBeverage: (beverage: BeverageDetail | null) => void

  /**
   * 清空状态
   */
  reset: () => void
}

/**
 * 饮品状态管理 Store
 */
export const useBeverageStore = create<BeverageState>((set) => ({
  selectedCategory: null,
  currentBeverage: null,

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setCurrentBeverage: (beverage) => set({ currentBeverage: beverage }),
  reset: () => set({ selectedCategory: null, currentBeverage: null }),
}))
