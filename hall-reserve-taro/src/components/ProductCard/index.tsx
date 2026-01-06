/**
 * @spec O009-miniapp-product-list
 * @spec O010-shopping-cart
 * ProductCard - 商品卡片组件
 * 展示商品图片、名称、价格、推荐标签、购物车控制器
 */

import { memo } from 'react'
import { View, Image, Text } from '@tarojs/components'
import type { ProductCard as ProductCardProps } from '@/types/product'
import { getImageSrc } from '@/utils/imageLoader'
import { useCartStore } from '@/stores/cartStore'
import { QuantityController } from '@/components/QuantityController'
import styles from './index.module.scss'

interface Props extends ProductCardProps {
  /** 点击回调 */
  onClick?: () => void
}

const ProductCard = memo<Props>(({
  id,
  name,
  price,
  imageUrl,
  isRecommended,
  badge,
  onClick,
}: Props) => {
  // ========== 购物车状态管理 (@spec O010-shopping-cart) ==========
  const addToCart = useCartStore((state) => state.addToCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const getProductQuantity = useCartStore((state) => state.getProductQuantity)

  // 获取当前商品在购物车中的数量
  const quantity = getProductQuantity(id)

  /**
   * 处理添加到购物车按钮点击
   * @spec O010-shopping-cart
   */
  const handleAddToCart = (e: any) => {
    e.stopPropagation() // 阻止触发商品详情导航
    addToCart(
      {
        id,
        name,
        price: typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) * 100 : price,
        image: imageUrl,
        isRecommended,
      },
      1
    )
  }

  /**
   * 处理数量增加
   * @spec O010-shopping-cart
   */
  const handleIncrease = () => {
    updateQuantity(id, 1)
  }

  /**
   * 处理数量减少
   * @spec O010-shopping-cart
   */
  const handleDecrease = () => {
    updateQuantity(id, -1)
  }

  return (
    <View
      className={styles.card}
      data-testid="product-card"
      data-product-id={id}
      onClick={onClick}
    >
      {/* 推荐标签 */}
      {isRecommended && badge && (
        <View className={styles.badge}>
          <Text className={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* 商品图片 */}
      <Image
        src={getImageSrc(imageUrl)}
        mode="aspectFill"
        className={styles.image}
        lazyLoad
        alt={name}
      />

      {/* 商品信息 */}
      <View className={styles.info}>
        {/* 商品名称 */}
        <Text className={styles.name}>{name}</Text>

        {/* 底部区域：价格 + 购物车控制器 */}
        <View className={styles.footer}>
          {/* 商品价格 */}
          <Text className={styles.price}>{price}</Text>

          {/* 购物车控制器 (@spec O010-shopping-cart) */}
          <View className={styles.cartControl}>
            {quantity > 0 ? (
              // 显示数量控制器
              <QuantityController
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
              />
            ) : (
              // 显示添加按钮
              <View className={styles.addButton} onClick={handleAddToCart}>
                <Text className={styles.addButtonText}>+</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
