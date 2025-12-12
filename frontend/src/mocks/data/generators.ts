import { SPUItem, SPUStatus, SPUAttribute, AttributeType, ProductImage } from '@/types/spu'
import { CategoryItem, CategoryStatus, CategoryLevel } from '@/types/category'
import { BrandItem, BrandStatus } from '@/types/brand'

// 影院商品相关数据
const cinemaProducts = {
  drinks: [
    '可口可乐500ml', '百事可乐500ml', '雪碧500ml', '芬达500ml', '美年达500ml',
    '七喜500ml', '冰红茶500ml', '绿茶500ml', '茉莉花茶500ml', '乌龙茶500ml'
  ],
  snacks: [
    '爆米花小份', '爆米花中份', '爆米花大份', '薯片小包', '薯片中包',
    '薯片大包', '巧克力棒', '曲奇饼干', '威化饼干', '坚果混合装'
  ],
  combo: [
    '可乐+爆米花套餐', '大份套餐A', '大份套餐B', '情侣套餐', '家庭套餐',
    '儿童套餐', '学生套餐', '豪华套餐', '双人套餐', '观影套餐'
  ],
  tickets: [
    '2D电影票', '3D电影票', 'IMAX电影票', 'VIP厅电影票', '情侣座票',
    '标准场次票', '黄金场次票', '夜场票', '早场票', '优惠票'
  ]
}

const cinemaBrands = [
  '可口可乐', '百事可乐', '农夫山泉', '康师傅', '统一',
  '乐事', '品客', '奥利奥', '德芙', '费列罗',
  '万达影业', '中影集团', '华谊兄弟', '光线传媒', '博纳影业'
]

const cinemaCategories = {
  level1: ['饮品', '小食', '套餐', '票务'],
  level2: {
    '饮品': ['碳酸饮料', '茶饮', '果汁', '咖啡', '水'],
    '小食': ['爆米花', '薯片', '糖果', '饼干', '坚果'],
    '套餐': ['单人套餐', '双人套餐', '家庭套餐', '豪华套餐'],
    '票务': ['标准票', '3D票', 'VIP票', '团体票', '优惠票']
  },
  level3: {
    '碳酸饮料': ['可乐类', '汽水类', '功能饮料'],
    '茶饮': ['绿茶', '红茶', '乌龙茶', '花茶'],
    '果汁': ['橙汁', '苹果汁', '葡萄汁', '混合果汁'],
    '爆米花': ['甜味', '咸味', '焦糖味', '黄油味'],
    '薯片': ['原味', '烧烤味', '番茄味', '海苔味']
  }
}

// 生成随机ID
const generateId = (prefix: string): string => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`
}

// 生成随机编码
const generateCode = (prefix: string): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// 从数组中随机选择
const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

// 生成SPU属性
const generateSPUAttributes = (category: string): SPUAttribute[] => {
  const attributes: SPUAttribute[] = []

  // 基础属性
  attributes.push({
    id: generateId('attr'),
    name: '容量',
    value: randomChoice(['500ml', '1L', '2L', '330ml', '250ml']),
    type: 'text',
    required: true,
    editable: true
  })

  attributes.push({
    id: generateId('attr'),
    name: '口味',
    value: randomChoice(['原味', '甜味', '咸味', '微辣', '不辣']),
    type: 'select',
    required: false,
    editable: true,
    validation: {
      options: ['原味', '甜味', '咸味', '微辣', '不辣']
    }
  })

  // 根据分类添加特定属性
  if (category.includes('饮料')) {
    attributes.push({
      id: generateId('attr'),
      name: '是否含糖',
      value: Math.random() > 0.5,
      type: 'boolean',
      required: true,
      editable: true
    })
  }

  if (category.includes('爆米花')) {
    attributes.push({
      id: generateId('attr'),
      name: '包装规格',
      value: randomChoice(['小份', '中份', '大份', '特大份']),
      type: 'select',
      required: true,
      editable: true,
      validation: {
        options: ['小份', '中份', '大份', '特大份']
      }
    })
  }

  return attributes
}

// 生成商品图片
const generateProductImages = (): ProductImage[] => {
  const imageCount = Math.floor(Math.random() * 3) + 1
  return Array.from({ length: imageCount }, (_, index) => ({
    id: generateId('img'),
    url: `https://images.unsplash.com/photo-${Math.random().toString(36).substr(2, 10)}?w=300&h=300&fit=crop`,
    alt: `商品图片${index + 1}`,
    isPrimary: index === 0,
    sort: index
  }))
}

