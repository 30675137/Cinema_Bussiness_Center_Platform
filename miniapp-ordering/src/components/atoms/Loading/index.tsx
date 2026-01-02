/**
 * @spec O006-miniapp-channel-order
 * Loading 原子组件 - 加载指示器
 */

import { View, Text } from '@tarojs/components'
import './index.scss'

export interface LoadingProps {
  /** 加载文本 */
  text?: string

  /** 加载指示器大小 */
  size?: 'small' | 'medium' | 'large'

  /** 是否垂直居中 */
  centered?: boolean

  /** 自定义类名 */
  className?: string
}

/**
 * Loading 原子组件
 *
 * @example
 * ```typescript
 * // 基础用法
 * <Loading />
 *
 * // 带文本
 * <Loading text="加载中..." />
 *
 * // 垂直居中(页面级加载)
 * <Loading centered text="正在加载商品..." />
 * ```
 */
export const Loading = ({
  text,
  size = 'medium',
  centered = false,
  className = '',
}: LoadingProps) => {
  const classNames = [
    'app-loading',
    `app-loading--${size}`,
    centered && 'app-loading--centered',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <View className={classNames}>
      <View className="app-loading__spinner">
        <View className="app-loading__dot app-loading__dot--1" />
        <View className="app-loading__dot app-loading__dot--2" />
        <View className="app-loading__dot app-loading__dot--3" />
      </View>
      {text && <Text className="app-loading__text">{text}</Text>}
    </View>
  )
}

export default Loading
