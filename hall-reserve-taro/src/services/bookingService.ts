import { useMutation } from '@tanstack/react-query'
import Taro from '@tarojs/taro'
import type { Scenario, ScenarioPackage } from '@/types'

export interface BookingData {
  scenario: Scenario
  package: ScenarioPackage
  addons: Record<string, number>
  total: number
  time: string
  date: string
}

interface BookingResult {
  success: boolean
  orderId: string
  message: string
}

// 模拟提交预订
const submitBooking = async (data: BookingData): Promise<BookingResult> => {
  // 模拟网络请求延迟
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // TODO: 替换为真实 API 调用
  // const response = await Taro.request({
  //   url: '/api/bookings',
  //   method: 'POST',
  //   data
  // })

  return {
    success: true,
    orderId: `ORD${Date.now()}`,
    message: '预订成功'
  }
}

/**
 * 创建预订 Hook
 */
export const useCreateBooking = () => {
  return useMutation({
    mutationFn: submitBooking,
    onSuccess: (result) => {
      if (result.success) {
        Taro.showToast({
          title: result.message,
          icon: 'success'
        })
      }
    },
    onError: (error) => {
      Taro.showToast({
        title: '预订失败，请重试',
        icon: 'error'
      })
      console.error('Booking error:', error)
    }
  })
}
