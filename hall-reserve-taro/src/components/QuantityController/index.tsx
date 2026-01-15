/**
 * @spec O010-shopping-cart
 * 数量控制器组件
 *
 * 用于购物车和商品卡片的数量加减控制
 * - 包含 "-" 按钮、数字显示、"+" 按钮
 * - 支持点击事件阻止冒泡（防止触发父组件点击）
 * - 防抖保护（300ms 内重复点击忽略）
 */

import React, { useRef } from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

/**
 * QuantityController 组件属性
 */
export interface QuantityControllerProps {
  /** 当前数量 */
  quantity: number

  /** 增加数量回调 */
  onIncrease: () => void

  /** 减少数量回调 */
  onDecrease: () => void

  /** 自定义样式类名 */
  className?: string
}

/**
 * 数量控制器组件
 *
 * @example
 * ```tsx
 * <QuantityController
 *   quantity={3}
 *   onIncrease={() => updateQuantity(productId, 1)}
 *   onDecrease={() => updateQuantity(productId, -1)}
 * />
 * ```
 */
export const QuantityController: React.FC<QuantityControllerProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  className = '',
}) => {
  // 防抖：记录上次点击时间
  const lastClickTime = useRef<number>(0)
  const DEBOUNCE_DELAY = 300 // 300ms 防抖延迟

  /**
   * 处理减少按钮点击
   * - 阻止事件冒泡，防止触发父组件（如商品卡片）的点击事件
   * - 防抖保护：300ms 内重复点击忽略
   */
  const handleDecrease = (e: any) => {
    e.stopPropagation()

    const now = Date.now()
    if (now - lastClickTime.current < DEBOUNCE_DELAY) {
      return // 忽略快速重复点击
    }
    lastClickTime.current = now

    onDecrease()
  }

  /**
   * 处理增加按钮点击
   * - 阻止事件冒泡，防止触发父组件（如商品卡片）的点击事件
   * - 防抖保护：300ms 内重复点击忽略
   */
  const handleIncrease = (e: any) => {
    e.stopPropagation()

    const now = Date.now()
    if (now - lastClickTime.current < DEBOUNCE_DELAY) {
      return // 忽略快速重复点击
    }
    lastClickTime.current = now

    onIncrease()
  }

  return (
    <View className={`${styles.controller} ${className}`}>
      {/* 减少按钮 */}
      <View className={styles.decreaseButton} onClick={handleDecrease}>
        <Text className={styles.buttonText}>-</Text>
      </View>

      {/* 数量显示 */}
      <Text className={styles.quantity}>{quantity}</Text>

      {/* 增加按钮 */}
      <View className={styles.increaseButton} onClick={handleIncrease}>
        <Text className={styles.buttonText}>+</Text>
      </View>
    </View>
  )
}
