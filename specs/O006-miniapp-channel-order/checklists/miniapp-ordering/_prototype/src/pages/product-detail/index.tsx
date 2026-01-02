/**
 * @spec O006-miniapp-channel-order
 * 商品详情页 - 规格选择与加购
 */

import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useChannelProductDetail, useChannelProductSpecs } from '../../hooks/useChannelProducts'
import { useCartStore } from '../../stores/cartStore'
import type { SelectedSpec, SpecType } from '../../types/channelProduct'
import {
  calculateUnitPrice,
  validateRequiredSpecs,
  formatPrice,
  formatPriceAdjustment,
} from '../../utils/priceCalculator'
import './index.scss'

export default function ProductDetailPage() {
  const router = useRouter()
  const productId = router.params.id || ''

  const { data: product, isLoading: isLoadingProduct } = useChannelProductDetail(productId)
  const { data: specs, isLoading: isLoadingSpecs } = useChannelProductSpecs(productId)

  const [selectedSpecs, setSelectedSpecs] = useState<SelectedSpec[]>([])
  const [quantity, setQuantity] = useState(1)

  const addToCart = useCartStore((state) => state.addToCart)

  // 初始化默认规格
  useEffect(() => {
    if (!specs || specs.length === 0) return

    const defaultSpecs: SelectedSpec[] = specs
      .filter((spec) => spec.isRequired || spec.options.some((opt) => opt.isDefault))
      .map((spec) => {
        const defaultOption = spec.options.find((opt) => opt.isDefault) || spec.options[0]
        return {
          specType: spec.specType,
          specName: spec.specName,
          optionId: defaultOption.id,
          optionName: defaultOption.optionName,
          priceAdjustment: defaultOption.priceAdjustment,
        }
      })

    setSelectedSpecs(defaultSpecs)
  }, [specs])

  // 处理规格选择
  const handleSpecSelect = (specType: SpecType, specName: string, optionId: string) => {
    if (!specs) return

    const spec = specs.find((s) => s.specType === specType)
    if (!spec) return

    const option = spec.options.find((opt) => opt.id === optionId)
    if (!option) return

    const newSpec: SelectedSpec = {
      specType,
      specName,
      optionId,
      optionName: option.optionName,
      priceAdjustment: option.priceAdjustment,
    }

    if (spec.allowMultiple) {
      // 多选：切换选中状态
      const isSelected = selectedSpecs.some(
        (s) => s.specType === specType && s.optionId === optionId
      )

      if (isSelected) {
        setSelectedSpecs(selectedSpecs.filter((s) => s.optionId !== optionId))
      } else {
        setSelectedSpecs([...selectedSpecs, newSpec])
      }
    } else {
      // 单选：替换同类型的规格
      setSelectedSpecs([
        ...selectedSpecs.filter((s) => s.specType !== specType),
        newSpec,
      ])
    }
  }

  // 处理数量调整
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity < 1 || newQuantity > 99) return
    setQuantity(newQuantity)
  }

  // 加入购物车
  const handleAddToCart = () => {
    if (!product || !specs) return

    // 验证必选规格
    const validation = validateRequiredSpecs(specs, selectedSpecs)
    if (!validation.valid) {
      Taro.showToast({
        title: `请选择: ${validation.missingSpecs.join(', ')}`,
        icon: 'none',
      })
      return
    }

    // 检查库存
    if (product.stockStatus === 'OUT_OF_STOCK') {
      Taro.showToast({
        title: '商品已售罄',
        icon: 'none',
      })
      return
    }

    // 加入购物车
    addToCart({
      channelProductId: product.id,
      displayName: product.displayName,
      mainImage: product.mainImage,
      basePrice: product.basePrice,
      selectedSpecs,
      quantity,
    })

    Taro.showToast({
      title: '已加入购物车',
      icon: 'success',
    })

    // 延迟返回
    setTimeout(() => {
      Taro.navigateBack()
    }, 500)
  }

  // Loading 状态
  if (isLoadingProduct || isLoadingSpecs) {
    return (
      <View className="product-detail-page">
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  // 数据不存在
  if (!product || !specs) {
    return (
      <View className="product-detail-page">
        <View className="error-container">
          <Text className="error-text">商品不存在</Text>
        </View>
      </View>
    )
  }

  const currentPrice = calculateUnitPrice(product.basePrice, selectedSpecs)
  const totalPrice = currentPrice * quantity

  return (
    <View className="product-detail-page">
      <ScrollView className="detail-content" scrollY>
        {/* 商品图片轮播 */}
        <View className="image-gallery">
          <Image
            className="main-image"
            src={product.mainImage}
            mode="aspectFill"
          />
        </View>

        {/* 商品基本信息 */}
        <View className="product-header">
          <View className="product-title-row">
            <Text className="product-name">{product.displayName}</Text>
            {product.isRecommended && (
              <View className="recommend-badge">
                <Text className="recommend-text">推荐</Text>
              </View>
            )}
          </View>

          <View className="price-row">
            <Text className="current-price">{formatPrice(currentPrice)}</Text>
            {currentPrice !== product.basePrice && (
              <Text className="base-price">{formatPrice(product.basePrice)}</Text>
            )}
          </View>

          {product.description && (
            <Text className="product-desc">{product.description}</Text>
          )}
        </View>

        {/* 规格选择区域 */}
        {specs.map((spec) => (
          <View key={spec.id} className="spec-section">
            <View className="spec-header">
              <Text className="spec-title">{spec.specName}</Text>
              {spec.isRequired && (
                <Text className="required-badge">必选</Text>
              )}
              {spec.allowMultiple && (
                <Text className="multi-badge">可多选</Text>
              )}
            </View>

            <View className="spec-options">
              {spec.options.map((option) => {
                const isSelected = selectedSpecs.some(
                  (s) => s.specType === spec.specType && s.optionId === option.id
                )

                return (
                  <View
                    key={option.id}
                    className={`spec-option ${isSelected ? 'selected' : ''}`}
                    onClick={() =>
                      handleSpecSelect(spec.specType, spec.specName, option.id)
                    }
                  >
                    <Text className="option-name">{option.optionName}</Text>
                    {option.priceAdjustment !== 0 && (
                      <Text className="option-price">
                        {formatPriceAdjustment(option.priceAdjustment)}
                      </Text>
                    )}
                  </View>
                )
              })}
            </View>
          </View>
        ))}

        {/* 数量选择 */}
        <View className="quantity-section">
          <Text className="section-title">数量</Text>
          <View className="quantity-control">
            <View
              className={`quantity-btn ${quantity <= 1 ? 'disabled' : ''}`}
              onClick={() => handleQuantityChange(-1)}
            >
              <Text className="btn-text">-</Text>
            </View>
            <Text className="quantity-value">{quantity}</Text>
            <View
              className={`quantity-btn ${quantity >= 99 ? 'disabled' : ''}`}
              onClick={() => handleQuantityChange(1)}
            >
              <Text className="btn-text">+</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="bottom-bar">
        <View className="price-info">
          <Text className="price-label">总计</Text>
          <Text className="total-price">{formatPrice(totalPrice)}</Text>
        </View>

        <Button
          className="add-cart-btn"
          type="primary"
          disabled={product.stockStatus === 'OUT_OF_STOCK'}
          onClick={handleAddToCart}
        >
          {product.stockStatus === 'OUT_OF_STOCK' ? '已售罄' : '加入购物车'}
        </Button>
      </View>
    </View>
  )
}
