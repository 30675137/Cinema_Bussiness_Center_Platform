/**
 * @spec O007-miniapp-menu-api
 * 商品列表 Hook
 */

import { useQuery } from '@tanstack/react-query'
import { ChannelCategory, ProductCard } from '../types/product'
import { fetchProducts, toProductCard } from '../services/channelProductService'

/**
 * 商品列表 Hook
 * @param category 分类（null 表示"全部"）
 * @returns TanStack Query 查询结果
 */
export function useProducts(category: ChannelCategory | null) {
  return useQuery({
    // 查询键：包含分类信息，分类变化时自动重新获取
    queryKey: ['products', { category }],
    
    // 查询函数
    queryFn: async () => {
      const response = await fetchProducts({
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
