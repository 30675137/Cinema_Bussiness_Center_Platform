/**
 * @spec O006-miniapp-channel-order
 * 浮动购物车按钮组件
 */

import { View, Text } from '@tarojs/components'
import { useCartStore } from '@/stores/cartStore'
import { Price } from '@/components/atoms/Price'
import { isCartEmpty } from '@/types/cart'
import './index.scss'

export interface FloatingCartButtonProps {
  /** 点击事件 */
  onClick?: () => void
}

/**
 * 浮动购物车按钮
 *
 * @description
 * - 固定在屏幕底部（底部导航上方）
 * - 显示购物车商品数量角标
 * - 显示总价
 * - 购物车为空时不显示
 *
 * @example
 * ```tsx
 * <FloatingCartButton onClick={() => setIsCartOpen(true)} />
 * ```
 */
export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  onClick,
}) => {
  const { items, totalQuantity, totalPrice } = useCartStore()

  // 购物车为空时不显示
  if (isCartEmpty(items)) {
    return null
  }

  return (
    <View className="floating-cart-button" onClick={onClick}>
      {/* 左侧: 商品数量角标 */}
      <View className="floating-cart-button__badge">
        <Text className="floating-cart-button__badge-text">{totalQuantity}</Text>
      </View>

      {/* 中间: 提示文字和总价 */}
      <View className="floating-cart-button__content">
        <Text className="floating-cart-button__label">去结账</Text>
        <View className="floating-cart-button__price">
          <Price value={totalPrice} size="large" bold />
        </View>
      </View>

      {/* 右侧: 箭头图标 */}
      <View className="floating-cart-button__arrow">
        <Text className="floating-cart-button__arrow-icon">›</Text>
      </View>
    </View>
  )
}
