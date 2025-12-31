/**
 * 预约单状态徽章组件 (Atom)
 *
 * 显示预约单状态，使用不同颜色区分
 * - PENDING: 黄色 "待确认"
 * - CONFIRMED: 蓝色 "已确认"
 * - COMPLETED: 绿色 "已完成"
 * - CANCELLED: 灰色 "已取消"
 */

import React, { memo } from 'react';
import { Tag, Badge } from 'antd';
import type { ReservationStatus } from '../types/reservation-order.types';
import { RESERVATION_STATUS_CONFIG } from '../types/reservation-order.types';

export interface OrderStatusBadgeProps {
  /** 预约单状态 */
  status: ReservationStatus;
  /** 显示模式: 'tag' | 'badge' */
  mode?: 'tag' | 'badge';
  /** 是否显示文字 */
  showText?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
}

/**
 * 预约单状态徽章组件
 *
 * @example
 * <OrderStatusBadge status="PENDING" />
 * <OrderStatusBadge status="CONFIRMED" mode="badge" />
 * <OrderStatusBadge status="COMPLETED" showText={false} />
 */
const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  mode = 'tag',
  showText = true,
  style,
  className,
}) => {
  const config = RESERVATION_STATUS_CONFIG[status] || {
    label: status,
    color: 'default',
    badgeStatus: 'default' as const,
  };

  // Badge 模式
  if (mode === 'badge') {
    return (
      <Badge
        status={config.badgeStatus}
        text={showText ? config.label : undefined}
        className={className}
        style={style}
      />
    );
  }

  // Tag 模式 (默认)
  return (
    <Tag color={config.color} className={className} style={style}>
      {showText ? config.label : null}
    </Tag>
  );
};

// 使用 React.memo 优化性能，避免不必要的重渲染
export default memo(OrderStatusBadge);

/**
 * 获取状态文本
 */
export const getStatusText = (status: ReservationStatus): string => {
  return RESERVATION_STATUS_CONFIG[status]?.label || status;
};

/**
 * 获取状态颜色
 */
export const getStatusColor = (status: ReservationStatus): string => {
  return RESERVATION_STATUS_CONFIG[status]?.color || 'default';
};

/**
 * 判断状态是否可以执行确认操作
 */
export const canConfirm = (status: ReservationStatus): boolean => {
  return status === 'PENDING';
};

/**
 * 判断状态是否可以执行取消操作
 */
export const canCancel = (status: ReservationStatus): boolean => {
  return status === 'PENDING' || status === 'CONFIRMED';
};

/**
 * 判断状态是否已经结束
 */
export const isTerminal = (status: ReservationStatus): boolean => {
  return status === 'COMPLETED' || status === 'CANCELLED';
};
