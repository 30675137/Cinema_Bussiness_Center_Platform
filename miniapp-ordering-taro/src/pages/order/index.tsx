import { useState, useMemo, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '../../components'
import { CategoryType, Product, CartItem, EntertainmentZone, Coupon, Member } from '../../types'
import { PRODUCTS, ZONES, MOCK_MEMBER } from '../../constants'
import './index.less'

export default function OrderPage() {
  // Tab 切换状态
  const [activeTab, setActiveTab] = useState<'order' | 'member'>('order')
  const [activeCategory, setActiveCategory] = useState<CategoryType>(CategoryType.ALCOHOL)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedZone, setSelectedZone] = useState<EntertainmentZone>(ZONES[0])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isScanOpen, setIsScanOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // 会员状态
  const [member, setMember] = useState<Member>(MOCK_MEMBER)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [usePoints, setUsePoints] = useState(false)
  
  // AI 推荐状态
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState<{name: string, reason: string}[]>([])

  // 按分类过滤商品
  const filteredProducts = useMemo(() => 
    PRODUCTS.filter(p => p.category === activeCategory),
    [activeCategory]
  )

  // 购物车小计
  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.isRedemption ? 0 : item.product.price * item.quantity), 0),
    [cart]
  )

  // 优惠计算
  const discount = useMemo(() => {
    let d = 0
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'flat' && subtotal >= appliedCoupon.minSpend) {
        d += appliedCoupon.value
      } else if (appliedCoupon.discountType === 'percent') {
        d += (subtotal * appliedCoupon.value) / 100
      }
    }
    if (usePoints) {
      const pointValue = member.points / 10
      const pointDiscount = Math.min(pointValue, subtotal * 0.5)
      d += pointDiscount
    }
    return Math.floor(d)
  }, [appliedCoupon, subtotal, usePoints, member.points])

  const cartTotal = Math.max(0, subtotal - discount)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const pointsToEarn = Math.floor(cartTotal)

  // 获取商品在购物车中的数量
  const getProductQuantity = (productId: string) => {
    return cart
      .filter(item => item.product.id === productId && !item.isRedemption)
      .reduce((sum, item) => sum + item.quantity, 0)
  }

  // 添加到购物车
  const addToCart = (product: Product, options: Record<string, string> = {}, isRedemption = false) => {
    if (isRedemption && member.points < (product.pointsPrice || 0)) {
      Taro.showToast({ title: '积分余额不足', icon: 'none' })
      return
    }

    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        item.isRedemption === isRedemption &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      )
      if (existing) {
        return prev.map(item => 
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1, selectedOptions: options, isRedemption }]
    })
    setSelectedProduct(null)
    if (isRedemption) {
      Taro.showToast({ title: `已成功兑换 ${product.name}`, icon: 'success' })
    }
  }

  // 更新购物车数量
  const updateCartQuantity = (productId: string, delta: number, isRedemption = false) => {
    setCart(prev => {
      const items = prev.filter(item => item.product.id === productId && item.isRedemption === isRedemption)
      if (items.length === 0 && delta > 0) {
        const product = PRODUCTS.find(p => p.id === productId)
        if (product) return [...prev, { product, quantity: 1, selectedOptions: {}, isRedemption }]
        return prev
      }
      
      return prev.map(item => {
        if (item.product.id === productId && item.isRedemption === isRedemption) {
          const newQty = Math.max(0, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  // 模拟 AI 推荐
  useEffect(() => {
    setIsAISuggestionLoading(true)
    const timer = setTimeout(() => {
      setAiRecommendations([
        { name: '午夜尼格罗尼', reason: '完美搭配影院氛围' }
      ])
      setIsAISuggestionLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [selectedZone])

  // 分类列表
  const categories = [
    { type: CategoryType.ALCOHOL, icon: 'wine' as const },
    { type: CategoryType.COFFEE, icon: 'coffee' as const },
    { type: CategoryType.BEVERAGE, icon: 'beverage' as const },
    { type: CategoryType.SNACK, icon: 'food' as const }
  ]

  // 可兑换商品
  const redeemableProducts = PRODUCTS.filter(p => p.pointsPrice)

  // 渲染点餐页面
  const renderOrderTab = () => (
    <View className='main-content'>
      {/* 左侧分类导航 */}
      <ScrollView className='category-nav' scrollY>
        {categories.map(({ type, icon }) => (
          <View 
            key={type}
            className={`category-item ${activeCategory === type ? 'active' : ''}`}
            onClick={() => setActiveCategory(type)}
          >
            <View className={`category-icon ${activeCategory === type ? 'active' : ''}`}>
              <Icon name={icon} size={24} />
            </View>
            <Text className='category-name'>{type}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 右侧商品列表 */}
      <ScrollView className='product-list' scrollY>
        <View className='list-header'>
          <Text className='list-title'>{activeCategory}</Text>
          <Text className='list-subtitle'>为您的视听盛宴挑选心意之选</Text>
        </View>

        {filteredProducts.map(product => {
          const qty = getProductQuantity(product.id)
          return (
            <View 
              key={product.id}
              className='product-card'
              onClick={() => setSelectedProduct(product)}
            >
              <Image 
                src={product.image} 
                className='product-image'
                mode='aspectFill'
              />
              <View className='product-info'>
                <View className='product-header'>
                  <Text className='product-name'>{product.name}</Text>
                  <View className='product-points'>
                    <Icon name='star' size={10} color='#f59e0b' />
                    <Text className='points-text'>预计得 {product.price} 积分</Text>
                  </View>
                </View>
                <View className='product-footer'>
                  <Text className='product-price'>¥{product.price}</Text>
                  <View className='quantity-controls'>
                    {qty > 0 && (
                      <>
                        <View 
                          className='qty-btn minus'
                          onClick={(e) => {
                            e.stopPropagation()
                            updateCartQuantity(product.id, -1)
                          }}
                        >
                          <Icon name='minus' size={14} color='#a1a1aa' />
                        </View>
                        <Text className='qty-num'>{qty}</Text>
                      </>
                    )}
                    <View 
                      className='qty-btn plus'
                      onClick={(e) => {
                        e.stopPropagation()
                        updateCartQuantity(product.id, 1)
                      }}
                    >
                      <Icon name='plus' size={14} color='#18181b' />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )

  // 渲染会员中心页面
  const renderMemberTab = () => (
    <ScrollView className='member-content' scrollY>
      {/* 会员卡片 */}
      <View className='member-card'>
        <View className='card-glow' />
        <View className='card-header'>
          <View className='card-info'>
            <Text className='member-name'>{member.name}</Text>
            <View className='member-meta'>
              <View className='level-badge'>{member.level}</View>
              <Text className='join-date'>自 2024 年加入</Text>
            </View>
          </View>
          <Icon name='award' size={32} color='#f59e0b' />
        </View>
        <View className='card-footer'>
          <View className='points-section'>
            <Text className='points-label'>积分余额</Text>
            <View className='points-value'>
              <Text className='points-num'>{member.points}</Text>
              <Text className='points-unit'>Pts</Text>
            </View>
          </View>
          <View className='spent-section'>
            <Text className='spent-label'>消费总计</Text>
            <Text className='spent-value'>¥{member.totalSpent}</Text>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View className='quick-actions'>
        <View className='action-item' onClick={() => Taro.showToast({ title: '暂无历史订单', icon: 'none' })}>
          <Icon name='list' size={20} color='#3b82f6' />
          <Text className='action-label'>我的订单</Text>
          <Text className='action-value'>查看全部</Text>
        </View>
        <View className='action-item' onClick={() => setIsCartOpen(true)}>
          <Icon name='cart' size={20} color='#22c55e' />
          {totalItems > 0 && <View className='action-badge'>{totalItems}</View>}
          <Text className='action-label'>购物车</Text>
          <Text className='action-value'>{totalItems > 0 ? `${totalItems}件商品` : '空空如也'}</Text>
        </View>
        <View className='action-item'>
          <Icon name='ticket' size={20} color='#f59e0b' />
          <Text className='action-label'>优惠券</Text>
          <Text className='action-value'>{member.coupons.length} 张可用</Text>
        </View>
        <View className='action-item'>
          <Icon name='award' size={20} color='#a855f7' />
          <Text className='action-label'>等级晋升</Text>
          <Text className='action-value'>¥{2000 - member.totalSpent} 升级</Text>
        </View>
      </View>

      {/* 积分商城 */}
      <View className='points-mall'>
        <View className='mall-header'>
          <Icon name='star' size={16} color='#f59e0b' />
          <Text className='mall-title'>积分商城</Text>
        </View>
        <View className='mall-list'>
          {redeemableProducts.map(product => (
            <View key={product.id} className='mall-item'>
              <Image src={product.image} className='item-image' mode='aspectFill' />
              <View className='item-info'>
                <Text className='item-name'>{product.name}</Text>
                <Text className='item-points'>{product.pointsPrice} 积分</Text>
              </View>
              <View className='redeem-btn' onClick={() => addToCart(product, {}, true)}>
                <Text className='btn-text'>立即兑换</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View className='order-page'>
      {/* 扫码界面覆盖层 */}
      {isScanOpen && (
        <View className='scan-overlay animate-fade-in'>
          <View className='scan-close' onClick={() => setIsScanOpen(false)}>
            <Icon name='close' size={24} color='#fff' />
          </View>
          
          <View className='scan-frame'>
            <View className='scan-corner top-left' />
            <View className='scan-corner top-right' />
            <View className='scan-corner bottom-left' />
            <View className='scan-corner bottom-right' />
            <View className='scan-line animate-scan' />
            <Icon name='camera' size={64} color='#3f3f46' />
          </View>
          
          <View className='scan-tips'>
            <Text className='scan-title'>扫描二维码</Text>
            <Text className='scan-desc'>对准影厅座位或桌台上的二维码即可自动点餐</Text>
          </View>

          <View 
            className='scan-mock-btn'
            onClick={() => {
              Taro.showToast({ title: '已识别: 3号厅-爵士现场-B12桌', icon: 'none' })
              setSelectedZone(ZONES[2])
              setIsScanOpen(false)
            }}
          >
            <Text className='mock-btn-text'>模拟识别</Text>
          </View>
        </View>
      )}

      {/* 顶部导航栏 */}
      <View className='header'>
        <View className='header-content'>
          <View className='header-left'>
            <Text className='brand'>CINELounge</Text>
            <View className='zone-info'>
              <Icon name='info' size={14} color='#71717a' />
              <Text className='zone-name'>{selectedZone.name}</Text>
              <Icon name='right' size={14} color='#71717a' />
            </View>
          </View>
          <View className='header-actions'>
            <View className='action-btn'>
              <Icon name='search' size={20} color='#d4d4d8' />
            </View>
            <View className='action-btn primary' onClick={() => setIsScanOpen(true)}>
              <Icon name='scan' size={20} color='#18181b' />
            </View>
          </View>
        </View>
      </View>

      {/* AI 推荐横幅 */}
      <View className='ai-banner'>
        <Icon name='star' size={12} color='#f59e0b' />
        <Text className='ai-text'>
          {isAISuggestionLoading 
            ? 'AI 正在根据氛围为您配餐...' 
            : aiRecommendations.length > 0 
              ? `AI推荐: ${aiRecommendations[0].name}` 
              : '会员特惠专场已开启'}
        </Text>
      </View>

      {/* 主内容区 - 根据 Tab 切换 */}
      {activeTab === 'order' ? renderOrderTab() : renderMemberTab()}

      {/* 底部 TabBar */}
      <View className='tab-bar'>
        <View 
          className={`tab-item ${activeTab === 'order' ? 'active' : ''}`}
          onClick={() => setActiveTab('order')}
        >
          <Icon name='cart' size={24} color={activeTab === 'order' ? '#f59e0b' : '#71717a'} />
          <Text className='tab-text'>点餐</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'member' ? 'active' : ''}`}
          onClick={() => setActiveTab('member')}
        >
          <Icon name='user' size={24} color={activeTab === 'member' ? '#f59e0b' : '#71717a'} />
          <Text className='tab-text'>会员中心</Text>
        </View>
      </View>

      {/* 底部购物车栏 - 仅在点餐页显示 */}
      {cartTotal > 0 && activeTab === 'order' && (
        <View className='cart-bar' onClick={() => setIsCartOpen(true)}>
          <View className='cart-count'>{totalItems}</View>
          <View className='cart-info'>
            <Text className='cart-label'>去结账</Text>
            <Text className='cart-total'>¥{cartTotal}</Text>
          </View>
          <Icon name='right' size={24} color='#18181b' />
        </View>
      )}

      {/* 商品详情弹窗 */}
      {selectedProduct && (
        <View className='product-modal'>
          <View className='modal-mask' onClick={() => setSelectedProduct(null)} />
          <View className='modal-content animate-slide-up'>
            <View className='modal-handle' />
            <View className='modal-body'>
              <Image src={selectedProduct.image} className='modal-image' mode='aspectFill' />
              <View className='modal-info'>
                <Text className='modal-name'>{selectedProduct.name}</Text>
                <Text className='modal-desc'>{selectedProduct.description}</Text>
                <Text className='modal-price'>¥{selectedProduct.price}</Text>
              </View>
            </View>
            <View className='modal-action' onClick={() => addToCart(selectedProduct)}>
              <Icon name='plus' size={20} color='#18181b' />
              <Text className='action-text'>加入购物车</Text>
            </View>
            <Text className='modal-points'>下单即可获得 {selectedProduct.price} 积分</Text>
          </View>
        </View>
      )}

      {/* 购物车弹窗 */}
      {isCartOpen && (
        <View className='cart-modal'>
          <View className='modal-mask' onClick={() => setIsCartOpen(false)} />
          <View className='cart-content animate-slide-up'>
            <View className='cart-header'>
              <Text className='cart-title'>订单汇总</Text>
              <View className='close-btn' onClick={() => setIsCartOpen(false)}>
                <Icon name='close' size={20} color='#fff' />
              </View>
            </View>
            
            <ScrollView className='cart-items' scrollY>
              {cart.map((item, idx) => (
                <View key={`${item.product.id}-${idx}`} className='cart-item'>
                  <View className='item-image-wrap'>
                    <Image src={item.product.image} className='item-image' mode='aspectFill' />
                    {item.isRedemption && <View className='redeem-tag'>兑换</View>}
                  </View>
                  <View className='item-info'>
                    <Text className='item-name'>{item.product.name}</Text>
                    <Text className='item-price'>
                      {item.isRedemption ? `${item.product.pointsPrice} 积分` : `¥${item.product.price}`}
                    </Text>
                  </View>
                  <View className='item-quantity'>
                    <View className='qty-btn' onClick={() => updateCartQuantity(item.product.id, -1, item.isRedemption)}>
                      <Icon name='minus' size={14} />
                    </View>
                    <Text className='qty-num'>{item.quantity}</Text>
                    <View className='qty-btn' onClick={() => updateCartQuantity(item.product.id, 1, item.isRedemption)}>
                      <Icon name='plus' size={14} />
                    </View>
                  </View>
                </View>
              ))}

              {/* 优惠券区域 */}
              <View className='coupon-section'>
                <Text className='section-title'>可用优惠券</Text>
                {member.coupons.map(coupon => (
                  <View
                    key={coupon.id}
                    className={`coupon-item ${appliedCoupon?.id === coupon.id ? 'active' : ''} ${subtotal < coupon.minSpend ? 'disabled' : ''}`}
                    onClick={() => {
                      if (subtotal >= coupon.minSpend) {
                        setAppliedCoupon(appliedCoupon?.id === coupon.id ? null : coupon)
                      }
                    }}
                  >
                    <Icon name='ticket' size={20} color={appliedCoupon?.id === coupon.id ? '#f59e0b' : '#71717a'} />
                    <View className='coupon-info'>
                      <Text className='coupon-title'>{coupon.title}</Text>
                      <Text className='coupon-desc'>{coupon.description}</Text>
                    </View>
                    {appliedCoupon?.id === coupon.id && <Icon name='check' size={20} color='#f59e0b' />}
                  </View>
                ))}
              </View>

              {/* 积分抵扣 */}
              <View className='points-toggle'>
                <View className='toggle-left'>
                  <Icon name='star' size={20} color='#f59e0b' />
                  <View className='toggle-info'>
                    <Text className='toggle-title'>积分抵扣现金</Text>
                    <Text className='toggle-desc'>当前余额: {member.points} 积分</Text>
                  </View>
                </View>
                <View 
                  className={`toggle-switch ${usePoints ? 'active' : ''}`}
                  onClick={() => setUsePoints(!usePoints)}
                >
                  <View className='toggle-dot' />
                </View>
              </View>
            </ScrollView>
            
            <View className='cart-footer'>
              <View className='footer-summary'>
                <View className='summary-row'>
                  <Text className='summary-label'>小计</Text>
                  <Text className='summary-value'>¥{subtotal}</Text>
                </View>
                {discount > 0 && (
                  <View className='summary-row discount'>
                    <Text className='summary-label'>已优惠</Text>
                    <Text className='summary-discount'>-¥{discount}</Text>
                  </View>
                )}
                <View className='summary-row total'>
                  <Text className='summary-label'>实付金额</Text>
                  <Text className='summary-total'>¥{cartTotal}</Text>
                </View>
                <View className='earn-points'>
                  <Icon name='check' size={12} color='#52525b' />
                  <Text className='earn-text'>本单将为您赚取 {pointsToEarn} 积分</Text>
                </View>
              </View>
              <View className='pay-btn' onClick={() => {
                Taro.showToast({ title: `支付成功! 实付 ¥${cartTotal}。您已获得 ${pointsToEarn} 积分。`, icon: 'success' })
                const pointsUsed = usePoints ? Math.min(member.points, Math.floor(subtotal * 5)) : 0
                setMember(prev => ({
                  ...prev, 
                  points: prev.points + pointsToEarn - pointsUsed, 
                  totalSpent: prev.totalSpent + cartTotal
                }))
                setCart([])
                setIsCartOpen(false)
                setAppliedCoupon(null)
                setUsePoints(false)
              }}>
                <Text className='pay-text'>立即支付</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
