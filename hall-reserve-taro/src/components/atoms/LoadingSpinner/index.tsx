/**
 * @spec O003-beverage-order
 * LoadingSpinner - C端通用加载中组件 (Taro)
 */
import { View, Text } from '@tarojs/components'
import { AtActivityIndicator } from 'taro-ui'
import './index.scss'

export interface LoadingSpinnerProps {
  /**
   * 加载提示文字
   */
  tip?: string
  /**
   * 尺寸大小
   */
  size?: number
  /**
   * 是否全屏居中
   */
  fullscreen?: boolean
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 加载中组件 (C端 Taro)
 *
 * 使用场景:
 * - 数据加载中
 * - 页面切换
 * - 异步操作等待
 *
 * @example
 * ```tsx
 * // 默认使用
 * <LoadingSpinner />
 *
 * // 带提示文字
 * <LoadingSpinner tip="加载中..." />
 *
 * // 全屏居中
 * <LoadingSpinner tip="正在加载订单数据..." fullscreen />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  tip = '加载中...',
  size = 32,
  fullscreen = false,
  className = '',
}) => {
  const containerClass = fullscreen
    ? 'loading-spinner loading-spinner--fullscreen'
    : 'loading-spinner loading-spinner--default'

  return (
    <View className={`${containerClass} ${className}`}>
      <AtActivityIndicator mode='center' size={size} />
      {tip && <Text className='loading-spinner__tip'>{tip}</Text>}
    </View>
  )
}

export default LoadingSpinner
