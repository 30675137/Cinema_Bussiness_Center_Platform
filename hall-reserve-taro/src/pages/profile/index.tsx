/**
 * 我的 - 个人中心页面
 * 小程序底部Tab "我的"入口
 */
import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { getPendingCount } from '@/services/reservationService'
import { silentLogin } from '@/services/authService'
import { useUserStore } from '@/stores/userStore'
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
  const user = useUserStore((state) => state.user)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)
  const [pendingCount, setPendingCount] = useState(0)

  // 调试日志: 检查当前状态
  console.log('[Profile] Current state - isLoggedIn:', isLoggedIn, 'user:', user)

  // 页面显示时检查登录状态和待处理订单数
  useDidShow(() => {
    fetchPendingCount()
  })

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
  const handleAvatarClick = async () => {
    if (!isLoggedIn) {
      // 触发静默登录
      Taro.showLoading({ title: '登录中...' })
      try {
        const loginResponse = await silentLogin()
        console.log('[Profile] Login response:', JSON.stringify(loginResponse))
        console.log('[Profile] User from response:', JSON.stringify(loginResponse.user))
        // 更新 userStore 状态
        useUserStore.getState().setUser(loginResponse.user)
        console.log('[Profile] After setUser, isLoggedIn:', useUserStore.getState().isLoggedIn)
        Taro.hideLoading()
        Taro.showToast({ title: '登录成功', icon: 'success' })
      } catch (error) {
        console.error('[Profile] Login error:', error)
        Taro.hideLoading()
        Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    }
  }

  // 处理菜单项点击
  const handleMenuClick = async (item: MenuItem) => {
    if (item.requireLogin && !isLoggedIn) {
      // 触发静默登录
      Taro.showLoading({ title: '登录中...' })
      try {
        const loginResponse = await silentLogin()
        // 更新 userStore 状态
        useUserStore.getState().setUser(loginResponse.user)
        Taro.hideLoading()
        // 登录成功后跳转到目标页面
        Taro.navigateTo({ url: item.path })
      } catch (error) {
        Taro.hideLoading()
        Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
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
          src={user?.avatarUrl || DEFAULT_AVATAR}
          mode="aspectFill"
        />
        <View className="user-info">
          <Text className="nickname">
            {isLoggedIn ? (user?.nickname || '微信用户') : '点击登录'}
          </Text>
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
