/**
 * @spec O003-beverage-order
 * 饮品列表查询 Hook
 */
import { useQuery } from '@tanstack/react-query'
import { beverageService } from '../services/beverageService'
import type { BeverageDTO } from '../types/beverage'

/**
 * 饮品菜单查询参数
 */
interface UseBeveragesParams {
  /**
   * 分类筛选（可选）
   */
  category?: string

  /**
   * 是否只查询推荐饮品
   */
  recommendedOnly?: boolean

  /**
   * 是否启用查询（默认为 true）
   */
  enabled?: boolean
}

/**
 * 饮品列表查询结果（按分类分组）
 */
export interface BeveragesByCategory {
  [category: string]: BeverageDTO[]
}

/**
 * 饮品列表查询 Hook
 *
 * @param params 查询参数
 * @returns TanStack Query result with data grouped by category
 */
export const useBeverages = (params?: UseBeveragesParams) => {
  const { category, recommendedOnly = false, enabled = true } = params || {}

  return useQuery({
    queryKey: ['beverages', { category, recommendedOnly }],
    queryFn: async () => {
      const response = await beverageService.getBeverages(category ? { category } : undefined)
      // 将 ListResponse<Beverage> 转换为 BeveragesByCategory
      const beverages = response.data || []

      // 如果只查询推荐饮品，过滤出推荐的
      const filteredBeverages = recommendedOnly
        ? beverages.filter((b) => b.isRecommended)
        : beverages

      return groupBeveragesByCategory(filteredBeverages)
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据不过期
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
    enabled,
  })
}

/**
 * 将饮品列表按分类分组
 */
function groupBeveragesByCategory(beverages: any[]): BeveragesByCategory {
  const grouped: BeveragesByCategory = {}

  beverages.forEach((beverage) => {
    const categoryKey = getCategoryLabel(beverage.category)
    if (!grouped[categoryKey]) {
      grouped[categoryKey] = []
    }

    // 映射后端字段到前端类型
    const mappedBeverage: BeverageDTO = {
      id: beverage.id,
      name: beverage.name,
      description: beverage.description,
      category: beverage.category,
      imageUrl: beverage.mainImage || '', // 后端字段 mainImage -> 前端字段 imageUrl
      detailImages: beverage.detailImages,
      basePrice: beverage.basePrice,
      nutritionInfo: beverage.nutritionInfo,
      status: beverage.status,
      isRecommended: beverage.isRecommended,
      sortOrder: beverage.sortOrder,
      createdAt: beverage.createdAt,
      updatedAt: beverage.updatedAt,
    }

    grouped[categoryKey].push(mappedBeverage)
  })

  return grouped
}

/**
 * 获取分类的中文标签
 */
function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    'COFFEE': '咖啡',
    'TEA': '茶饮',
    'JUICE': '果汁',
    'MILK': '奶制品',
    'SODA': '碳酸饮料',
    'WATER': '水',
    'OTHER': '其他',
  }
  return categoryMap[category] || category
}
