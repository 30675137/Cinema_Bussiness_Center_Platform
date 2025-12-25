import React from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Tag, Button, Space, Tooltip } from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  CopyOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { SPUItem } from '../../../types/spu';
import { CategoryItem } from '../../../types/category';
import { BrandItem } from '../../../types/brand';

// 状态标签配置
const statusConfig = {
  active: { text: '启用', color: 'success' },
  inactive: { text: '停用', color: 'error' },
  draft: { text: '草稿', color: 'default' }
};

// 操作按钮配置
interface SPUColumnsGeneratorProps {
  onEdit?: (record: SPUItem) => void;
  onView?: (record: SPUItem) => void;
  onCopy?: (record: SPUItem) => void;
  categories: CategoryItem[];
  brands: BrandItem[];
}

export const SPUColumnsGenerator = ({
  onEdit,
  onView,
  onCopy,
  categories,
  brands
}: SPUColumnsGeneratorProps) => {
  // 获取品牌名称
  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || brandId;
  };

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  // 格式化时间
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const columns: ColumnsType<SPUItem> = [
    // 复选框列
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 50,
      fixed: 'left',
    },
    // SPU编码
    {
      title: 'SPU编码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
      sorter: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="font-mono text-sm">{text}</span>
        </Tooltip>
      )
    },
    // SPU名称
    {
      title: 'SPU名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      sorter: true,
      render: (text: string, record: SPUItem) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          {record.shortName && (
            <div className="text-xs text-gray-500 mt-1">{record.shortName}</div>
          )}
        </div>
      )
    },
    // 品牌 - 直接使用SPU数据中的brandName字段
    {
      title: '品牌',
      dataIndex: 'brandName',
      key: 'brandId',
      width: 120,
      filters: brands.map(brand => ({
        text: brand.name,
        value: brand.id,
      })),
      onFilter: (value: string, record: SPUItem) => record.brandId === value,
      render: (brandName: string, record: SPUItem) => (
        <span className="text-sm">{brandName || record.brandId || '-'}</span>
      )
    },
    // 分类 - 直接使用SPU数据中的categoryName字段
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryId',
      width: 150,
      filters: categories.map(category => ({
        text: category.name,
        value: category.id,
      })),
      onFilter: (value: string, record: SPUItem) => record.categoryId === value,
      render: (categoryName: string, record: SPUItem) => {
        const categoryPath = record.categoryPath || [];

        return (
          <div>
            <div className="text-sm">{categoryName || record.categoryId || '-'}</div>
            {categoryPath.length > 1 && (
              <div className="text-xs text-gray-500">
                {categoryPath.slice(0, -1).join(' > ')}
              </div>
            )}
          </div>
        );
      }
    },
    // 规格
    {
      title: '规格',
      key: 'specifications',
      width: 150,
      render: (_, record: SPUItem) => {
        const specs = record.specifications || [];
        const primarySpec = specs.find(s => s.name === '容量' || s.name === '重量');

        if (primarySpec) {
          return (
            <span className="text-sm">
              {primarySpec.value}
              {record.unit && `/${record.unit}`}
            </span>
          );
        }

        return specs.length > 0 ? (
          <Tooltip title={specs.map(s => `${s.name}: ${s.value}`).join(', ')}>
            <span className="text-sm text-gray-600">{specs[0].value}</span>
          </Tooltip>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        );
      }
    },
    // 状态
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      filters: Object.entries(statusConfig).map(([key, config]) => ({
        text: config.text,
        value: key,
      })),
      onFilter: (value: string, record: SPUItem) => record.status === value,
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      }
    },
    // 标签
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags: string[]) => {
        if (!tags || tags.length === 0) {
          return <span className="text-gray-400 text-xs">-</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map(tag => (
              <Tag key={tag} size="small" color="blue">
                {tag}
              </Tag>
            ))}
            {tags.length > 2 && (
              <Tag size="small" color="default">
                +{tags.length - 2}
              </Tag>
            )}
          </div>
        );
      }
    },
    // SKU数量
    {
      title: 'SKU数量',
      dataIndex: 'skuCount',
      key: 'skuCount',
      width: 90,
      sorter: true,
      render: (count: number) => (
        <span className="text-sm font-medium">{count || 0}</span>
      )
    },
    // 创建信息
    {
      title: '创建信息',
      key: 'createInfo',
      width: 160,
      render: (_, record: SPUItem) => (
        <div className="text-xs">
          <div className="text-gray-600">{record.createdBy || '-'}</div>
          <div className="text-gray-400">
            {formatDateTime(record.createdAt)}
          </div>
        </div>
      )
    },
    // 更新时间
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 140,
      sorter: true,
      render: (updatedAt: string) => (
        <span className="text-xs text-gray-600">
          {formatDateTime(updatedAt)}
        </span>
      )
    },
    // 操作列
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record: SPUItem) => (
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

          <Tooltip title="复制">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => onCopy?.(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return columns;
};