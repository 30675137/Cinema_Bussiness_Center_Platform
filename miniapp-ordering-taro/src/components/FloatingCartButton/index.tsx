/**
 * @spec O010-shopping-cart
 * 浮动购物车按钮组件
 */
import { View, Text } from '@tarojs/components'
import { memo, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { useCartStore } from '../../stores/cartStore'
import { formatPrice } from '../../utils/formatPrice'
import './index.less'

/**
 * 浮动购物车按钮组件
 * 固定定位在底部导航栏上方，显示购物车总金额和商品件数
 */
export const FloatingCartButton = memo(() => {
  // ✅ 修复：订阅 cart 状态，而不是只订阅函数
  const { cart, toggleCartDrawer } = useCartStore()

  /**
   * 获取当前页面路径
   */
  const currentPages = Taro.getCurrentPages()
  const currentPage = currentPages[currentPages.length - 1]
  const currentRoute = currentPage?.route || ''

  /**
   * 判断是否为商品列表页
   * 商品列表页路径可能包含: /pages/menu/index, /pages/products/index 等
   */
  const isProductListPage = useMemo(() => {
    return currentRoute.includes('/pages/menu/') || currentRoute.includes('/pages/products/')
  }, [currentRoute])

  /**
   * ✅ 修复：基于 cart.items 计算总数量
   */
  const totalItemsCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart.items])

  /**
   * 条件渲染：购物车有商品 且 当前在商品列表页
   */
  const shouldShow = totalItemsCount > 0 && isProductListPage

  /**
   * ✅ 修复：格式化角标数字（超过99显示99+）
   */
  const badgeText = useMemo(() => {
    return totalItemsCount > 99 ? '99+' : totalItemsCount.toString()
  }, [totalItemsCount])

  /**
   * ✅ 修复：计算总金额（基于 cart.items）
   */
  const totalAmount = useMemo(() => {
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  }, [cart.items])

  /**
   * 格式化总金额
   */
  const totalPriceText = useMemo(() => {
    return formatPrice(totalAmount)
  }, [totalAmount])

  /**
   * 处理点击事件
   */
  const handleClick = () => {
    toggleCartDrawer()
  }

  // 不满足显示条件时返回 null
  if (!shouldShow) {
    return null
  }

  return (
    <View className='floating-cart-button' onClick={handleClick}>
      {/* 左侧：黑色角标 */}
      <View className='badge'>
        <Text className='badge-text'>{badgeText}</Text>
      </View>

      {/* 中间："去结账"文字 */}
      <View className='content'>
        <Text className='checkout-text'>去结账</Text>
      </View>

      {/* 右侧：总金额 + 箭头 */}
      <View className='price-section'>
        <Text className='total-price'>{totalPriceText}</Text>
        <Text className='arrow'>›</Text>
      </View>
    </View>
  )
})

FloatingCartButton.displayName = 'FloatingCartButton'