// 生成SPU数据
export const generateMockSPU = (overrides?: Partial<SPUItem>): SPUItem => {
  const categoryKey = randomChoice(Object.keys(cinemaCategories.level1))
  const categoryName = cinemaCategories.level1[categoryKey as keyof typeof cinemaCategories.level1]
  const categoryLevel2 = randomChoice(cinemaCategories.level2[categoryName] || [])
  const categoryLevel3 = categoryLevel2 ? randomChoice(cinemaCategories.level3[categoryLevel2] || []) : undefined

  const allProducts = [...cinemaProducts.drinks, ...cinemaProducts.snacks, ...cinemaProducts.combo]
  const productName = randomChoice(allProducts)

  const brand = randomChoice(cinemaBrands)
  const status = randomChoice<SPUStatus>(['draft', 'active', 'inactive'])

  const now = new Date().toISOString()
  const createdDaysAgo = Math.floor(Math.random() * 30)
  const createdTime = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()

  return {
    id: generateId('SPU'),
    code: generateCode('SPU'),
    name: productName,
    shortName: productName.length > 10 ? productName.slice(0, 8) + '...' : productName,
    description: `${productName}，${brand}出品，适合观影时享用的高品质产品。`,
    unit: randomChoice(['瓶', '包', '盒', '份', '张']),
    categoryId: generateId('CAT'),
    categoryName: categoryLevel3 ? `${categoryName} > ${categoryLevel2} > ${categoryLevel3}` : `${categoryName} > ${categoryLevel2}`,
    categoryPath: [categoryName, categoryLevel2, categoryLevel3].filter(Boolean),
    brandId: generateId('BRAND'),
    brandName: brand,
    status,
    attributes: generateSPUAttributes(categoryName),
    images: generateProductImages(),
    tags: [randomChoice(['热销', '新品', '推荐', '限时优惠']), randomChoice(['经典', '网红', '健康'])],
    skuCount: Math.floor(Math.random() * 10) + 1,
    priceRange: {
      min: Math.floor(Math.random() * 50) + 10,
      max: Math.floor(Math.random() * 150) + 100
    },
    inventory: {
      totalStock: Math.floor(Math.random() * 1000) + 100,
      availableStock: Math.floor(Math.random() * 800) + 50
    },
    createdAt: createdTime,
    updatedAt: status === 'active' ? now : createdTime,
    creator: randomChoice(['张三', '李四', '王五', '赵六']),
    modifier: status === 'active' ? randomChoice(['张三', '李四', '王五', '赵六']) : '',
    ...overrides
  }
}

// 生成SPU列表
export const generateMockSPUList = (count: number): SPUItem[] => {
  return Array.from({ length: count }, () => generateMockSPU())
}

