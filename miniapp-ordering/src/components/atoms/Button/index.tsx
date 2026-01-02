/**
 * @spec O006-miniapp-channel-order
 * Button 原子组件
 */

import { View } from '@tarojs/components'
import type { ReactNode } from 'react'
import './index.scss'

export interface ButtonProps {
  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'danger' | 'default'

  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'

  /** 是否禁用 */
  disabled?: boolean

  /** 是否加载中 */
  loading?: boolean

  /** 是否块级按钮(宽度 100%) */
  block?: boolean

  /** 按钮文本或子元素 */
  children: ReactNode

  /** 点击事件 */
  onClick?: () => void

  /** 自定义类名 */
  className?: string
}

/**
 * Button 原子组件
 *
 * @description
 * - 支持 4 种类型: primary, secondary, danger, default
 * - 支持 3 种尺寸: small, medium, large
 * - 支持加载状态和禁用状态
 *
 * @example
 * ```typescript
 * // 主要按钮
 * <Button type="primary" onClick={handleClick}>
 *   确认
 * </Button>
 *
 * // 加载状态
 * <Button loading>
 *   提交中...
 * </Button>
 *
 * // 块级按钮
 * <Button block type="primary">
 *   加入购物车
 * </Button>
 * ```
 */
export const Button = ({
  type = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  block = false,
  children,
  onClick,
  className = '',
}: ButtonProps) => {
  const handleClick = () => {
    if (disabled || loading) {
      return
    }
    onClick?.()
  }

  const classNames = [
    'app-button',
    `app-button--${type}`,
    `app-button--${size}`,
    block && 'app-button--block',
    disabled && 'app-button--disabled',
    loading && 'app-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <View className={classNames} onClick={handleClick}>
      {loading && <View className="app-button__loading-icon">...</View>}
      <View className="app-button__text">{children}</View>
    </View>
  )
}

export default Button
