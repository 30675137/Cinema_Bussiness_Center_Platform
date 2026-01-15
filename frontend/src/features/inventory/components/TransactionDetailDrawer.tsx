/**
 * P004-inventory-adjustment: 库存流水详情抽屉组件
 *
 * 显示单条流水记录的完整详情。
 *
 * @since US2 - 查看库存流水记录
 */

import React from 'react';
import { Drawer, Descriptions, Tag, Divider, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTransactionTypeName } from './TransactionQuantityTag';
import type { InventoryTransaction } from '../hooks/useTransactions';

const { Text, Title } = Typography;

export interface TransactionDetailDrawerProps {
  /** 流水记录 */
  transaction: InventoryTransaction | null;
  /** 是否可见 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 获取来源类型的显示名称
 */
function getSourceTypeName(sourceType?: string): string {
  const sourceTypeMap: Record<string, string> = {
    purchase_order: '采购订单',
    sales_order: '销售订单',
    inventory_adjustment: '库存调整',
    safety_stock_config: '安全库存配置',
    transfer_order: '调拨单',
    return_order: '退货单',
    manual: '手工操作',
  };
  return sourceTypeMap[sourceType || ''] || sourceType || '-';
}

/**
 * 判断是否为入库类型
 */
function isInboundType(type: string): boolean {
  return type.includes('_in') || type === 'safety_stock_update';
}

/**
 * 库存流水详情抽屉组件
 *
 * 功能：
 * - 显示流水记录的完整详情
 * - 包含时间、类型、数量变化、来源信息等
 * - 备注信息显示
 *
 * @example
 * ```tsx
 * <TransactionDetailDrawer
 *   transaction={selectedTransaction}
 *   open={drawerOpen}
 *   onClose={() => setDrawerOpen(false)}
 * />
 * ```
 */
export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  open,
  onClose,
}) => {
  if (!transaction) {
    return null;
  }

  const isInbound = isInboundType(transaction.transactionType);
  const quantityColor = isInbound ? '#52c41a' : '#ff4d4f';
  const quantityPrefix = isInbound ? '+' : '-';

  return (
    <Drawer
      title="流水详情"
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {/* 交易概览 */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 24,
          padding: '16px 0',
          background: '#fafafa',
          borderRadius: 8,
        }}
      >
        <Tag
          color={isInbound ? 'success' : 'warning'}
          icon={isInbound ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          style={{ fontSize: 14, padding: '4px 12px' }}
        >
          {getTransactionTypeName(transaction.transactionType)}
        </Tag>
        <Title level={2} style={{ color: quantityColor, margin: '16px 0 8px' }}>
          {quantityPrefix}
          {Math.abs(transaction.quantity)}
        </Title>
        <Text type="secondary">
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {dayjs(transaction.transactionTime).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      </div>

      <Divider />

      {/* 库存变化信息 */}
      <Descriptions title="库存变化" column={1} bordered size="small">
        <Descriptions.Item label="变动数量">
          <Text strong style={{ color: quantityColor }}>
            {quantityPrefix}
            {Math.abs(transaction.quantity)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="库存变化">
          <Text>
            {transaction.stockBefore} → <Text strong>{transaction.stockAfter}</Text>
          </Text>
        </Descriptions.Item>
        {(transaction.availableBefore !== undefined ||
          transaction.availableAfter !== undefined) && (
          <Descriptions.Item label="可用数量变化">
            <Text>
              {transaction.availableBefore ?? '-'} →{' '}
              <Text strong>{transaction.availableAfter ?? '-'}</Text>
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      {/* 来源信息 */}
      <Descriptions title="来源信息" column={1} bordered size="small">
        <Descriptions.Item label="来源类型">
          {getSourceTypeName(transaction.sourceType)}
        </Descriptions.Item>
        <Descriptions.Item label="来源单据">
          {transaction.sourceId ? (
            <Text copyable={{ text: transaction.sourceId }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              {transaction.sourceId}
            </Text>
          ) : (
            '-'
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* 操作信息 */}
      <Descriptions title="操作信息" column={1} bordered size="small">
        <Descriptions.Item label="操作人">
          <Text>
            <UserOutlined style={{ marginRight: 8 }} />
            {transaction.operatorName || '-'}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="交易时间">
          {dayjs(transaction.transactionTime).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {dayjs(transaction.createdAt).format('YYYY-MM-DD HH:mm:ss')}
        </Descriptions.Item>
      </Descriptions>

      {/* 备注信息 */}
      {transaction.remarks && (
        <>
          <Divider />
          <Descriptions title="备注" column={1} bordered size="small">
            <Descriptions.Item>
              <Text>{transaction.remarks}</Text>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  );
};

export default TransactionDetailDrawer;
