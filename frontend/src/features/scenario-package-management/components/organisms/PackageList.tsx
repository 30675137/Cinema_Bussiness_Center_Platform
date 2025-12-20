/**
 * 场景包列表组件
 *
 * 表格展示场景包列表，包含操作按钮
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React from 'react';
import { Table, Space, Button, Popconfirm, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import StatusBadge from '../atoms/StatusBadge';
import type { ScenarioPackageSummary, PackageStatus } from '../../types';

interface PackageListProps {
  /** 场景包列表数据 */
  data: ScenarioPackageSummary[];
  /** 总数量 */
  total: number;
  /** 当前页码（从 1 开始） */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 是否加载中 */
  loading?: boolean;
  /** 页码变更回调 */
  onPageChange?: (page: number, pageSize: number) => void;
  /** 预览操作回调 */
  onPreview?: (id: string) => void;
  /** 编辑操作回调 */
  onEdit?: (id: string) => void;
  /** 删除操作回调 */
  onDelete?: (id: string) => void;
  /** 删除操作是否加载中 */
  deleteLoading?: boolean;
}

/**
 * 场景包列表组件
 *
 * 封装场景包列表的表格展示，支持分页和操作
 */
export const PackageList: React.FC<PackageListProps> = ({
  data,
  total,
  page,
  pageSize,
  loading = false,
  onPageChange,
  onPreview,
  onEdit,
  onDelete,
  deleteLoading = false,
}) => {
  const columns: ColumnsType<ScenarioPackageSummary> = [
    {
      title: '背景图片',
      dataIndex: 'backgroundImageUrl',
      key: 'backgroundImageUrl',
      width: 100,
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            alt="背景图片"
            width={80}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U..."
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 60,
              backgroundColor: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: 12,
            }}
          >
            暂无图片
          </div>
        ),
    },
    {
      title: '场景包名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PackageStatus) => <StatusBadge status={status} />,
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
      render: (hours: number) => (hours ? `${hours}小时` : '-'),
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
      render: (date: string) =>
        date ? new Date(date).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onPreview?.(record.id)}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record.id)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个场景包吗？"
            description="删除后无法恢复，请谨慎操作"
            onConfirm={() => onDelete?.(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (newPage, newPageSize) => {
      onPageChange?.(newPage, newPageSize);
    },
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1600 }}
      pagination={pagination}
    />
  );
};

export default PackageList;
