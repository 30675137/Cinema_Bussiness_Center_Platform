/**
 * @spec O011-order-checkout
 * 支付方式选择抽屉组件
 */
import { View, Text, Image } from '@tarojs/components'
import { memo } from 'react'
import { PAYMENT_OPTIONS } from '../../types/order'
import type { PaymentMethod } from '../../types/order'
import './index.less'

interface PaymentSheetProps {
  visible: boolean
  onClose: () => void
  onSelect: (method: PaymentMethod) => void
}

/**
 * 支付方式选择抽屉
 * 从底部弹出，显示支付方式列表
 */
export const PaymentSheet = memo<PaymentSheetProps>(({ visible, onClose, onSelect }) => {
  if (!visible) {
    return null
  }

  /**
   * 处理遮罩点击
   */
  const handleMaskClick = () => {
    onClose()
  }

  /**
   * 阻止抽屉内容区点击冒泡
   */
  const handleContentClick = (e: any) => {
    e.stopPropagation()
  }

  /**
   * 处理支付方式选择
   */
  const handleSelect = (method: PaymentMethod) => {
    onSelect(method)
  }

  // 支付图标映射（使用 emoji 代替 SVG）
  const getPaymentIcon = (method: PaymentMethod): string => {
    switch (method) {
      case 'WECHAT_PAY':
        return '💚'
      case 'ALIPAY':
        return '💙'
      case 'APPLE_PAY':
        return '🍎'
      default:
        return '💳'
    }
  }

  return (
    <View className="payment-sheet-mask" onClick={handleMaskClick}>
      <View className="payment-sheet" onClick={handleContentClick}>
        {/* 标题栏 */}
        <View className="sheet-header">
          <Text className="sheet-title">选择支付方式</Text>
          <View className="close-button" onClick={onClose}>
            <Text className="close-icon">✕</Text>
          </View>
        </View>

        {/* 支付方式列表 */}
        <View className="payment-list">
          {PAYMENT_OPTIONS.map((option) => (
            <View
              key={option.method}
              className="payment-option"
              onClick={() => handleSelect(option.method)}
            >
              <View className="option-icon">
                <Text className="icon-emoji">{getPaymentIcon(option.method)}</Text>
              </View>
              <Text className="option-label">{option.label}</Text>
              <View className="option-arrow">
                <Text className="arrow-icon">›</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 取消按钮 */}
        <View className="cancel-button" onClick={onClose}>
          <Text className="cancel-text">取消</Text>
        </View>
      </View>
    </View>
  )
})

PaymentSheet.displayName = 'PaymentSheet'
