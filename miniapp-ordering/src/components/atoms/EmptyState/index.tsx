/**
 * @spec O006-miniapp-channel-order
 * EmptyState 原子组件 - 空状态提示
 */

import { View, Text } from '@tarojs/components'
import type { ReactNode } from 'react'
import './index.scss'

export interface EmptyStateProps {
  /** 空状态图片 URL */
  image?: string

  /** 空状态标题 */
  title?: string

  /** 空状态描述 */
  description?: string

  /** 操作按钮或自定义内容 */
  action?: ReactNode

  /** 自定义类名 */
  className?: string
}

/**
 * EmptyState 原子组件
 *
 * @example
 * ```typescript
 * // 空购物车
 * <EmptyState
 *   image="/assets/images/placeholders/empty-cart.png"
 *   title="购物车是空的"
 *   description="快去选购心仪的商品吧"
 *   action={
 *     <Button type="primary" onClick={handleGoShopping}>
 *       去逛逛
 *     </Button>
 *   }
 * />
 *
 * // 暂无订单
 * <EmptyState
 *   title="暂无订单"
 *   description="您还没有下过订单哦"
 * />
 * ```
 */
export const EmptyState = ({
  image,
  title = '暂无数据',
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  const classNames = ['app-empty-state', className].filter(Boolean).join(' ')

  return (
    <View className={classNames}>
      {image && (
        <View className="app-empty-state__image">
          <image src={image} mode="aspectFit" />
        </View>
      )}

      {title && <Text className="app-empty-state__title">{title}</Text>}

      {description && (
        <Text className="app-empty-state__description">{description}</Text>
      )}

      {action && <View className="app-empty-state__action">{action}</View>}
    </View>
  )
}

export default EmptyState
