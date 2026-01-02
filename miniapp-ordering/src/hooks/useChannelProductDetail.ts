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
 * @param id 商品 ID
 * @param options 查询配置选项
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```typescript
 * function ProductDetailPage({ id }: { id: string }) {
 *   const { data, isLoading, error } = useChannelProductDetail(id)
 *
 *   if (isLoading) return <Loading />
 *   if (error) return <Error message="商品不存在" />
 *
 *   return (
 *     <View>
 *       <Image src={data.mainImage} />
 *       <Text>{data.displayName}</Text>
 *       <Price value={data.basePrice} />
 *       <Text>{data.description}</Text>
 *     </View>
 *   )
 * }
 * ```
 */
export const useChannelProductDetail = (id: string) => {
  return useQuery({
    queryKey: channelProductsKeys.detail(id),
    queryFn: () => getChannelProductDetail(id),
    staleTime: 10 * 60 * 1000, // 10分钟(商品详情变化较少)
    enabled: !!id, // 只有当 id 存在时才执行查询
  })
}
