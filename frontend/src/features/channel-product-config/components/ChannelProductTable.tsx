/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * Channel Product List Table
 */

import React from 'react';
import { Table, Tag, Space, Button, Popconfirm, Avatar, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import type { ChannelProductConfig } from '../types';
import { ChannelProductStatus, CHANNEL_PRODUCT_STATUS_LABELS } from '../types';

const { Text } = Typography;

export interface ChannelProductTableProps {
  loading: boolean;
  dataSource: ChannelProductConfig[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onEdit: (record: ChannelProductConfig) => void;
  onStatusChange: (record: ChannelProductConfig, status: ChannelProductStatus) => void;
  onDelete: (record: ChannelProductConfig) => void;
}

export const ChannelProductTable: React.FC<ChannelProductTableProps> = ({
  loading,
  dataSource,
  total,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const columns = [
    {
      title: '商品信息',
      key: 'info',
      width: 250,
      render: (_: any, record: ChannelProductConfig) => (
        <Space>
          <Avatar shape="square" size={64} src={record.mainImage} icon={<PictureOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.displayName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {record.sku?.skuCode || record.skuId}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '分类',
      key: 'category',
      width: 100,
      render: (_: any, record: ChannelProductConfig) => (
        <Tag>{record.category?.displayName || '未知分类'}</Tag>
      ),
    },
    {
      title: '价格',
      key: 'price',
      width: 120,
      render: (_: any, record: ChannelProductConfig) => {
        const price = record.channelPrice ?? record.sku?.price;
        return <Text>¥{((price || 0) / 100).toFixed(2)}</Text>;
      },
    },
    {
      title: '规格数',
      key: 'specs',
      width: 80,
      render: (_: any, record: ChannelProductConfig) => record.specs?.length || 0,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: ChannelProductConfig) => {
        const statusConfig = {
          [ChannelProductStatus.ACTIVE]: { color: 'success' },
          [ChannelProductStatus.INACTIVE]: { color: 'default' },
          [ChannelProductStatus.OUT_OF_STOCK]: { color: 'warning' },
        };
        const config = statusConfig[record.status] || { color: 'default' };
        return <Tag color={config.color}>{CHANNEL_PRODUCT_STATUS_LABELS[record.status]}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: ChannelProductConfig) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            编辑
          </Button>

          {record.status === ChannelProductStatus.ACTIVE ? (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => onStatusChange(record, ChannelProductStatus.INACTIVE)}
            >
              下架
            </Button>
          ) : (
            <Button
              type="text"
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => onStatusChange(record, ChannelProductStatus.ACTIVE)}
            >
              上架
            </Button>
          )}

          <Popconfirm
            title="确认删除该商品吗？"
            description="删除后该商品将无法在渠道中显示。"
            onConfirm={() => onDelete(record)}
            okText="删除"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      dataSource={dataSource}
      columns={columns}
      rowKey="id"
      pagination={{
        current: page,
        pageSize: pageSize,
        total: total,
        onChange: onPageChange,
        showSizeChanger: true,
        showTotal: (t) => `共 ${t} 条`,
      }}
    />
  );
};
