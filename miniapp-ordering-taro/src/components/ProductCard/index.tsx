/**
 * @spec O007-miniapp-menu-api, O010-shopping-cart
 * 商品卡片组件 - 水平布局 + 购物车集成
 */

import { View, Image, Text } from '@tarojs/components'
import { useState, memo, useMemo } from 'react'
import { ProductCard as ProductCardType } from '../../types/product'
import { useCartStore } from '../../stores/cartStore'
import { QuantityController } from '../QuantityController'
import type { CartProduct } from '../../types/cart'
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
 * 商品卡片组件 - 水平布局 + 购物车集成
 * 使用 memo 优化渲染性能
 */
const ProductCard = memo(function ProductCard({ product, onClick, onAdd }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // 防止重复点击

  // 获取购物车状态和操作
  const { cart, addToCart, updateQuantity } = useCartStore()

  /**
   * 将 ProductCardType 转换为 CartProduct
   */
  const cartProduct: CartProduct = useMemo(() => {
    // 从 priceText 解析价格（元）并转换为分
    const priceInYuan = parseFloat(product.priceText.replace(/[^0-9.]/g, '')) || 0
    return {
      id: product.id,
      name: product.name,
      price: Math.round(priceInYuan * 100), // 转换为分
      image: product.imageUrl
    }
  }, [product.id, product.name, product.priceText, product.imageUrl])

  /**
   * 获取当前商品在购物车中的数量
   */
  const quantity = useMemo(() => {
    const item = cart.items.find(item => item.product.id === product.id)
    return item?.quantity || 0
  }, [cart.items, product.id])

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
   * 处理添加按钮点击（首次添加）
   */
  const handleAdd = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (isProcessing) return // 防止重复点击

    setIsProcessing(true)
    addToCart(cartProduct) // 添加到购物车
    if (onAdd) {
      onAdd(product) // 保留原有回调
    }

    // 300ms 后解除锁定
    setTimeout(() => setIsProcessing(false), 300)
  }

  /**
   * 处理数量增加
   */
  const handleIncrease = () => {
    if (isProcessing) return

    setIsProcessing(true)
    if (quantity === 0) {
      addToCart(cartProduct)
    } else {
      updateQuantity(product.id, 1)
    }

    setTimeout(() => setIsProcessing(false), 300)
  }

  /**
   * 处理数量减少
   */
  const handleDecrease = () => {
    if (isProcessing) return

    setIsProcessing(true)
    updateQuantity(product.id, -1)

    setTimeout(() => setIsProcessing(false), 300)
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

        {/* 价格和添加按钮/数量控制器 */}
        <View className='price-row'>
          <View className='price-info'>
            <Text className='currency'>¥</Text>
            <Text className='price'>{product.priceText.replace('¥', '')}</Text>
          </View>

          {/* 条件渲染：未添加时显示"+"按钮，已添加时显示数量控制器 */}
          {product.isAvailable && (
            quantity === 0 ? (
              // 未添加：显示"+"按钮
              <View className='add-button' onClick={handleAdd}>
                <Text className='add-icon'>+</Text>
              </View>
            ) : (
              // 已添加：显示数量控制器
              <QuantityController
                productId={product.id}
                quantity={quantity}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
              />
            )
          )}
        </View>
      </View>
    </View>
  )
})

export default ProductCard
