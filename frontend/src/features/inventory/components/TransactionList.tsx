/**
 * P004-inventory-adjustment: 库存流水列表组件
 * 
 * 显示库存流水记录列表，支持时间筛选。
 * 实现 T031 任务。
 * 
 * @since US2 - 查看库存流水记录
 */

import React, { useState, useMemo } from 'react';
import { Table, DatePicker, Space, Empty, Spin, Typography, Tag } from 'antd';
import type { TableProps } from 'antd';
import dayjs from 'dayjs';
import { TransactionQuantityTag, getTransactionTypeName } from './TransactionQuantityTag';
import { useTransactions, type InventoryTransaction } from '../hooks/useTransactions';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export interface TransactionListProps {
  /** SKU ID */
  skuId: string;
  /** 门店 ID（可选） */
  storeId?: string;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 库存流水列表组件
 * 
 * 功能：
 * - 显示流水记录列表
 * - 时间范围筛选
 * - 入库绿色+/出库红色- 显示
 * - 分页支持
 * 
 * @example
 * ```tsx
 * <TransactionList skuId="sku-001" storeId="store-001" />
 * ```
 */
export const TransactionList: React.FC<TransactionListProps> = ({
  skuId,
  storeId,
  pageSize = 10,
}) => {
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [page, setPage] = useState(1);

  // 构建查询参数
  const queryParams = useMemo(() => ({
    skuId,
    storeId,
    startDate: dateRange?.[0],
    endDate: dateRange?.[1],
    page,
    pageSize,
  }), [skuId, storeId, dateRange, page, pageSize]);

  // 查询流水记录
  const { data, isLoading, isError } = useTransactions(queryParams, !!skuId);

  // 日期范围变化处理
  const handleDateChange = (dates: any) => {
    if (dates) {
      setDateRange([
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD'),
      ]);
    } else {
      setDateRange(null);
    }
    setPage(1); // 重置页码
  };

  // 表格列定义
  const columns: TableProps<InventoryTransaction>['columns'] = [
    {
      title: '时间',
      dataIndex: 'transactionTime',
      key: 'transactionTime',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 100,
      render: (type: string) => (
        <Tag color={type.includes('_in') ? 'green' : 'orange'}>
          {getTransactionTypeName(type)}
        </Tag>
      ),
    },
    {
      title: '数量变化',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'center',
      render: (quantity: number) => (
        <TransactionQuantityTag quantity={quantity} size="small" />
      ),
    },
    {
      title: '库存变化',
      key: 'stockChange',
      width: 140,
      render: (_, record) => (
        <Text>
          {record.stockBefore} → <Text strong>{record.stockAfter}</Text>
        </Text>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100,
    },
  ];

  // 错误状态
  if (isError) {
    return <Empty description="加载流水记录失败" />;
  }

  return (
    <div data-testid="transaction-list">
      {/* 时间筛选 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Text type="secondary">时间范围：</Text>
          <RangePicker 
            onChange={handleDateChange} 
            placeholder={['开始日期', '结束日期']}
          />
        </Space>
      </div>

      {/* 流水表格 */}
      <Spin spinning={isLoading}>
        <Table<InventoryTransaction>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          size="small"
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showTotal: (total) => `共 ${total} 条`,
            onChange: setPage,
            showSizeChanger: false,
          }}
          locale={{ emptyText: <Empty description="暂无流水记录" /> }}
        />
      </Spin>
    </div>
  );
};

export default TransactionList;
