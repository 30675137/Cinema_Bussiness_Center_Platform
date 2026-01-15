/**
 * @spec O003-beverage-order
 * @spec O002-miniapp-menu-config
 * @spec O010-shopping-cart
 * 饮品菜单页面 - 使用动态分类 + 购物车功能
 */
import React, { useState, useEffect, useMemo } from 'react'
import { View, ScrollView, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeverages, useMenuCategories } from '../../../hooks'
import { BeverageCard } from '../../../components/BeverageCard'
import { useBeverageStore } from '../../../stores/beverageStore'
import { useMenuCategoryStore } from '../../../stores/menuCategoryStore'
import CartIcon from '../../../components/cart/CartIcon'
import { CartDrawer } from '../../../components/CartDrawer'
import { FloatingCartButton } from '../../../components/FloatingCartButton'
import type { BeverageDTO } from '../../../types/beverage'
import type { MenuCategoryDTO } from '../../../types/menuCategory'
import './index.scss'

/**
 * 饮品菜单页面
 *
 * 功能：
 * - 从 API 动态获取分类列表 (O002)
 * - 分类标签页切换
 * - 饮品列表展示
 * - 点击卡片跳转详情页
 */
const BeverageMenu: React.FC = () => {
  // O002: 从 API 获取动态分类
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useMenuCategories()

  // O003: 获取饮品数据
  const { data: beveragesData, isLoading: isBeveragesLoading, error: beveragesError } = useBeverages()

  const { setSelectedCategory: setBeverageCategory, setCurrentBeverage } = useBeverageStore()
  const { setCategories, selectCategory, selectedCategoryId } = useMenuCategoryStore()

  // 当前选中的分类 code (null 表示 "全部")
  const [activeCategoryCode, setActiveCategoryCode] = useState<string | null>(null)

  // 同步分类数据到 store
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      setCategories(categoriesData)
    }
  }, [categoriesData, setCategories])

  // 构建分类列表（包含 "全部" 选项）
  const categories: Array<{ id: string | null; code: string; displayName: string; iconUrl?: string }> = useMemo(() => {
    const allOption = { id: null, code: 'ALL', displayName: '全部', iconUrl: undefined }
    if (!categoriesData || categoriesData.length === 0) {
      return [allOption]
    }
    return [
      allOption,
      ...categoriesData.map((cat: MenuCategoryDTO) => ({
        id: cat.id,
        code: cat.code,
        displayName: cat.displayName,
        iconUrl: cat.iconUrl,
      })),
    ]
  }, [categoriesData])

  // 获取当前分类的饮品列表
  const currentBeverages: BeverageDTO[] = useMemo(() => {
    if (!beveragesData) return []

    // 如果选择 "全部"，返回所有饮品
    if (activeCategoryCode === null || activeCategoryCode === 'ALL') {
      return Object.values(beveragesData).flat()
    }

    // 根据分类 code 过滤饮品
    // beveragesData 的 key 是中文分类名，需要映射
    const categoryItem = categories.find((c) => c.code === activeCategoryCode)
    if (categoryItem && categoryItem.displayName && beveragesData[categoryItem.displayName]) {
      return beveragesData[categoryItem.displayName] || []
    }

    // 尝试直接用 code 匹配（向后兼容旧版 useBeverages 的 key 格式）
    return beveragesData[activeCategoryCode] || Object.values(beveragesData).flat().filter(
      (b: BeverageDTO) => b.category === activeCategoryCode
    )
  }, [beveragesData, activeCategoryCode, categories])

  const handleCategoryChange = (category: { id: string | null; code: string }) => {
    setActiveCategoryCode(category.code === 'ALL' ? null : category.code)
    selectCategory(category.id)
    setBeverageCategory(category.code === 'ALL' ? null : category.code)
  }

  const handleBeverageClick = (beverage: BeverageDTO) => {
    setCurrentBeverage(null) // 先清空，触发详情页重新加载
    Taro.navigateTo({
      url: `/pages/beverage/detail/index?id=${beverage.id}`,
    })
  }

  const isLoading = isCategoriesLoading || isBeveragesLoading
  const error = categoriesError || beveragesError

  if (isLoading) {
    return (
      <View className="beverage-menu loading">
        <Text>加载中...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="beverage-menu error">
        <Text>加载失败：{error.message}</Text>
      </View>
    )
  }

  return (
    <View className="beverage-menu">
      {/* 购物车图标 */}
      <CartIcon />

      {/* 分类标签页 - 使用动态分类 */}
      <View className="beverage-menu__tabs">
        <ScrollView scrollX className="beverage-menu__tabs-scroll">
          <View className="beverage-menu__tabs-container">
            {categories.map((category) => (
              <View
                key={category.code}
                className={`beverage-menu__tab ${
                  (activeCategoryCode === null && category.code === 'ALL') ||
                  activeCategoryCode === category.code
                    ? 'active'
                    : ''
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {/* T084/T085: 显示分类图标，无图标时显示文字首字符作为 fallback */}
                {category.iconUrl ? (
                  <Image
                    className="beverage-menu__tab-icon"
                    src={category.iconUrl}
                    mode="aspectFit"
                  />
                ) : (
                  <View className="beverage-menu__tab-icon-fallback">
                    <Text>{category.displayName.charAt(0)}</Text>
                  </View>
                )}
                <Text className="beverage-menu__tab-text">{category.displayName}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 饮品列表 */}
      <ScrollView scrollY className="beverage-menu__content">
        {currentBeverages.length === 0 ? (
          <View className="beverage-menu__empty">
            <Text>该分类暂无饮品</Text>
          </View>
        ) : (
          <View className="beverage-menu__grid">
            {currentBeverages.map((beverage) => (
              <BeverageCard key={beverage.id} beverage={beverage} onClick={handleBeverageClick} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 购物车功能 (@spec O010-shopping-cart) */}
      <FloatingCartButton />
      <CartDrawer />
    </View>
  )
}

export default BeverageMenu
