/**
 * @spec O003-beverage-order
 * C端订单状态变化通知 Hook
 * FR-016: 订单状态变化时通知用户
 */
import { useEffect, useRef } from 'react'
import Taro from '@tarojs/taro'
import type { OrderStatus } from '../types/beverage'

/**
 * 订单状态描述映射
 */
const STATUS_MESSAGES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '订单待支付',
  PENDING_PRODUCTION: '订单已支付，等待制作',
  PRODUCING: '订单制作中',
  COMPLETED: '订单已完成，请取餐！',
  DELIVERED: '订单已取餐',
  CANCELLED: '订单已取消',
}

/**
 * 需要震动提醒的状态
 */
const VIBRATE_STATUSES: OrderStatus[] = ['COMPLETED']

/**
 * 订单状态通知配置
 */
export interface OrderStatusNotificationConfig {
  /** 是否启用震动 */
  enableVibrate?: boolean
  /** 是否启用 Toast 提示 */
  enableToast?: boolean
}

/**
 * C端订单状态变化通知 Hook
 * 
 * @param currentStatus - 当前订单状态
 * @param queueNumber - 取餐号
 * @param config - 通知配置
 */
export const useOrderStatusNotification = (
  currentStatus: OrderStatus | undefined,
  queueNumber?: string,
  config: OrderStatusNotificationConfig = {}
) => {
  const { enableVibrate = true, enableToast = true } = config
  const previousStatusRef = useRef<OrderStatus | undefined>(undefined)

  useEffect(() => {
    // 跳过首次渲染或状态未变化
    if (!currentStatus || currentStatus === previousStatusRef.current) {
      return
    }

    const previousStatus = previousStatusRef.current

    // 更新 ref
    previousStatusRef.current = currentStatus

    // 首次加载不触发通知
    if (previousStatus === undefined) {
      return
    }

    // 订单完成时的特殊处理
    if (currentStatus === 'COMPLETED') {
      handleOrderCompleted(queueNumber, enableVibrate, enableToast)
      return
    }

    // 其他状态变化的通用处理
    if (enableToast) {
      Taro.showToast({
        title: STATUS_MESSAGES[currentStatus] || '订单状态已更新',
        icon: 'none',
        duration: 2000,
      })
    }
  }, [currentStatus, queueNumber, enableVibrate, enableToast])

  return {
    currentStatus,
    statusMessage: currentStatus ? STATUS_MESSAGES[currentStatus] : '',
  }
}

/**
 * 处理订单完成通知
 */
function handleOrderCompleted(
  queueNumber: string | undefined,
  enableVibrate: boolean,
  enableToast: boolean
) {
  // 震动提醒
  if (enableVibrate) {
    try {
      // 长震动
      Taro.vibrateLong({
        success: () => console.log('震动成功'),
        fail: () => console.warn('震动失败，设备可能不支持'),
      })
    } catch (error) {
      console.warn('震动功能不可用:', error)
    }
  }

  // Toast 提示
  if (enableToast) {
    const message = queueNumber
      ? `订单已完成！取餐号: ${queueNumber}`
      : '订单已完成，请取餐！'

    Taro.showToast({
      title: message,
      icon: 'success',
      duration: 3000,
    })

    // 额外显示模态框确保用户注意到
    setTimeout(() => {
      Taro.showModal({
        title: '🎉 订单已完成',
        content: queueNumber
          ? `您的取餐号是 ${queueNumber}，请前往取餐台取餐！`
          : '请前往取餐台取餐！',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#1890ff',
      })
    }, 500)
  }
}

export default useOrderStatusNotification
