/**
 * @spec O007-miniapp-menu-api
 * @spec O002-miniapp-menu-config
 * 商品列表 Hook
 */

import { useQuery } from '@tanstack/react-query'
import { ChannelCategory, ProductCard } from '../types/product'
import { fetchProducts, toProductCard } from '../services/channelProductService'

/**
 * @spec O002-miniapp-menu-config
 * 商品列表查询参数
 */
interface UseProductsParams {
  /**
   * 分类 ID（UUID 格式，优先级最高）
   */
  categoryId?: string | null
  /**
   * 分类编码（向后兼容，优先级次之）
   */
  category?: ChannelCategory | null
}

/**
 * 商品列表 Hook
 * @spec O002-miniapp-menu-config
 * @param params 查询参数（支持 categoryId 和 category）
 * @returns TanStack Query 查询结果
 */
export function useProducts(params?: UseProductsParams) {
  const categoryId = params?.categoryId
  const category = params?.category

  return useQuery({
    // O002: 查询键包含 categoryId，分类变化时自动重新获取
    queryKey: ['products', { categoryId, category }],

    // 查询函数
    queryFn: async () => {
      const response = await fetchProducts({
        // O002: categoryId 优先级最高
        categoryId: categoryId,
        category: category,
        status: 'ACTIVE',
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      })

      // 转换为 ProductCard 数组
      const products = response.data.map(toProductCard)
      return products
    },

    // 缓存时间：调试模式禁用缓存
    staleTime: 0,

    // 禁用后台自动刷新
    refetchInterval: false,

    // 窗口聚焦时自动刷新
    refetchOnWindowFocus: true,

    // 重连时自动刷新
    refetchOnReconnect: true,

    // 失败重试：最多2次
    retry: 2,

    // 重试延迟：指数退避（1秒、2秒）
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
