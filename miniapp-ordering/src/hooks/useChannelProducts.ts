/**
 * @spec O006-miniapp-channel-order
 * 渠道商品查询 Hook
 */

import { useQuery } from '@tanstack/react-query'
import { getChannelProducts } from '@/services/channelProductService'
import type { ChannelCategory } from '@/types/channelProduct'

/**
 * 查询商品列表的 Query Key
 */
export const channelProductsKeys = {
  all: ['channel-products'] as const,
  lists: () => [...channelProductsKeys.all, 'list'] as const,
  list: (category?: ChannelCategory) =>
    [...channelProductsKeys.lists(), { category }] as const,
  details: () => [...channelProductsKeys.all, 'detail'] as const,
  detail: (id: string) => [...channelProductsKeys.details(), id] as const,
  specs: (id: string) =>
    [...channelProductsKeys.detail(id), 'specs'] as const,
}

/**
 * 获取渠道商品列表
 *
 * @param category 按分类筛选(可选)
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```typescript
 * function ProductListPage() {
 *   const { data, isLoading, error } = useChannelProducts()
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error message={error.message} />
 *
 *   return (
 *     <View>
 *       {data?.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </View>
 *   )
 * }
 *
 * // 按分类筛选
 * function CoffeeProducts() {
 *   const { data } = useChannelProducts(ChannelCategory.COFFEE)
 *   return <ProductList products={data || []} />
 * }
 * ```
 */
export const useChannelProducts = (category?: ChannelCategory) => {
  return useQuery({
    queryKey: channelProductsKeys.list(category),
    queryFn: () => getChannelProducts(category),
    staleTime: 5 * 60 * 1000, // 5分钟(商品列表较稳定)
  })
}
