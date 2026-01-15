/**
 * 商品分类枚举
 */
export enum CategoryType {
  ALCOHOL = '经典特调',
  COFFEE = '精品咖啡',
  BEVERAGE = '清爽饮品',
  SNACK = '主厨小食',
  REWARDS = '积分兑换'
}

/**
 * 商品类型
 */
export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: CategoryType
  pointsPrice?: number
  options?: {
    name: string
    choices: string[]
  }[]
}

/**
 * 购物车项
 */
export interface CartItem {
  product: Product
  quantity: number
  selectedOptions: Record<string, string>
  isRedemption?: boolean
}

/**
 * 娱乐区域
 */
export interface EntertainmentZone {
  id: string
  name: string
  type: 'Movie' | 'Live Sports' | 'Gaming' | 'Jazz Lounge'
  status: 'Full' | 'Available'
}

/**
 * 优惠券
 */
export interface Coupon {
  id: string
  title: string
  description: string
  discountType: 'flat' | 'percent'
  value: number
  minSpend: number
  expiryDate: string
}

/**
 * 会员
 */
export interface Member {
  name: string
  level: '大众会员' | '白银会员' | '黄金会员'
  points: number
  coupons: Coupon[]
  totalSpent: number
}
