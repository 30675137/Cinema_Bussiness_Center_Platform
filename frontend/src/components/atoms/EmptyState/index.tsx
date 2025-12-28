/**
 * @spec O003-beverage-order
 * EmptyState - 通用空状态组件
 */
import React from 'react'
import { Button, Empty } from 'antd'

export interface EmptyStateProps {
  /**
   * 空状态描述文字
   */
  description?: string
  /**
   * 操作按钮文字
   */
  actionText?: string
  /**
   * 操作按钮点击回调
   */
  onAction?: () => void
  /**
   * 自定义图片
   */
  image?: React.ReactNode
  /**
   * 是否使用简单模式 (更小的图片)
   */
  simple?: boolean
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 空状态组件
 *
 * 使用场景:
 * - 列表无数据
 * - 搜索无结果
 * - 购物车为空
 * - 订单列表为空
 *
 * @example
 * ```tsx
 * // 默认空状态
 * <EmptyState />
 *
 * // 带操作按钮
 * <EmptyState
 *   description="暂无订单"
 *   actionText="去下单"
 *   onAction={() => navigate('/beverages')}
 * />
 *
 * // 简单模式
 * <EmptyState
 *   description="暂无数据"
 *   simple
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  description = '暂无数据',
  actionText,
  onAction,
  image,
  simple = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Empty
        image={image || (simple ? Empty.PRESENTED_IMAGE_SIMPLE : Empty.PRESENTED_IMAGE_DEFAULT)}
        description={description}
      >
        {actionText && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
