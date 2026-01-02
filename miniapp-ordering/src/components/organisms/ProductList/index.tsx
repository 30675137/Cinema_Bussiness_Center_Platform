/**
 * @spec O006-miniapp-channel-order
 * ProductList 生物组件 - 商品列表容器
 */

import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { ProductCard } from '@/components/molecules/ProductCard'
import { Loading } from '@/components/atoms/Loading'
import { EmptyState } from '@/components/atoms/EmptyState'
import type { ChannelProductDTO } from '@/types/channelProduct'
import './index.scss'

export interface ProductListProps {
  /** 商品列表数据 */
  products: ChannelProductDTO[]

  /** 是否加载中 */
  isLoading?: boolean

  /** 是否启用下拉刷新 */
  enableRefresh?: boolean

  /** 下拉刷新回调 */
  onRefresh?: () => void

  /** 商品点击回调 */
  onProductClick?: (product: ChannelProductDTO) => void

  /** 空状态文本 */
  emptyText?: string

  /** 自定义类名 */
  className?: string
}

/**
 * ProductList 商品列表组件
 *
 * @example
 * ```typescript
 * function ProductMenu() {
 *   const { data, isLoading, refetch } = useChannelProducts()
 *
 *   return (
 *     <ProductList
 *       products={data || []}
 *       isLoading={isLoading}
 *       enableRefresh
 *       onRefresh={refetch}
 *     />
 *   )
 * }
 * ```
 */
export const ProductList = ({
  products,
  isLoading = false,
  enableRefresh = true,
  onRefresh,
  onProductClick,
  emptyText = '暂无商品',
  className = '',
}: ProductListProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleProductClick = (product: ChannelProductDTO) => {
    if (onProductClick) {
      onProductClick(product)
    } else {
      // 默认跳转到商品详情
      Taro.navigateTo({
        url: `/pages/detail/index?id=${product.id}`,
      })
    }
  }

  const classNames = ['product-list', className].filter(Boolean).join(' ')

  // 加载状态
  if (isLoading && products.length === 0) {
    return (
      <View className={classNames}>
        <Loading centered text="加载商品中..." />
      </View>
    )
  }

  // 空状态
  if (!isLoading && products.length === 0) {
    return (
      <View className={classNames}>
        <EmptyState
          title={emptyText}
          description="换个分类看看吧"
        />
      </View>
    )
  }

  // 商品列表
  return (
    <ScrollView
      className={classNames}
      scrollY
      enhanced
      showScrollbar={false}
      refresherEnabled={enableRefresh}
      refresherTriggered={isRefreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className="product-list__grid">
        {products.map((product) => (
          <View key={product.id} className="product-list__item">
            <ProductCard
              product={product}
              onClick={handleProductClick}
            />
          </View>
        ))}
      </View>

      {/* 加载更多指示器 */}
      {isLoading && products.length > 0 && (
        <View className="product-list__loading">
          <Loading size="small" text="加载中..." />
        </View>
      )}
    </ScrollView>
  )
}

export default ProductList
