/**
 * P004-inventory-adjustment: 流水数量标签组件
 * 
 * 用于显示库存流水的数量变化，入库绿色+/出库红色-
 * 实现 T030 任务。
 * 
 * @since US2 - 查看库存流水记录
 */

import React from 'react';
import { Tag, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

export interface TransactionQuantityTagProps {
  /** 数量值（正数为入库，负数为出库） */
  quantity: number;
  /** 单位（可选） */
  unit?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 大小 */
  size?: 'small' | 'default' | 'large';
}

/**
 * 流水数量标签组件
 * 
 * 功能：
 * - 入库类（正数）：绿色 + 号显示
 * - 出库类（负数）：红色 - 号显示
 * - 支持显示单位
 */
export const TransactionQuantityTag: React.FC<TransactionQuantityTagProps> = ({
  quantity,
  unit,
  showIcon = true,
  size = 'default',
}) => {
  const isInbound = quantity > 0;
  const isZero = quantity === 0;
  
  const color = isZero ? 'default' : isInbound ? 'green' : 'red';
  const displayQuantity = Math.abs(quantity);
  const prefix = isZero ? '' : isInbound ? '+' : '-';
  
  const icon = showIcon && !isZero ? (
    isInbound ? <PlusOutlined /> : <MinusOutlined />
  ) : null;
  
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;
  const padding = size === 'small' ? '0 4px' : size === 'large' ? '4px 12px' : '2px 8px';

  return (
    <Tag
      color={color}
      icon={icon}
      style={{ fontSize, padding, fontWeight: 500, margin: 0 }}
      data-testid="transaction-quantity-tag"
    >
      <Space size={4}>
        <span>{prefix}{displayQuantity}</span>
        {unit && <span style={{ fontSize: fontSize - 2 }}>{unit}</span>}
      </Space>
    </Tag>
  );
};

/**
 * 获取交易类型的中文名称
 */
export function getTransactionTypeName(transactionType: string): string {
  const typeNames: Record<string, string> = {
    purchase_in: '采购入库',
    sale_out: '销售出库',
    transfer_in: '调拨入库',
    transfer_out: '调拨出库',
    adjustment_in: '调整入库',
    adjustment_out: '调整出库',
    return_in: '退货入库',
    return_out: '退货出库',
    damage_out: '报损出库',
    production_in: '生产入库',
    expired_out: '过期出库',
  };
  return typeNames[transactionType] || transactionType;
}

export default TransactionQuantityTag;
