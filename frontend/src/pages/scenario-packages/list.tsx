/**
 * 场景包列表页（MVP版本）
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React, { useState } from 'react';
import { Button, Table, Space, Tag, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePackageList } from '../../features/scenario-package-management/hooks/usePackageList';
import { useDeletePackage } from '../../features/scenario-package-management/hooks/usePackageMutations';
import type { ScenarioPackageSummary, PackageStatus } from '../../features/scenario-package-management/types';

const ScenarioPackageListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const { data, isLoading, isError, error } = usePackageList({ page, size });
  const deleteMutation = useDeletePackage();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getStatusTag = (status: PackageStatus) => {
    const statusConfig = {
      DRAFT: { color: 'default', text: '草稿' },
      PUBLISHED: { color: 'success', text: '已发布' },
      UNPUBLISHED: { color: 'warning', text: '已下架' },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: '场景包名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PackageStatus) => getStatusTag(status),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version: number) => `v${version}`,
    },
    {
      title: '时长',
      dataIndex: 'durationHours',
      key: 'durationHours',
      width: 100,
      render: (hours: number) => hours ? `${hours}小时` : '-',
    },
    {
      title: '人数范围',
      dataIndex: 'peopleRange',
      key: 'peopleRange',
      width: 120,
      render: (range: string) => range || '不限',
    },
    {
      title: '影厅数量',
      dataIndex: 'hallCount',
      key: 'hallCount',
      width: 100,
      render: (count: number) => `${count}个`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ScenarioPackageSummary) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/scenario-packages/${record.id}/preview`)}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/scenario-packages/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个场景包吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isError) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>加载失败: {(error as any)?.message || '未知错误'}</p>
          <Button onClick={() => window.location.reload()}>重新加载</Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="场景包管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/scenario-packages/create')}
          >
            新建场景包
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            current: page + 1,
            pageSize: size,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (newPage, newSize) => {
              setPage(newPage - 1);
              setSize(newSize);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default ScenarioPackageListPage;
