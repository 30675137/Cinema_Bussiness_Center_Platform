/**
 * @spec O006-miniapp-channel-order
 * Button 原子组件 - 通用按钮
 */

import { Button as TaroButton, View } from '@tarojs/components'
import type { ButtonProps as TaroButtonProps } from '@tarojs/components'
import './index.scss'

export interface ButtonProps {
  /** 按钮文本 */
  children: React.ReactNode

  /** 按钮类型 */
  type?: 'primary' | 'secondary' | 'default' | 'danger'

  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'

  /** 是否禁用 */
  disabled?: boolean

  /** 是否加载中 */
  loading?: boolean

  /** 是否块级按钮(占满容器宽度) */
  block?: boolean

  /** 点击事件 */
  onClick?: () => void

  /** 自定义类名 */
  className?: string

  /** Taro Button 原生属性 */
  openType?: TaroButtonProps['openType']
  formType?: TaroButtonProps['formType']
}

/**
 * Button 原子组件
 *
 * @example
 * ```typescript
 * // 主按钮
 * <Button type="primary" onClick={handleSubmit}>
 *   提交订单
 * </Button>
 *
 * // 加载状态
 * <Button type="primary" loading>
 *   提交中...
 * </Button>
 *
 * // 块级按钮
 * <Button type="primary" block>
 *   立即购买
 * </Button>
 *
 * // 危险按钮
 * <Button type="danger" onClick={handleDelete}>
 *   删除
 * </Button>
 *
 * // 小尺寸按钮
 * <Button size="small" type="secondary">
 *   取消
 * </Button>
 * ```
 */
export const Button = ({
  children,
  type = 'default',
  size = 'medium',
  disabled = false,
  loading = false,
  block = false,
  onClick,
  className = '',
  openType,
  formType,
}: ButtonProps) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
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
    <TaroButton
      className={classNames}
      disabled={disabled || loading}
      loading={loading}
      onClick={handleClick}
      openType={openType}
      formType={formType}
    >
      <View className="app-button__content">{children}</View>
    </TaroButton>
  )
}

export default Button
