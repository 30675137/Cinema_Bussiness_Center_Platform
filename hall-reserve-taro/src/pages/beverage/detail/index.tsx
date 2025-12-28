/**
 * @spec O003-beverage-order
 * 饮品详情页面
 */
import React, { useState, useMemo } from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useBeverageDetail } from '../../../hooks'
import { SpecSelector } from '../../../components/SpecSelector'
import { useOrderCartStore } from '../../../stores/orderCartStore'
import type { CartItem } from '../../../stores/orderCartStore'
import './index.scss'

/**
 * 饮品详情页面
 *
 * 功能：
 * - 显示饮品详细信息
 * - 规格选择（规格、温度、甜度、小料）
 * - 数量调整
 * - 添加到购物车
 */
const BeverageDetail: React.FC = () => {
  const router = useRouter()
  const beverageId = router.params.id || null
  const { data: beverage, isLoading, error } = useBeverageDetail({ beverageId })
  const { addItem } = useOrderCartStore()

  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [customerNote, setCustomerNote] = useState('')

  // 初始化默认规格（选择每个规格类型的第一个选项）
  React.useEffect(() => {
    if (beverage?.specs) {
      const defaultSpecs: Record<string, string> = {}
      const specsByType = beverage.specs.reduce((acc, spec) => {
        const type = spec.specType.toLowerCase()
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(spec)
        return acc
      }, {} as Record<string, any[]>)

      Object.entries(specsByType).forEach(([type, specs]) => {
        if (specs.length > 0) {
          defaultSpecs[type] = specs[0].specName
        }
      })

      setSelectedSpecs(defaultSpecs)
    }
  }, [beverage])

  // 计算当前单价（基础价格 + 规格调整）
  const unitPrice = useMemo(() => {
    if (!beverage) return 0

    let price = beverage.basePrice

    beverage.specs.forEach((spec) => {
      const type = spec.specType.toLowerCase()
      if (selectedSpecs[type] === spec.specName) {
        price += spec.priceAdjustment
      }
    })

    return price
  }, [beverage, selectedSpecs])

  // 计算小计
  const subtotal = unitPrice * quantity

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!beverage) return

    const cartItem: CartItem = {
      beverageId: beverage.id,
      beverageName: beverage.name,
      beverageImageUrl: beverage.imageUrl,
      selectedSpecs,
      quantity,
      unitPrice,
      subtotal,
      customerNote: customerNote || undefined,
    }

    addItem(cartItem)

    Taro.showToast({
      title: '已添加到购物车',
      icon: 'success',
      duration: 1500,
    })

    // 1.5秒后返回菜单页
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  if (isLoading) {
    return (
      <View className="beverage-detail loading">
        <Text>加载中...</Text>
      </View>
    )
  }

  if (error || !beverage) {
    return (
      <View className="beverage-detail error">
        <Text>加载失败：{error?.message || '饮品不存在'}</Text>
      </View>
    )
  }

  return (
    <View className="beverage-detail">
      <ScrollView scrollY className="beverage-detail__scroll">
        {/* 饮品图片 */}
        <View className="beverage-detail__banner">
          <Image src={beverage.imageUrl} mode="aspectFill" className="beverage-detail__image" />
        </View>

        {/* 饮品基本信息 */}
        <View className="beverage-detail__info">
          <Text className="beverage-detail__name">{beverage.name}</Text>
          <Text className="beverage-detail__description">{beverage.description}</Text>
          {beverage.nutritionInfo && (
            <Text className="beverage-detail__nutrition">营养信息: {beverage.nutritionInfo}</Text>
          )}
        </View>

        {/* 规格选择 */}
        <View className="beverage-detail__section">
          <SpecSelector
            specs={beverage.specs}
            selectedSpecs={selectedSpecs}
            onChange={setSelectedSpecs}
          />
        </View>

        {/* 数量选择 */}
        <View className="beverage-detail__section">
          <Text className="beverage-detail__section-title">数量</Text>
          <View className="beverage-detail__quantity">
            <View
              className="beverage-detail__quantity-btn"
              onClick={() => handleQuantityChange(-1)}
            >
              <Text>-</Text>
            </View>
            <Text className="beverage-detail__quantity-value">{quantity}</Text>
            <View
              className="beverage-detail__quantity-btn"
              onClick={() => handleQuantityChange(1)}
            >
              <Text>+</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="beverage-detail__footer">
        <View className="beverage-detail__price-info">
          <View className="beverage-detail__price">
            <Text className="beverage-detail__price-symbol">¥</Text>
            <Text className="beverage-detail__price-value">{(subtotal / 100).toFixed(2)}</Text>
          </View>
          <Text className="beverage-detail__price-unit">
            ¥{(unitPrice / 100).toFixed(2)} × {quantity}
          </Text>
        </View>
        <View className="beverage-detail__add-btn" onClick={handleAddToCart}>
          <Text>加入购物车</Text>
        </View>
      </View>
    </View>
  )
}

export default BeverageDetail
