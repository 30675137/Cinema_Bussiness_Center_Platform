/**
 * SKU表格组件
 * 展示SKU列表数据，支持排序、分页和操作
 */
import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography } from 'antd';
import { EyeOutlined, EditOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SKU } from '@/types/sku';
import { SkuStatus, SkuType, SKU_TYPE_CONFIG } from '@/types/sku';
import {
  getSkuStatusText,
  getSkuStatusColor,
  formatSkuCode,
  formatBarcode,
  canEnableSku,
  canDisableSku,
} from '@/utils/skuHelpers';
import { useResponsive } from '@/hooks/useResponsive';

const { Text } = Typography;

interface SkuTableProps {
  data: SKU[];
  loading?: boolean;
  pagination: TablePaginationConfig;
  onPaginationChange: (page: number, pageSize: number) => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  onView?: (record: SKU) => void;
  onEdit?: (record: SKU) => void;
  onToggleStatus?: (record: SKU, status: SkuStatus) => void;
  /** 选中的行keys */
  selectedRowKeys?: React.Key[];
  /** 选中行变化回调 */
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: SKU[]) => void;
}

/**
 * SKU表格组件
 */
export const SkuTable: React.FC<SkuTableProps> = ({
  data,
  loading = false,
  pagination,
  onPaginationChange,
  onSortChange,
  onView,
  onEdit,
  onToggleStatus,
  selectedRowKeys,
  onSelectionChange,
}) => {
  const { isMobile } = useResponsive();

  const handleSort = (field: string, order?: 'ascend' | 'descend') => {
    if (onSortChange && order) {
      onSortChange(field, order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const columns: ColumnsType<SKU> = [
    {
      title: 'SKU编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: isMobile ? undefined : 'left',
      render: (code: string) => <Text strong>{formatSkuCode(code)}</Text>,
    },
    {
      title: 'SKU名称',
      dataIndex: 'name',
      key: 'name',
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
      title: '所属SPU',
      dataIndex: 'spuName',
      key: 'spuName',
      width: 150,
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
      title: 'SKU类型',
      dataIndex: 'skuType',
      key: 'skuType',
      width: 120,
      filters: [
        { text: '原料', value: SkuType.RAW_MATERIAL },
        { text: '包材', value: SkuType.PACKAGING },
        { text: '成品', value: SkuType.FINISHED_PRODUCT },
        { text: '套餐', value: SkuType.COMBO },
      ],
      onFilter: (value, record) => record.skuType === value,
      render: (type: SkuType) => {
        const config = SKU_TYPE_CONFIG[type];
        return config ? (
          <Tag color={config.color}>{config.text}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
    },
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: (category: string) => (
        <Tooltip title={category}>
          <span>{category}</span>
        </Tooltip>
      ),
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 100,
    },
    {
      title: '主库存单位',
      dataIndex: 'mainUnit',
      key: 'mainUnit',
      width: 100,
    },
    {
      title: '主条码',
      dataIndex: 'mainBarcode',
      key: 'mainBarcode',
      width: 140,
      render: (barcode: string) => formatBarcode(barcode),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '草稿', value: SkuStatus.DRAFT },
        { text: '启用', value: SkuStatus.ENABLED },
        { text: '停用', value: SkuStatus.DISABLED },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: SkuStatus) => (
        <Tag color={getSkuStatusColor(status)}>{getSkuStatusText(status)}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => handleSort('createdAt', 'ascend'),
      }),
      render: (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: isMobile ? undefined : 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView?.(record)}
            data-testid={`sku-view-button-${record.id}`}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
            data-testid={`sku-edit-button-${record.id}`}
          >
            编辑
          </Button>
          {canEnableSku(record) && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => onToggleStatus?.(record, SkuStatus.ENABLED)}
              data-testid={`sku-enable-button-${record.id}`}
            >
              启用
            </Button>
          )}
          {canDisableSku(record) && (
            <Button
              type="link"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => onToggleStatus?.(record, SkuStatus.DISABLED)}
              data-testid={`sku-disable-button-${record.id}`}
            >
              停用
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = onSelectionChange
    ? {
        selectedRowKeys,
        onChange: onSelectionChange,
      }
    : undefined;

  return (
    <Table<SKU>
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      rowSelection={rowSelection}
      data-testid="sku-table"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: !isMobile,
        showTotal: (total) => `共 ${total} 条`,
        onChange: onPaginationChange,
      }}
      scroll={{ x: 1400, y: isMobile ? undefined : 600 }}
      size={isMobile ? 'small' : 'middle'}
      onRow={(record) => ({
        'data-testid': `sku-table-row-${record.id}`,
      })}
    />
  );
};

export default SkuTable;
