/**
 * @spec O007-miniapp-menu-api
 * 商品列表组件
 */

import { View, Text } from '@tarojs/components'
import { ProductCard as ProductCardType } from '../../types/product'
import { ApiError } from '../../utils/error'
import ProductCard from '../ProductCard'
import ProductListSkeleton from '../ProductListSkeleton'
import ErrorState from '../ErrorState'
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
  error?: ApiError | Error | null
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

  // 加载状态 - 使用骨架屏组件
  if (loading) {
    return <ProductListSkeleton count={6} />
  }

  // 错误状态 - 使用错误状态组件
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  // 空状态
  if (products.length === 0) {
    return renderEmpty()
  }

  // 商品列表
  return renderProducts()
}
