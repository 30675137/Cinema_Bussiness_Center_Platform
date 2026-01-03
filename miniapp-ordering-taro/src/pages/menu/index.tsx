/**
 * @spec O007-miniapp-menu-api
 * 菜单页面
 */

import { View, Text } from '@tarojs/components'
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { ChannelCategory, ProductCard } from '../../types/product'
import { useProductListStore } from '../../stores/productListStore'
import { useProducts } from '../../hooks/useProducts'
import { getCategoryDisplayName } from '../../utils/category'
import CategoryTabs from '../../components/CategoryTabs'
import ProductList from '../../components/ProductList'
import './index.less'

/**
 * 菜单页面组件
 */
export default function MenuPage() {
  // 获取状态管理
  const { selectedCategory, setSelectedCategory } = useProductListStore()

  // 获取商品列表数据
  const { data: products = [], isLoading, error, refetch } = useProducts(selectedCategory)

  /**
   * 页面初始化：设置默认分类为第一个分类
   */
  useEffect(() => {
    setSelectedCategory(ChannelCategory.ALCOHOL)
  }, [])

  /**
   * 处理分类切换
   */
  const handleCategoryChange = (category: ChannelCategory | null) => {
    setSelectedCategory(category)
  }

  /**
   * 处理商品卡片点击
   */
  const handleProductClick = (product: ProductCard) => {
    console.log('商品点击:', product)
    // TODO: 跳转到商品详情页（占位逻辑）
    Taro.showToast({
      title: `即将查看 ${product.name}`,
      icon: 'none',
      duration: 2000,
    })
  }

  /**
   * 处理下拉刷新
   */
  Taro.usePullDownRefresh(async () => {
    await refetch()
    Taro.stopPullDownRefresh()
  })

  // 核心分类列表（排除 MEAL 和 OTHER）
  const coreCategories: ChannelCategory[] = [
    ChannelCategory.ALCOHOL,
    ChannelCategory.COFFEE,
    ChannelCategory.BEVERAGE,
    ChannelCategory.SNACK,
  ]

  // 获取当前分类名称
  const currentCategoryName = selectedCategory
    ? getCategoryDisplayName(selectedCategory)
    : '全部商品'

  return (
    <View className='menu-page'>
      {/* 主体内容：左右布局 */}
      <View className='main-content'>
        {/* 左侧：分类侧边栏 */}
        <View className='sidebar'>
          <CategoryTabs
            categories={coreCategories}
            activeCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </View>

        {/* 右侧：商品列表区域 */}
        <View className='product-area'>
          {/* 分类标题 */}
          <View className='category-header'>
            <Text className='category-title'>{currentCategoryName}</Text>
            <Text className='category-subtitle'>为您的视听盛宴挑选心意之选</Text>
          </View>

          {/* 商品列表 */}
          <View className='product-section'>
            <ProductList
              products={products}
              onProductClick={handleProductClick}
              loading={isLoading}
              error={error}
              onRetry={refetch}
            />
          </View>
        </View>
      </View>
    </View>
  )
}
