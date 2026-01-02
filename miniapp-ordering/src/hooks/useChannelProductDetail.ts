/**
 * @spec O006-miniapp-channel-order
 * 渠道商品详情查询 Hook
 */

import { useQuery } from '@tanstack/react-query'
import { getChannelProductDetail } from '@/services/channelProductService'
import { channelProductsKeys } from './useChannelProducts'

/**
 * 获取渠道商品详情
 *
 * @param id 渠道商品 ID
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```typescript
 * function ProductDetailPage({ productId }: { productId: string }) {
 *   const { data: product, isLoading, error } = useChannelProductDetail(productId)
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error message="商品不存在" />
 *
 *   return (
 *     <View>
 *       <Image src={product.mainImage} />
 *       <Text>{product.displayName}</Text>
 *       <Text>{product.description}</Text>
 *       <Text>库存状态: {product.stockStatus}</Text>
 *     </View>
 *   )
 * }
 * ```
 */
export const useChannelProductDetail = (id: string) => {
  return useQuery({
    queryKey: channelProductsKeys.detail(id),
    queryFn: () => getChannelProductDetail(id),
    enabled: !!id, // 只有当 id 存在时才查询
    staleTime: 3 * 60 * 1000, // 3分钟
  })
}
