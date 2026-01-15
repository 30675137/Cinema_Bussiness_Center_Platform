/**
 * @spec O007-miniapp-menu-api
 * 错误状态组件 - 显示错误信息和重试按钮
 */

import { View, Text } from '@tarojs/components'
import { ApiError, ApiErrorCode } from '../../utils/error'
import Icon from '../Icon'
import './index.less'

/**
 * 错误状态组件属性
 */
export interface ErrorStateProps {
  /** API 错误对象 */
  error: ApiError | Error | null
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义标题 */
  title?: string
  /** 自定义描述 */
  description?: string
}

/**
 * 根据错误类型获取图标和文案
 */
function getErrorDisplay(error: ApiError | Error | null): {
  icon: 'wifi-off' | 'alert-circle' | 'server-off'
  title: string
  description: string
} {
  if (!error) {
    return {
      icon: 'alert-circle',
      title: '加载失败',
      description: '请稍后重试',
    }
  }

  if (error instanceof ApiError) {
    switch (error.code) {
      case ApiErrorCode.NETWORK_ERROR:
        return {
          icon: 'wifi-off',
          title: '网络已断开',
          description: '请检查网络连接后重试',
        }
      case ApiErrorCode.TIMEOUT:
        return {
          icon: 'wifi-off',
          title: '网络超时',
          description: '网络较慢，请稍后重试',
        }
      case ApiErrorCode.UNAUTHORIZED:
      case ApiErrorCode.FORBIDDEN:
        return {
          icon: 'alert-circle',
          title: '访问受限',
          description: error.getUserMessage(),
        }
      case ApiErrorCode.NOT_FOUND:
        return {
          icon: 'alert-circle',
          title: '内容不存在',
          description: '请求的内容已被移除',
        }
      case ApiErrorCode.SERVER_ERROR:
        return {
          icon: 'server-off',
          title: '服务异常',
          description: '服务暂时不可用，请稍后重试',
        }
      default:
        return {
          icon: 'alert-circle',
          title: '加载失败',
          description: error.getUserMessage(),
        }
    }
  }

  // 普通 Error
  return {
    icon: 'alert-circle',
    title: '加载失败',
    description: error.message || '请稍后重试',
  }
}

/**
 * 错误状态组件
 * 显示错误信息和重试按钮
 */
export default function ErrorState({
  error,
  onRetry,
  title,
  description,
}: ErrorStateProps) {
  const display = getErrorDisplay(error)

  return (
    <View className='error-state'>
      {/* 错误图标 - 使用简单的文字代替 */}
      <View className='error-icon'>
        <Text className='error-emoji'>😔</Text>
      </View>

      {/* 错误标题 */}
      <Text className='error-title'>{title || display.title}</Text>

      {/* 错误描述 */}
      <Text className='error-description'>
        {description || display.description}
      </Text>

      {/* 重试按钮 */}
      {onRetry && (
        <View className='retry-button' onClick={onRetry}>
          <Text className='retry-text'>重新加载</Text>
        </View>
      )}
    </View>
  )
}
