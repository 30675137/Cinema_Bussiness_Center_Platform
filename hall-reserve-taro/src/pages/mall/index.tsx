import { View, Text } from '@tarojs/components'
import './index.scss'

export default function Mall() {
  return (
    <View className='mall-page'>
      <View className='mall-header'>
        <Text className='mall-title'>商城</Text>
      </View>
      <View className='mall-content'>
        <Text className='placeholder-text'>商城功能开发中...</Text>
      </View>
    </View>
  )
}
