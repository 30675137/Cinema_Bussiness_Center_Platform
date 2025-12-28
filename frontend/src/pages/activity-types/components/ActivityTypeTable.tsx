/**
 * 活动类型管理 - 表格组件
 */

import React from 'react';
import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { ActivityType } from '../types/activity-type.types';
import { ActivityTypeStatus } from '../types/activity-type.types';

interface ActivityTypeTableProps {
  data: ActivityType[];
  loading?: boolean;
  onEdit?: (activityType: ActivityType) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, status: ActivityTypeStatus) => void;
}

export const ActivityTypeTable: React.FC<ActivityTypeTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const columns: ColumnsType<ActivityType> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string | null) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ActivityTypeStatus) => {
        const statusConfig = {
          [ActivityTypeStatus.ENABLED]: { color: 'green', text: '启用' },
          [ActivityTypeStatus.DISABLED]: { color: 'orange', text: '停用' },
          [ActivityTypeStatus.DELETED]: { color: 'red', text: '已删除' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '排序号',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
      sorter: (a, b) => a.sort - b.sort,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ActivityType) => (
        <Space size="small">
          {onEdit && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
          )}
          {onToggleStatus && record.status !== ActivityTypeStatus.DELETED && (
            record.status === ActivityTypeStatus.ENABLED ? (
              <Popconfirm
                title="确定要停用此活动类型吗？"
                description="停用后小程序端将不再显示此类型"
                onConfirm={() => onToggleStatus(record.id, ActivityTypeStatus.DISABLED)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small">
                  停用
                </Button>
              </Popconfirm>
            ) : (
              <Button
                type="link"
                size="small"
                onClick={() => onToggleStatus(record.id, ActivityTypeStatus.ENABLED)}
              >
                启用
              </Button>
            )
          )}
          {onDelete && record.status !== ActivityTypeStatus.DELETED && (
            <Popconfirm
              title="确定要删除此活动类型吗？"
              description="删除后该类型将不再显示，但历史预约记录仍可正常关联"
              onConfirm={() => onDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
    />
  );
};

