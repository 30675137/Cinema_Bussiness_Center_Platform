/**
 * @spec O006-miniapp-channel-order
 * 商品菜单页面 - 首页
 */

import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { CategoryTabs } from '@/components/molecules/CategoryTabs'
import { ProductList } from '@/components/organisms/ProductList'
import { useChannelProducts } from '@/hooks/useChannelProducts'
import type { ChannelCategory } from '@/types/channelProduct'
import './index.scss'

export default function Index() {
  // 分类筛选状态
  const [activeCategory, setActiveCategory] = useState<ChannelCategory | null>(
    null
  )

  // 获取商品列表数据
  const { data, isLoading, error, refetch } = useChannelProducts(activeCategory || undefined)

  // 处理分类切换
  const handleCategoryChange = (category: ChannelCategory | null) => {
    setActiveCategory(category)
  }

  // 处理错误状态
  if (error) {
    Taro.showToast({
      title: '加载失败,请重试',
      icon: 'none',
      duration: 2000,
    })
  }

  return (
    <View className="index">
      {/* 分类标签栏 */}
      <CategoryTabs
        activeCategory={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* 商品列表 */}
      <ProductList
        products={data?.data || []}
        isLoading={isLoading}
        enableRefresh
        onRefresh={refetch}
        emptyText={activeCategory ? '该分类暂无商品' : '暂无商品'}
      />
    </View>
  )
}
