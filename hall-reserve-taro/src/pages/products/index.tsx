/**
 * @spec O006-miniapp-channel-order
 * 商品菜单页 - 商品列表浏览与分类筛选
 */

import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useChannelProducts } from '../../hooks/useChannelProducts'
import { usePrefetchProductDetail } from '../../hooks/useChannelProducts'
import { useCartStore } from '../../stores/cartStore'
import { ChannelCategory } from '../../types/channelProduct'
import { formatPrice } from '../../utils/priceCalculator'
import './index.scss'

const CATEGORIES = [
  { label: '全部', value: undefined },
  { label: '酒水', value: ChannelCategory.ALCOHOL },
  { label: '咖啡', value: ChannelCategory.COFFEE },
  { label: '饮料', value: ChannelCategory.BEVERAGE },
  { label: '小食', value: ChannelCategory.SNACK },
  { label: '餐品', value: ChannelCategory.MEAL },
  { label: '其他', value: ChannelCategory.OTHER },
]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | undefined>()

  const { data: products, isLoading, error } = useChannelProducts(selectedCategory)
  const prefetchDetail = usePrefetchProductDetail()
  const getTotalItems = useCartStore((state) => state.getTotalItems)

  // 处理商品点击
  const handleProductClick = (productId: string) => {
    Taro.navigateTo({
      url: `/pages/product-detail/index?id=${productId}`,
    })
  }

  // 处理商品 hover (预取详情数据)
  const handleProductHover = (productId: string) => {
    prefetchDetail(productId)
  }

  // 跳转购物车
  const handleCartClick = () => {
    Taro.navigateTo({
      url: '/pages/cart/index',
    })
  }

  // Loading 状态
  if (isLoading) {
    return (
      <View className="products-page">
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  // Error 状态
  if (error) {
    return (
      <View className="products-page">
        <View className="error-container">
          <Text className="error-text">加载失败: {error.message}</Text>
        </View>
      </View>
    )
  }

  // 空状态
  if (!products || products.length === 0) {
    return (
      <View className="products-page">
        <View className="category-tabs">
          {CATEGORIES.map((cat) => (
            <View
              key={cat.label}
              className={`category-tab ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <Text className="category-label">{cat.label}</Text>
            </View>
          ))}
        </View>

        <View className="empty-container">
          <Text className="empty-text">暂无商品</Text>
        </View>
      </View>
    )
  }

  const cartItemCount = getTotalItems()

  return (
    <View className="products-page">
      {/* 分类选项卡 */}
      <View className="category-tabs">
        {CATEGORIES.map((cat) => (
          <View
            key={cat.label}
            className={`category-tab ${selectedCategory === cat.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            <Text className="category-label">{cat.label}</Text>
          </View>
        ))}
      </View>

      {/* 商品列表 */}
      <ScrollView className="product-list" scrollY>
        {products.map((product) => (
          <View
            key={product.id}
            className="product-card"
            onClick={() => handleProductClick(product.id)}
            onTouchStart={() => handleProductHover(product.id)}
          >
            {/* 商品图片 */}
            <View className="product-image-wrapper">
              <Image
                className="product-image"
                src={product.mainImage}
                mode="aspectFill"
                lazyLoad
              />
              {product.isRecommended && (
                <View className="recommend-badge">
                  <Text className="recommend-text">推荐</Text>
                </View>
              )}
            </View>

            {/* 商品信息 */}
            <View className="product-info">
              <Text className="product-name">{product.displayName}</Text>

              {product.description && (
                <Text className="product-desc">{product.description}</Text>
              )}

              <View className="product-footer">
                <Text className="product-price">{formatPrice(product.basePrice)}</Text>

                {product.stockStatus === 'OUT_OF_STOCK' && (
                  <View className="stock-badge out-of-stock">
                    <Text className="stock-text">售罄</Text>
                  </View>
                )}
                {product.stockStatus === 'LOW_STOCK' && (
                  <View className="stock-badge low-stock">
                    <Text className="stock-text">库存不足</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 购物车浮动按钮 */}
      {cartItemCount > 0 && (
        <View className="cart-fab" onClick={handleCartClick}>
          <Text className="cart-icon">🛒</Text>
          <View className="cart-badge">
            <Text className="cart-count">{cartItemCount}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
