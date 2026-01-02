/**
 * @spec O006-miniapp-channel-order
 * 商品菜单页面 - 首页
 */

import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { CategoryTabs } from '@/components/molecules/CategoryTabs'
import { ProductList } from '@/components/organisms/ProductList'
import { FloatingCartButton } from '@/components/organisms/FloatingCartButton'
import { CartModal } from '@/components/organisms/CartModal'
import { useChannelProducts } from '@/hooks/useChannelProducts'
import type { ChannelCategory } from '@/types/channelProduct'
import './index.scss'

export default function Index() {
  // 分类筛选状态
  const [activeCategory, setActiveCategory] = useState<ChannelCategory | null>(
    null
  )

  // 购物车弹窗状态
  const [isCartOpen, setIsCartOpen] = useState(false)

  // 获取商品列表数据
  const { data, isLoading, error, refetch } = useChannelProducts(activeCategory || undefined)

  // 处理分类切换
  const handleCategoryChange = (category: ChannelCategory | null) => {
    setActiveCategory(category)
  }

  // 打开购物车
  const handleOpenCart = () => {
    setIsCartOpen(true)
  }

  // 关闭购物车
  const handleCloseCart = () => {
    setIsCartOpen(false)
  }

  // 去结账
  const handleCheckout = () => {
    setIsCartOpen(false)
    Taro.navigateTo({ url: '/pages/order-confirm/index' })
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
        products={data || []}
        isLoading={isLoading}
        enableRefresh
        onRefresh={refetch}
        emptyText={activeCategory ? '该分类暂无商品' : '暂无商品'}
      />

      {/* 浮动购物车按钮 */}
      <FloatingCartButton onClick={handleOpenCart} />

      {/* 购物车弹窗 */}
      <CartModal
        visible={isCartOpen}
        onClose={handleCloseCart}
        onCheckout={handleCheckout}
      />
    </View>
  )
}
