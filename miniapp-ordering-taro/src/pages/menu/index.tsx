/**
 * @spec O007-miniapp-menu-api
 * @spec O002-miniapp-menu-config
 * @spec O010-shopping-cart
 * 菜单页面
 */

import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { ProductCard } from '../../types/product'
import { useProductListStore } from '../../stores/productListStore'
import { useProducts } from '../../hooks/useProducts'
import { useMenuCategories, MenuCategoryDTO } from '../../hooks/useMenuCategories'
import Header from '../../components/Header'
import CategoryTabs from '../../components/CategoryTabs'
import ProductList from '../../components/ProductList'
import TabBar from '../../components/TabBar'
import { FloatingCartButton } from '../../components/FloatingCartButton'
import { CartDrawer } from '../../components/CartDrawer'
import './index.less'

/**
 * @spec O007-miniapp-menu-api
 * 菜单页面组件
 */
export default function MenuPage() {
  // 状态管理 - 分类 ID 和分类编码
  const { selectedCategoryId, selectedCategory, setSelectedCategory } = useProductListStore()

  // TabBar 当前激活项
  const [activeTab, setActiveTab] = useState('order')

  // O007: 获取动态分类列表
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useMenuCategories()

  // O007: 获取商品列表数据 - 传递 categoryId
  const {
    data: products = [],
    isLoading: isProductsLoading,
    error: productsError,
    refetch,
  } = useProducts({
    categoryId: selectedCategoryId,
    category: selectedCategory,
  })

  /**
   * @spec O007-miniapp-menu-api
   * 页面初始化：设置默认分类为第一个分类
   */
  useEffect(() => {
    // O007: 动态分类加载完成后，设置默认分类
    if (categories.length > 0 && !selectedCategoryId) {
      const firstCategory = categories[0]
      setSelectedCategory(firstCategory.id, firstCategory.code)
    }
  }, [categories, selectedCategoryId])

  /**
   * @spec O007-miniapp-menu-api
   * 处理分类切换
   */
  const handleCategoryChange = (category: MenuCategoryDTO | null) => {
    if (category) {
      setSelectedCategory(category.id, category.code)
    } else {
      setSelectedCategory(null, null)
    }
  }

  /**
   * 处理商品卡片点击
   */
  const handleProductClick = (product: ProductCard) => {
    console.log('商品点击:', product)
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

  // O007: 获取当前分类名称
  const currentCategory = categories.find((c) => c.id === selectedCategoryId)
  const currentCategoryName = currentCategory?.displayName || '全部商品'

  // TabBar 配置
  const tabBarTabs = [
    { key: 'order', label: '点餐', icon: 'cart' as const },
    { key: 'member', label: '会员中心', icon: 'user' as const },
  ]

  /**
   * 处理 TabBar 切换
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    if (key === 'member') {
      Taro.showToast({ title: '会员中心开发中', icon: 'none' })
    }
  }

  // 加载状态
  const isLoading = isCategoriesLoading || isProductsLoading
  const error = categoriesError || productsError

  return (
    <View className='menu-page'>
      {/* 顶部导航栏 */}
      <Header
        zoneName='3号厅 VIP区'
        onSearchClick={() => Taro.showToast({ title: '搜索功能开发中', icon: 'none' })}
        onScanClick={() => Taro.showToast({ title: '扫码功能开发中', icon: 'none' })}
        onZoneClick={() => Taro.showToast({ title: '切换区域功能开发中', icon: 'none' })}
      />

      {/* 主体内容：左右布局 */}
      <View className='main-content'>
        {/* 左侧：分类侧边栏 */}
        <View className='sidebar'>
          <CategoryTabs
            categories={categories}
            activeCategoryId={selectedCategoryId}
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

      {/* O010: 浮动购物车按钮（固定在底部导航栏上方） */}
      <FloatingCartButton />

      {/* 底部导航栏 */}
      <TabBar
        tabs={tabBarTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* O010: 购物车抽屉（全屏遮罩） */}
      <CartDrawer />
    </View>
  )
}
