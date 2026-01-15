/**
 * @spec O003-beverage-order
 * B端饮品订单状态徽章组件
 */
import React from 'react';
import { Tag, type TagProps } from 'antd';
import { BeverageOrderStatus } from '../../../types/beverageOrder';

/**
 * 订单状态配置
 */
const STATUS_CONFIG: Record<BeverageOrderStatus, { color: TagProps['color']; text: string }> = {
  [BeverageOrderStatus.PENDING_PAYMENT]: { color: 'default', text: '待支付' },
  [BeverageOrderStatus.PENDING_PRODUCTION]: { color: 'blue', text: '待制作' },
  [BeverageOrderStatus.PRODUCING]: { color: 'processing', text: '制作中' },
  [BeverageOrderStatus.COMPLETED]: { color: 'success', text: '已完成' },
  [BeverageOrderStatus.DELIVERED]: { color: 'default', text: '已交付' },
  [BeverageOrderStatus.CANCELLED]: { color: 'error', text: '已取消' },
};

/**
 * 订单状态徽章组件属性
 */
export interface BeverageOrderStatusBadgeProps {
  status: BeverageOrderStatus;
}

/**
 * B端订单状态徽章组件
 */
export const BeverageOrderStatusBadge: React.FC<BeverageOrderStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  return <Tag color={config.color}>{config.text}</Tag>;
};
