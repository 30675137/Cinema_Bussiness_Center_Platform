/**
 * @spec O009-miniapp-product-list
 * 商品列表页面 - 集成 ProductList 组件，处理加载状态
 */

import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import CategoryTabs from '@/components/CategoryTabs'
import ProductList from '@/components/ProductList'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { useProductMenuStore } from '@/stores/productMenuStore'
import styles from './index.module.scss'

const ProductListPage = () => {
  const selectedCategoryId = useProductMenuStore((state) => state.selectedCategoryId)
  const setSelectedCategoryId = useProductMenuStore((state) => state.setSelectedCategoryId)

  const { data: categoriesData } = useCategories()
  const { data, isLoading, refetch } = useProducts({ categoryId: selectedCategoryId })

  /**
   * 下拉刷新处理
   */
  const handlePullDownRefresh = async () => {
    try {
      await refetch()
      Taro.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500,
      })
    } catch (error) {
      Taro.showToast({
        title: '刷新失败',
        icon: 'error',
        duration: 1500,
      })
    } finally {
      Taro.stopPullDownRefresh()
    }
  }

  /**
   * 商品卡片点击处理
   */
  const handleProductClick = (productId: string) => {
    Taro.navigateTo({
      url: `/pages/product-detail/index?id=${productId}`,
    })
  }

  /**
   * 分类选择处理
   */
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
  }

  // 页面显示时触发
  Taro.useDidShow(() => {
    console.log('Product list page shown')
  })

  // 页面准备完成
  Taro.useReady(() => {
    console.log('Product list page ready')
  })

  // 设置下拉刷新监听
  Taro.usePullDownRefresh(() => {
    handlePullDownRefresh()
  })

  return (
    <View className={styles.page} data-testid="product-list-page">
      {/* 页面标题栏 */}
      <View className={styles.header}>
        <Text className={styles.title}>商品列表</Text>
        {!isLoading && data && (
          <Text className={styles.count}>共 {data.total} 件商品</Text>
        )}
      </View>

      {/* 分类筛选标签 */}
      {categoriesData && categoriesData.data.length > 0 && (
        <CategoryTabs
          categories={categoriesData.data}
          selectedId={selectedCategoryId}
          onSelect={handleCategorySelect}
        />
      )}

      {/* 商品列表 */}
      <ProductList
        categoryId={selectedCategoryId}
        onProductClick={handleProductClick}
      />
    </View>
  )
}

export default ProductListPage
