/**
 * @spec O011-order-checkout
 * 支付成功页组件
 */
import { View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useMemo } from 'react'
import { formatPrice } from '../../utils/formatPrice'
import './index.less'

const OrderSuccess = () => {
  const router = useRouter()

  // 从 URL 参数获取订单信息
  const { orderNumber, pickupNumber, totalAmount } = useMemo(() => {
    const params = router.params
    return {
      orderNumber: params.orderNumber || '',
      pickupNumber: params.pickupNumber || '',
      totalAmount: Number(params.totalAmount) || 0
    }
  }, [router.params])

  /**
   * 返回首页
   */
  const handleBackToHome = () => {
    Taro.reLaunch({
      url: '/pages/menu/index'
    })
  }

  /**
   * 查看订单详情（预留）
   */
  const handleViewOrder = () => {
    Taro.showToast({
      title: '订单功能开发中',
      icon: 'none',
      duration: 2000
    })
  }

  return (
    <View className="order-success-page">
      {/* 成功图标区域 */}
      <View className="success-icon-wrapper">
        <View className="success-icon">
          <Text className="check-mark">✓</Text>
        </View>
        <View className="success-ripple ripple-1" />
        <View className="success-ripple ripple-2" />
      </View>

      {/* 成功提示文字 */}
      <Text className="success-title">支付成功</Text>
      <Text className="success-subtitle">感谢您的订购</Text>

      {/* 取餐号展示（突出显示） */}
      <View className="pickup-section">
        <Text className="pickup-label">取餐号</Text>
        <Text className="pickup-number">{pickupNumber}</Text>
        <Text className="pickup-hint">请留意叫号屏幕</Text>
      </View>

      {/* 订单信息卡片 */}
      <View className="order-info-card">
        <View className="info-row">
          <Text className="info-label">订单编号</Text>
          <Text className="info-value">{orderNumber}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">支付金额</Text>
          <Text className="info-value amount">{formatPrice(totalAmount)}</Text>
        </View>
        <View className="info-row">
          <Text className="info-label">预计等待</Text>
          <Text className="info-value">10-15 分钟</Text>
        </View>
      </View>

      {/* 温馨提示 */}
      <View className="tips-section">
        <Text className="tips-title">温馨提示</Text>
        <Text className="tips-content">
          请在听到取餐号后前往取餐窗口领取您的商品
        </Text>
      </View>

      {/* 底部按钮区域 */}
      <View className="bottom-actions">
        <View className="action-button secondary" onClick={handleViewOrder}>
          <Text className="button-text">查看订单</Text>
        </View>
        <View className="action-button primary" onClick={handleBackToHome}>
          <Text className="button-text">返回首页</Text>
        </View>
      </View>
    </View>
  )
}

export default OrderSuccess
