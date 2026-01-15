/**
 * @spec O003-beverage-order
 * 新订单通知 Hook
 */
import { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useVoiceAnnouncement } from './useVoiceAnnouncement';
import type { BeverageOrderDTO } from '../types/beverageOrder';

/**
 * 新订单通知配置
 */
interface NewOrderNotificationConfig {
  /**
   * 是否启用语音提醒
   */
  enableVoice?: boolean;

  /**
   * 是否启用桌面通知
   */
  enableDesktop?: boolean;

  /**
   * 自定义通知标题
   */
  title?: string;

  /**
   * 通知持续时间（秒）
   */
  duration?: number;
}

/**
 * 新订单通知 Hook
 *
 * 监听订单列表变化，当有新订单时触发通知：
 * - Ant Design notification
 * - 语音播报
 * - 桌面通知（需用户授权）
 *
 * @param orders 当前订单列表
 * @param config 通知配置
 */
export const useNewOrderNotification = (
  orders: BeverageOrderDTO[] | undefined,
  config?: NewOrderNotificationConfig
) => {
  const {
    enableVoice = true,
    enableDesktop = true,
    title = '新订单提醒',
    duration = 4.5,
  } = config || {};

  const { announceNewOrder } = useVoiceAnnouncement();
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!orders || orders.length === 0) {
      return;
    }

    // 获取当前订单ID集合
    const currentOrderIds = new Set(orders.map((order) => order.id));

    // 检测新订单（存在于当前但不在之前的集合中）
    const newOrders = orders.filter((order) => !previousOrderIdsRef.current.has(order.id));

    // 如果是初次加载，只记录ID不触发通知
    if (previousOrderIdsRef.current.size === 0) {
      previousOrderIdsRef.current = currentOrderIds;
      return;
    }

    // 如果有新订单，触发通知
    if (newOrders.length > 0) {
      // Ant Design 通知
      newOrders.forEach((order) => {
        notification.info({
          message: title,
          description: `订单号: ${order.orderNumber}，共 ${order.items.length} 件商品`,
          icon: <BellOutlined style={{ color: '#1890ff' }} />,
          duration,
          placement: 'topRight',
        });
      });

      // 语音播报
      if (enableVoice) {
        announceNewOrder();
      }

      // 桌面通知
      if (enableDesktop && 'Notification' in window) {
        requestDesktopNotification(newOrders);
      }
    }

    // 更新订单ID集合
    previousOrderIdsRef.current = currentOrderIds;
  }, [orders, enableVoice, enableDesktop, title, duration, announceNewOrder]);
};

/**
 * 请求桌面通知权限并发送通知
 */
const requestDesktopNotification = async (newOrders: BeverageOrderDTO[]) => {
  // 检查浏览器是否支持桌面通知
  if (!('Notification' in window)) {
    return;
  }

  // 请求权限
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  // 如果已授权，发送通知
  if (permission === 'granted') {
    newOrders.forEach((order) => {
      new Notification('新订单提醒', {
        body: `订单号: ${order.orderNumber}\n共 ${order.items.length} 件商品`,
        icon: '/favicon.ico',
        tag: `order-${order.id}`,
        requireInteraction: true, // 需要用户交互才关闭
      });
    });
  }
};
