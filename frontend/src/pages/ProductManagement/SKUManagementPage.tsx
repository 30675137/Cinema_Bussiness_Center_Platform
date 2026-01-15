/**
 * @spec O004-beverage-sku-reuse
 * SKU Management Page
 *
 * SKU 管理页面 - 提供 SKU 的创建、查询、编辑、删除等功能
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { SKUListTable } from '@/features/product-management/components/SKUListTable';
import { SKUCreateModal } from '@/features/product-management/components/SKUCreateModal';
import { SKUEditModal } from '@/features/product-management/components/SKUEditModal';
import { useSKUs } from '@/hooks/useSKUs';
import {
  useSkuManagementStore,
  useQueryParams,
  useSelectedSkuIds,
  useCreateModalVisible,
  useEditModal,
} from '@/stores/skuManagementStore';
import type { SKU, SkuStatus } from '@/types/sku';

const { Title } = Typography;
const { confirm } = Modal;

/**
 * SKU Management Page Component
 */
export const SKUManagementPage: React.FC = () => {
  // === Store 状态 ===
  const queryParams = useQueryParams();
  const { setQueryParams, resetQueryParams } = useSkuManagementStore();
  const selectedSkuIds = useSelectedSkuIds();
  const { clearSelection } = useSkuManagementStore();
  const isCreateModalVisible = useCreateModalVisible();
  const { openCreateModal, closeCreateModal } = useSkuManagementStore();
  const { isVisible: isEditModalVisible, editingSkuId } = useEditModal();
  const { openEditModal, closeEditModal } = useSkuManagementStore();

  // === 查询参数本地状态(用于输入框绑定) ===
  const [searchKeyword, setSearchKeyword] = useState(queryParams.keyword || '');
  const [statusFilter, setStatusFilter] = useState<SkuStatus | 'all'>(queryParams.status || 'all');

  // === TanStack Query ===
  const { data, isLoading, refetch } = useSKUs(queryParams);

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    setQueryParams({
      keyword: searchKeyword || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: 1, // 重置到第 1 页
    });
  };

  /**
   * 处理重置筛选
   */
  const handleReset = () => {
    setSearchKeyword('');
    setStatusFilter('all');
    resetQueryParams();
  };

  /**
   * 处理刷新
   */
  const handleRefresh = () => {
    refetch();
    message.success('数据已刷新');
  };

  /**
   * 处理编辑 SKU
   */
  const handleEdit = (sku: SKU) => {
    openEditModal(sku.id);
  };

  /**
   * 处理删除单个 SKU
   */
  const handleDelete = (sku: SKU) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除 SKU "${sku.name}" 吗?此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: 调用删除 API
          message.success(`SKU "${sku.name}" 已删除`);
          refetch();
        } catch (error) {
          message.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      },
    });
  };

  /**
   * 处理批量删除
   */
  const handleBatchDelete = () => {
    if (selectedSkuIds.length === 0) {
      message.warning('请先选择要删除的 SKU');
      return;
    }

    confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedSkuIds.length} 个 SKU 吗?此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: 调用批量删除 API
          message.success(`已删除 ${selectedSkuIds.length} 个 SKU`);
          clearSelection();
          refetch();
        } catch (error) {
          message.error(`批量删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      },
    });
  };

  /**
   * 统计数据
   */
  const stats = {
    total: data?.total || 0,
    enabled: data?.items.filter((sku) => sku.status === 'enabled').length || 0,
    disabled: data?.items.filter((sku) => sku.status === 'disabled').length || 0,
    draft: data?.items.filter((sku) => sku.status === 'draft').length || 0,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <Title level={2}>SKU 管理</Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总 SKU 数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="启用中" value={stats.enabled} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已禁用" value={stats.disabled} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="草稿" value={stats.draft} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      {/* 筛选工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="搜索 SKU 名称或编码"
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
            </Col>
            <Col span={6}>
              <Select
                placeholder="SKU 状态"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                options={[
                  { label: '全部状态', value: 'all' },
                  { label: '草稿', value: 'draft' },
                  { label: '启用', value: 'enabled' },
                  { label: '禁用', value: 'disabled' },
                ]}
              />
            </Col>
            <Col span={10}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            data-testid="add-sku-button"
          >
            创建 SKU
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedSkuIds.length === 0}
          >
            批量删除 ({selectedSkuIds.length})
          </Button>
        </Space>
      </Card>

      {/* SKU 列表表格 */}
      <Card>
        <SKUListTable
          dataSource={data?.items || []}
          loading={isLoading}
          pagination={{
            current: data?.page || 1,
            pageSize: data?.pageSize || 20,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setQueryParams({ page, pageSize });
            },
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      {/* SKU 创建模态框 */}
      <SKUCreateModal
        visible={isCreateModalVisible}
        onCancel={closeCreateModal}
        onSuccess={() => {
          closeCreateModal();
          refetch(); // 刷新列表
        }}
      />

      {/* SKU 编辑模态框 */}
      <SKUEditModal
        skuId={editingSkuId}
        visible={isEditModalVisible}
        onCancel={closeEditModal}
        onSuccess={() => {
          closeEditModal();
          refetch(); // 刷新列表
        }}
      />
    </div>
  );
};
