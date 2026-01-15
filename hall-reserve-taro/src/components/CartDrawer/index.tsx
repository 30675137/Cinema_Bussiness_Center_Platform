/**
 * @spec O010-shopping-cart
 * CartDrawer - 购物车抽屉组件
 *
 * 功能：
 * - 从底部滑入的抽屉式购物车
 * - 显示商品列表（可滚动）
 * - 显示小计和总金额
 * - 固定的标题栏和结算区域
 * - 点击遮罩层或关闭按钮关闭抽屉
 */

import React, { useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { useCartStore } from '@/stores/cartStore'
import { QuantityController } from '@/components/QuantityController'
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
 * 购物车抽屉组件
 *
 * @example
 * ```tsx
 * <CartDrawer />
 * ```
 */
export const CartDrawer: React.FC = () => {
  // ========== 购物车状态 ==========
  const cart = useCartStore((state) => state.cart)
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const setCartOpen = useCartStore((state) => state.setCartOpen)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const subtotal = useCartStore((state) => state.subtotal())
  const cartTotal = useCartStore((state) => state.cartTotal())

  // ========== 计算值 ==========

  /**
   * 实时计算总金额
   * 使用 useMemo 优化性能
   */
  const totalAmount = useMemo(() => {
    return cartTotal
  }, [cartTotal])

  // ========== 事件处理器 ==========

  /**
   * 关闭抽屉
   */
  const handleClose = () => {
    setCartOpen(false)
  }

  /**
   * 点击遮罩层关闭抽屉
   */
  const handleMaskClick = () => {
    setCartOpen(false)
  }

  /**
   * 阻止抽屉内容点击事件冒泡到遮罩层
   */
  const handleDrawerClick = (e: any) => {
    e.stopPropagation()
  }

  // 抽屉未打开时不渲染
  if (!isCartOpen) {
    return null
  }

  return (
    <View className={styles.overlay}>
      {/* 遮罩层 */}
      <View className={styles.mask} onClick={handleMaskClick} />

      {/* 抽屉 */}
      <View className={styles.drawer} onClick={handleDrawerClick}>
        {/* 标题栏 */}
        <View className={styles.header}>
          <Text className={styles.title}>订单汇总</Text>
          <View className={styles.closeButton} onClick={handleClose}>
            <Text className={styles.closeIcon}>✕</Text>
          </View>
        </View>

        {/* 商品列表（可滚动） */}
        <ScrollView className={styles.list} scrollY>
          {cart.length === 0 ? (
            // 空购物车状态
            <View className={styles.empty}>
              <Text className={styles.emptyText}>空空如也</Text>
              <Text className={styles.emptyHint}>快去选购商品吧~</Text>
            </View>
          ) : (
            // 商品列表
            cart.map((item, index) => (
              <View key={`${item.product.id}-${index}`} className={styles.item}>
                {/* 商品图片 */}
                <Image
                  src={item.product.image}
                  className={styles.itemImage}
                  mode="aspectFill"
                />

                {/* 商品信息 */}
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{item.product.name}</Text>
                  <Text className={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
                </View>

                {/* 数量控制器 */}
                <View className={styles.itemControl}>
                  <QuantityController
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity(item.product.id, 1, item.selectedOptions)}
                    onDecrease={() => updateQuantity(item.product.id, -1, item.selectedOptions)}
                  />
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* 底部结算区域 */}
        <View className={styles.footer}>
          {/* 小计 */}
          <View className={styles.summary}>
            <Text className={styles.summaryLabel}>小计:</Text>
            <Text className={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          {/* 优惠（当前版本暂无优惠逻辑） */}
          {/* <View className={styles.summary}>
            <Text className={styles.summaryLabel}>优惠:</Text>
            <Text className={styles.summaryValue}>-¥0.00</Text>
          </View> */}

          {/* 实付金额 */}
          <View className={styles.total}>
            <Text className={styles.totalLabel}>实付金额:</Text>
            <Text className={styles.totalValue}>{formatPrice(totalAmount)}</Text>
          </View>

          {/* 支付按钮 */}
          <View className={styles.payButton}>
            <Text className={styles.payButtonText}>立即支付</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
