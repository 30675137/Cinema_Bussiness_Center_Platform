/**
 * @spec O007-miniapp-menu-api
 * Mock 数据
 */

import { ChannelProductDTO, ChannelCategory } from '../types/product'

/**
 * Mock 商品数据
 */
export const MOCK_PRODUCTS: ChannelProductDTO[] = [
  // 经典特调 (ALCOHOL)
  {
    id: 'cp001',
    productId: 'p001',
    productName: '莫吉托',
    mainImageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400',
    category: ChannelCategory.ALCOHOL,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 4800,
    sortOrder: 1,
    tags: ['推荐', '热销'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp002',
    productId: 'p002',
    productName: '长岛冰茶',
    mainImageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
    category: ChannelCategory.ALCOHOL,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 5200,
    sortOrder: 2,
    tags: ['推荐'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp003',
    productId: 'p003',
    productName: '玛格丽特',
    mainImageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400',
    category: ChannelCategory.ALCOHOL,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 4500,
    sortOrder: 3,
    tags: [],
    stockStatus: 'IN_STOCK',
  },

  // 精品咖啡 (COFFEE)
  {
    id: 'cp004',
    productId: 'p004',
    productName: '美式咖啡',
    mainImageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    category: ChannelCategory.COFFEE,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 2800,
    sortOrder: 4,
    tags: ['热销'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp005',
    productId: 'p005',
    productName: '拿铁',
    mainImageUrl: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400',
    category: ChannelCategory.COFFEE,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 3200,
    sortOrder: 5,
    tags: ['推荐', '热销'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp006',
    productId: 'p006',
    productName: '卡布奇诺',
    mainImageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    category: ChannelCategory.COFFEE,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 3500,
    sortOrder: 6,
    tags: [],
    stockStatus: 'IN_STOCK',
  },

  // 经典饮品 (BEVERAGE)
  {
    id: 'cp007',
    productId: 'p007',
    productName: '芒果奶昔',
    mainImageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784720?w=400',
    category: ChannelCategory.BEVERAGE,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 2500,
    sortOrder: 7,
    tags: ['推荐'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp008',
    productId: 'p008',
    productName: '草莓奶昔',
    mainImageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400',
    category: ChannelCategory.BEVERAGE,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 2500,
    sortOrder: 8,
    tags: ['热销'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp009',
    productId: 'p009',
    productName: '西瓜汁',
    mainImageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400',
    category: ChannelCategory.BEVERAGE,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 2000,
    sortOrder: 9,
    tags: [],
    stockStatus: 'LOW_STOCK',
  },

  // 主厨小食 (SNACK)
  {
    id: 'cp010',
    productId: 'p010',
    productName: '炸鸡翅',
    mainImageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
    category: ChannelCategory.SNACK,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 3800,
    sortOrder: 10,
    tags: ['推荐', '热销'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp011',
    productId: 'p011',
    productName: '薯条',
    mainImageUrl: 'https://images.unsplash.com/photo-1585238341710-4a5c1dc9bae3?w=400',
    category: ChannelCategory.SNACK,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 2200,
    sortOrder: 11,
    tags: [],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp012',
    productId: 'p012',
    productName: '洋葱圈',
    mainImageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
    category: ChannelCategory.SNACK,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 2800,
    sortOrder: 12,
    tags: [],
    stockStatus: 'IN_STOCK',
  },

  // 主厨正餐 (MEAL)
  {
    id: 'cp013',
    productId: 'p013',
    productName: '牛排套餐',
    mainImageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
    category: ChannelCategory.MEAL,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 12800,
    sortOrder: 13,
    tags: ['推荐'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp014',
    productId: 'p014',
    productName: '意大利面',
    mainImageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    category: ChannelCategory.MEAL,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 6800,
    sortOrder: 14,
    tags: ['热销'],
    stockStatus: 'IN_STOCK',
  },
  {
    id: 'cp015',
    productId: 'p015',
    productName: '汉堡套餐',
    mainImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: ChannelCategory.MEAL,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 8800,
    sortOrder: 15,
    tags: ['推荐'],
    stockStatus: 'IN_STOCK',
  },

  // 其他 (OTHER)
  {
    id: 'cp016',
    productId: 'p016',
    productName: '爆米花（大）',
    mainImageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400',
    category: ChannelCategory.OTHER,
    salesChannel: 'MINIAPP',
    status: 'ACTIVE',
    priceInCents: 3500,
    sortOrder: 16,
    tags: [],
    stockStatus: 'IN_STOCK',
  },
]

/**
 * 按分类过滤商品
 */
export function filterByCategory(
  products: ChannelProductDTO[],
  category: ChannelCategory | null
): ChannelProductDTO[] {
  if (!category) {
    return products
  }
  return products.filter((p) => p.category === category)
}

/**
 * 获取所有分类
 */
export function getAllCategories(): ChannelCategory[] {
  return [
    ChannelCategory.ALCOHOL,
    ChannelCategory.COFFEE,
    ChannelCategory.BEVERAGE,
    ChannelCategory.SNACK,
    ChannelCategory.MEAL,
    ChannelCategory.OTHER,
  ]
}
