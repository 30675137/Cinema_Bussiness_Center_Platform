/**
 * 商城页面 - 占位
 * 后续开发电商功能
 */
import { View, Text, Image } from '@tarojs/components'
import './index.less'

export default function Mall() {
  return (
    <View className="mall-page">
      <View className="placeholder">
        <Text className="icon">🛍️</Text>
        <Text className="title">商城</Text>
        <Text className="subtitle">精选好物，即将上线</Text>
      </View>
    </View>
  )
}
