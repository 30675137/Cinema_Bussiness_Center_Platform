/**
 * @spec O006-miniapp-channel-order
 * 创建订单 Mutation Hook
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Taro from '@tarojs/taro'
import { createChannelProductOrder } from '@/services/orderService'
import type { CreateChannelProductOrderDTO } from '@/types/order'

/**
 * 订单查询键工厂
 */
export const orderKeys = {
  all: ['channel-product-orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: { status?: string; page?: number }) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

/**
 * 创建渠道商品订单 Mutation Hook
 *
 * @returns TanStack Query mutation 结果
 *
 * @example
 * ```typescript
 * function CheckoutPage() {
 *   const createOrder = useCreateOrder()
 *   const cartStore = useCartStore()
 *
 *   const handleSubmit = async () => {
 *     try {
 *       const order = await createOrder.mutateAsync({
 *         items: cartStore.items.map(item => ({
 *           channelProductId: item.productId,
 *           selectedSpecs: item.selectedSpecs,
 *           quantity: item.quantity,
 *           unitPrice: item.unitPrice
 *         }))
 *       })
 *
 *       Taro.showToast({ title: '下单成功', icon: 'success' })
 *       
 *       // 跳转到订单详情或支付页面
 *       Taro.redirectTo({
 *         url: `/pages/order-detail/index?id=${order.id}`
 *       })
 *       
 *       // 清空购物车
 *       cartStore.clearCart()
 *     } catch (error) {
 *       Taro.showToast({ title: '下单失败', icon: 'error' })
 *     }
 *   }
 *
 *   return (
 *     <Button 
 *       onClick={handleSubmit} 
 *       loading={createOrder.isPending}
 *     >
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
      // 订单创建成功后,使订单列表缓存失效
      queryClient.invalidateQueries({
        queryKey: orderKeys.lists(),
      })

      // 可选:直接添加新订单到缓存
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder)
    },

    onError: (error: any) => {
      console.error('创建订单失败:', error)
      
      // 显示错误提示
      const errorMessage = error?.message || '订单提交失败,请重试'
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000,
      })
    },
  })
}
