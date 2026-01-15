/**
 * @spec O003-beverage-order
 * OrderStatusBadge - 订单状态徽章组件
 */
import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';

/**
 * 饮品订单状态枚举
 * 与后端 BeverageOrderStatus 保持一致
 */
export enum BeverageOrderStatus {
  /** 待支付 */
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  /** 待制作 */
  PENDING_PRODUCTION = 'PENDING_PRODUCTION',
  /** 制作中 */
  PRODUCING = 'PRODUCING',
  /** 已完成 (等待取餐) */
  COMPLETED = 'COMPLETED',
  /** 已交付 */
  DELIVERED = 'DELIVERED',
  /** 已取消 */
  CANCELLED = 'CANCELLED',
}

/**
 * 订单状态配置
 */
const STATUS_CONFIG: Record<BeverageOrderStatus, { color: TagProps['color']; text: string }> = {
  [BeverageOrderStatus.PENDING_PAYMENT]: {
    color: 'default',
    text: '待支付',
  },
  [BeverageOrderStatus.PENDING_PRODUCTION]: {
    color: 'orange',
    text: '待制作',
  },
  [BeverageOrderStatus.PRODUCING]: {
    color: 'processing',
    text: '制作中',
  },
  [BeverageOrderStatus.COMPLETED]: {
    color: 'success',
    text: '已完成',
  },
  [BeverageOrderStatus.DELIVERED]: {
    color: 'success',
    text: '已交付',
  },
  [BeverageOrderStatus.CANCELLED]: {
    color: 'error',
    text: '已取消',
  },
};

export interface OrderStatusBadgeProps {
  /**
   * 订单状态
   */
  status: BeverageOrderStatus | string;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 订单状态徽章组件
 *
 * 使用场景:
 * - 订单列表
 * - 订单详情
 * - 订单卡片
 *
 * @example
 * ```tsx
 * <OrderStatusBadge status={BeverageOrderStatus.PRODUCING} />
 * <OrderStatusBadge status="COMPLETED" />
 * ```
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status as BeverageOrderStatus] || {
    color: 'default',
    text: status,
  };

  return (
    <Tag color={config.color} className={className}>
      {config.text}
    </Tag>
  );
};

export default OrderStatusBadge;
