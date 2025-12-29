/**
 * @spec O003-beverage-order
 * 订单详情页面
 */
import React from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useOrderDetail, useQueueNumber, useReorder } from '../../../hooks'
import type { BeverageOrder } from '../../../services/beverageService'
import './index.scss'

/**
 * 订单状态配置
 */
const ORDER_STATUS_CONFIG: Record<
  BeverageOrder['status'],
  { text: string; color: string; icon: string }
> = {
  PENDING_PAYMENT: {
    text: '待支付',
    color: '#faad14',
    icon: '⏳',
  },
  PENDING_PRODUCTION: {
    text: '待制作',
    color: '#1890ff',
    icon: '📝',
  },
  PRODUCING: {
    text: '制作中',
    color: '#13c2c2',
    icon: '🔄',
  },
  COMPLETED: {
    text: '已完成',
    color: '#52c41a',
    icon: '✓',
  },
  DELIVERED: {
    text: '已交付',
    color: '#8c8c8c',
    icon: '✓✓',
  },
  CANCELLED: {
    text: '已取消',
    color: '#ff4d4f',
    icon: '×',
  },
}

/**
 * 订单详情页面
 *
 * 功能：
 * - 显示订单详细信息
 * - 显示取餐号
 * - 8秒轮询订单状态（制作中 -> 已完成 -> 已交付）
 * - 状态进度展示
 * - 一键复购 (T129 - US3: FR-021)
 */
const OrderDetail: React.FC = () => {
  const router = useRouter()
  const orderId = router.params.orderId || null

  // 启用轮询：制作中/待制作状态下每8秒轮询一次
  const { data: order, isLoading, error } = useOrderDetail({
    orderId,
    polling: true, // 启用8秒轮询
  })

  const { data: queueNumber } = useQueueNumber({
    orderId,
    enabled: order?.status !== 'PENDING_PAYMENT',
  })

  // 一键复购 mutation (T129)
  const { mutate: reorder, isPending: isReordering } = useReorder()

  const handleReorder = () => {
    if (!order) return

    Taro.showModal({
      title: '确认复购',
      content: '将清空当前购物车并添加此订单的所有商品',
      success: (res) => {
        if (res.confirm) {
          reorder(order as any)
        }
      },
    })
  }

  const formatSpecs = (specs: string) => {
    try {
      const parsed = JSON.parse(specs)
      return Object.values(parsed).filter(Boolean).join(' · ')
    } catch {
      return specs
    }
  }

  if (isLoading) {
    return (
      <View className="order-detail loading">
        <Text>加载中...</Text>
      </View>
    )
  }

  if (error || !order) {
    return (
      <View className="order-detail error">
        <Text>加载失败：{error?.message || '订单不存在'}</Text>
      </View>
    )
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status]

  return (
    <View className="order-detail">
      <ScrollView scrollY className="order-detail__scroll">
        {/* 订单状态 */}
        <View className="order-detail__status-card">
          <View className="order-detail__status-icon" style={{ color: statusConfig.color }}>
            <Text>{statusConfig.icon}</Text>
          </View>
          <Text className="order-detail__status-text" style={{ color: statusConfig.color }}>
            {statusConfig.text}
          </Text>

          {/* 取餐号 */}
          {queueNumber && (
            <View className="order-detail__queue-number">
              <Text className="order-detail__queue-label">取餐号</Text>
              <Text className="order-detail__queue-value">{queueNumber.queueNumber}</Text>
            </View>
          )}

          {/* 状态提示 */}
          {order.status === 'PRODUCING' && (
            <Text className="order-detail__status-hint">您的饮品正在制作中，请稍候...</Text>
          )}
          {order.status === 'COMPLETED' && (
            <Text className="order-detail__status-hint">您的饮品已完成，请凭取餐号取餐</Text>
          )}
          {order.status === 'DELIVERED' && (
            <Text className="order-detail__status-hint">感谢您的光临，期待下次再见！</Text>
          )}
        </View>

        {/* 订单信息 */}
        <View className="order-detail__section">
          <Text className="order-detail__section-title">订单信息</Text>
          <View className="order-detail__info-row">
            <Text className="order-detail__info-label">订单号</Text>
            <Text className="order-detail__info-value">{order.orderNumber}</Text>
          </View>
          <View className="order-detail__info-row">
            <Text className="order-detail__info-label">下单时间</Text>
            <Text className="order-detail__info-value">
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </Text>
          </View>
          {order.paidAt && (
            <View className="order-detail__info-row">
              <Text className="order-detail__info-label">支付时间</Text>
              <Text className="order-detail__info-value">
                {new Date(order.paidAt).toLocaleString('zh-CN')}
              </Text>
            </View>
          )}
        </View>

        {/* 商品清单 */}
        <View className="order-detail__section">
          <Text className="order-detail__section-title">商品清单</Text>
          {order.items.map((item, index) => (
            <View key={index} className="order-detail__item">
              <View className="order-detail__item-info">
                <Text className="order-detail__item-name">{item.beverageName}</Text>
                <Text className="order-detail__item-specs">
                  {formatSpecs(item.selectedSpecs)}
                </Text>
                {item.customerNote && (
                  <Text className="order-detail__item-note">备注: {item.customerNote}</Text>
                )}
              </View>
              <View className="order-detail__item-right">
                <Text className="order-detail__item-price">
                  ¥{(item.unitPrice / 100).toFixed(2)}
                </Text>
                <Text className="order-detail__item-quantity">× {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 价格信息 */}
        <View className="order-detail__section">
          <View className="order-detail__price-row">
            <Text className="order-detail__price-label">商品总价</Text>
            <Text className="order-detail__price-value">
              ¥{(order.totalPrice / 100).toFixed(2)}
            </Text>
          </View>
          <View className="order-detail__price-row total">
            <Text className="order-detail__price-label">实付金额</Text>
            <Text className="order-detail__price-value total">
              ¥{(order.totalPrice / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* 一键复购按钮 (T129 - US3: FR-021) */}
        {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
          <View className="order-detail__actions">
            <View
              className={`order-detail__reorder-btn ${isReordering ? 'loading' : ''}`}
              onClick={handleReorder}
            >
              <Text>{isReordering ? '处理中...' : '再来一单'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default OrderDetail
