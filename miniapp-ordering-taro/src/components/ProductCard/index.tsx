/**
 * @spec O007-miniapp-menu-api
 * 商品卡片组件 - 水平布局
 */

import { View, Image, Text } from '@tarojs/components'
import { useState, memo } from 'react'
import { ProductCard as ProductCardType } from '../../types/product'
import './index.less'

/**
 * 商品卡片组件属性
 */
export interface ProductCardProps {
  /** 商品数据 */
  product: ProductCardType
  /** 点击回调 */
  onClick?: (product: ProductCardType) => void
  /** 添加按钮回调 */
  onAdd?: (product: ProductCardType) => void
}

/**
 * 商品卡片组件 - 水平布局
 * 使用 memo 优化渲染性能
 */
const ProductCard = memo(function ProductCard({ product, onClick, onAdd }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  /**
   * 处理图片加载失败
   */
  const handleImageError = () => {
    setImageError(true)
  }

  /**
   * 处理卡片点击
   */
  const handleClick = () => {
    if (onClick) {
      onClick(product)
    }
  }

  /**
   * 处理添加按钮点击
   */
  const handleAdd = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (onAdd) {
      onAdd(product)
    }
  }

  /**
   * 计算预计积分（假设1元=1积分）
   * 从 priceText (如 "¥48") 解析价格
   */
  const priceNumber = parseFloat(product.priceText.replace(/[^0-9.]/g, '')) || 0
  const estimatedPoints = Math.floor(priceNumber)

  return (
    <View
      className={`product-card ${!product.isAvailable ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      {/* 商品图片 */}
      <View className='image-wrapper'>
        <Image
          src={imageError ? '/assets/images/placeholder.svg' : product.imageUrl}
          className='product-image'
          mode='aspectFill'
          lazyLoad
          onError={handleImageError}
        />

        {/* 售罄遮罩 */}
        {!product.isAvailable && (
          <View className='unavailable-mask'>
            <Text className='unavailable-text'>售罄</Text>
          </View>
        )}
      </View>

      {/* 商品信息 */}
      <View className='info-section'>
        {/* 商品名称 */}
        <Text className='product-name'>{product.name}</Text>

        {/* 积分信息 */}
        <View className='points-row'>
          <Text className='points-icon'>★</Text>
          <Text className='points-text'>预计得 </Text>
          <Text className='points-value'>{estimatedPoints}</Text>
          <Text className='points-text'> 积分</Text>
        </View>

        {/* 价格和添加按钮 */}
        <View className='price-row'>
          <View className='price-info'>
            <Text className='currency'>¥</Text>
            <Text className='price'>{product.priceText.replace('¥', '')}</Text>
          </View>

          {/* 添加按钮 */}
          {product.isAvailable && (
            <View className='add-button' onClick={handleAdd}>
              <Text className='add-icon'>+</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
})

export default ProductCard
