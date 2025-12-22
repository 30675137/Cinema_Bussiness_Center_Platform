/**
 * StoreTable Component
 *
 * Displays list of stores with columns: name, region, status
 * Follows Ant Design Table patterns from BrandTable
 */

import React from 'react';
import { Table, Tag, Empty, Button, Space } from 'antd';
import { EditOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Store } from '../types/store.types';

interface StoreTableProps {
  stores: Store[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  /** 编辑门店回调 @since 020-store-address */
  onEdit?: (store: Store) => void;
}

/**
 * Store Table Component
 * Displays stores in a table format with name, region, and status columns
 */
const StoreTable: React.FC<StoreTableProps> = ({
  stores,
  loading = false,
  pagination,
  onEdit,
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // Get status color for tag
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'disabled':
        return 'red';
      default:
        return 'default';
    }
  };

  // Get status text for display
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '启用';
      case 'disabled':
        return '停用';
      default:
        return status;
    }
  };

  const columns: ColumnsType<Store> = [
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Store) => (
        <div className="store-name-cell">
          <div>
            <span className="store-name-text" title={text}>
              {text}
            </span>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.code}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region',
      width: 150,
      render: (text: string) => (
        <span className="region-text">
          {text || '-'}
        </span>
      ),
      sorter: (a, b) => (a.region || '').localeCompare(b.region || ''),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '启用', value: 'active' },
        { text: '停用', value: 'disabled' },
      ],
      onFilter: (value, record) => record.status.toLowerCase() === value,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <span className="created-time-text">
          {formatDate(date)}
        </span>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    // 020-store-address: 添加地址摘要列
    {
      title: '地址',
      dataIndex: 'addressSummary',
      key: 'addressSummary',
      width: 150,
      render: (text: string, record: Store) => (
        <span className="address-summary-text">
          {text || record.city && record.district
            ? `${record.city || ''} ${record.district || ''}`.trim()
            : <span style={{ color: '#999' }}>未配置</span>}
        </span>
      ),
    },
    // 020-store-address: 添加操作列
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: Store) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EnvironmentOutlined />}
            onClick={() => onEdit?.(record)}
            aria-label={`编辑${record.name}的地址`}
          >
            地址
          </Button>
        </Space>
      ),
    },
  ];

  // If no data and not loading, show empty state
  if (!loading && stores.length === 0) {
    return (
      <div className="store-table-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无门店数据"
        />
      </div>
    );
  }

  return (
    <div className="store-table-wrapper">
      <Table
        columns={columns}
        dataSource={stores}
        rowKey="id"
        loading={loading}
        pagination={pagination ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: pagination.onChange,
          onShowSizeChange: pagination.onChange,
          pageSizeOptions: ['10', '20', '50', '100'],
        } : false}
        scroll={{ x: 800 }}
        className="store-table"
        size="middle"
      />
    </div>
  );
};

export default StoreTable;
