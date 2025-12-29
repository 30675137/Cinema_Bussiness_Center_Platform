/**
 * @spec O003-beverage-order
 * Mock 支付 Mutation Hook
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Taro from '@tarojs/taro'
import { orderService } from '../services/orderService'
import type { BeverageOrderDTO } from '../types/order'

/**
 * Mock 支付 Hook 配置
 */
interface UseMockPaymentOptions {
  /**
   * 支付成功回调
   */
  onSuccess?: (data: BeverageOrderDTO) => void

  /**
   * 支付失败回调
   */
  onError?: (error: Error) => void
}

/**
 * Mock 支付 Mutation Hook
 *
 * 模拟支付流程：
 * - 调用后端 Mock 支付接口（500ms 延迟）
 * - 支付成功后生成取餐号
 * - 刷新订单缓存
 *
 * @param options 配置选项
 * @returns TanStack Query mutation result
 */
export const useMockPayment = (options?: UseMockPaymentOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      // 显示支付中提示
      Taro.showLoading({
        title: '支付中...',
        mask: true,
      })

      try {
        const result = await orderService.payOrder(orderId)
        return result
      } finally {
        Taro.hideLoading()
      }
    },

    onSuccess: (data: BeverageOrderDTO) => {
      // 刷新订单详情缓存
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
      queryClient.invalidateQueries({ queryKey: ['order-by-number', data.orderNumber] })

      // 刷新"我的订单"列表缓存
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })

      // 显示成功提示
      Taro.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000,
      })

      // 调用用户自定义回调
      options?.onSuccess?.(data)
    },

    onError: (error: Error) => {
      // 显示错误提示
      Taro.showToast({
        title: error.message || '支付失败',
        icon: 'error',
        duration: 2000,
      })

      // 调用用户自定义回调
      options?.onError?.(error)
    },
  })
}
