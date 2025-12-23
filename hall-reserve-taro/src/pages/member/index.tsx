import { View, Text } from '@tarojs/components'
import './index.scss'

export default function Member() {
  return (
    <View className='member-page'>
      <View className='member-header'>
        <Text className='member-title'>会员中心</Text>
      </View>
      <View className='member-content'>
        <Text className='placeholder-text'>会员功能开发中...</Text>
      </View>
    </View>
  )
}
