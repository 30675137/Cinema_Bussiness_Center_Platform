/**
 * @spec O006-miniapp-channel-order
 * 购物车弹窗组件
 */

import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCartStore } from '@/stores/cartStore'
import { CartItemCard } from '@/components/molecules/CartItemCard'
import { Price } from '@/components/atoms/Price'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/atoms/EmptyState'
import { isCartEmpty } from '@/types/cart'
import './index.scss'

export interface CartModalProps {
  /** 是否显示弹窗 */
  visible: boolean

  /** 关闭事件 */
  onClose?: () => void

  /** 去结账事件 */
  onCheckout?: () => void
}

/**
 * 购物车弹窗
 *
 * @description
 * - 全屏遮罩 + 底部滑出动画
 * - 显示购物车商品列表
 * - 支持数量调整、删除商品
 * - 显示价格汇总和结账按钮
 *
 * @example
 * ```tsx
 * const [isCartOpen, setIsCartOpen] = useState(false)
 *
 * <CartModal
 *   visible={isCartOpen}
 *   onClose={() => setIsCartOpen(false)}
 *   onCheckout={() => {
 *     setIsCartOpen(false)
 *     Taro.navigateTo({ url: '/pages/order-confirm/index' })
 *   }}
 * />
 * ```
 */
export const CartModal: React.FC<CartModalProps> = ({
  visible,
  onClose,
  onCheckout,
}) => {
  const { items, totalQuantity, totalPrice, updateQuantity } = useCartStore()

  if (!visible) {
    return null
  }

  const handleIncrease = (cartItemId: string) => {
    const item = items.find((i) => i.cartItemId === cartItemId)
    if (item) {
      updateQuantity(cartItemId, item.quantity + 1)
    }
  }

  const handleDecrease = (cartItemId: string) => {
    const item = items.find((i) => i.cartItemId === cartItemId)
    if (item) {
      updateQuantity(cartItemId, item.quantity - 1)
    }
  }

  const handleCheckout = () => {
    if (isCartEmpty(items)) {
      Taro.showToast({
        title: '购物车为空',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    onCheckout?.()
  }

  const handleOverlayClick = () => {
    onClose?.()
  }

  const handleContentClick = (e: any) => {
    // 阻止事件冒泡，避免点击内容区域关闭弹窗
    e.stopPropagation()
  }

  return (
    <View className="cart-modal">
      {/* 遮罩层 */}
      <View className="cart-modal__overlay" onClick={handleOverlayClick} />

      {/* 内容区域 */}
      <View className="cart-modal__content" onClick={handleContentClick}>
        {/* 标题栏 */}
        <View className="cart-modal__header">
          <Text className="cart-modal__title">订单汇总</Text>
          <View className="cart-modal__close" onClick={onClose}>
            <Text className="cart-modal__close-icon">×</Text>
          </View>
        </View>

        {/* 商品列表 */}
        <ScrollView
          className="cart-modal__body"
          scrollY
          enableBackToTop
        >
          {isCartEmpty(items) ? (
            <EmptyState message="购物车空空如也" />
          ) : (
            <View className="cart-modal__items">
              {items.map((item) => (
                <CartItemCard
                  key={item.cartItemId}
                  item={item}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
              ))}
            </View>
          )}
        </ScrollView>

        {/* 底部汇总 */}
        {!isCartEmpty(items) && (
          <View className="cart-modal__footer">
            <View className="cart-modal__summary">
              <View className="cart-modal__summary-row">
                <Text className="cart-modal__summary-label">小计</Text>
                <Price value={totalPrice} size="small" />
              </View>

              <View className="cart-modal__summary-row cart-modal__summary-row--total">
                <Text className="cart-modal__summary-label-total">实付金额</Text>
                <Price value={totalPrice} size="large" bold color="#f59e0b" />
              </View>

              <View className="cart-modal__summary-hint">
                <Text className="cart-modal__summary-hint-text">
                  共 {totalQuantity} 件商品
                </Text>
              </View>
            </View>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleCheckout}
            >
              立即支付
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}
