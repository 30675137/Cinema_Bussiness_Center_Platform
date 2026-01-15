/**
 * @spec O007-miniapp-menu-api
 * 商品列表骨架屏组件 - 加载状态占位
 */

import { View } from '@tarojs/components'
import './index.less'

/**
 * 骨架屏组件属性
 */
export interface ProductListSkeletonProps {
  /** 显示的骨架卡片数量 */
  count?: number
}

/**
 * 单个商品卡片骨架
 */
function SkeletonCard() {
  return (
    <View className='skeleton-card'>
      {/* 图片占位 */}
      <View className='skeleton-image shimmer' />
      {/* 内容区域 */}
      <View className='skeleton-content'>
        {/* 标题占位 */}
        <View className='skeleton-title shimmer' />
        {/* 价格占位 */}
        <View className='skeleton-price shimmer' />
      </View>
    </View>
  )
}

/**
 * 商品列表骨架屏组件
 * 在数据加载时显示，模拟商品卡片布局
 */
export default function ProductListSkeleton({
  count = 6,
}: ProductListSkeletonProps) {
  return (
    <View className='skeleton-list'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  )
}
