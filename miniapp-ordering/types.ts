
export enum CategoryType {
  ALCOHOL = '经典特调',
  COFFEE = '精品咖啡',
  BEVERAGE = '清爽饮品',
  SNACK = '主厨小食',
  REWARDS = '积分兑换'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: CategoryType;
  pointsPrice?: number;
  options?: {
    name: string;
    choices: string[];
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  isRedemption?: boolean;
}

export interface EntertainmentZone {
  id: string;
  name: string;
  type: 'Movie' | 'Live Sports' | 'Gaming' | 'Jazz Lounge';
  status: 'Full' | 'Available';
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percent';
  value: number;
  minSpend: number;
  expiryDate: string;
}

export interface Member {
  name: string;
  level: '大众会员' | '白银会员' | '黄金会员';
  points: number;
  coupons: Coupon[];
  totalSpent: number;
}
