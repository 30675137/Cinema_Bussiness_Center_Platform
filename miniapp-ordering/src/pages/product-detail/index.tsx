/**
 * @spec O006-miniapp-channel-order
 * 商品详情页面
 */

import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { Image } from '@/components/atoms/Image'
import { Price } from '@/components/atoms/Price'
import { Button } from '@/components/atoms/Button'
import { Loading } from '@/components/atoms/Loading'
import { SpecSelector } from '@/components/organisms/SpecSelector'
import { useChannelProductDetail } from '@/hooks/useChannelProductDetail'
import { useChannelProductSpecs } from '@/hooks/useChannelProductSpecs'
import { useCartStore } from '@/stores/cartStore'
import { calculateCartItemUnitPrice } from '@/types/cart'
import type { SelectedSpec, SpecType } from '@/types/productSpec'
import './index.scss'

export default function ProductDetail() {
  const router = useRouter()
  const productId = router.params.id || ''

  // 已选择的规格
  const [selectedSpecs, setSelectedSpecs] = useState<Record<SpecType, SelectedSpec>>({})

  // 获取商品详情和规格
  const { data: product, isLoading: isLoadingProduct } = useChannelProductDetail(productId)
  const { data: specs, isLoading: isLoadingSpecs } = useChannelProductSpecs(productId)

  // 购物车
  const addItem = useCartStore((state) => state.addItem)

  // 自动选择默认规格
  useEffect(() => {
    if (!specs || specs.length === 0) return

    const defaultSpecs: Record<SpecType, SelectedSpec> = {}

    specs.forEach((spec) => {
      const defaultOption = spec.options.find((opt) => opt.isDefault)
      if (defaultOption) {
        defaultSpecs[spec.specType] = {
          specType: spec.specType,
          specName: spec.specName,
          optionId: defaultOption.id,
          optionName: defaultOption.optionName,
          priceAdjustment: defaultOption.priceAdjustment,
        }
      }
    })

    setSelectedSpecs(defaultSpecs)
  }, [specs])

  // 计算当前价格（基础价 + 规格调整）
  const currentPrice = product
    ? calculateCartItemUnitPrice(product.basePrice, selectedSpecs)
    : 0

  // 检查是否所有必选规格都已选择
  const validateSpecs = (): boolean => {
    if (!specs) return true

    for (const spec of specs) {
      if (spec.isRequired && !selectedSpecs[spec.specType]) {
        Taro.showToast({
          title: `请选择${spec.specName}`,
          icon: 'none',
          duration: 2000,
        })
        return false
      }
    }

    return true
  }

  // 加入购物车
  const handleAddToCart = () => {
    if (!product) return

    if (!validateSpecs()) return

    addItem(product, selectedSpecs)

    Taro.showToast({
      title: '已添加到购物车',
      icon: 'success',
      duration: 1500,
    })

    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  // 加载中
  if (isLoadingProduct || isLoadingSpecs) {
    return (
      <View className="product-detail">
        <Loading fullscreen text="加载中..." />
      </View>
    )
  }

  // 商品不存在
  if (!product) {
    return (
      <View className="product-detail">
        <View className="product-detail__error">
          <Text className="product-detail__error-text">商品不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="product-detail">
      {/* 商品图片 */}
      <View className="product-detail__images">
        <Image
          src={product.mainImage}
          mode="aspectFill"
          className="product-detail__main-image"
        />
      </View>

      {/* 商品信息 */}
      <ScrollView className="product-detail__content" scrollY>
        <View className="product-detail__info">
          <Text className="product-detail__name">{product.displayName}</Text>

          {product.description && (
            <Text className="product-detail__description">
              {product.description}
            </Text>
          )}

          <View className="product-detail__price-section">
            <Price value={currentPrice} size="xlarge" bold color="#f59e0b" />
          </View>
        </View>

        {/* 规格选择 */}
        {specs && specs.length > 0 && (
          <View className="product-detail__specs">
            <SpecSelector
              specs={specs}
              selectedSpecs={selectedSpecs}
              onChange={setSelectedSpecs}
            />
          </View>
        )}
      </ScrollView>

      {/* 底部按钮 */}
      <View className="product-detail__footer">
        <Button
          type="primary"
          size="large"
          block
          onClick={handleAddToCart}
        >
          加入购物车
        </Button>
        <View className="product-detail__footer-hint">
          <Text className="product-detail__footer-hint-text">
            下单即可获得 {(currentPrice / 100).toFixed(0)} 积分
          </Text>
        </View>
      </View>
    </View>
  )
}
