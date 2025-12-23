import { View, Text } from '@tarojs/components'
import './index.scss'

export default function Profile() {
  return (
    <View className='profile-page'>
      <View className='profile-header'>
        <Text className='profile-title'>我的</Text>
      </View>
      <View className='profile-content'>
        <Text className='placeholder-text'>个人中心开发中...</Text>
      </View>
    </View>
  )
}
