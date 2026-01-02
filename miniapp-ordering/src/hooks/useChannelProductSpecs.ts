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
 * @param id 渠道商品 ID
 * @returns TanStack Query 查询结果
 *
 * @example
 * ```typescript
 * function ProductSpecsSelector({ productId }: { productId: string }) {
 *   const { data: specs, isLoading } = useChannelProductSpecs(productId)
 *
 *   if (isLoading) return <Loading />
 *
 *   return (
 *     <View>
 *       {specs?.map(spec => (
 *         <SpecSelector
 *           key={spec.id}
 *           spec={spec}
 *           required={spec.isRequired}
 *           allowMultiple={spec.allowMultiple}
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
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟(规格配置较稳定)
  })
}
