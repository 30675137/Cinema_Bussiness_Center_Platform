/**
 * @spec O002-miniapp-menu-config
 * 分类表格组件
 */

import React from 'react';
import { Table, Switch, Button, Space, Tag, Tooltip, Typography, Image } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  HolderOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuCategoryDTO } from '../types';

const { Text } = Typography;

interface CategoryTableProps {
  data: MenuCategoryDTO[];
  loading?: boolean;
  onEdit: (category: MenuCategoryDTO) => void;
  onDelete: (category: MenuCategoryDTO) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  toggleVisibilityLoading?: string | null;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onToggleVisibility,
  toggleVisibilityLoading,
}) => {
  const columns: ColumnsType<MenuCategoryDTO> = [
    {
      title: '',
      key: 'drag',
      width: 40,
      render: () => (
        <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      align: 'center',
      render: (sortOrder: number) => (
        <Text type="secondary">{sortOrder}</Text>
      ),
    },
    {
      title: '图标',
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      width: 60,
      align: 'center',
      render: (iconUrl: string) =>
        iconUrl ? (
          <Image
            src={iconUrl}
            alt="分类图标"
            width={32}
            height={32}
            preview={false}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (code: string, record: MenuCategoryDTO) => (
        <Space>
          <Text code>{code}</Text>
          {record.isDefault && (
            <Tag color="blue">默认</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '显示名称',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150,
      render: (displayName: string, record: MenuCategoryDTO) => (
        <Space>
          <Text strong={record.isDefault}>{displayName}</Text>
          {!record.isVisible && (
            <Tooltip title="已隐藏">
              <EyeInvisibleOutlined style={{ color: '#999' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '商品数量',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Tag color={count > 0 ? 'green' : 'default'}>
          {count ?? 0} 件
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) =>
        description ? (
          <Tooltip title={description}>
            <Text type="secondary">{description}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '可见',
      dataIndex: 'isVisible',
      key: 'isVisible',
      width: 80,
      align: 'center',
      render: (isVisible: boolean, record: MenuCategoryDTO) => (
        <Switch
          checked={isVisible}
          onChange={(checked) => onToggleVisibility(record.id, checked)}
          loading={toggleVisibilityLoading === record.id}
          disabled={record.isDefault}
          checkedChildren={<EyeOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_: unknown, record: MenuCategoryDTO) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.isDefault ? '默认分类不可删除' : '删除'}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
              disabled={record.isDefault}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="id"
      pagination={false}
      size="middle"
      rowClassName={(record) =>
        record.isVisible ? '' : 'category-row-hidden'
      }
    />
  );
};

export default CategoryTable;
