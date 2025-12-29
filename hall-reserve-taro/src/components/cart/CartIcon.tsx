/**
 * @spec O003-beverage-order
 * 购物车图标组件
 *
 * 显示购物车图标和商品数量徽章，点击跳转到购物车页面
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useOrderCartStore } from '../../stores/orderCartStore'
import './CartIcon.scss'

interface CartIconProps {
  /**
   * 是否固定在右下角
   * @default true
   */
  fixed?: boolean

  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 购物车图标组件
 */
const CartIcon: React.FC<CartIconProps> = ({ fixed = true, className = '' }) => {
  const totalCount = useOrderCartStore(state => state.getTotalQuantity())

  const handleClick = () => {
    Taro.navigateTo({
      url: '/pages/order/cart/index'
    })
  }

  return (
    <View
      className={`cart-icon ${fixed ? 'cart-icon--fixed' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* 购物车图标 */}
      <View className="cart-icon__icon">
        🛒
      </View>

      {/* 商品数量徽章 */}
      {totalCount > 0 && (
        <View className="cart-icon__badge">
          <Text className="cart-icon__badge-text">
            {totalCount > 99 ? '99+' : totalCount}
          </Text>
        </View>
      )}
    </View>
  )
}

export default CartIcon
