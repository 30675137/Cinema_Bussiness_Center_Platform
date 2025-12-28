/**
 * 会员页面 - 占位
 * 后续开发会员功能
 */
import { View, Text } from '@tarojs/components'
import './index.less'

export default function Member() {
  return (
    <View className="member-page">
      <View className="placeholder">
        <Text className="icon">👑</Text>
        <Text className="title">会员中心</Text>
        <Text className="subtitle">专属权益，敬请期待</Text>
      </View>
    </View>
  )
}
