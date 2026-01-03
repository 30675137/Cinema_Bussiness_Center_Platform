/**
 * @spec O007-miniapp-menu-api
 * 商品列表组件
 */

import { View, Text } from '@tarojs/components'
import { ProductCard as ProductCardType } from '../../types/product'
import ProductCard from '../ProductCard'
import './index.less'

/**
 * 商品列表组件属性
 */
export interface ProductListProps {
  /** 商品列表 */
  products: ProductCardType[]
  /** 商品点击回调 */
  onProductClick?: (product: ProductCardType) => void
  /** 加载状态 */
  loading?: boolean
  /** 错误信息 */
  error?: Error | null
  /** 重试回调 */
  onRetry?: () => void
}

/**
 * 商品列表组件
 */
export default function ProductList({
  products,
  onProductClick,
  loading = false,
  error = null,
  onRetry,
}: ProductListProps) {
  /**
   * 渲染加载骨架屏
   */
  const renderSkeleton = () => {
    return (
      <View className='skeleton-grid'>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} className='skeleton-card'>
            <View className='skeleton-image' />
            <View className='skeleton-info'>
              <View className='skeleton-title' />
              <View className='skeleton-price' />
            </View>
          </View>
        ))}
      </View>
    )
  }

  /**
   * 渲染空状态
   */
  const renderEmpty = () => {
    return (
      <View className='empty-state'>
        <Text className='empty-icon'>📦</Text>
        <Text className='empty-text'>暂无商品</Text>
        <Text className='empty-hint'>换个分类看看吧</Text>
      </View>
    )
  }

  /**
   * 渲染错误状态
   */
  const renderError = () => {
    return (
      <View className='error-state'>
        <Text className='error-icon'>⚠️</Text>
        <Text className='error-text'>
          {error?.message || '加载失败'}
        </Text>
        {onRetry && (
          <View className='retry-button' onClick={onRetry}>
            <Text className='retry-text'>重试</Text>
          </View>
        )}
      </View>
    )
  }

  /**
   * 渲染商品列表
   */
  const renderProducts = () => {
    return (
      <View className='product-grid'>
        {products.map((product) => (
          <View key={product.id} className='grid-item'>
            <ProductCard product={product} onClick={onProductClick} />
          </View>
        ))}
      </View>
    )
  }

  // 加载状态
  if (loading) {
    return renderSkeleton()
  }

  // 错误状态
  if (error) {
    return renderError()
  }

  // 空状态
  if (products.length === 0) {
    return renderEmpty()
  }

  // 商品列表
  return renderProducts()
}
