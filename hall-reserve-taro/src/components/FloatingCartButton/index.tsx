/**
 * @spec O010-shopping-cart
 * FloatingCartButton - 浮动购物车按钮组件
 *
 * 功能：
 * - 购物车有商品时显示在页面底部
 * - 显示角标（商品总件数）
 * - 显示总金额
 * - 点击打开购物车抽屉
 * - 购物车为空时隐藏
 */

import React from 'react'
import { View, Text } from '@tarojs/components'
import { useCartStore } from '@/stores/cartStore'
import styles from './index.module.scss'

/**
 * 格式化价格（分 → 元）
 * @param priceInCents 价格（单位：分）
 * @returns 格式化后的价格字符串（如 "¥28.00"）
 */
const formatPrice = (priceInCents: number): string => {
  const yuan = priceInCents / 100
  return `¥${yuan.toFixed(2)}`
}

/**
 * 浮动购物车按钮组件
 *
 * @example
 * ```tsx
 * <FloatingCartButton />
 * ```
 */
export const FloatingCartButton: React.FC = () => {
  // ========== 购物车状态 ==========
  const totalItems = useCartStore((state) => state.totalItems())
  const cartTotal = useCartStore((state) => state.cartTotal())
  const toggleCartDrawer = useCartStore((state) => state.toggleCartDrawer)

  // 购物车为空时隐藏按钮
  if (cartTotal === 0) {
    return null
  }

  /**
   * 处理点击按钮
   */
  const handleClick = () => {
    toggleCartDrawer()
  }

  return (
    <View className={styles.floatingButton} onClick={handleClick}>
      {/* 角标：显示商品总件数 */}
      <View className={styles.badge}>
        <Text className={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
      </View>

      {/* 按钮内容 */}
      <View className={styles.content}>
        {/* 左侧文字 */}
        <Text className={styles.label}>去结账</Text>

        {/* 右侧：总金额 + 箭头 */}
        <View className={styles.right}>
          <Text className={styles.price}>{formatPrice(cartTotal)}</Text>
          <Text className={styles.arrow}>→</Text>
        </View>
      </View>
    </View>
  )
}
