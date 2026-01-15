import React from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Image,
  Typography,
  Popconfirm,
  message,
  Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, EyeOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import type { Product } from '@/types';

const { Text } = Typography;

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  };
  selectedRowKeys?: React.Key[];
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onSelectChange?: (selectedRowKeys: React.Key[]) => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onCopy?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  pagination,
  selectedRowKeys = [],
  onChange,
  onSelectChange,
  onEdit,
  onView,
  onCopy,
  onDelete,
}) => {
  // 商品状态映射
  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      pending_review: { color: 'processing', text: '待审核' },
      approved: { color: 'success', text: '已审核' },
      published: { color: 'success', text: '已发布' },
      disabled: { color: 'warning', text: '已禁用' },
      archived: { color: 'default', text: '已归档' },
    };
    return statusMap[status] || { color: 'default', text: status };
  };

  // 物料类型映射
  const getMaterialTypeConfig = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      raw_material: { color: 'orange', text: '原材料' },
      semi_finished: { color: 'blue', text: '半成品' },
      finished_good: { color: 'green', text: '成品' },
    };
    return typeMap[type] || { color: 'default', text: type };
  };

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(price);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 获取主图URL
  const getMainImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find((img) => img.type === 'main');
      return mainImage ? mainImage.url : product.images[0].url;
    }
    return undefined;
  };

  // 处理操作
  const handleEdit = (record: Product) => {
    onEdit?.(record.id);
  };

  const handleView = (record: Product) => {
    onView?.(record.id);
  };

  const handleCopy = (record: Product) => {
    onCopy?.(record.id);
  };

  const handleDelete = (record: Product) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个商品吗？此操作不可撤销。',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        onDelete?.(record.id);
        message.success('商品删除成功');
      },
    });
  };

  // 表格列定义
  const columns: ColumnsType<Product> = [
    {
      title: '商品信息',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 商品图片 */}
          <Image
            width={48}
            height={48}
            src={getMainImage(record)}
            fallback="data:image/png;base64,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"
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />

          {/* 商品信息 */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
              SKU: {record.skuId}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>条码: {record.barcode || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      title: '类目',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
      render: (categoryName) => (
        <Text ellipsis={{ tooltip: categoryName }} style={{ width: 100 }}>
          {categoryName}
        </Text>
      ),
    },
    {
      title: '物料类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 100,
      render: (type) => {
        const config = getMaterialTypeConfig(type);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '基础价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 120,
      render: (price) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatPrice(price)}
        </Text>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => <Text>{formatDate(date)}</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个商品吗？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={products}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
      }}
      rowSelection={{
        selectedRowKeys,
        onChange: onSelectChange,
      }}
      onChange={onChange}
      scroll={{ x: 1200 }}
      size="middle"
    />
  );
};

export default ProductTable;
