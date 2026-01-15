/**
 * @spec O003-beverage-order
 * 我的订单列表页面
 */
import React, { useState } from 'react'
import { View, Text, ScrollView, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useOrderHistory, useSearchOrders } from '../../../hooks'
import { useUserStore } from '../../../stores/userStore'
import type { BeverageOrder } from '../../../services/beverageService'
import './index.scss'

/**
 * 订单状态配置
 */
const ORDER_STATUS_CONFIG: Record<
  BeverageOrder['status'],
  { text: string; color: string }
> = {
  PENDING_PAYMENT: { text: '待支付', color: '#faad14' },
  PENDING_PRODUCTION: { text: '待制作', color: '#1890ff' },
  PRODUCING: { text: '制作中', color: '#13c2c2' },
  COMPLETED: { text: '已完成', color: '#52c41a' },
  DELIVERED: { text: '已交付', color: '#8c8c8c' },
  CANCELLED: { text: '已取消', color: '#ff4d4f' },
}

/**
 * 状态筛选选项
 */
const STATUS_FILTER_OPTIONS = [
  { value: '', label: '全部订单' },
  { value: 'PENDING_PAYMENT', label: '待支付' },
  { value: 'PENDING_PRODUCTION', label: '待制作' },
  { value: 'PRODUCING', label: '制作中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'DELIVERED', label: '已交付' },
  { value: 'CANCELLED', label: '已取消' },
]

/**
 * 我的订单列表页面
 *
 * 功能：
 * - 显示用户订单历史列表
 * - 订单状态筛选 (T128 - US3: FR-019)
 * - 订单号搜索 (T130 - US3: T130)
 * - 分页加载 (T128 - US3: FR-019)
 * - 点击跳转订单详情
 */
const MyOrders: React.FC = () => {
  const { user } = useUserStore()
  const userId = user?.id || ''

  // 状态管理
  const [selectedStatusIndex, setSelectedStatusIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  const selectedStatus = STATUS_FILTER_OPTIONS[selectedStatusIndex].value as BeverageOrder['status'] | undefined

  // 订单历史查询
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useOrderHistory({
    userId,
    status: selectedStatus || undefined,
    page: currentPage,
    pageSize: 10,
    enabled: !isSearchMode,
  })

  // 订单搜索
  const { data: searchResult, isLoading: isSearching } = useSearchOrders(
    userId,
    searchQuery
  )

  const handleStatusChange = (e: any) => {
    setSelectedStatusIndex(e.detail.value)
    setCurrentPage(1)
    setIsSearchMode(false)
    setSearchQuery('')
  }

  const handleSearchInput = (e: any) => {
    const query = e.detail.value
    setSearchQuery(query)
    setIsSearchMode(query.trim().length > 0)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchMode(false)
    refetch()
  }

  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?orderId=${orderId}`,
    })
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (historyData && currentPage < historyData.totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // 渲染订单列表
  const renderOrders = () => {
    const orders = isSearchMode
      ? (searchResult ? [searchResult] : [])
      : (historyData?.content || [])

    if (orders.length === 0) {
      return (
        <View className="my-orders__empty">
          <Text className="my-orders__empty-text">
            {isSearchMode ? '未找到匹配的订单' : '暂无订单'}
          </Text>
          {!isSearchMode && (
            <>
              <Text className="my-orders__empty-hint">快去选购您喜欢的饮品吧~</Text>
              <View
                className="my-orders__empty-btn"
                onClick={() => Taro.switchTab({ url: '/pages/beverage/menu/index' })}
              >
                <Text>去选购</Text>
              </View>
            </>
          )}
        </View>
      )
    }

    return orders.map((order) => {
      const statusConfig = ORDER_STATUS_CONFIG[order.status]
      const firstItem = order.items?.[0]
      if (!firstItem) return null

      const moreCount = (order.items?.length || 0) - 1

      return (
        <View
          key={order.id}
          className="my-orders__item"
          onClick={() => handleOrderClick(order.id)}
        >
          {/* 订单头部 */}
          <View className="my-orders__header">
            <Text className="my-orders__order-number">{order.orderNumber}</Text>
            <View
              className="my-orders__status"
              style={{ color: statusConfig.color }}
            >
              <Text>{statusConfig.text}</Text>
            </View>
          </View>

          {/* 订单信息 */}
          <View className="my-orders__content">
            <Text className="my-orders__item-name">{firstItem.beverageName}</Text>
            {moreCount > 0 && (
              <Text className="my-orders__more-items">
                等{order.items?.length}件商品
              </Text>
            )}
            <Text className="my-orders__order-time">
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </Text>
          </View>

          {/* 订单价格 */}
          <View className="my-orders__footer">
            <View className="my-orders__price">
              <Text className="my-orders__price-label">合计：</Text>
              <Text className="my-orders__price-value">
                ¥{(order.totalPrice / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      )
    })
  }

  if (isLoading || isSearching) {
    return (
      <View className="my-orders loading">
        <Text>加载中...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="my-orders error">
        <Text>加载失败：{error.message}</Text>
      </View>
    )
  }

  return (
    <View className="my-orders">
      {/* 搜索和筛选 */}
      <View className="my-orders__filters">
        {/* 订单号搜索 */}
        <View className="my-orders__search">
          <Input
            className="my-orders__search-input"
            placeholder="搜索订单号"
            value={searchQuery}
            onInput={handleSearchInput}
          />
          {searchQuery && (
            <View className="my-orders__search-clear" onClick={handleClearSearch}>
              <Text>×</Text>
            </View>
          )}
        </View>

        {/* 状态筛选 */}
        {!isSearchMode && (
          <Picker
            mode="selector"
            range={STATUS_FILTER_OPTIONS}
            rangeKey="label"
            value={selectedStatusIndex}
            onChange={handleStatusChange}
          >
            <View className="my-orders__status-filter">
              <Text>{STATUS_FILTER_OPTIONS[selectedStatusIndex].label}</Text>
              <Text className="my-orders__status-filter-arrow">▼</Text>
            </View>
          </Picker>
        )}
      </View>

      {/* 订单列表 */}
      <ScrollView scrollY className="my-orders__scroll">
        {renderOrders()}

        {/* 分页控制 */}
        {!isSearchMode && historyData && historyData.totalPages > 1 && (
          <View className="my-orders__pagination">
            <View
              className={`my-orders__page-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={handlePrevPage}
            >
              <Text>上一页</Text>
            </View>
            <Text className="my-orders__page-info">
              {currentPage} / {historyData.totalPages}
            </Text>
            <View
              className={`my-orders__page-btn ${
                currentPage === historyData.totalPages ? 'disabled' : ''
              }`}
              onClick={handleNextPage}
            >
              <Text>下一页</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default MyOrders
