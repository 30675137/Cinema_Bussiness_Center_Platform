/**
 * @spec O010-shopping-cart
 * 会员页面 - 包含购物车入口
 */
import { View, Text } from '@tarojs/components'
import { useCartStore } from '../../stores/cartStore'
import { CartDrawer } from '../../components/CartDrawer'
import './index.less'

export default function Member() {
  // ========== 购物车状态 (@spec O010-shopping-cart) ==========
  const totalItems = useCartStore((state) => state.totalItems())
  const toggleCartDrawer = useCartStore((state) => state.toggleCartDrawer)

  /**
   * 打开购物车抽屉
   */
  const handleCartClick = () => {
    toggleCartDrawer()
  }

  return (
    <View className="member-page">
      {/* 会员中心占位 */}
      <View className="placeholder">
        <Text className="icon">👑</Text>
        <Text className="title">会员中心</Text>
        <Text className="subtitle">专属权益，敬请期待</Text>
      </View>

      {/* 购物车入口卡片 (@spec O010-shopping-cart) */}
      <View className="cart-section">
        <View className="cart-card" onClick={handleCartClick}>
          {/* 购物袋图标 */}
          <View className="cart-icon-wrapper">
            <Text className="cart-icon">🛍️</Text>
            {/* 角标：显示商品件数 */}
            {totalItems > 0 && (
              <View className="cart-badge">
                <Text className="cart-badge-text">{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            )}
          </View>

          {/* 购物车信息 */}
          <View className="cart-info">
            <Text className="cart-title">我的购物车</Text>
            <Text className="cart-subtitle">
              {totalItems > 0 ? `${totalItems}件商品` : '空空如也'}
            </Text>
          </View>

          {/* 右箭头 */}
          <Text className="cart-arrow">→</Text>
        </View>
      </View>

      {/* 购物车抽屉 (@spec O010-shopping-cart) */}
      <CartDrawer />
    </View>
  )
}