// 生成分类数据
export const generateMockCategory = (level: CategoryLevel, parentId?: string): CategoryItem => {
  const level1Categories = cinemaCategories.level1
  const level1Key = randomChoice(level1Categories)

  let name = ''
  let code = ''
  let path: string[] = []

  if (level === 1) {
    name = level1Key
    code = `CAT${Math.floor(Math.random() * 100)}`
    path = [name]
  } else if (level === 2 && parentId) {
    const parentCategory = level1Categories.find(cat => level1Categories.includes(cat))
    if (parentCategory) {
      const level2Options = cinemaCategories.level2[parentCategory as keyof typeof cinemaCategories.level2] || []
      name = randomChoice(level2Options)
      code = `CAT${Math.floor(Math.random() * 1000)}`
      path = [parentCategory, name]
    }
  } else if (level === 3 && parentId) {
    // 简化处理，生成三级分类
    const level3Options = ['标准款', '升级款', '豪华款', '经典款', '新款']
    name = randomChoice(level3Options)
    code = `CAT${Math.floor(Math.random() * 10000)}`
    path = ['父级分类', '二级分类', name]
  }

  const now = new Date().toISOString()

  return {
    id: generateId('CAT'),
    code,
    name,
    level,
    parentId,
    path,
    status: randomChoice<CategoryStatus>(['active', 'inactive']),
    sortOrder: Math.floor(Math.random() * 100),
    spuCount: Math.floor(Math.random() * 50),
    hasChildren: Math.random() > 0.5,
    createdAt: now,
    updatedAt: now
  }
}

// 生成分类列表
export const generateMockCategories = (count: number = 20): CategoryItem[] => {
  const categories: CategoryItem[] = []

  // 生成一级分类
  for (let i = 0; i < 4; i++) {
    const category = generateMockCategory(1)
    categories.push(category)
  }

  // 生成二级分类
  for (let i = 4; i < count - 4; i++) {
    const parentId = randomChoice(categories.slice(0, 4)).id
    const category = generateMockCategory(2, parentId)
    categories.push(category)
  }

  // 生成三级分类
  for (let i = count - 4; i < count; i++) {
    const parentId = randomChoice(categories.slice(4, count - 4)).id
    const category = generateMockCategory(3, parentId)
    categories.push(category)
  }

  return categories
}

// 生成品牌数据
export const generateMockBrand = (): BrandItem => {
  const brand = randomChoice(cinemaBrands)
  const now = new Date().toISOString()
  const foundedYear = Math.floor(Math.random() * 50) + 1970

  return {
    id: generateId('BRAND'),
    code: generateCode('BRAND'),
    name: brand,
    englishName: brand,
    description: `${brand}是知名的消费品品牌，在影院零售渠道有着良好的口碑和市场份额。`,
    logo: `https://logo.clearbit.com/${brand.toLowerCase().replace(/\s+/g, '')}.com`,
    website: `https://www.${brand.toLowerCase().replace(/\s+/g, '')}.com`,
    country: randomChoice(['中国', '美国', '日本', '德国', '法国']),
    foundedYear,
    status: randomChoice<BrandStatus>(['active', 'inactive']),
    spuCount: Math.floor(Math.random() * 20) + 5,
    contactInfo: {
      phone: `400-123-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `contact@${brand.toLowerCase().replace(/\s+/g, '')}.com`,
      address: randomChoice(['北京市朝阳区', '上海市浦东新区', '广州市天河区', '深圳市南山区']),
      website: `https://www.${brand.toLowerCase().replace(/\s+/g, '')}.com`
    },
    createdAt: now,
    updatedAt: now
  }
}

// 生成品牌列表
export const generateMockBrands = (count: number = 10): BrandItem[] => {
  return Array.from({ length: count }, () => generateMockBrand())
}

// 生成特定场景的测试数据
export const generateScenarioData = (scenario: string) => {
  switch (scenario) {
    case 'low-stock':
      return generateMockSPUList(10).map(spu => ({
        ...spu,
        inventory: {
          totalStock: Math.floor(Math.random() * 20) + 1,
          availableStock: Math.floor(Math.random() * 15) + 1
        }
      }))

    case 'new-products':
      return generateMockSPUList(15).map(spu => ({
        ...spu,
        status: 'active',
        tags: ['新品', '推荐'],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
      }))

    case 'high-price':
      return generateMockSPUList(8).map(spu => ({
        ...spu,
        priceRange: {
          min: Math.floor(Math.random() * 100) + 100,
          max: Math.floor(Math.random() * 200) + 200
        }
      }))

    default:
      return generateMockSPUList(20)
  }
}