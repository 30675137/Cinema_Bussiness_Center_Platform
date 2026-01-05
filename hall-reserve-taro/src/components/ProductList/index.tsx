/**
 * @spec O009-miniapp-product-list
 * ProductList - 商品列表组件（支持无限滚动）
 * 使用 useInfiniteProducts Hook，实现推荐商品置顶排序
 */

import { View, Text } from '@tarojs/components'
import { useMemo } from 'react'
import ProductCard from '../ProductCard'
import { useInfiniteProducts } from '@/hooks/useProducts'
import { mapToProductCard } from '@/types/product'
import { formatPrice } from '@/utils/priceFormatter'
import type { ChannelProductDTO } from '@/types/product'
import styles from './index.module.scss'

interface Props {
  /** 分类ID筛选 (null = 全部商品) */
  categoryId?: string | null
  /** 点击商品卡片回调 */
  onProductClick?: (productId: string) => void
  /** 加载更多回调 */
  onLoadMore?: () => void
}

/**
 * 商品排序函数：推荐商品优先，相同推荐状态按 sortOrder 升序
 */
const sortProducts = (products: ChannelProductDTO[]): ChannelProductDTO[] => {
  return [...products].sort((a, b) => {
    // 推荐商品优先
    if (a.isRecommended && !b.isRecommended) return -1
    if (!a.isRecommended && b.isRecommended) return 1

    // 相同推荐状态，按 sortOrder 升序
    return a.sortOrder - b.sortOrder
  })
}

const ProductList = ({ categoryId, onProductClick, onLoadMore }: Props) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({ categoryId })

  // 合并所有页面的商品数据
  const allProducts = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page.data)
  }, [data])

  // 排序商品：推荐商品置顶
  const sortedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return []
    return sortProducts(allProducts)
  }, [allProducts])

  // 处理加载更多
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
      onLoadMore?.()
    }
  }

  // 加载骨架屏
  if (isLoading) {
    return (
      <View className={styles.loadingContainer} data-testid="product-list-loading">
        <View className={styles.skeleton}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className={styles.skeletonCard}>
              <View className={styles.skeletonImage} />
              <View className={styles.skeletonText} />
              <View className={styles.skeletonPrice} />
            </View>
          ))}
        </View>
      </View>
    )
  }

  // 错误状态
  if (isError) {
    return (
      <View className={styles.errorContainer}>
        <Text className={styles.errorText}>
          加载失败：{error?.message || '未知错误'}
        </Text>
      </View>
    )
  }

  // 空状态
  if (!sortedProducts || sortedProducts.length === 0) {
    return (
      <View className={styles.emptyContainer}>
        <Text className={styles.emptyText}>暂无商品</Text>
      </View>
    )
  }

  // 商品列表
  return (
    <View data-testid="product-list">
      <View className={styles.list}>
        {sortedProducts.map((product) => {
          const productCard = mapToProductCard(product, formatPrice)

          return (
            <ProductCard
              key={product.id}
              {...productCard}
              onClick={() => onProductClick?.(product.id)}
            />
          )
        })}
      </View>

      {/* 加载更多指示器 */}
      {hasNextPage && (
        <View
          className={styles.loadMoreContainer}
          onClick={handleLoadMore}
          data-testid="load-more-trigger"
        >
          {isFetchingNextPage ? (
            <Text className={styles.loadingText}>加载中...</Text>
          ) : (
            <Text className={styles.loadMoreText}>点击加载更多</Text>
          )}
        </View>
      )}

      {/* 无更多数据提示 */}
      {!hasNextPage && sortedProducts.length > 0 && (
        <View className={styles.noMoreContainer}>
          <Text className={styles.noMoreText}>已加载全部商品</Text>
        </View>
      )}
    </View>
  )
}

export default ProductList
