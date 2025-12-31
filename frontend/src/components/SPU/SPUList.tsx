import React, { useState, useCallback, useEffect } from 'react';
import { Table, Tag, Button, Space, Tooltip, Avatar, Image, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  MoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { SPUItem, SPUStatus, ProductType } from '@/types/spu';
import { PRODUCT_TYPE_OPTIONS } from '@/types/spu';
import { formatSPUStatus, formatSPUDate, formatSpecifications } from '@/utils/spuHelpers';
import { statusColors } from '@/theme';

interface SPUListProps {
  data: SPUItem[];
  loading?: boolean;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[]) => void;
  onEdit?: (record: SPUItem) => void;
  onDelete?: (record: SPUItem) => void;
  onView?: (record: SPUItem) => void;
  onCopy?: (record: SPUItem) => void;
  onBatchDelete?: (ids: string[]) => void;
  onStatusChange?: (id: string, status: SPUStatus) => void;
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    getCheckboxProps?: (record: SPUItem) => { disabled?: boolean };
  };
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
    onChange?: (page: number, pageSize: number) => void;
  };
  scroll?: {
    x?: number;
    y?: number;
  };
}

const SPUList: React.FC<SPUListProps> = ({
  data,
  loading = false,
  selectedRowKeys = [],
  onSelectChange,
  onEdit,
  onDelete,
  onView,
  onCopy,
  onBatchDelete,
  onStatusChange,
  rowSelection,
  pagination,
  scroll,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  // 处理行展开
  const handleExpand = useCallback(
    (expanded: boolean, record: SPUItem) => {
      const newExpanded = expanded
        ? [...expandedRowKeys, record.id]
        : expandedRowKeys.filter((key) => key !== record.id);
      setExpandedRowKeys(newExpanded);
    },
    [expandedRowKeys]
  );

  // 获取状态标签
  const getStatusTag = (status: SPUStatus) => {
    const statusInfo = statusColors[status as keyof typeof statusColors];
    return (
      <Tag color={statusInfo.color} style={{ fontSize: '12px' }}>
        {statusInfo.text}
      </Tag>
    );
  };

  // 获取产品类型标签
  const getProductTypeTag = (productType?: ProductType) => {
    if (!productType) return '-';
    const typeOption = PRODUCT_TYPE_OPTIONS.find((opt) => opt.value === productType);
    if (!typeOption) return '-';
    return (
      <Tag color={typeOption.color} style={{ fontSize: '12px' }}>
        {typeOption.label}
      </Tag>
    );
  };

  // 获取品牌标签
  const getBrandTag = (brand?: { name: string; code?: string }) => {
    if (!brand) return '-';
    return (
      <Tag color="blue" style={{ fontSize: '12px' }}>
        {brand.code ? `${brand.name}(${brand.code})` : brand.name}
      </Tag>
    );
  };

  // 获取分类标签
  const getCategoryTag = (category?: { name: string; path?: string[] }) => {
    if (!category) return '-';
    return (
      <Tooltip title={category.path?.join(' / ') || category.name}>
        <Tag color="green" style={{ fontSize: '12px', maxWidth: '150px' }}>
          {category.name}
        </Tag>
      </Tooltip>
    );
  };

  // 渲染规格参数
  const renderSpecifications = (specifications: Array<{ name: string; value: string }>) => {
    if (!specifications || specifications.length === 0) {
      return '-';
    }

    const displaySpecs = specifications.slice(0, 2);
    const hasMore = specifications.length > 2;

    return (
      <div>
        {displaySpecs.map((spec, index) => (
          <div key={index} style={{ fontSize: '12px', color: '#666' }}>
            <span style={{ fontWeight: 500 }}>{spec.name}:</span> {spec.value}
          </div>
        ))}
        {hasMore && (
          <div style={{ fontSize: '12px', color: '#999' }}>
            +{specifications.length - 2} 更多...
          </div>
        )}
      </div>
    );
  };

  // 渲染图片预览
  const renderImages = (images: Array<{ url: string; alt: string }>) => {
    if (!images || images.length === 0) {
      return <Avatar size="small" icon={<EyeOutlined />} />;
    }

    const firstImage = images[0];
    const hasMore = images.length > 1;

    return (
      <Space>
        <Image
          width={32}
          height={32}
          src={firstImage.url}
          alt={firstImage.alt}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          preview={{
            mask: '预览',
          }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMCThS6VzhQM+oi6lP4UrWixxg1Gko1+B8OJh0l7IJgJZYC7tdy4wJKjEzzHJcNglMcAA=="
        />
        {hasMore && <span style={{ fontSize: '12px', color: '#999' }}>+{images.length - 1}</span>}
      </Space>
    );
  };

  // 渲染操作按钮
  const renderActions = (record: SPUItem) => {
    const items = [
      {
        key: 'view',
        label: '查看详情',
        icon: <EyeOutlined />,
        onClick: () => onView?.(record),
      },
      {
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
        onClick: () => onEdit?.(record),
      },
      {
        key: 'copy',
        label: '复制',
        icon: <CopyOutlined />,
        onClick: () => onCopy?.(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          Popconfirm.confirm({
            title: '确认删除',
            content: `确定要删除SPU"${record.name}"吗？此操作不可恢复。`,
            onConfirm: () => onDelete?.(record),
          });
        },
      },
    ];

    return (
      <Space size="small">
        <Tooltip title="查看详情">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onView?.(record)}
          />
        </Tooltip>
        <Tooltip title="编辑">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
          />
        </Tooltip>
        <Tooltip title="更多操作">
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // 这里可以添加下拉菜单逻辑
            }}
          />
        </Tooltip>
      </Space>
    );
  };

  // 表格列配置
  const columns: ColumnsType<SPUItem> = [
    {
      title: 'SPU编码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
      sorter: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 500 }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'SPU名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string, record: SPUItem) => (
        <Tooltip title={text}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
            {record.shortName && (
              <div style={{ fontSize: '12px', color: '#666' }}>{record.shortName}</div>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      align: 'center',
      render: renderImages,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
      render: (_: any, record: SPUItem) => {
        // 支持brand对象或brandName字符串
        const brandName = record.brand?.name || record.brandName;
        if (!brandName) return '-';
        return (
          <Tag color="blue" style={{ fontSize: '12px' }}>
            {brandName}
          </Tag>
        );
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (_: any, record: SPUItem) => {
        // 支持category对象或categoryName字符串
        const categoryName = record.category?.name || record.categoryName;
        if (!categoryName) return '-';
        return (
          <Tooltip title={record.category?.path?.join(' / ') || categoryName}>
            <Tag color="green" style={{ fontSize: '12px', maxWidth: '150px' }}>
              {categoryName}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: SPUStatus, record: SPUItem) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            // 这里可以添加状态切换逻辑
          }}
        >
          {getStatusTag(status)}
        </div>
      ),
    },
    {
      title: '产品类型',
      dataIndex: 'productType',
      key: 'productType',
      width: 90,
      align: 'center',
      render: (productType: ProductType) => getProductTypeTag(productType),
    },
    {
      title: '规格参数',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 150,
      render: renderSpecifications,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 120,
      render: (tags: string[]) => {
        if (!tags || tags.length === 0) return '-';

        const displayTags = tags.slice(0, 2);
        const hasMore = tags.length > 2;

        return (
          <div>
            <Space size={[4, 4]} wrap>
              {displayTags.map((tag, index) => (
                <Tag key={index} style={{ fontSize: '11px' }}>
                  {tag}
                </Tag>
              ))}
              {hasMore && <Tag style={{ fontSize: '11px', color: '#999' }}>+{tags.length - 2}</Tag>}
            </Space>
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => formatSPUDate(date, 'MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: SPUItem) => renderActions(record),
    },
  ];

  // 展开行内容
  const expandedRowRender = (record: SPUItem) => {
    return (
      <div style={{ padding: '16px 24px', backgroundColor: '#fafafa' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>基础信息</h4>
            <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
              <div>
                <strong>SPU编码:</strong> {record.code}
              </div>
              <div>
                <strong>标准简称:</strong> {record.shortName || '-'}
              </div>
              <div>
                <strong>标准单位:</strong> {record.unit || '-'}
              </div>
              <div>
                <strong>创建者:</strong> {record.createdBy || '-'}
              </div>
              <div>
                <strong>更新者:</strong> {record.updatedBy || '-'}
              </div>
            </div>
          </div>
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>商品描述</h4>
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#666' }}>
              {record.description || '-'}
            </div>
          </div>
        </div>
        {record.attributes && record.attributes.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>动态属性</h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {record.attributes.map((attr, index) => (
                <Tag key={index} color="cyan" style={{ fontSize: '12px' }}>
                  {attr.name}: {attr.value}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 处理表格行选择
  const rowSelectionConfig = rowSelection
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => {
          onSelectChange?.(keys);
        },
        getCheckboxProps: (record: SPUItem) => ({
          disabled: record.status === 'archived', // 归档状态的SPU不可选
          ...rowSelection.getCheckboxProps?.(record),
        }),
        ...rowSelection,
      }
    : undefined;

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      scroll={scroll}
      rowSelection={rowSelectionConfig}
      expandable={{
        expandedRowKeys,
        onExpanded: handleExpand,
        expandedRowRender,
        columnWidth: 50,
        expandedRowClassName: 'expanded-row',
      }}
      size="middle"
      bordered
      className="spu-list-table"
      onRow={(record) => ({
        onDoubleClick: () => onView?.(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
};

export default SPUList;
