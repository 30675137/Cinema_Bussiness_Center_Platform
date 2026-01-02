/**
 * @spec O006-miniapp-channel-order
 * 订单确认页面
 */

import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { CartItemCard } from '@/components/molecules/CartItemCard'
import { Price } from '@/components/atoms/Price'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/atoms/EmptyState'
import { useCartStore } from '@/stores/cartStore'
import { useCreateOrder } from '@/hooks/useCreateOrder'
import { isCartEmpty } from '@/types/cart'
import './index.scss'

export default function OrderConfirm() {
  const { items, totalQuantity, totalPrice, clearCart, updateQuantity } = useCartStore()
  const createOrderMutation = useCreateOrder()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 增加数量
  const handleIncrease = (cartItemId: string) => {
    const item = items.find((i) => i.cartItemId === cartItemId)
    if (item) {
      updateQuantity(cartItemId, item.quantity + 1)
    }
  }

  // 减少数量
  const handleDecrease = (cartItemId: string) => {
    const item = items.find((i) => i.cartItemId === cartItemId)
    if (item) {
      updateQuantity(cartItemId, item.quantity - 1)
    }
  }

  // 提交订单
  const handleSubmitOrder = async () => {
    if (isCartEmpty(items)) {
      Taro.showToast({
        title: '购物车为空',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 构造订单数据
      const orderItems = items.map((item) => ({
        channelProductId: item.channelProductId,
        selectedSpecs: item.selectedSpecs,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))

      // 调用创建订单 API
      const order = await createOrderMutation.mutateAsync({ items: orderItems })

      // 清空购物车
      clearCart()

      // 显示成功提示
      Taro.showToast({
        title: '下单成功!',
        icon: 'success',
        duration: 2000,
      })

      // 跳转到订单详情页面（TODO: 实现订单详情页面后取消注释）
      setTimeout(() => {
        // Taro.redirectTo({ url: `/pages/order-detail/index?id=${order.id}` })
        Taro.navigateBack()
      }, 2000)
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '下单失败',
        icon: 'none',
        duration: 2000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 购物车为空
  if (isCartEmpty(items)) {
    return (
      <View className="order-confirm">
        <EmptyState message="购物车空空如也" />
        <View className="order-confirm__empty-action">
          <Button
            type="primary"
            size="medium"
            onClick={() => Taro.navigateBack()}
          >
            返回菜单
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View className="order-confirm">
      {/* 商品列表 */}
      <ScrollView className="order-confirm__content" scrollY>
        <View className="order-confirm__section">
          <View className="order-confirm__section-header">
            <Text className="order-confirm__section-title">商品清单</Text>
            <Text className="order-confirm__section-count">共 {totalQuantity} 件</Text>
          </View>

          <View className="order-confirm__items">
            {items.map((item) => (
              <CartItemCard
                key={item.cartItemId}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
              />
            ))}
          </View>
        </View>

        {/* 订单汇总 */}
        <View className="order-confirm__section">
          <View className="order-confirm__section-header">
            <Text className="order-confirm__section-title">订单汇总</Text>
          </View>

          <View className="order-confirm__summary">
            <View className="order-confirm__summary-row">
              <Text className="order-confirm__summary-label">商品小计</Text>
              <Price value={totalPrice} size="small" />
            </View>

            <View className="order-confirm__summary-row order-confirm__summary-row--total">
              <Text className="order-confirm__summary-label-total">实付金额</Text>
              <Price value={totalPrice} size="large" bold color="#f59e0b" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View className="order-confirm__footer">
        <View className="order-confirm__footer-info">
          <Text className="order-confirm__footer-label">应付</Text>
          <Price value={totalPrice} size="xlarge" bold color="#f59e0b" />
        </View>

        <Button
          type="primary"
          size="large"
          loading={isSubmitting}
          onClick={handleSubmitOrder}
          className="order-confirm__submit-btn"
        >
          {isSubmitting ? '提交中...' : '提交订单'}
        </Button>
      </View>
    </View>
  )
}
