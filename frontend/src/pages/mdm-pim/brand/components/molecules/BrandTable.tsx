import React from 'react';
import { Table, Space, Button, Empty, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Brand, BrandTableProps } from '../../types/brand.types';
import BrandLogo from '../atoms/BrandLogo';
import BrandStatusTag from '../atoms/BrandStatusTag';
import BrandTypeTag from '../atoms/BrandTypeTag';
import BrandStatusActions from './BrandStatusActions';

/**
 * 品牌表格分子组件
 * 显示品牌列表数据，包含操作按钮和状态显示
 */
const BrandTable: React.FC<BrandTableProps> = ({
  brands,
  loading = false,
  onView,
  onEdit,
  onStatusChange
}) => {
  // 格式化时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 格式化主营类目
  const formatCategories = (categories: string[]) => {
    if (!categories || categories.length === 0) {
      return '-';
    }
    return categories.join(', ');
  };

  const columns: ColumnsType<Brand> = [
    {
      title: '品牌名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      className: 'brand-name-column',
      render: (text: string, record: Brand) => (
        <div className="brand-name-cell">
          <BrandLogo
            src={record.logoUrl}
            alt={record.name}
            size="small"
            className="brand-logo"
          />
          <span
            className="brand-name-text"
            data-testid="brand-name"
            title={text}
          >
            {text}
          </span>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '英文名',
      dataIndex: 'englishName',
      key: 'englishName',
      width: 120,
      className: 'english-name-column',
      render: (text: string) => (
        <span
          className="english-name-text"
          data-testid="english-name"
          title={text}
        >
          {text || '-'}
        </span>
      ),
      sorter: (a, b) => (a.englishName || '').localeCompare(b.englishName || ''),
    },
    {
      title: '品牌编码',
      dataIndex: 'brandCode',
      key: 'brandCode',
      width: 120,
      className: 'brand-code-column',
      render: (text: string) => (
        <span
          className="brand-code-text"
          data-testid="brand-code"
        >
          {text}
        </span>
      ),
      sorter: (a, b) => a.brandCode.localeCompare(b.brandCode),
    },
    {
      title: '品牌类型',
      dataIndex: 'brandType',
      key: 'brandType',
      width: 100,
      className: 'brand-type-column',
      render: (type: string) => (
        <BrandTypeTag type={type as any} />
      ),
      filters: [
        { text: '自有品牌', value: 'own' },
        { text: '代理品牌', value: 'agency' },
        { text: '联营品牌', value: 'joint' },
        { text: '其他', value: 'other' },
      ],
      onFilter: (value, record) => record.brandType === value,
    },
    {
      title: '主营类目',
      dataIndex: 'primaryCategories',
      key: 'primaryCategories',
      width: 150,
      className: 'primary-category-column',
      render: (categories: string[]) => (
        <Tooltip title={formatCategories(categories)}>
          <span
            className="primary-category-text"
            data-testid="primary-category"
          >
            {formatCategories(categories)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      className: 'status-column',
      render: (status: string) => (
        <BrandStatusTag status={status as any} />
      ),
      filters: [
        { text: '启用', value: 'enabled' },
        { text: '停用', value: 'disabled' },
        { text: '草稿', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      className: 'created-time-column',
      render: (date: string) => (
        <span
          className="created-time-text"
          data-testid="created-time"
        >
          {formatDate(date)}
        </span>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      className: 'actions-column',
      render: (_, record: Brand) => {
        // 为每行添加唯一标识
        const rowKey = `brand-${record.id}`;

        return (
          <div
            className="brand-table-row"
            data-testid="brand-table-row"
            data-row-key={rowKey}
          >
            <Space size="small" className="brand-actions" data-testid="brand-actions">
              <Tooltip title="查看详情">
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => onView(record)}
                  data-testid="view-button"
                />
              </Tooltip>

              <Tooltip title="编辑">
                <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              data-testid="edit-button"
            />
          </Tooltip>

              {/* 状态管理按钮 */}
              <BrandStatusActions
                brand={record}
                onStatusChange={onStatusChange}
                size="small"
                type="text"
                data-testid="brand-status-actions"
              />
            </Space>
          </div>
        );
      },
    },
  ];

  // 如果没有数据，显示空状态
  if (!loading && brands.length === 0) {
    return (
      <div className="brand-table-empty" data-testid="brand-empty-state">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无品牌数据"
        >
          <Button type="primary">创建品牌</Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="brand-table-wrapper">
      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
        className="brand-table"
        data-testid="brand-table"
        rowClassName={(record) => `brand-table-row ${record.status}`}
        size="middle"
      />
    </div>
  );
};

export default BrandTable;