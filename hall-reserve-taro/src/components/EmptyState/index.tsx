import { View, Text } from '@tarojs/components'
import './index.less'

interface EmptyStateProps {
  message?: string
  icon?: string
}

/**
 * 空状态组件
 * 用于显示无数据、暂无内容等情况
 */
export default function EmptyState({ message, icon }: EmptyStateProps) {
  const defaultMessage = '暂无可用场景包，敬请期待'
  const defaultIcon = '📭'

  return (
    <View className="empty-state">
      <View className="empty-icon">{icon || defaultIcon}</View>
      <Text className="empty-message">{message || defaultMessage}</Text>
    </View>
  )
}
