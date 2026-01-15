/**
 * @spec O006-miniapp-channel-order
 * 订单详情页 - 查看订单状态和详细信息
 */

import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useChannelOrderDetail } from '../../hooks/useChannelOrders'
import { OrderStatus, PaymentStatus } from '../../types/order'
import { formatPrice } from '../../utils/priceCalculator'
import './index.scss'

const STATUS_TEXT_MAP: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待支付',
  [OrderStatus.PENDING]: '待制作',
  [OrderStatus.PREPARING]: '制作中',
  [OrderStatus.READY]: '已完成',
  [OrderStatus.DELIVERED]: '已交付',
  [OrderStatus.CANCELLED]: '已取消',
}

const PAYMENT_STATUS_TEXT: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: '未支付',
  [PaymentStatus.PAID]: '已支付',
  [PaymentStatus.REFUNDED]: '已退款',
}

export default function OrderDetailPage() {
  const router = useRouter()
  const orderId = router.params.id || ''

  const { data: order, isLoading, error } = useChannelOrderDetail(orderId)

  // 复制订单号
  const handleCopyOrderNumber = () => {
    if (!order) return

    Taro.setClipboardData({
      data: order.orderNumber,
      success: () => {
        Taro.showToast({
          title: '已复制订单号',
          icon: 'success',
        })
      },
    })
  }

  // Loading 状态
  if (isLoading) {
    return (
      <View className="order-detail-page">
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      </View>
    )
  }

  // Error 状态
  if (error || !order) {
    return (
      <View className="order-detail-page">
        <View className="error-container">
          <Text className="error-text">
            {error?.message || '订单不存在'}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="order-detail-page">
      <ScrollView className="detail-content" scrollY>
        {/* 订单状态卡片 */}
        <View className="status-card">
          <View className={`status-icon status-${order.status.toLowerCase()}`}>
            <Text className="icon-text">
              {order.status === OrderStatus.PENDING_PAYMENT && '⏳'}
              {order.status === OrderStatus.PENDING && '📝'}
              {order.status === OrderStatus.PREPARING && '⚙️'}
              {order.status === OrderStatus.READY && '✅'}
              {order.status === OrderStatus.DELIVERED && '🎉'}
              {order.status === OrderStatus.CANCELLED && '❌'}
            </Text>
          </View>

          <Text className="status-title">{STATUS_TEXT_MAP[order.status]}</Text>

          {order.pickupNumber && (
            <View className="pickup-section">
              <Text className="pickup-label">取餐号</Text>
              <Text className="pickup-number">{order.pickupNumber}</Text>
            </View>
          )}

          {order.estimatedTime && (
            <Text className="estimated-time">
              预计制作时间: {order.estimatedTime} 分钟
            </Text>
          )}
        </View>

        {/* 订单商品 */}
        <View className="items-section">
          <Text className="section-title">订单商品</Text>

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
                        {spec.specName}: {spec.optionName}
                        {spec.priceAdjustment !== 0 &&
                          ` (${formatPrice(spec.priceAdjustment)})`}
                      </Text>
                    ))}
                  </View>
                )}

                <View className="item-bottom">
                  <Text className="item-price">{formatPrice(item.unitPrice)}</Text>
                  <Text className="item-quantity">x{item.quantity}</Text>
                </View>
              </View>

              <Text className="item-subtotal">{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* 订单信息 */}
        <View className="info-section">
          <Text className="section-title">订单信息</Text>

          <View className="info-row">
            <Text className="info-label">订单号</Text>
            <View className="info-value-row">
              <Text className="info-value">{order.orderNumber}</Text>
              <Text className="copy-btn" onClick={handleCopyOrderNumber}>
                复制
              </Text>
            </View>
          </View>

          <View className="info-row">
            <Text className="info-label">下单时间</Text>
            <Text className="info-value">
              {new Date(order.createdAt).toLocaleString('zh-CN')}
            </Text>
          </View>

          {order.paymentTime && (
            <View className="info-row">
              <Text className="info-label">支付时间</Text>
              <Text className="info-value">
                {new Date(order.paymentTime).toLocaleString('zh-CN')}
              </Text>
            </View>
          )}

          <View className="info-row">
            <Text className="info-label">支付方式</Text>
            <Text className="info-value">{order.paymentMethod}</Text>
          </View>

          <View className="info-row">
            <Text className="info-label">支付状态</Text>
            <Text
              className={`info-value ${
                order.paymentStatus === PaymentStatus.PAID ? 'text-success' : ''
              }`}
            >
              {PAYMENT_STATUS_TEXT[order.paymentStatus]}
            </Text>
          </View>

          {order.note && (
            <View className="info-row">
              <Text className="info-label">备注</Text>
              <Text className="info-value">{order.note}</Text>
            </View>
          )}
        </View>

        {/* 价格明细 */}
        <View className="price-section">
          <Text className="section-title">价格明细</Text>

          <View className="price-row">
            <Text className="price-label">商品总额</Text>
            <Text className="price-value">{formatPrice(order.totalAmount)}</Text>
          </View>

          <View className="price-row total-row">
            <Text className="price-label">实付金额</Text>
            <Text className="price-value total-value">
              {formatPrice(order.totalAmount)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏（如果需要） */}
      {order.status === OrderStatus.PENDING_PAYMENT && (
        <View className="bottom-bar">
          <Button className="cancel-btn">取消订单</Button>
          <Button className="pay-btn" type="primary">
            去支付
          </Button>
        </View>
      )}
    </View>
  )
}
