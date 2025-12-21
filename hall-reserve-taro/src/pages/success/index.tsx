import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/stores/appStore'
import { ADDONS } from '@/constants'
import './index.less'

export default function Success() {
  const successData = useAppStore((s) => s.successData)
  const reset = useAppStore((s) => s.reset)

  const handleBackHome = () => {
    reset()
    Taro.reLaunch({ url: '/pages/home/index' })
  }

  if (!successData) {
    return (
      <View className="loading-container">
        <Text>加载中...</Text>
      </View>
    )
  }

  const { scenario, package: pkg, addons, total, time, date } = successData

  // 计算已选加购项
  const selectedAddons = ADDONS.filter((item) => addons[item.id] > 0)

  return (
    <View className="success-page">
      {/* Success Header */}
      <View className="success-header">
        <View className="success-icon">
          <Text>✓</Text>
        </View>
        <Text className="success-title">预订成功</Text>
        <Text className="success-subtitle">您的预订已确认，请准时到场</Text>
      </View>

      {/* Order Card */}
      <View className="order-card">
        <View className="order-header">
          <Image src={scenario.image} mode="aspectFill" className="order-image" />
          <View className="order-info">
            <Text className="order-title">{scenario.title}</Text>
            <Text className="order-location">{scenario.location}</Text>
          </View>
        </View>

        <View className="order-divider" />

        <View className="order-details">
          <View className="detail-row">
            <Text className="detail-label">套餐</Text>
            <Text className="detail-value">{pkg.name}</Text>
          </View>
          <View className="detail-row">
            <Text className="detail-label">日期</Text>
            <Text className="detail-value">{date}</Text>
          </View>
          <View className="detail-row">
            <Text className="detail-label">时间</Text>
            <Text className="detail-value">{time}</Text>
          </View>
          {selectedAddons.length > 0 && (
            <View className="detail-row">
              <Text className="detail-label">加购</Text>
              <Text className="detail-value">
                {selectedAddons.map((a) => `${a.name} x${addons[a.id]}`).join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View className="order-divider" />

        <View className="order-total">
          <Text className="total-label">订单金额</Text>
          <Text className="total-value">¥{total}</Text>
        </View>
      </View>

      {/* Order ID */}
      <View className="order-id-section">
        <Text className="order-id">订单号: ORD{Date.now().toString().slice(-8)}</Text>
      </View>

      {/* Action Buttons */}
      <View className="action-buttons">
        <View className="btn-secondary" onClick={handleBackHome}>
          <Text>返回首页</Text>
        </View>
        <View className="btn-primary">
          <Text>查看订单</Text>
        </View>
      </View>

      {/* Tips */}
      <View className="tips-section">
        <Text className="tips-title">温馨提示</Text>
        <View className="tips-list">
          <Text className="tip-item">• 请提前 15 分钟到达场馆</Text>
          <Text className="tip-item">• 如需取消请提前 24 小时联系客服</Text>
          <Text className="tip-item">• 凭订单号或手机号到前台核销</Text>
        </View>
      </View>
    </View>
  )
}
