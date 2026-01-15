/**
 * @spec O003-beverage-order
 * ErrorState - C端通用错误状态组件 (Taro)
 */
import { View, Text, Button } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import './index.scss'

export interface ErrorStateProps {
  /**
   * 错误标题
   */
  title?: string
  /**
   * 错误描述
   */
  description?: string
  /**
   * 重试按钮文字
   */
  retryText?: string
  /**
   * 重试回调
   */
  onRetry?: () => void
  /**
   * 自定义类名
   */
  className?: string
}

/**
 * 错误状态组件 (C端 Taro)
 *
 * 使用场景:
 * - API 请求失败
 * - 数据加载错误
 * - 权限不足
 * - 404 资源不存在
 *
 * @example
 * ```tsx
 * // 默认错误状态
 * <ErrorState />
 *
 * // 带重试功能
 * <ErrorState
 *   title="加载失败"
 *   description="网络连接失败,请检查网络后重试"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title = '出错了',
  description = '数据加载失败,请稍后重试',
  retryText = '重试',
  onRetry,
  className = '',
}) => {
  return (
    <View className={`error-state ${className}`}>
      <View className='error-state__icon'>
        <AtIcon value='close-circle' size='80' color='#f5222d' />
      </View>
      <Text className='error-state__title'>{title}</Text>
      <Text className='error-state__description'>{description}</Text>
      {onRetry && (
        <Button className='error-state__button' type='primary' onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </View>
  )
}

export default ErrorState
