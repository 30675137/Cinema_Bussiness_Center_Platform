/**
 * @spec O003-beverage-order
 * 饮品菜单页面
 */
import React, { useState } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useBeverages } from '../../../hooks'
import { BeverageCard } from '../../../components/BeverageCard'
import { useBeverageStore } from '../../../stores/beverageStore'
import type { BeverageDTO } from '../../../types/beverage'
import './index.scss'

/**
 * 饮品菜单页面
 *
 * 功能：
 * - 分类标签页切换
 * - 饮品列表展示
 * - 点击卡片跳转详情页
 */
const BeverageMenu: React.FC = () => {
  const { data, isLoading, error } = useBeverages()
  const { setSelectedCategory, setCurrentBeverage } = useBeverageStore()
  const [activeCategory, setActiveCategory] = useState<string>('全部')

  // 获取分类列表
  const categories = data ? ['全部', ...Object.keys(data)] : ['全部']

  // 获取当前分类的饮品列表
  const currentBeverages: BeverageDTO[] = React.useMemo(() => {
    if (!data) return []
    if (activeCategory === '全部') {
      return Object.values(data).flat()
    }
    return data[activeCategory] || []
  }, [data, activeCategory])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setSelectedCategory(category === '全部' ? null : category)
  }

  const handleBeverageClick = (beverage: BeverageDTO) => {
    setCurrentBeverage(null) // 先清空，触发详情页重新加载
    Taro.navigateTo({
      url: `/pages/beverage/detail/index?id=${beverage.id}`,
    })
  }

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
      {/* 分类标签页 */}
      <View className="beverage-menu__tabs">
        <ScrollView scrollX className="beverage-menu__tabs-scroll">
          <View className="beverage-menu__tabs-container">
            {categories.map((category) => (
              <View
                key={category}
                className={`beverage-menu__tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                <Text className="beverage-menu__tab-text">{category}</Text>
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
    </View>
  )
}

export default BeverageMenu
