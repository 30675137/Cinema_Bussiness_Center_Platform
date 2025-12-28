/**
 * @spec O003-beverage-order
 * 一键复购 Hook (C端)
 */
import { useMutation } from '@tanstack/react-query'
import Taro from '@tarojs/taro'
import { useOrderCartStore } from '../stores/orderCartStore'
import type { BeverageOrderDTO } from '../types/beverageOrder'

/**
 * 复购结果
 */
interface ReorderResult {
  /**
   * 是否成功
   */
  success: boolean

  /**
   * 添加的商品数量
   */
  itemsAdded: number

  /**
   * 错误信息（如果失败）
   */
  error?: string
}

/**
 * 一键复购 Hook
 *
 * US3: FR-021
 * 用户能够对历史订单进行"再来一单"操作，
 * 系统自动填充相同的饮品和规格到当前订单
 *
 * @returns TanStack Query mutation
 */
export const useReorder = () => {
  const { clearCart, addItem } = useOrderCartStore()

  return useMutation<ReorderResult, Error, BeverageOrderDTO>({
    mutationFn: async (order: BeverageOrderDTO) => {
      try {
        // 1. 清空当前购物车
        clearCart()

        // 2. 将历史订单的所有商品添加到购物车
        let itemsAdded = 0

        for (const item of order.items) {
          // 解析规格（从 selectedSpecs JSON字符串）
          let selectedSpecs: Record<string, string> = {}
          if (item.selectedSpecs) {
            try {
              selectedSpecs = JSON.parse(item.selectedSpecs)
            } catch (e) {
              console.warn('解析规格失败:', e)
              selectedSpecs = {}
            }
          }

          // 添加到购物车
          addItem({
            beverageId: item.beverageId,
            beverageName: item.beverageName,
            beverageImageUrl: item.beverageImageUrl || '',
            selectedSpecs,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })

          itemsAdded++
        }

        // 3. 显示成功提示
        Taro.showToast({
          title: `已添加 ${itemsAdded} 件商品`,
          icon: 'success',
          duration: 2000,
        })

        // 4. 导航到购物车页面
        await Taro.navigateTo({
          url: '/pages/order/cart/index',
        })

        return {
          success: true,
          itemsAdded,
        }
      } catch (error) {
        console.error('复购失败:', error)

        Taro.showToast({
          title: '复购失败，请重试',
          icon: 'error',
          duration: 2000,
        })

        return {
          success: false,
          itemsAdded: 0,
          error: error instanceof Error ? error.message : '未知错误',
        }
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        console.log(`复购成功 - 添加了 ${result.itemsAdded} 件商品`)
      }
    },
    onError: (error) => {
      console.error('复购操作失败:', error)
    },
  })
}
