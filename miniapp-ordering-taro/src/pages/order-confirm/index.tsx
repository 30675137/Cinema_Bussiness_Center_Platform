/**
 * @spec O011-order-checkout
 * 订单确认页组件
 */
import { View, Text, Image, ScrollView, Textarea } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { useCartStore } from '../../stores/cartStore'
import { formatPrice } from '../../utils/formatPrice'
import { PaymentSheet } from '../../components/PaymentSheet'
import { createOrder, saveOrder } from '../../services/orderService'
import type { PaymentMethod } from '../../types/order'
import './index.less'

const OrderConfirm = () => {
  // 购物车状态
  const cart = useCartStore((state) => state.cart)
  const clearCart = useCartStore((state) => state.clearCart)

  // 本地状态
  const [remark, setRemark] = useState('')
  const [showPaymentSheet, setShowPaymentSheet] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  // 计算金额
  const subtotal = useMemo(() => {
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  }, [cart.items])

  const discountAmount = 0 // 当前版本无优惠
  const totalAmount = subtotal - discountAmount

  /**
   * 格式化选项显示
   */
  const formatOptions = (selectedOptions: Record<string, string>): string => {
    const values = Object.values(selectedOptions).filter(Boolean)
    return values.length > 0 ? values.join(' · ') : ''
  }

  /**
   * 处理备注输入
   */
  const handleRemarkInput = (e: any) => {
    const value = e.detail.value
    if (value.length <= 100) {
      setRemark(value)
    }
  }

  /**
   * 处理确认支付按钮
   */
  const handleConfirmPayment = () => {
    if (cart.items.length === 0) {
      Taro.showToast({ title: '购物车为空', icon: 'none' })
      return
    }
    setShowPaymentSheet(true)
  }

  /**
   * 处理支付方式选择
   */
  const handlePaymentSelect = (method: PaymentMethod) => {
    setShowPaymentSheet(false)
    setIsPaymentLoading(true)

    // Mock 支付延迟 1.5 秒
    setTimeout(() => {
      // 创建订单
      const order = createOrder(cart.items, totalAmount, method, remark)

      // 保存订单
      saveOrder(order)

      // 清空购物车
      clearCart()

      setIsPaymentLoading(false)

      // 跳转到支付成功页
      Taro.redirectTo({
        url: `/pages/order-success/index?orderNumber=${order.orderNumber}&pickupNumber=${order.pickupNumber}&totalAmount=${order.totalAmount}`
      })
    }, 1500)
  }

  /**
   * 关闭支付选择抽屉
   */
  const handlePaymentClose = () => {
    setShowPaymentSheet(false)
  }

  return (
    <View className="order-confirm-page">
      <ScrollView className="page-content" scrollY enhanced showScrollbar={false}>
        {/* 商品列表区域 */}
        <View className="section product-section">
          <View className="section-title">
            <Text className="title-text">商品清单</Text>
            <Text className="item-count">{cart.items.length}件商品</Text>
          </View>

          <View className="product-list">
            {cart.items.map((item) => (
              <View key={item.product.id} className="product-item">
                <Image
                  src={item.product.image}
                  className="product-image"
                  mode="aspectFill"
                />
                <View className="product-info">
                  <Text className="product-name">{item.product.name}</Text>
                  {Object.keys(item.selectedOptions).length > 0 && (
                    <Text className="product-options">
                      {formatOptions(item.selectedOptions)}
                    </Text>
                  )}
                  <View className="product-price-row">
                    <Text className="product-price">
                      {formatPrice(item.product.price)}
                    </Text>
                    <Text className="product-quantity">x{item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 备注输入区域 */}
        <View className="section remark-section">
          <View className="section-title">
            <Text className="title-text">订单备注</Text>
          </View>
          <View className="remark-input-wrapper">
            <Textarea
              className="remark-input"
              placeholder="请输入特殊要求（选填）"
              placeholderClass="remark-placeholder"
              value={remark}
              onInput={handleRemarkInput}
              maxlength={100}
            />
            <Text className="remark-count">{remark.length}/100</Text>
          </View>
        </View>

        {/* 金额汇总区域 */}
        <View className="section amount-section">
          <View className="amount-row">
            <Text className="amount-label">商品小计</Text>
            <Text className="amount-value">{formatPrice(subtotal)}</Text>
          </View>
          <View className="amount-row">
            <Text className="amount-label">优惠金额</Text>
            <Text className="amount-value discount">-{formatPrice(discountAmount)}</Text>
          </View>
          <View className="amount-row total-row">
            <Text className="amount-label">实付金额</Text>
            <Text className="amount-value total">{formatPrice(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部支付按钮 */}
      <View className="bottom-bar">
        <View className="pay-summary">
          <Text className="pay-label">合计：</Text>
          <Text className="pay-amount">{formatPrice(totalAmount)}</Text>
        </View>
        <View className="pay-button" onClick={handleConfirmPayment}>
          <Text className="pay-button-text">确认支付</Text>
        </View>
      </View>

      {/* 支付方式选择抽屉 */}
      <PaymentSheet
        visible={showPaymentSheet}
        onClose={handlePaymentClose}
        onSelect={handlePaymentSelect}
      />

      {/* 支付加载遮罩 */}
      {isPaymentLoading && (
        <View className="payment-loading-mask">
          <View className="loading-content">
            <View className="loading-spinner" />
            <Text className="loading-text">支付中...</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default OrderConfirm
