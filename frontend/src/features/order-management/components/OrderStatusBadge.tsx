/**
 * @spec O001-product-order-list
 * 订单状态徽章组件 - 使用 Ant Design Tag 展示订单状态
 */

import React from 'react';
import { Tag } from 'antd';
import { OrderStatus } from '../types/order';
import { formatOrderStatus, getOrderStatusColor } from '../utils/formatOrderStatus';

export interface OrderStatusBadgeProps {
  /**
   * 订单状态
   */
  status: OrderStatus;

  /**
   * 额外的 CSS 类名
   */
  className?: string;

  /**
   * 是否显示描述信息（Tooltip）
   */
  showDescription?: boolean;
}

/**
 * 订单状态徽章组件
 *
 * 将订单状态映射为 Ant Design Tag 组件，显示对应的文本和颜色
 *
 * @example
 * ```tsx
 * <OrderStatusBadge status={OrderStatus.PAID} />
 * ```
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = React.memo(
  ({ status, className, showDescription = false }) => {
    const label = formatOrderStatus(status);
    const color = getOrderStatusColor(status);

    return (
      <Tag color={color} className={className}>
        {label}
      </Tag>
    );
  }
);

OrderStatusBadge.displayName = 'OrderStatusBadge';

export default OrderStatusBadge;
