/**
 * @spec O003-beverage-order
 * Mock 支付页面
 */
import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useMockPayment } from '../../../hooks'
import './index.scss'

/**
 * Mock 支付页面
 *
 * 功能：
 * - 自动调用 Mock 支付接口（500ms 延迟）
 * - 支付成功后跳转订单详情页
 */
const MockPayment: React.FC = () => {
  const router = useRouter()
  const orderId = router.params.orderId || ''
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  )

  const { mutateAsync: mockPay } = useMockPayment({
    onSuccess: (order) => {
      setPaymentStatus('success')
      setTimeout(() => {
        Taro.redirectTo({
          url: `/pages/order/detail/index?orderId=${order.id}`,
        })
      }, 1500)
    },
    onError: () => {
      setPaymentStatus('error')
    },
  })

  useEffect(() => {
    if (!orderId) {
      Taro.showToast({
        title: '订单ID不存在',
        icon: 'error',
        duration: 2000,
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 2000)
      return
    }

    // 自动触发支付
    mockPay(orderId)
  }, [orderId, mockPay])

  const handleRetry = () => {
    setPaymentStatus('processing')
    mockPay(orderId)
  }

  return (
    <View className="mock-payment">
      {paymentStatus === 'processing' && (
        <View className="mock-payment__status processing">
          <View className="mock-payment__spinner" />
          <Text className="mock-payment__text">支付处理中...</Text>
          <Text className="mock-payment__hint">请稍候，正在完成支付</Text>
        </View>
      )}

      {paymentStatus === 'success' && (
        <View className="mock-payment__status success">
          <View className="mock-payment__icon success">✓</View>
          <Text className="mock-payment__text">支付成功！</Text>
          <Text className="mock-payment__hint">即将跳转到订单详情</Text>
        </View>
      )}

      {paymentStatus === 'error' && (
        <View className="mock-payment__status error">
          <View className="mock-payment__icon error">×</View>
          <Text className="mock-payment__text">支付失败</Text>
          <Text className="mock-payment__hint">请稍后重试</Text>
          <View className="mock-payment__retry-btn" onClick={handleRetry}>
            <Text>重新支付</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default MockPayment
