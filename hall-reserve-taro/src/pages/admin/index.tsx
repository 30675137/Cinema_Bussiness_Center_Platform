import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import type { AdminOrder } from '@/types'
import './index.less'

// Mock 订单数据
const MOCK_ORDERS: AdminOrder[] = [
  {
    id: 'ORD001',
    customer: '张先生',
    scenarioTitle: '至尊路演：企业年会专场',
    time: '2024-12-22 14:30',
    amount: 4300,
    status: 'pending'
  },
  {
    id: 'ORD002',
    customer: '李女士',
    scenarioTitle: '浪漫策划：求婚仪式',
    time: '2024-12-23 19:00',
    amount: 6199,
    status: 'confirmed'
  },
  {
    id: 'ORD003',
    customer: '王经理',
    scenarioTitle: '电竞/娱乐团建包',
    time: '2024-12-21 10:00',
    amount: 5300,
    status: 'completed'
  }
]

const STATUS_MAP = {
  pending: { label: '待确认', style: 'status-pending' },
  confirmed: { label: '已确认', style: 'status-confirmed' },
  completed: { label: '已完成', style: 'status-completed' },
  cancelled: { label: '已取消', style: 'status-cancelled' }
}

export default function Admin() {
  const [orders] = useState<AdminOrder[]>(MOCK_ORDERS)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed'>('all')

  const handleBack = () => {
    Taro.navigateBack()
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    today: orders.filter((o) => o.time.includes('12-22')).length,
    revenue: orders.reduce((sum, o) => sum + o.amount, 0)
  }

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="header-top">
          <View className="back-btn" onClick={handleBack}>
            <Text>‹</Text>
          </View>
          <Text className="header-title">订单管理</Text>
          <View className="placeholder" />
        </View>

        {/* Stats */}
        <View className="stats-grid">
          <View className="stat-item">
            <Text className="stat-value">{stats.total}</Text>
            <Text className="stat-label">总订单</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value pending">{stats.pending}</Text>
            <Text className="stat-label">待处理</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">{stats.today}</Text>
            <Text className="stat-label">今日预订</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value revenue">¥{stats.revenue}</Text>
            <Text className="stat-label">总营收</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="tabs">
        <View
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Text>全部</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Text>待确认</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
        >
          <Text>已确认</Text>
        </View>
      </View>

      {/* Order List */}
      <View className="order-list">
        {filteredOrders.map((order) => {
          const status = STATUS_MAP[order.status]
          return (
            <View key={order.id} className="order-item">
              <View className="order-header">
                <Text className="order-id">{order.id}</Text>
                <View className={`status-badge ${status.style}`}>
                  <Text>{status.label}</Text>
                </View>
              </View>
              <Text className="order-title">{order.scenarioTitle}</Text>
              <View className="order-meta">
                <View className="meta-item">
                  <Text className="meta-icon">👤</Text>
                  <Text className="meta-text">{order.customer}</Text>
                </View>
                <View className="meta-item">
                  <Text className="meta-icon">🕐</Text>
                  <Text className="meta-text">{order.time}</Text>
                </View>
              </View>
              <View className="order-footer">
                <Text className="order-amount">¥{order.amount}</Text>
                {order.status === 'pending' && (
                  <View className="action-btns">
                    <View className="action-btn reject">
                      <Text>拒绝</Text>
                    </View>
                    <View className="action-btn confirm">
                      <Text>确认</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )
        })}

        {filteredOrders.length === 0 && (
          <View className="empty-state">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-text">暂无订单</Text>
          </View>
        )}
      </View>
    </View>
  )
}
