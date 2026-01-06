/**
 * @spec O010-shopping-cart
 * 购物车抽屉组件
 */
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { memo, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { useCartStore } from '../../stores/cartStore'
import { QuantityController } from '../QuantityController'
import { formatPrice } from '../../utils/formatPrice'
import type { CartItem } from '../../types/cart'
import './index.less'

/**
 * 购物车抽屉组件
 * 从底部滑入的购物车详情界面
 */
export const CartDrawer = memo(() => {
  // ✅ 修复：订阅 cart 状态
  const { cart, isCartOpen, toggleCartDrawer, updateQuantity } = useCartStore()

  /**
   * 处理遮罩层点击（关闭抽屉）
   */
  const handleMaskClick = () => {
    toggleCartDrawer()
  }

  /**
   * 处理抽屉内容区点击（阻止冒泡）
   */
  const handleDrawerClick = (e: any) => {
    e.stopPropagation()
  }

  /**
   * 处理关闭按钮点击
   */
  const handleClose = () => {
    toggleCartDrawer()
  }

  /**
   * 处理数量增加
   */
  const handleIncrease = (productId: string) => {
    updateQuantity(productId, 1)
  }

  /**
   * 处理数量减少
   */
  const handleDecrease = (productId: string) => {
    updateQuantity(productId, -1)
  }

  /**
   * 格式化选项显示（如"少冰 · 半糖"）
   */
  const formatOptions = (selectedOptions: Record<string, string>): string => {
    const values = Object.values(selectedOptions).filter(Boolean)
    return values.join(' · ')
  }

  /**
   * 处理支付按钮点击
   */
  const handlePayment = () => {
    // 导航到订单确认页
    Taro.navigateTo({
      url: '/pages/order-confirm/index'
    })
  }

  /**
   * ✅ 修复：基于 cart.items 计算小计和实付金额
   */
  const subtotalAmount = useMemo(() => {
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  }, [cart.items])

  const totalAmount = useMemo(() => {
    // 目前小计与总金额相同（无优惠）
    return subtotalAmount
  }, [subtotalAmount])

  // 不显示抽屉时返回 null
  if (!isCartOpen) {
    return null
  }

  return (
    <View className='cart-drawer-mask animate-fade-in' onClick={handleMaskClick}>
      {/* 抽屉主体 */}
      <View className='cart-drawer animate-slide-up' onClick={handleDrawerClick}>
        {/* 标题栏 */}
        <View className='drawer-header'>
          <Text className='drawer-title'>订单汇总</Text>
          <View className='close-button' onClick={handleClose}>
            <Text className='close-icon'>✕</Text>
          </View>
        </View>

        {/* 商品列表区域 */}
        {cart.items.length === 0 ? (
          // 空购物车状态
          <View className='empty-cart'>
            <Text className='empty-icon'>🛒</Text>
            <Text className='empty-text'>空空如也</Text>
          </View>
        ) : (
          <ScrollView
            className='product-list'
            scrollY
            enhanced
            showScrollbar={false}
          >
            {cart.items.map((item: CartItem) => (
              <View key={item.product.id} className='cart-item'>
                {/* 商品图片 */}
                <Image
                  src={item.product.image}
                  className='item-image'
                  mode='aspectFill'
                />

                {/* 商品信息 */}
                <View className='item-info'>
                  <Text className='item-name'>{item.product.name}</Text>
                  {/* 选项显示（如"少冰 · 半糖"） */}
                  {Object.keys(item.selectedOptions).length > 0 && (
                    <Text className='item-options'>
                      {formatOptions(item.selectedOptions)}
                    </Text>
                  )}
                  <Text className='item-price'>{formatPrice(item.product.price)}</Text>
                </View>

                {/* 数量控制器 */}
                <View className='item-controller'>
                  <QuantityController
                    productId={item.product.id}
                    quantity={item.quantity}
                    onIncrease={() => handleIncrease(item.product.id)}
                    onDecrease={() => handleDecrease(item.product.id)}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* 结算区域 */}
        {cart.items.length > 0 && (
          <View className='checkout-section'>
            {/* 小计 */}
            <View className='subtotal-row'>
              <Text className='subtotal-label'>小计</Text>
              <Text className='subtotal-amount'>{formatPrice(subtotalAmount)}</Text>
            </View>

            {/* 实付金额 */}
            <View className='total-row'>
              <Text className='total-label'>实付</Text>
              <Text className='total-amount'>{formatPrice(totalAmount)}</Text>
            </View>

            {/* 支付按钮 */}
            <View className='pay-button' onClick={handlePayment}>
              <Text className='pay-button-text'>立即支付</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
})

CartDrawer.displayName = 'CartDrawer'
