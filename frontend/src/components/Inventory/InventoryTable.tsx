import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { CurrentInventory } from '@/types/inventory';
import {
  formatQuantity,
  formatDateTime,
  calculateInventoryStatus,
} from '@/utils/inventoryHelpers';
import { useResponsive, useResponsiveTableScroll } from '@/hooks/useResponsive';

const { Text } = Typography;

interface InventoryTableProps {
  data: CurrentInventory[];
  loading?: boolean;
  pagination: TablePaginationConfig;
  onPaginationChange: (page: number, pageSize: number) => void;
  onViewDetails?: (record: CurrentInventory) => void;
}

/**
 * 库存台账表格组件
 * 展示库存台账数据，支持排序和分页
 */
export const InventoryTable: React.FC<InventoryTableProps> = ({
  data,
  loading = false,
  pagination,
  onPaginationChange,
  onViewDetails,
}) => {
  const { isMobile } = useResponsive();
  const scroll = useResponsiveTableScroll();

  const columns: ColumnsType<CurrentInventory> = [
    {
      title: 'SKU编码',
      dataIndex: ['sku', 'skuCode'],
      key: 'skuCode',
      width: 120,
      fixed: isMobile ? undefined : 'left',
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
      title: '现存数量',
      dataIndex: 'onHandQty',
      key: 'onHandQty',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.onHandQty - b.onHandQty,
      render: (qty: number, record) => (
        <Text strong style={{ color: qty <= 0 ? '#ff4d4f' : undefined }}>
          {formatQuantity(qty, record.sku?.unit)}
        </Text>
      ),
    },
    {
      title: '可用数量',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.availableQty - b.availableQty,
      render: (qty: number, record) => formatQuantity(qty, record.sku?.unit),
    },
    {
      title: '预占数量',
      dataIndex: 'reservedQty',
      key: 'reservedQty',
      width: 110,
      align: 'right',
      render: (qty: number, record) => formatQuantity(qty, record.sku?.unit),
    },
    {
      title: '在途数量',
      dataIndex: 'inTransitQty',
      key: 'inTransitQty',
      width: 110,
      align: 'right',
      render: (qty: number, record) => formatQuantity(qty, record.sku?.unit),
    },
    {
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 110,
      align: 'right',
      render: (qty: number, record) => formatQuantity(qty, record.sku?.unit),
    },
    {
      title: '库存状态',
      key: 'status',
      width: 130,
      filters: [
        { text: '缺货', value: 'out_of_stock' },
        { text: '低于安全库存', value: 'low_stock' },
        { text: '正常', value: 'normal' },
        { text: '超库存', value: 'overstock' },
      ],
      onFilter: (value, record) => {
        const status = calculateInventoryStatus(record);
        return status.status === value;
      },
      render: (_, record) => {
        const status = calculateInventoryStatus(record);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 160,
      sorter: (a, b) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
      render: (date: string) => formatDateTime(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: isMobile ? undefined : 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails?.(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<CurrentInventory>
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: !isMobile,
        showTotal: (total) => `共 ${total} 条`,
        onChange: onPaginationChange,
      }}
      scroll={scroll}
      size={isMobile ? 'small' : 'middle'}
    />
  );
};

export default InventoryTable;
