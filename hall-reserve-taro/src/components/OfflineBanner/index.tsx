/**
 * @spec O003-beverage-order
 * 离线提示横幅组件
 */
import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

/**
 * 离线提示横幅
 * 当网络连接断开时显示提示
 */
export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [networkType, setNetworkType] = useState<string>('unknown')

  useEffect(() => {
    // 获取初始网络状态
    Taro.getNetworkType({
      success: (res) => {
        setNetworkType(res.networkType)
        setIsOnline(res.networkType !== 'none')
      },
    })

    // 监听网络状态变化
    const onNetworkChange = Taro.onNetworkStatusChange((res) => {
      setIsOnline(res.isConnected)
      setNetworkType(res.networkType)

      if (!res.isConnected) {
        Taro.showToast({
          title: '网络连接已断开',
          icon: 'none',
          duration: 2000,
        })
      } else {
        Taro.showToast({
          title: '网络已恢复',
          icon: 'success',
          duration: 1500,
        })
      }
    })

    return () => {
      // 清理监听器（Taro 目前不支持 offNetworkStatusChange）
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <View className="offline-banner">
      <View className="offline-banner__icon">📡</View>
      <Text className="offline-banner__text">网络连接已断开，部分功能可能不可用</Text>
      <Text className="offline-banner__subtext">已保存的购物车数据不会丢失</Text>
    </View>
  )
}

export default OfflineBanner
