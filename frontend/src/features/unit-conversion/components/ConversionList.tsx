/**
 * 换算规则列表表格组件
 * P002-unit-conversion
 */

import React, { useMemo } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Skeleton,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useConversions, useDeleteConversion } from '../hooks/useConversions';
import { useConversionUIStore } from '../stores/conversionUIStore';
import { CATEGORY_OPTIONS, DB_CATEGORY_LABELS } from '../utils/categoryMapping';
import type { UnitConversion, DbUnitCategory } from '../types';

const { Text } = Typography;

const ConversionList: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    openCreateModal,
    openEditModal,
  } = useConversionUIStore();

  const {
    data: conversions,
    isLoading,
    isFetching,
  } = useConversions({
    category: categoryFilter || undefined,
    search: searchTerm || undefined,
  });

  const deleteMutation = useDeleteConversion();

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('删除成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 类别标签颜色
  const getCategoryColor = (category: DbUnitCategory) => {
    switch (category) {
      case 'volume':
        return 'blue';
      case 'weight':
        return 'green';
      case 'quantity':
        return 'orange';
      default:
        return 'default';
    }
  };

  // 表格列定义
  const columns: ColumnsType<UnitConversion> = useMemo(
    () => [
      {
        title: '源单位',
        dataIndex: 'fromUnit',
        key: 'fromUnit',
        width: 120,
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: '',
        key: 'arrow',
        width: 50,
        align: 'center',
        render: () => <ArrowRightOutlined style={{ color: '#999' }} />,
      },
      {
        title: '目标单位',
        dataIndex: 'toUnit',
        key: 'toUnit',
        width: 120,
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: '换算率',
        dataIndex: 'conversionRate',
        key: 'conversionRate',
        width: 150,
        render: (rate: number, record: UnitConversion) => (
          <Text code>
            1 {record.fromUnit} = {rate} {record.toUnit}
          </Text>
        ),
      },
      {
        title: '类别',
        dataIndex: 'category',
        key: 'category',
        width: 100,
        render: (category: DbUnitCategory) => (
          <Tag color={getCategoryColor(category)}>{DB_CATEGORY_LABELS[category]}</Tag>
        ),
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        render: (_: unknown, record: UnitConversion) => (
          <Space size="small">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            <Popconfirm
              title="确定删除此换算规则？"
              description="删除后不可恢复"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [openEditModal, deleteMutation.isPending]
  );

  return (
    <div>
      {/* 工具栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Space wrap>
          <Input
            placeholder="搜索单位名称"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="筛选类别"
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 120 }}
            allowClear
            options={CATEGORY_OPTIONS}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          新增换算规则
        </Button>
      </div>

      {/* 表格 - 初次加载显示骨架屏 */}
      {isLoading ? (
        <div style={{ padding: '16px 0' }}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={conversions}
          rowKey="id"
          loading={isFetching && !isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            defaultPageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
          }}
          size="middle"
        />
      )}
    </div>
  );
};

export default ConversionList;
