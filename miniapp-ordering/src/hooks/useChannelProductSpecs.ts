/**
 * @spec O006-miniapp-channel-order
 * 渠道商品规格查询 Hook
 */

import { useQuery } from '@tanstack/react-query'
import { getChannelProductSpecs } from '@/services/channelProductService'
import { channelProductsKeys } from './useChannelProducts'

/**
 * 获取渠道商品规格列表
 *
 * @param id 商品 ID
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```typescript
 * function ProductSpecSelector({ productId }: { productId: string }) {
 *   const { data: specs, isLoading } = useChannelProductSpecs(productId)
 *
 *   if (isLoading) return <Loading />
 *
 *   return (
 *     <View>
 *       {specs?.map(spec => (
 *         <SpecGroup
 *           key={spec.id}
 *           spec={spec}
 *           onSelect={handleSpecSelect}
 *         />
 *       ))}
 *     </View>
 *   )
 * }
 * ```
 */
export const useChannelProductSpecs = (id: string) => {
  return useQuery({
    queryKey: channelProductsKeys.specs(id),
    queryFn: () => getChannelProductSpecs(id),
    staleTime: 10 * 60 * 1000, // 10分钟(规格配置变化较少)
    enabled: !!id, // 只有当 id 存在时才执行查询
  })
}
