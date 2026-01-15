import { CategoryType, Product, EntertainmentZone, Coupon, Member } from '../types'

/**
 * 娱乐区域列表
 */
export const ZONES: EntertainmentZone[] = [
  { id: 'h1', name: '1号厅: IMAX影院', type: 'Movie', status: 'Available' },
  { id: 'h2', name: '2号厅: 电竞中心', type: 'Gaming', status: 'Available' },
  { id: 'h3', name: '3号厅: 爵士现场', type: 'Jazz Lounge', status: 'Available' },
  { id: 'h4', name: '4号厅: 体育赛事', type: 'Live Sports', status: 'Full' }
]

/**
 * Mock 优惠券
 */
export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c1',
    title: '新人尊享券',
    description: '小食类满40元减15元',
    discountType: 'flat',
    value: 15,
    minSpend: 40,
    expiryDate: '2025-12-31'
  },
  {
    id: 'c2',
    title: '欢乐时光饮品券',
    description: '全场酒精类饮品8折',
    discountType: 'percent',
    value: 20,
    minSpend: 0,
    expiryDate: '2025-12-31'
  }
]

/**
 * Mock 会员信息
 */
export const MOCK_MEMBER: Member = {
  name: '尊贵会员',
  level: '白银会员',
  points: 1250,
  coupons: MOCK_COUPONS,
  totalSpent: 1240
}

/**
 * 商品列表
 */
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: '午夜尼格罗尼',
    price: 88,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop',
    description: '经典金酒基底，带有电影质感的烟熏风味。',
    category: CategoryType.ALCOHOL,
    pointsPrice: 800,
    options: [{ name: '冰量', choices: ['正常冰', '少冰', '去冰'] }]
  },
  {
    id: '2',
    name: '浓缩咖啡马天尼',
    price: 78,
    image: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=400&h=400&fit=crop',
    description: '现磨浓缩咖啡与顶级伏特加的醇厚碰撞。',
    category: CategoryType.ALCOHOL,
    pointsPrice: 700
  },
  {
    id: '3',
    name: '黑松露爆米花',
    price: 45,
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=400&fit=crop',
    description: '主厨特制，黑松露油与海盐的奢华融合。',
    category: CategoryType.SNACK,
    pointsPrice: 400
  },
  {
    id: '4',
    name: '和牛小汉堡 (3个)',
    price: 128,
    image: 'https://images.unsplash.com/photo-1550317138-10000687ad32?w=400&h=400&fit=crop',
    description: '顶级和牛配以焦糖洋葱，每一口都是满足。',
    category: CategoryType.SNACK,
    pointsPrice: 1200
  },
  {
    id: '5',
    name: '燕麦奶白咖啡',
    price: 38,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=400&fit=crop',
    description: '醇厚精品咖啡与瑞典Oatly燕麦奶的丝滑结合。',
    category: CategoryType.COFFEE,
    pointsPrice: 350,
    options: [{ name: '甜度', choices: ['无糖', '半糖', '标准'] }]
  },
  {
    id: '6',
    name: '香柚苏打气泡水',
    price: 32,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop',
    description: '进口柚子原汁搭配细腻气泡，微甜清爽，影院解腻首选。',
    category: CategoryType.BEVERAGE,
    pointsPrice: 300
  },
  {
    id: '7',
    name: '洛神花果冰茶',
    price: 35,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
    description: '红宝石般的色泽，纯天然洛神花萃取，口感酸甜回甘。',
    category: CategoryType.BEVERAGE,
    pointsPrice: 320
  },
  {
    id: '8',
    name: '青瓜青柠莫吉托',
    price: 38,
    image: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbadf3?w=400&h=400&fit=crop',
    description: '无酒精Mocktail，新鲜青瓜与薄荷的极简清新。',
    category: CategoryType.BEVERAGE,
    pointsPrice: 350
  },
  {
    id: '9',
    name: '粉红西柚汤力',
    price: 36,
    image: 'https://images.unsplash.com/photo-1525385133336-254847240f92?w=400&h=400&fit=crop',
    description: '手工熬制西柚果酱，粉色外观极具辨识度，微苦醇美。',
    category: CategoryType.BEVERAGE,
    pointsPrice: 330
  },
  {
    id: '10',
    name: '圣培露气泡矿泉水',
    price: 28,
    image: 'https://images.unsplash.com/photo-1559839914-17aae19471c2?w=400&h=400&fit=crop',
    description: '来自意大利的经典，细腻的气泡与平衡的矿物质感。',
    category: CategoryType.BEVERAGE,
    pointsPrice: 250
  }
]

/**
 * 分类图标映射
 */
export const CATEGORY_ICONS: Record<CategoryType, string> = {
  [CategoryType.ALCOHOL]: 'wine',
  [CategoryType.COFFEE]: 'coffee',
  [CategoryType.BEVERAGE]: 'beverage',
  [CategoryType.SNACK]: 'food',
  [CategoryType.REWARDS]: 'gift'
}
