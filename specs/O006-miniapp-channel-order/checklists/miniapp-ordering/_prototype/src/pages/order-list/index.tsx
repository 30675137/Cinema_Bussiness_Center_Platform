/**
 * @spec O006-miniapp-channel-order
 * 订单列表页 - 查看我的订单
 */

import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useChannelOrdersByStatus } from '../../hooks/useChannelOrders'
import { OrderStatus } from '../../types/order'
import { formatPrice } from '../../utils/priceCalculator'
import './index.scss'

const STATUS_TABS = [
  { label: '全部', value: undefined },
  { label: '待支付', value: OrderStatus.PENDING_PAYMENT },
  { label: '制作中', value: OrderStatus.PREPARING },
  { label: '已完成', value: OrderStatus.READY },
]

const STATUS_TEXT_MAP: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待支付',
  [OrderStatus.PENDING]: '待制作',
  [OrderStatus.PREPARING]: '制作中',
  [OrderStatus.READY]: '已完成',
  [OrderStatus.DELIVERED]: '已交付',
  [OrderStatus.CANCELLED]: '已取消',
}

export default function OrderListPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>()

  const { data: response, isLoading, error } = useChannelOrdersByStatus(selectedStatus)

  // 处理订单点击
  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({
      url: `/pages/order-detail/index?id=${orderId}`,
    })
  }

  // Loading 状态
  if (isLoading) {
    return (
      <View className="order-list-page">
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  // Error 状态
  if (error) {
    return (
      <View className="order-list-page">
        <View className="error-container">
          <Text className="error-text">加载失败: {error.message}</Text>
        </View>
      </View>
    )
  }

  const orders = response?.items || []

  return (
    <View className="order-list-page">
      {/* 状态选项卡 */}
      <View className="status-tabs">
        {STATUS_TABS.map((tab) => (
          <View
            key={tab.label}
            className={`status-tab ${selectedStatus === tab.value ? 'active' : ''}`}
            onClick={() => setSelectedStatus(tab.value)}
          >
            <Text className="tab-label">{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      {orders.length === 0 ? (
        <View className="empty-container">
          <Text className="empty-icon">📋</Text>
          <Text className="empty-text">暂无订单</Text>
        </View>
      ) : (
        <ScrollView className="order-list" scrollY>
          {orders.map((order) => (
            <View
              key={order.id}
              className="order-card"
              onClick={() => handleOrderClick(order.id)}
            >
              {/* 订单头部 */}
              <View className="order-header">
                <View className="order-number-row">
                  <Text className="order-number">订单号: {order.orderNumber}</Text>
                  <View className={`status-badge status-${order.status.toLowerCase()}`}>
                    <Text className="status-text">{STATUS_TEXT_MAP[order.status]}</Text>
                  </View>
                </View>

                <Text className="order-time">
                  {new Date(order.createdAt).toLocaleString('zh-CN')}
                </Text>
              </View>

              {/* 订单商品 */}
              <View className="order-items">
                {order.items.map((item, index) => (
                  <View key={index} className="order-item">
                    <Image
                      className="item-image"
                      src={item.mainImage}
                      mode="aspectFill"
                    />

                    <View className="item-info">
                      <Text className="item-name">{item.displayName}</Text>

                      {item.selectedSpecs.length > 0 && (
                        <View className="item-specs">
                          {item.selectedSpecs.map((spec, idx) => (
                            <Text key={idx} className="spec-text">
                              {spec.optionName}
                              {idx < item.selectedSpecs.length - 1 && ' / '}
                            </Text>
                          ))}
                        </View>
                      )}

                      <View className="item-bottom">
                        <Text className="item-price">{formatPrice(item.unitPrice)}</Text>
                        <Text className="item-quantity">x{item.quantity}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* 订单总价 */}
              <View className="order-footer">
                <Text className="total-label">合计</Text>
                <Text className="total-amount">{formatPrice(order.totalAmount)}</Text>
              </View>

              {/* 取餐号（如果有） */}
              {order.pickupNumber && (
                <View className="pickup-number-badge">
                  <Text className="pickup-label">取餐号</Text>
                  <Text className="pickup-number">{order.pickupNumber}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
