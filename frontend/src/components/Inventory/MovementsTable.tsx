import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography } from 'antd';
import { EyeOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { TransactionDetail } from '@/types/inventory';
import {
  formatQuantity,
  formatDateTime,
  formatCurrency,
  getTransactionTypeLabel,
  getSourceTypeLabel,
  isInboundTransaction,
  formatTransactionQuantity,
} from '@/utils/inventoryHelpers';
import { useResponsive, useResponsiveTableScroll } from '@/hooks/useResponsive';

const { Text, Link } = Typography;

interface MovementsTableProps {
  data: TransactionDetail[];
  loading?: boolean;
  pagination: TablePaginationConfig;
  onPaginationChange: (page: number, pageSize: number) => void;
  onViewDetails?: (record: TransactionDetail) => void;
}

/**
 * 库存流水表格组件
 * 展示库存变动历史记录
 */
export const MovementsTable: React.FC<MovementsTableProps> = ({
  data,
  loading = false,
  pagination,
  onPaginationChange,
  onViewDetails,
}) => {
  const { isMobile } = useResponsive();
  const scroll = useResponsiveTableScroll();

  const columns: ColumnsType<TransactionDetail> = [
    {
      title: '交易时间',
      dataIndex: 'transactionTime',
      key: 'transactionTime',
      width: 160,
      fixed: isMobile ? undefined : 'left',
      sorter: (a, b) =>
        new Date(a.transactionTime).getTime() - new Date(b.transactionTime).getTime(),
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'SKU编码',
      dataIndex: ['sku', 'skuCode'],
      key: 'skuCode',
      width: 120,
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'SKU名称',
      dataIndex: ['sku', 'name'],
      key: 'skuName',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Tooltip title={name}>
          <span>{name}</span>
        </Tooltip>
      ),
    },
    {
      title: '门店/仓库',
      dataIndex: ['store', 'name'],
      key: 'storeName',
      width: 150,
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      filters: [
        { text: '采购入库', value: 'purchase_in' },
        { text: '销售出库', value: 'sale_out' },
        { text: '调拨入库', value: 'transfer_in' },
        { text: '调拨出库', value: 'transfer_out' },
        { text: '盘盈入库', value: 'adjustment_in' },
        { text: '盘亏出库', value: 'adjustment_out' },
      ],
      onFilter: (value, record) => record.transactionType === value,
      render: (type) => {
        const { label, color } = getTransactionTypeLabel(type);
        const isInbound = isInboundTransaction(type);
        return (
          <Tag
            color={color}
            icon={isInbound ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: '变动数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (qty: number, record) => {
        const isInbound = isInboundTransaction(record.transactionType);
        return (
          <Text
            strong
            style={{ color: isInbound ? '#52c41a' : '#ff4d4f' }}
          >
            {formatTransactionQuantity(qty, record.transactionType, record.sku?.unit)}
          </Text>
        );
      },
    },
    {
      title: '库存前',
      dataIndex: 'stockBefore',
      key: 'stockBefore',
      width: 100,
      align: 'right',
      render: (qty: number, record) => formatQuantity(qty, record.sku?.unit),
    },
    {
      title: '库存后',
      dataIndex: 'stockAfter',
      key: 'stockAfter',
      width: 100,
      align: 'right',
      render: (qty: number, record) => (
        <Text strong>{formatQuantity(qty, record.sku?.unit)}</Text>
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 100,
      align: 'right',
      render: (cost?: number) => (cost ? formatCurrency(cost) : '-'),
    },
    {
      title: '总价',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right',
      render: (cost?: number) => (cost ? formatCurrency(cost) : '-'),
    },
    {
      title: '来源类型',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 120,
      render: (type) => {
        const { label, color } = getSourceTypeLabel(type);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '单据号',
      dataIndex: 'sourceDocument',
      key: 'sourceDocument',
      width: 150,
      render: (doc?: string) => (
        doc ? (
          <Link onClick={(e) => e.stopPropagation()}>
            {doc}
          </Link>
        ) : '-'
      ),
    },
    {
      title: '操作人',
      dataIndex: ['operator', 'name'],
      key: 'operatorName',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (remarks?: string) =>
        remarks ? (
          <Tooltip title={remarks}>
            <span>{remarks}</span>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: isMobile ? undefined : 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetails?.(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <Table<TransactionDetail>
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: !isMobile,
        showTotal: (total) => `共 ${total} 条流水记录`,
        onChange: onPaginationChange,
      }}
      scroll={scroll}
      size={isMobile ? 'small' : 'middle'}
    />
  );
};

export default MovementsTable;
