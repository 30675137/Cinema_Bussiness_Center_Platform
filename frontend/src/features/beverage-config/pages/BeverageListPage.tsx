/**
 * @spec O003-beverage-order, O004-beverage-sku-reuse
 * B端饮品列表页面 (User Story 3 - FR-028)
 *
 * T044 + T045: 显示迁移通知，禁用创建/编辑按钮，重定向到SKU管理
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Space, Table, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getBeverageList, deleteBeverage } from '../services/beverageAdminApi';
import { BeverageFormModal } from '../components/BeverageFormModal';
import { SpecConfigModal } from '../components/SpecConfigModal';
import { RecipeConfigModal } from '../components/RecipeConfigModal';
import { MigrationNotice } from '../components/MigrationNotice';
import type {
  BeverageDTO,
  BeverageCategory,
  BeverageStatus,
  BeverageQueryParams,
} from '../types/beverage';

const { Search } = Input;

/**
 * 分类显示名称映射
 */
const CATEGORY_LABELS: Record<BeverageCategory, string> = {
  COFFEE: '咖啡',
  TEA: '茶饮',
  JUICE: '果汁',
  SMOOTHIE: '奶昔',
  MILK_TEA: '奶茶',
  OTHER: '其他',
};

/**
 * 状态显示名称和颜色映射
 */
const STATUS_CONFIG: Record<BeverageStatus, { label: string; color: string }> = {
  ACTIVE: { label: '已上架', color: 'green' },
  INACTIVE: { label: '已下架', color: 'default' },
  OUT_OF_STOCK: { label: '已售罄', color: 'red' },
};

export const BeverageListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState<BeverageQueryParams>({
    page: 0,
    size: 20,
  });
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBeverage, setEditingBeverage] = useState<BeverageDTO | null>(null);
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedBeverage, setSelectedBeverage] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 获取饮品列表数据
  const { data, isLoading } = useQuery({
    queryKey: ['beverages', queryParams],
    queryFn: () => getBeverageList(queryParams),
  });

  // 删除饮品
  const deleteMutation = useMutation({
    mutationFn: deleteBeverage,
    onSuccess: () => {
      message.success('删除饮品成功');
      queryClient.invalidateQueries({ queryKey: ['beverages'] });
    },
    onError: (error: Error) => {
      message.error(`删除失败: ${error.message}`);
    },
  });

  // 搜索处理
  const handleSearch = (value: string) => {
    setQueryParams((prev) => ({
      ...prev,
      name: value || undefined,
      page: 0,
    }));
  };

  // 分类筛选
  const handleCategoryFilter = (category: string | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      category,
      page: 0,
    }));
  };

  // 状态筛选
  const handleStatusFilter = (status: BeverageStatus | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      status,
      page: 0,
    }));
  };

  // 分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page: page - 1, // Table组件从1开始，后端从0开始
      size: pageSize,
    }));
  };

  // 新增饮品 (T045: 重定向到SKU管理)
  const handleAddBeverage = () => {
    // 重定向到SKU管理页面，自动选择finished_product类型和饮品分类
    navigate('/products/sku?type=finished_product&category=beverage');
  };

  // 编辑饮品
  const handleEditBeverage = (beverage: BeverageDTO) => {
    setEditingBeverage(beverage);
    setFormModalOpen(true);
  };

  // 删除饮品
  const handleDeleteBeverage = (id: string) => {
    deleteMutation.mutate(id);
  };

  // 配置规格
  const handleConfigSpecs = (beverage: BeverageDTO) => {
    setSelectedBeverage({ id: beverage.id, name: beverage.name });
    setSpecModalOpen(true);
  };

  // 配置配方
  const handleConfigRecipe = (beverage: BeverageDTO) => {
    setSelectedBeverage({ id: beverage.id, name: beverage.name });
    setRecipeModalOpen(true);
  };

  // 表格列定义
  const columns: ColumnsType<BeverageDTO> = [
    {
      title: '饮品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: BeverageDTO) => (
        <Space>
          {record.mainImage && (
            <img
              src={record.mainImage}
              alt={name}
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: BeverageCategory) => CATEGORY_LABELS[category],
    },
    {
      title: '基础价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 100,
      render: (price: number) => `¥${(price / 100).toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: BeverageStatus) => {
        const config = STATUS_CONFIG[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '推荐',
      dataIndex: 'isRecommended',
      key: 'isRecommended',
      width: 80,
      render: (isRecommended: boolean) => (isRecommended ? <Tag color="gold">推荐</Tag> : '-'),
    },
    {
      title: '规格数量',
      dataIndex: 'specCount',
      key: 'specCount',
      width: 100,
    },
    {
      title: '配方数量',
      dataIndex: 'recipeCount',
      key: 'recipeCount',
      width: 100,
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
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: BeverageDTO) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleEditBeverage(record)}
            disabled
            title="请前往SKU管理页面编辑"
          >
            编辑 (已禁用)
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleConfigSpecs(record)}
            disabled
            title="请前往SKU管理页面配置"
          >
            规格
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleConfigRecipe(record)}
            disabled
            title="请前往BOM管理页面配置"
          >
            配方
          </Button>
          <Popconfirm
            title="确定删除此饮品吗？删除后需在SKU管理中查看。"
            onConfirm={() => handleDeleteBeverage(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* T044: Migration Notice */}
      <MigrationNotice />

      <div style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索饮品名称"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="选择分类"
            allowClear
            style={{ width: 150 }}
            onChange={handleCategoryFilter}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
          >
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ float: 'right' }}
          onClick={handleAddBeverage}
        >
          新增饮品 (跳转至SKU管理)
        </Button>
      </div>

      <Table<BeverageDTO>
        columns={columns}
        dataSource={data?.content || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: (queryParams.page || 0) + 1,
          pageSize: queryParams.size || 20,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handleTableChange,
        }}
        scroll={{ x: 1400 }}
      />

      <BeverageFormModal
        open={formModalOpen}
        beverage={editingBeverage}
        onClose={() => {
          setFormModalOpen(false);
          setEditingBeverage(null);
        }}
      />

      <SpecConfigModal
        open={specModalOpen}
        beverageId={selectedBeverage?.id || null}
        beverageName={selectedBeverage?.name}
        onClose={() => {
          setSpecModalOpen(false);
          setSelectedBeverage(null);
        }}
      />

      <RecipeConfigModal
        open={recipeModalOpen}
        beverageId={selectedBeverage?.id || null}
        beverageName={selectedBeverage?.name}
        onClose={() => {
          setRecipeModalOpen(false);
          setSelectedBeverage(null);
        }}
      />
    </div>
  );
};

export default BeverageListPage;
