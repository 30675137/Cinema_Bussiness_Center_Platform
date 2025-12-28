/**
 * @spec O003-beverage-order
 * 饮品卡片组件
 */
import React, { useState } from 'react'
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { BeverageDTO } from '../../types/beverage'
import './index.scss'

/** 默认占位图 */
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUY1RjUiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNDQ0MiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWKoOi9veS4rS4uLjwvdGV4dD48L3N2Zz4='

/**
 * 饮品卡片组件 Props
 */
export interface BeverageCardProps {
  /**
   * 饮品数据
   */
  beverage: BeverageDTO

  /**
   * 点击回调
   */
  onClick?: (beverage: BeverageDTO) => void
}

/**
 * 饮品卡片组件
 *
 * 用于饮品列表展示，支持：
 * - 饮品图片、名称、描述
 * - 价格显示
 * - 状态标识（售罄、推荐）
 * - 点击跳转详情
 */
export const BeverageCard: React.FC<BeverageCardProps> = ({ beverage, onClick }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleClick = () => {
    if (beverage.status === 'OUT_OF_STOCK') {
      Taro.showToast({
        title: '该饮品已售罄',
        icon: 'none',
        duration: 2000,
      })
      return
    }

    onClick?.(beverage)
  }

  return (
    <View
      className={`beverage-card ${beverage.status === 'OUT_OF_STOCK' ? 'out-of-stock' : ''}`}
      onClick={handleClick}
    >
      {/* 饮品图片 - 懒加载 + 占位图 + 错误处理 */}
      <View className="beverage-card__image-wrapper">
        <Image
          src={imageError ? PLACEHOLDER_IMAGE : (beverage.imageUrl || PLACEHOLDER_IMAGE)}
          mode="aspectFill"
          className={`beverage-card__image ${imageLoaded ? 'loaded' : 'loading'}`}
          lazyLoad
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        {beverage.isRecommended && (
          <View className="beverage-card__badge beverage-card__badge--recommend">推荐</View>
        )}
        {beverage.status === 'OUT_OF_STOCK' && (
          <View className="beverage-card__badge beverage-card__badge--sold-out">售罄</View>
        )}
      </View>

      {/* 饮品信息 */}
      <View className="beverage-card__content">
        <Text className="beverage-card__name">{beverage.name}</Text>
        <Text className="beverage-card__description">{beverage.description}</Text>

        {/* 价格 */}
        <View className="beverage-card__footer">
          <View className="beverage-card__price">
            <Text className="beverage-card__price-symbol">¥</Text>
            <Text className="beverage-card__price-value">
              {(beverage.basePrice / 100).toFixed(2)}
            </Text>
          </View>
          {beverage.status !== 'OUT_OF_STOCK' && (
            <View className="beverage-card__action">
              <Text className="beverage-card__action-text">立即购买</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
