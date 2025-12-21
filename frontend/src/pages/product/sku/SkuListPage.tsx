/**
 * SKU列表页面
 * 整合筛选器、表格等组件，提供完整的SKU列表查看和搜索功能
 */
import React, { useEffect, useMemo } from 'react';
import { Button, Space, message, Modal, Alert, Empty, Card } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { showError } from '@/utils/errorHandler';
import { SkuFilters } from '@/components/sku/SkuFilters';
import { SkuTable } from '@/components/sku/SkuTable';
import { SkuForm } from '@/components/sku';
import { SkuDetail } from '@/components/sku/SkuDetail';
import { useSkuStore } from '@/stores/skuStore';
import {
  useSkuListQuery,
  useToggleSkuStatusMutation,
} from '@/hooks/useSku';
import type { SKU, SkuQueryParams } from '@/types/sku';
import { SkuStatus } from '@/types/sku';
import { useNavigate } from 'react-router-dom';

/**
 * SKU列表页面组件
 */
const SkuListPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useSkuStore();
  
  // 安全地获取 store 值，确保不为 undefined
  const filters = store.filters || { status: 'all' };
  const pagination = store.pagination || { page: 1, pageSize: 20 };
  const sorting = store.sorting || { field: 'createdAt', order: 'desc' };
  const {
    setPagination,
    setSorting,
    openFormDrawer,
    openDetailDrawer,
    formDrawerOpen = false,
    formDrawerMode = 'create',
    formDrawerSkuId = null,
    closeFormDrawer,
    detailDrawerOpen = false,
    detailDrawerSkuId = null,
    closeDetailDrawer,
  } = store;

  // 构建查询参数
  const queryParams: SkuQueryParams = useMemo(
    () => ({
      ...(filters || {}),
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 20,
      sortField: sorting?.field,
      sortOrder: sorting?.order,
    }),
    [filters, pagination, sorting]
  );

  // 获取SKU列表
  const {
    data: skuListResponse,
    isLoading,
    error: listError,
    refetch,
  } = useSkuListQuery(queryParams);

  // 状态切换Mutation
  const toggleStatusMutation = useToggleSkuStatusMutation();

  // 处理筛选
  const handleFilter = (values: Partial<SkuQueryParams>) => {
    // 筛选条件已通过store更新，这里只需要触发重新查询
    refetch();
  };

  // 处理重置
  const handleReset = () => {
    refetch();
  };

  // 处理分页变化
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ page, pageSize });
  };

  // 处理排序变化
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSorting({ field, order });
  };

  // 处理查看详情
  const handleView = (record: SKU) => {
    openDetailDrawer(record.id);
  };

  // 处理编辑
  const handleEdit = (record: SKU) => {
    openFormDrawer('edit', record.id);
  };

  // 处理状态切换
  const handleToggleStatus = (record: SKU, status: SkuStatus) => {
    const statusText = status === SkuStatus.ENABLED ? '启用' : '停用';
    const confirmText =
      status === SkuStatus.DISABLED
        ? `确定要停用SKU "${record.name}" 吗？`
        : `确定要启用SKU "${record.name}" 吗？`;

    Modal.confirm({
      title: `确认${statusText}`,
      content: confirmText,
      onOk: async () => {
        try {
          await toggleStatusMutation.mutateAsync({
            id: record.id,
            status,
          });
          refetch();
        } catch (error: any) {
          showError(error, `${statusText}失败`);
        }
      },
    });
  };

  // 处理新建SKU
  const handleCreate = () => {
    openFormDrawer('create');
  };

  // 处理表单成功
  const handleFormSuccess = () => {
    refetch();
  };

  return (
    <div style={{ padding: 24 }} data-testid="sku-list-page">
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span data-testid="sku-list-title">SKU管理</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              data-testid="sku-create-button"
            >
              新建SKU
            </Button>
          </div>
        }
        data-testid="sku-list-card"
      >
        {/* 筛选器 */}
        <div style={{ marginBottom: 16 }}>
          <SkuFilters
            onFilter={handleFilter}
            onReset={handleReset}
            loading={isLoading}
          />
        </div>

        {/* 错误提示 */}
        {listError && (
          <Alert
            message="加载失败"
            description={listError instanceof Error ? listError.message : '获取SKU列表失败，请稍后重试'}
            type="error"
            showIcon
            closable
            data-testid="sku-list-error"
            action={
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={() => refetch()}
                data-testid="sku-list-retry-button"
              >
                重试
              </Button>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 空状态和表格 */}
        {!listError && !isLoading && (!skuListResponse?.items || skuListResponse.items.length === 0) ? (
          <Empty
            description={
              <span>
                {Object.keys(filters || {}).length > 0
                  ? '没有找到匹配的SKU，请尝试调整筛选条件'
                  : '暂无SKU数据，点击"新建SKU"开始创建'}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            data-testid="sku-list-empty"
          >
            {Object.keys(filters || {}).length === 0 && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreate}
                data-testid="sku-empty-create-button"
              >
                新建SKU
              </Button>
            )}
          </Empty>
        ) : (
          <SkuTable
            data={skuListResponse?.items || []}
            loading={isLoading}
            pagination={{
              current: pagination?.page || 1,
              pageSize: pagination?.pageSize || 20,
              total: skuListResponse?.total || 0,
            }}
            onPaginationChange={handlePaginationChange}
            onSortChange={handleSortChange}
            onView={handleView}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </Card>

      {/* 表单和详情抽屉 */}
      <SkuForm
        open={formDrawerOpen}
        mode={formDrawerMode}
        skuId={formDrawerSkuId || undefined}
        onClose={closeFormDrawer}
        onSuccess={handleFormSuccess}
      />

      <SkuDetail
        open={detailDrawerOpen}
        skuId={detailDrawerSkuId}
        onClose={closeDetailDrawer}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default SkuListPage;

