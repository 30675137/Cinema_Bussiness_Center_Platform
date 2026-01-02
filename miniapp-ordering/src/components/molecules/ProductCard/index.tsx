/**
 * @spec O006-miniapp-channel-order
 * ProductCard 分子组件 - 商品卡片
 */

import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Image } from '@/components/atoms/Image'
import { Price } from '@/components/atoms/Price'
import type { ChannelProductDTO } from '@/types/channelProduct'
import './index.scss'

export interface ProductCardProps {
  /** 商品数据 */
  product: ChannelProductDTO

  /** 点击回调 */
  onClick?: (product: ChannelProductDTO) => void

  /** 自定义类名 */
  className?: string
}

/**
 * ProductCard 商品卡片组件
 *
 * @example
 * ```typescript
 * function ProductList() {
 *   const { data } = useChannelProducts()
 *
 *   const handleProductClick = (product: ChannelProductDTO) => {
 *     Taro.navigateTo({ url: `/pages/detail/index?id=${product.id}` })
 *   }
 *
 *   return (
 *     <View>
 *       {data?.data.map(product => (
 *         <ProductCard
 *           key={product.id}
 *           product={product}
 *           onClick={handleProductClick}
 *         />
 *       ))}
 *     </View>
 *   )
 * }
 * ```
 */
export const ProductCard = ({
  product,
  onClick,
  className = '',
}: ProductCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product)
    } else {
      // 默认跳转到商品详情页
      Taro.navigateTo({
        url: `/pages/detail/index?id=${product.id}`,
      })
    }
  }

  const classNames = ['product-card', className].filter(Boolean).join(' ')

  return (
    <View className={classNames} onClick={handleClick}>
      {/* 商品图片 */}
      <View className="product-card__image-wrapper">
        <Image
          src={product.mainImage}
          mode="aspectFill"
          className="product-card__image"
          lazyLoad
        />

        {/* 推荐标签 */}
        {product.isRecommended && (
          <View className="product-card__badge">
            <Text className="product-card__badge-text">推荐</Text>
          </View>
        )}
      </View>

      {/* 商品信息 */}
      <View className="product-card__info">
        {/* 商品名称 */}
        <Text className="product-card__name">{product.displayName}</Text>

        {/* 价格 */}
        <View className="product-card__price">
          <Price value={product.basePrice} type="accent" size="medium" />
        </View>
      </View>
    </View>
  )
}

export default ProductCard
