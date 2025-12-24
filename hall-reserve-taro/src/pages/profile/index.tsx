/**
 * 我的 - 个人中心页面
 * 小程序底部Tab "我的"入口
 */
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { getPendingCount } from '@/services/reservationService'
import './index.less'

// 默认头像
const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

// 菜单项配置
interface MenuItem {
  icon: string
  title: string
  path: string
  badge?: number
  requireLogin?: boolean
}

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState({
    nickname: '点击登录',
    avatar: DEFAULT_AVATAR,
  })
  const [pendingCount, setPendingCount] = useState(0)

  // 页面显示时检查登录状态和待处理订单数
  useDidShow(() => {
    checkLoginStatus()
    fetchPendingCount()
  })

  // 检查登录状态
  const checkLoginStatus = useCallback(() => {
    const token = Taro.getStorageSync('token')
    const storedUserInfo = Taro.getStorageSync('userInfo')
    
    if (token && storedUserInfo) {
      setIsLoggedIn(true)
      setUserInfo(storedUserInfo)
    } else {
      setIsLoggedIn(false)
      setUserInfo({
        nickname: '点击登录',
        avatar: DEFAULT_AVATAR,
      })
    }
  }, [])

  // 获取待处理订单数量
  const fetchPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount()
      setPendingCount(count)
    } catch (error) {
      console.error('获取待处理订单数失败:', error)
      setPendingCount(0)
    }
  }, [])

  // 处理头像区域点击
  const handleAvatarClick = () => {
    if (!isLoggedIn) {
      // 跳转登录页面
      Taro.navigateTo({
        url: '/pages/login/index?redirect=/pages/profile/index',
      })
    }
  }

  // 处理菜单项点击
  const handleMenuClick = (item: MenuItem) => {
    if (item.requireLogin && !isLoggedIn) {
      Taro.navigateTo({
        url: `/pages/login/index?redirect=${encodeURIComponent(item.path)}`,
      })
      return
    }
    Taro.navigateTo({ url: item.path })
  }

  // 菜单项列表
  const menuItems: MenuItem[] = [
    {
      icon: '📋',
      title: '我的预约',
      path: '/pages/my-reservations/index',
      badge: pendingCount,
      requireLogin: true,
    },
    {
      icon: '📞',
      title: '联系客服',
      path: '/pages/customer-service/index',
      requireLogin: false,
    },
    {
      icon: '⚙️',
      title: '设置',
      path: '/pages/settings/index',
      requireLogin: false,
    },
  ]

  return (
    <View className="profile-page">
      {/* 用户信息区域 */}
      <View className="user-section" onClick={handleAvatarClick}>
        <Image
          className="avatar"
          src={userInfo.avatar}
          mode="aspectFill"
        />
        <View className="user-info">
          <Text className="nickname">{userInfo.nickname}</Text>
          {!isLoggedIn && (
            <Text className="login-hint">登录后查看更多信息</Text>
          )}
        </View>
        <Text className="arrow">›</Text>
      </View>

      {/* 功能菜单区域 */}
      <View className="menu-section">
        {menuItems.map((item, index) => (
          <View
            key={index}
            className="menu-item"
            onClick={() => handleMenuClick(item)}
          >
            <View className="menu-left">
              <Text className="menu-icon">{item.icon}</Text>
              <Text className="menu-title">{item.title}</Text>
              {item.badge && item.badge > 0 && (
                <View className="badge">
                  <Text className="badge-text">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text className="menu-arrow">›</Text>
          </View>
        ))}
      </View>

      {/* 版本信息 */}
      <View className="version-info">
        <Text className="version-text">版本 1.0.0</Text>
      </View>
    </View>
  )
}
