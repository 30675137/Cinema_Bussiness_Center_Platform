/**
 * @spec O009-miniapp-product-list
 * ProductCard - 商品卡片组件
 * 展示商品图片、名称、价格、推荐标签
 */

import { memo } from 'react'
import { View, Image, Text } from '@tarojs/components'
import type { ProductCard as ProductCardProps } from '@/types/product'
import { getImageSrc } from '@/utils/imageLoader'
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

        {/* 商品价格 */}
        <Text className={styles.price}>{price}</Text>
      </View>
    </View>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
