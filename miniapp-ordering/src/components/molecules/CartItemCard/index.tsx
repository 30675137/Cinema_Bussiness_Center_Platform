/**
 * @spec O006-miniapp-channel-order
 * 购物车商品项卡片组件
 */

import { View, Text } from '@tarojs/components'
import { Image } from '@/components/atoms/Image'
import { Price } from '@/components/atoms/Price'
import type { CartItem as CartItemType } from '@/types/cart'
import './index.scss'

export interface CartItemCardProps {
  /** 购物车商品项数据 */
  item: CartItemType

  /** 增加数量事件 */
  onIncrease?: (cartItemId: string) => void

  /** 减少数量事件 */
  onDecrease?: (cartItemId: string) => void

  /** 删除事件 */
  onRemove?: (cartItemId: string) => void
}

/**
 * 购物车商品项卡片
 *
 * @description
 * - 显示商品图片、名称、规格、价格
 * - 支持数量调整（+/-）
 * - 显示小计
 *
 * @example
 * ```tsx
 * <CartItemCard
 *   item={cartItem}
 *   onIncrease={(id) => updateQuantity(id, item.quantity + 1)}
 *   onDecrease={(id) => updateQuantity(id, item.quantity - 1)}
 * />
 * ```
 */
export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onIncrease,
  onDecrease,
}) => {
  const handleIncrease = () => {
    onIncrease?.(item.cartItemId)
  }

  const handleDecrease = () => {
    onDecrease?.(item.cartItemId)
  }

  // 格式化规格显示
  const formatSpecs = () => {
    const specs = Object.values(item.selectedSpecs)
    if (specs.length === 0) return null

    return specs.map((spec) => spec.optionName).join(' / ')
  }

  const specsText = formatSpecs()

  return (
    <View className="cart-item-card">
      {/* 左侧: 商品图片 */}
      <View className="cart-item-card__image-wrapper">
        <Image
          src={item.productImage}
          alt={item.productName}
          className="cart-item-card__image"
          mode="aspectFill"
        />
      </View>

      {/* 中间: 商品信息 */}
      <View className="cart-item-card__content">
        <View className="cart-item-card__info">
          <Text className="cart-item-card__name">{item.productName}</Text>
          {specsText && (
            <Text className="cart-item-card__specs">{specsText}</Text>
          )}
        </View>

        <View className="cart-item-card__price">
          <Price value={item.unitPrice} size="small" bold color="#f59e0b" />
        </View>
      </View>

      {/* 右侧: 数量控制 */}
      <View className="cart-item-card__quantity-control">
        <View
          className="cart-item-card__quantity-btn cart-item-card__quantity-btn--minus"
          onClick={handleDecrease}
        >
          <Text className="cart-item-card__quantity-icon">−</Text>
        </View>

        <Text className="cart-item-card__quantity-text">{item.quantity}</Text>

        <View
          className="cart-item-card__quantity-btn cart-item-card__quantity-btn--plus"
          onClick={handleIncrease}
        >
          <Text className="cart-item-card__quantity-icon">+</Text>
        </View>
      </View>
    </View>
  )
}
