import { View, Text, Button } from '@tarojs/components'
import './index.less'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

/**
 * 错误状态组件
 * 用于显示网络错误、服务器错误等异常情况
 */
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  const defaultMessage = '网络连接失败，请检查网络设置'

  return (
    <View className="error-state">
      <View className="error-icon">⚠️</View>
      <Text className="error-message">{message || defaultMessage}</Text>
      {onRetry && (
        <Button className="retry-button" onClick={onRetry}>
          重试
        </Button>
      )}
    </View>
  )
}
