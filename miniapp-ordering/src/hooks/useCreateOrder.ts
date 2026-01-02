/**
 * @spec O006-miniapp-channel-order
 * 创建订单 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Taro from '@tarojs/taro'
import { createChannelProductOrder } from '@/services/orderService'
import type { CreateChannelProductOrderDTO } from '@/types/order'
import { myOrdersKeys } from './useMyOrders'

/**
 * 创建渠道商品订单
 *
 * @returns TanStack Query Mutation 结果
 *
 * @example
 * ```typescript
 * function CartPage() {
 *   const { mutate: createOrder, isPending } = useCreateOrder()
 *   const { items, clearCart } = useCartStore()
 *
 *   const handleSubmitOrder = () => {
 *     const orderData: CreateChannelProductOrderDTO = {
 *       items: items.map(item => ({
 *         channelProductId: item.channelProductId,
 *         selectedSpecs: item.selectedSpecs,
 *         quantity: item.quantity,
 *         unitPrice: item.unitPrice
 *       }))
 *     }
 *
 *     createOrder(orderData, {
 *       onSuccess: (order) => {
 *         clearCart()
 *         Taro.showToast({ title: '订单创建成功', icon: 'success' })
 *         Taro.navigateTo({ url: `/pages/order-detail/index?id=${order.id}` })
 *       },
 *       onError: (error) => {
 *         Taro.showToast({ title: error.message, icon: 'error' })
 *       }
 *     })
 *   }
 *
 *   return (
 *     <Button onClick={handleSubmitOrder} loading={isPending}>
 *       提交订单
 *     </Button>
 *   )
 * }
 * ```
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderData: CreateChannelProductOrderDTO) =>
      createChannelProductOrder(orderData),

    onSuccess: (newOrder) => {
      // 创建成功后,使我的订单列表缓存失效,触发重新查询
      queryClient.invalidateQueries({ queryKey: myOrdersKeys.lists() })

      // 可选:将新订单添加到缓存中
      queryClient.setQueryData(myOrdersKeys.detail(newOrder.id), newOrder)

      // 显示成功提示
      Taro.showToast({
        title: '订单创建成功',
        icon: 'success',
        duration: 2000,
      })
    },

    onError: (error: Error) => {
      // 显示错误提示
      Taro.showToast({
        title: error.message || '订单创建失败',
        icon: 'error',
        duration: 2000,
      })
    },
  })
}
