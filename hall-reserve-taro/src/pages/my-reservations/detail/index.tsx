/**
 * 预约单详情页（C端）
 * 显示预约单完整信息
 */
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getReservationDetail, cancelMyReservation } from '@/services/reservationService'
import { RESERVATION_STATUS_CONFIG, canCancel, canPay } from '@/services/types/reservation.types'
import type { ReservationStatus } from '@/services/types/reservation.types'
import './index.less'

export default function ReservationDetail() {
  const router = useRouter()
  const { id } = router.params

  const [isCancelling, setIsCancelling] = useState(false)

  // 获取预约详情
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reservationDetail', id],
    queryFn: () => getReservationDetail(id || ''),
    enabled: !!id,
  })

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack()
  }

  // 取消预约
  const handleCancel = async () => {
    if (!order || isCancelling) return

    const res = await Taro.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      confirmText: '确定取消',
      cancelText: '再想想',
    })

    if (res.confirm) {
      setIsCancelling(true)
      try {
        await cancelMyReservation(order.id, '用户主动取消')
        Taro.showToast({ title: '取消成功', icon: 'success' })
        refetch()
      } catch (err) {
        console.error('取消失败:', err)
        Taro.showToast({ title: '取消失败', icon: 'none' })
      } finally {
        setIsCancelling(false)
      }
    }
  }

  // 去支付
  const handlePay = () => {
    if (!order) return
    // TODO: 跳转到支付页面
    Taro.showToast({ title: '支付功能开发中', icon: 'none' })
  }

  // 格式化日期
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <View className="detail-page">
        <View className="loading">
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  if (error || !order) {
    return (
      <View className="detail-page">
        <View className="error">
          <Text>加载失败</Text>
          <View className="retry-btn" onClick={() => refetch()}>
            <Text>重试</Text>
          </View>
        </View>
      </View>
    )
  }

  const statusConfig = RESERVATION_STATUS_CONFIG[order.status as ReservationStatus]
  const showCancel = canCancel(order.status as ReservationStatus)
  const showPay = canPay(order.status as ReservationStatus, order.requiresPayment)

  return (
    <View className="detail-page">
      {/* 顶部导航 */}
      <View className="header">
        <View className="back-btn" onClick={handleBack}>
          <Text>‹</Text>
        </View>
        <Text className="header-title">预约详情</Text>
        <View className="header-placeholder" />
      </View>

      <ScrollView scrollY className="content-scroll">
        {/* 状态卡片 */}
        <View className="status-card" style={{ backgroundColor: statusConfig?.color || '#999' }}>
          <Text className="status-label">{statusConfig?.label || order.status}</Text>
          <Text className="order-number">{order.orderNumber}</Text>
        </View>

        {/* 场景包信息 */}
        <View className="section">
          <Text className="section-title">场景包信息</Text>
          <View className="info-card">
            <View className="info-row">
              <Text className="info-label">场景包</Text>
              <Text className="info-value">{order.scenarioPackageName}</Text>
            </View>
            <View className="info-row">
              <Text className="info-label">套餐</Text>
              <Text className="info-value">{order.tierName}</Text>
            </View>
            <View className="info-row">
              <Text className="info-label">时段</Text>
              <Text className="info-value">{order.reservationDate} {order.timeSlotName}</Text>
            </View>
          </View>
        </View>

        {/* 加购项 */}
        {order.items && order.items.length > 0 && (
          <View className="section">
            <Text className="section-title">加购项</Text>
            <View className="info-card">
              {order.items.filter(item => item.itemType === 'ADDON').map((item) => (
                <View key={item.id} className="addon-row">
                  <Text className="addon-name">{item.itemName}</Text>
                  <Text className="addon-qty">x{item.quantity}</Text>
                  <Text className="addon-price">¥{item.subtotal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 联系人信息 */}
        <View className="section">
          <Text className="section-title">联系人信息</Text>
          <View className="info-card">
            <View className="info-row">
              <Text className="info-label">姓名</Text>
              <Text className="info-value">{order.contactName}</Text>
            </View>
            <View className="info-row">
              <Text className="info-label">手机</Text>
              <Text className="info-value">{order.contactPhone}</Text>
            </View>
            {order.remark && (
              <View className="info-row">
                <Text className="info-label">备注</Text>
                <Text className="info-value">{order.remark}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 订单信息 */}
        <View className="section">
          <Text className="section-title">订单信息</Text>
          <View className="info-card">
            <View className="info-row">
              <Text className="info-label">创建时间</Text>
              <Text className="info-value">{formatDateTime(order.createdAt)}</Text>
            </View>
            {order.confirmedAt && (
              <View className="info-row">
                <Text className="info-label">确认时间</Text>
                <Text className="info-value">{formatDateTime(order.confirmedAt)}</Text>
              </View>
            )}
            {order.completedAt && (
              <View className="info-row">
                <Text className="info-label">完成时间</Text>
                <Text className="info-value">{formatDateTime(order.completedAt)}</Text>
              </View>
            )}
            {order.cancelledAt && (
              <View className="info-row">
                <Text className="info-label">取消时间</Text>
                <Text className="info-value">{formatDateTime(order.cancelledAt)}</Text>
              </View>
            )}
            {order.cancelReason && (
              <View className="info-row">
                <Text className="info-label">取消原因</Text>
                <Text className="info-value cancel-reason">{order.cancelReason}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 金额信息 */}
        <View className="section">
          <View className="amount-card">
            <Text className="amount-label">合计金额</Text>
            <Text className="amount-value">¥{order.totalAmount}</Text>
          </View>
        </View>

        {/* 底部占位 */}
        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部操作栏 */}
      {(showCancel || showPay) && (
        <View className="action-bar">
          {showCancel && (
            <View
              className={`action-btn cancel ${isCancelling ? 'disabled' : ''}`}
              onClick={handleCancel}
            >
              <Text>{isCancelling ? '取消中...' : '取消预约'}</Text>
            </View>
          )}
          {showPay && (
            <View className="action-btn pay" onClick={handlePay}>
              <Text>立即支付</Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
