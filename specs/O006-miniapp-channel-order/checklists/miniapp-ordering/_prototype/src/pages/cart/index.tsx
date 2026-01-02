/**
 * @spec O006-miniapp-channel-order
 * 购物车页面 - 商品编辑与订单提交
 */

import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCartStore } from '../../stores/cartStore'
import { useCreateChannelOrder } from '../../hooks/useChannelOrders'
import { formatPrice } from '../../utils/priceCalculator'
import type { CreateChannelProductOrderDTO } from '../../types/order'
import './index.scss'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const getTotalAmount = useCartStore((state) => state.getTotalAmount)
  const clearCart = useCartStore((state) => state.clearCart)

  const { mutateAsync: createOrder, isPending } = useCreateChannelOrder()

  // 处理数量调整
  const handleQuantityChange = (cartItemId: string, delta: number) => {
    const item = items.find((i) => i.cartItemId === cartItemId)
    if (!item) return

    const newQuantity = item.quantity + delta
    updateQuantity(cartItemId, newQuantity)
  }

  // 处理删除商品
  const handleRemoveItem = (cartItemId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          removeFromCart(cartItemId)
        }
      },
    })
  }

  // 提交订单
  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      Taro.showToast({
        title: '购物车为空',
        icon: 'none',
      })
      return
    }

    try {
      const orderRequest: CreateChannelProductOrderDTO = {
        items: items.map((item) => ({
          channelProductId: item.channelProductId,
          displayName: item.displayName,
          mainImage: item.mainImage,
          basePrice: item.basePrice,
          selectedSpecs: item.selectedSpecs,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
        totalAmount: getTotalAmount(),
        paymentMethod: 'MOCK',
      }

      Taro.showLoading({ title: '提交中...' })

      const order = await createOrder(orderRequest)

      Taro.hideLoading()

      // 清空购物车
      clearCart()

      // 跳转到订单详情
      Taro.showToast({
        title: '下单成功',
        icon: 'success',
      })

      setTimeout(() => {
        Taro.redirectTo({
          url: `/pages/order-detail/index?id=${order.id}`,
        })
      }, 500)
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({
        title: error.message || '下单失败',
        icon: 'none',
      })
    }
  }

  // 空购物车状态
  if (items.length === 0) {
    return (
      <View className="cart-page">
        <View className="empty-cart">
          <Text className="empty-icon">🛒</Text>
          <Text className="empty-text">购物车空空如也</Text>
          <Button
            className="go-shopping-btn"
            onClick={() => Taro.navigateBack()}
          >
            去逛逛
          </Button>
        </View>
      </View>
    )
  }

  const totalAmount = getTotalAmount()

  return (
    <View className="cart-page">
      <ScrollView className="cart-list" scrollY>
        {items.map((item) => (
          <View key={item.cartItemId} className="cart-item">
            {/* 商品图片 */}
            <View className="item-image-wrapper">
              <Image
                className="item-image"
                src={item.mainImage}
                mode="aspectFill"
              />
            </View>

            {/* 商品信息 */}
            <View className="item-info">
              <Text className="item-name">{item.displayName}</Text>

              {/* 规格信息 */}
              {item.selectedSpecs.length > 0 && (
                <View className="item-specs">
                  {item.selectedSpecs.map((spec, index) => (
                    <Text key={index} className="spec-text">
                      {spec.optionName}
                      {index < item.selectedSpecs.length - 1 && ' / '}
                    </Text>
                  ))}
                </View>
              )}

              {/* 价格和数量 */}
              <View className="item-footer">
                <Text className="item-price">{formatPrice(item.unitPrice)}</Text>

                <View className="quantity-control">
                  <View
                    className={`quantity-btn ${item.quantity <= 1 ? 'disabled' : ''}`}
                    onClick={() => handleQuantityChange(item.cartItemId, -1)}
                  >
                    <Text className="btn-text">-</Text>
                  </View>
                  <Text className="quantity-value">{item.quantity}</Text>
                  <View
                    className={`quantity-btn ${item.quantity >= 99 ? 'disabled' : ''}`}
                    onClick={() => handleQuantityChange(item.cartItemId, 1)}
                  >
                    <Text className="btn-text">+</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 删除按钮 */}
            <View
              className="delete-btn"
              onClick={() => handleRemoveItem(item.cartItemId)}
            >
              <Text className="delete-icon">×</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 底部结算栏 */}
      <View className="bottom-bar">
        <View className="total-info">
          <Text className="total-label">合计</Text>
          <Text className="total-amount">{formatPrice(totalAmount)}</Text>
        </View>

        <Button
          className="submit-btn"
          type="primary"
          disabled={isPending}
          onClick={handleSubmitOrder}
        >
          {isPending ? '提交中...' : '提交订单'}
        </Button>
      </View>
    </View>
  )
}
