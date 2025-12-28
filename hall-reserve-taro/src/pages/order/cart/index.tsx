/**
 * @spec O003-beverage-order
 * 购物车页面
 */
import React from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useOrderCartStore } from '../../../stores/orderCartStore'
import './index.scss'

/**
 * 购物车页面
 *
 * 功能：
 * - 显示购物车商品列表
 * - 数量调整
 * - 删除商品
 * - 显示总价
 * - 跳转到订单确认页
 */
const OrderCart: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalQuantity,
    clearCart,
  } = useOrderCartStore()

  const handleQuantityChange = (
    beverageId: string,
    specs: Record<string, string>,
    delta: number
  ) => {
    const currentItem = items.find(
      (item) =>
        item.beverageId === beverageId &&
        JSON.stringify(item.selectedSpecs) === JSON.stringify(specs)
    )

    if (!currentItem) return

    const newQuantity = currentItem.quantity + delta

    if (newQuantity <= 0) {
      handleRemoveItem(beverageId, specs)
    } else if (newQuantity <= 99) {
      updateQuantity(beverageId, specs, newQuantity)
    }
  }

  const handleRemoveItem = (beverageId: string, specs: Record<string, string>) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要从购物车中移除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          removeItem(beverageId, specs)
          Taro.showToast({
            title: '已移除',
            icon: 'success',
            duration: 1500,
          })
        }
      },
    })
  }

  const handleClearCart = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          clearCart()
          Taro.showToast({
            title: '已清空',
            icon: 'success',
            duration: 1500,
          })
        }
      },
    })
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      Taro.showToast({
        title: '购物车是空的',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    Taro.navigateTo({
      url: '/pages/order/confirm/index',
    })
  }

  // 格式化规格显示
  const formatSpecs = (specs: Record<string, string>) => {
    return Object.values(specs).filter(Boolean).join(' · ')
  }

  if (items.length === 0) {
    return (
      <View className="order-cart empty">
        <View className="order-cart__empty-content">
          <Text className="order-cart__empty-text">购物车是空的</Text>
          <Text className="order-cart__empty-hint">快去选购您喜欢的饮品吧~</Text>
          <View
            className="order-cart__empty-btn"
            onClick={() => Taro.navigateBack()}
          >
            <Text>去选购</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="order-cart">
      {/* 顶部操作栏 */}
      <View className="order-cart__header">
        <Text className="order-cart__title">购物车 ({getTotalQuantity()})</Text>
        <Text className="order-cart__clear" onClick={handleClearCart}>
          清空
        </Text>
      </View>

      {/* 商品列表 */}
      <ScrollView scrollY className="order-cart__content">
        {items.map((item, index) => (
          <View key={`${item.beverageId}-${index}`} className="order-cart__item">
            {/* 商品图片 */}
            <Image
              src={item.beverageImageUrl}
              mode="aspectFill"
              className="order-cart__item-image"
            />

            {/* 商品信息 */}
            <View className="order-cart__item-info">
              <Text className="order-cart__item-name">{item.beverageName}</Text>
              <Text className="order-cart__item-specs">{formatSpecs(item.selectedSpecs)}</Text>
              {item.customerNote && (
                <Text className="order-cart__item-note">备注: {item.customerNote}</Text>
              )}

              {/* 价格和数量 */}
              <View className="order-cart__item-footer">
                <View className="order-cart__item-price">
                  <Text className="order-cart__item-price-symbol">¥</Text>
                  <Text className="order-cart__item-price-value">
                    {(item.unitPrice / 100).toFixed(2)}
                  </Text>
                </View>

                {/* 数量调整 */}
                <View className="order-cart__quantity">
                  <View
                    className="order-cart__quantity-btn"
                    onClick={() =>
                      handleQuantityChange(item.beverageId, item.selectedSpecs, -1)
                    }
                  >
                    <Text>-</Text>
                  </View>
                  <Text className="order-cart__quantity-value">{item.quantity}</Text>
                  <View
                    className="order-cart__quantity-btn"
                    onClick={() =>
                      handleQuantityChange(item.beverageId, item.selectedSpecs, 1)
                    }
                  >
                    <Text>+</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 删除按钮 */}
            <View
              className="order-cart__item-delete"
              onClick={() => handleRemoveItem(item.beverageId, item.selectedSpecs)}
            >
              <Text>×</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 底部结算栏 */}
      <View className="order-cart__footer">
        <View className="order-cart__total">
          <Text className="order-cart__total-label">合计：</Text>
          <View className="order-cart__total-price">
            <Text className="order-cart__total-symbol">¥</Text>
            <Text className="order-cart__total-value">
              {(getTotalPrice() / 100).toFixed(2)}
            </Text>
          </View>
        </View>
        <View className="order-cart__checkout-btn" onClick={handleCheckout}>
          <Text>去结算</Text>
        </View>
      </View>
    </View>
  )
}

export default OrderCart
