/**
 * @spec O003-beverage-order
 * 创建订单 Mutation Hook
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Taro from '@tarojs/taro'
import { orderService } from '../services/orderService'
import type { CreateBeverageOrderRequest, BeverageOrderDTO } from '../types/order'

/**
 * 创建订单成功回调参数
 */
interface CreateOrderSuccessContext {
  order: BeverageOrderDTO
}

/**
 * 创建订单 Hook 配置
 */
interface UseCreateOrderOptions {
  /**
   * 创建成功回调
   */
  onSuccess?: (data: BeverageOrderDTO) => void

  /**
   * 创建失败回调
   */
  onError?: (error: Error) => void
}

/**
 * 创建订单 Mutation Hook
 *
 * @param options 配置选项
 * @returns TanStack Query mutation result
 */
export const useCreateOrder = (options?: UseCreateOrderOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateBeverageOrderRequest) => {
      return orderService.createOrder(request)
    },

    onSuccess: (data: BeverageOrderDTO) => {
      // 刷新"我的订单"列表缓存
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })

      // 显示成功提示
      Taro.showToast({
        title: '订单创建成功',
        icon: 'success',
        duration: 2000,
      })

      // 调用用户自定义回调
      options?.onSuccess?.(data)
    },

    onError: (error: Error) => {
      // 显示错误提示
      Taro.showToast({
        title: error.message || '订单创建失败',
        icon: 'error',
        duration: 2000,
      })

      // 调用用户自定义回调
      options?.onError?.(error)
    },
  })
}
