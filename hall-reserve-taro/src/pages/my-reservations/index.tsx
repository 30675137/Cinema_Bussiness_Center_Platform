/**
 * 我的预约列表页
 * 展示用户的所有预约单历史
 */
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyReservations } from '@/services/reservationService'
import { RESERVATION_STATUS_CONFIG } from '@/services/types/reservation.types'
import type { ReservationListItem, ReservationStatus } from '@/services/types/reservation.types'
import './index.less'

// 状态筛选选项
const STATUS_TABS = [
  { key: '', label: '全部' },
  { key: 'PENDING', label: '待确认' },
  { key: 'CONFIRMED', label: '已确认' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'CANCELLED', label: '已取消' },
]

export default function MyReservations() {
  const [activeTab, setActiveTab] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 获取预约列表
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['myReservations', activeTab],
    queryFn: () => getMyReservations({
      page: 0,
      size: 20,
      status: activeTab || undefined,
    }),
  })

  // 页面显示时刷新数据
  useDidShow(() => {
    refetch()
  })

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }, [refetch])

  // 切换Tab
  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  // 跳转详情
  const handleItemClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/my-reservations/detail/index?id=${id}`,
    })
  }

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // 格式化创建时间
  const formatCreatedAt = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const reservations = data?.content || []

  return (
    <View className="my-reservations-page">
      {/* 顶部导航 */}
      <View className="header">
        <View className="back-btn" onClick={handleBack}>
          <Text>‹</Text>
        </View>
        <Text className="header-title">我的预约</Text>
        <View className="header-placeholder" />
      </View>

      {/* 状态筛选Tab */}
      <ScrollView scrollX className="status-tabs">
        {STATUS_TABS.map((tab) => (
          <View
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 列表内容 */}
      <ScrollView
        scrollY
        className="list-scroll"
        refresherEnabled
        refresherTriggered={isRefreshing}
        onRefresherRefresh={handleRefresh}
      >
        {isLoading ? (
          <View className="loading">
            <Text>加载中...</Text>
          </View>
        ) : error ? (
          <View className="error">
            <Text>加载失败，请重试</Text>
            <View className="retry-btn" onClick={() => refetch()}>
              <Text>重试</Text>
            </View>
          </View>
        ) : reservations.length === 0 ? (
          <View className="empty">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-text">暂无预约记录</Text>
          </View>
        ) : (
          <View className="reservation-list">
            {reservations.map((item: ReservationListItem) => {
              const statusConfig = RESERVATION_STATUS_CONFIG[item.status as ReservationStatus]
              return (
                <View
                  key={item.id}
                  className="reservation-card"
                  onClick={() => handleItemClick(item.id)}
                >
                  <View className="card-header">
                    <Text className="order-number">{item.orderNumber}</Text>
                    <View
                      className="status-badge"
                      style={{ backgroundColor: statusConfig?.color || '#999' }}
                    >
                      <Text>{statusConfig?.label || item.status}</Text>
                    </View>
                  </View>
                  <View className="card-content">
                    <Text className="package-name">{item.scenarioPackageName}</Text>
                    <View className="info-row">
                      <Text className="info-label">套餐：</Text>
                      <Text className="info-value">{item.tierName}</Text>
                    </View>
                    <View className="info-row">
                      <Text className="info-label">时段：</Text>
                      <Text className="info-value">
                        {formatDate(item.reservationDate)} {item.timeSlotName}
                      </Text>
                    </View>
                    <View className="info-row">
                      <Text className="info-label">创建时间：</Text>
                      <Text className="info-value">{formatCreatedAt(item.createdAt)}</Text>
                    </View>
                  </View>
                  <View className="card-footer">
                    <Text className="total-amount">¥{item.totalAmount}</Text>
                    <Text className="view-detail">查看详情 ›</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
