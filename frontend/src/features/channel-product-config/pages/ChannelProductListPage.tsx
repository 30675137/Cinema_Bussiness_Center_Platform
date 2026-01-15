/**
 * @spec O005-channel-product-config
 * Channel Product List Page
 */

import React, { useEffect } from 'react';
import { Card, Button, Space, App, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useChannelProductStore } from '../stores/useChannelProductStore';
import {
  useChannelProducts,
  useUpdateChannelProductStatus,
  useDeleteChannelProduct,
} from '../services/channelProductService';
import { ChannelProductFilter } from '../components/ChannelProductFilter';
import { ChannelProductTable } from '../components/ChannelProductTable';
import { ChannelProductStatus } from '../types';
import type { ChannelProductConfig } from '../types';

const { Title } = Typography;

const ChannelProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { filters, setFilters } = useChannelProductStore();

  // API Queries & Mutations
  const { data, isLoading, isRefetching } = useChannelProducts({
    channelType: filters.channelType,
    channelCategory: filters.channelCategory,
    status: filters.status,
    keyword: filters.keyword,
    page: 1, // Store currently manages global filters, pagination usually local or combined
    size: 20, // Default size
  });

  // Pagination State (Local for now, or sync with store if needed)
  const [pagination, setPagination] = React.useState({
    page: 1,
    size: 20,
  });

  // Re-fetch when pagination changes
  const { data: pagedData, isLoading: isPagedLoading } = useChannelProducts({
    ...filters,
    page: pagination.page,
    size: pagination.size,
  });

  const updateStatusMutation = useUpdateChannelProductStatus();
  const deleteMutation = useDeleteChannelProduct();

  // Handlers
  const handlePageChange = (page: number, size: number) => {
    setPagination({ page, size });
  };

  const handleEdit = (record: ChannelProductConfig) => {
    navigate(`/channel-products/mini-program/${record.id}/edit`);
  };

  const handleStatusChange = async (record: ChannelProductConfig, status: ChannelProductStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: record.id, status });
      message.success(status === ChannelProductStatus.ACTIVE ? '已上架' : '已下架');
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (record: ChannelProductConfig) => {
    try {
      await deleteMutation.mutateAsync(record.id);
      message.success('删除成功');
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  const handleCreate = () => {
    navigate('/channel-products/mini-program/create');
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ marginBottom: 0 }}>
            渠道商品配置
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增商品
          </Button>
        </div>

        <Card bordered={false}>
          <ChannelProductFilter />

          <ChannelProductTable
            loading={isLoading || isPagedLoading || isRefetching}
            dataSource={pagedData?.items || []}
            total={pagedData?.total || 0}
            page={pagination.page}
            pageSize={pagination.size}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </Card>
      </Space>
    </div>
  );
};

export default ChannelProductListPage;
