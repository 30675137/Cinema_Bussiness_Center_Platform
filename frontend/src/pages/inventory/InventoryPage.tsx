/**
 * P003-inventory-query: 库存查询页面
 * P004-inventory-adjustment: 添加库存调整功能
 * 
 * 提供门店SKU库存列表展示，支持分页和库存调整。
 */

import { useState, useCallback } from 'react';
import { Card, Typography, Empty, Alert, Button, Spin, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useInventoryList } from '@/features/inventory/hooks/useInventory';
import { InventoryTable } from '@/features/inventory/components/InventoryTable';
import { SearchInput } from '@/features/inventory/components/SearchInput';
import { InventoryFilterBar } from '@/features/inventory/components/InventoryFilterBar';
import { InventoryDetailDrawer } from '@/features/inventory/components/InventoryDetailDrawer';
import { AdjustmentModal } from '@/features/inventory/components/AdjustmentModal';
import type { InventoryQueryParams, StoreInventoryItem, InventoryStatus } from '@/features/inventory/types';

const { Title } = Typography;

/**
 * 库存查询页面
 * 
 * User Story 1: 店长能够查看门店所有SKU的当前库存数量
 */
export function InventoryPage() {
  // 查询参数状态
  const [queryParams, setQueryParams] = useState<InventoryQueryParams>({
    page: 1,
    pageSize: 20,
    keyword: '',
  });

  // 详情抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | undefined>(undefined);

  // 调整弹窗状态
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedInventoryForAdjust, setSelectedInventoryForAdjust] = useState<StoreInventoryItem | null>(null);

  // 获取库存列表
  const { data, isLoading, isError, error, refetch } = useInventoryList(queryParams);

  // 分页变化处理
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setQueryParams((prev: InventoryQueryParams) => ({
      ...prev,
      page,
      pageSize,
    }));
  }, []);

  // 搜索关键词变化处理
  const handleSearch = useCallback((keyword: string) => {
    setQueryParams((prev: InventoryQueryParams) => ({
      ...prev,
      keyword,
      page: 1, // 搜索时重置到第一页
    }));
  }, []);

  // 筛选变化处理
  const handleFilterChange = useCallback((filters: {
    storeId?: string;
    statuses?: InventoryStatus[];
    categoryId?: string;
  }) => {
    setQueryParams((prev: InventoryQueryParams) => ({
      ...prev,
      storeId: filters.storeId,
      statuses: filters.statuses,
      categoryId: filters.categoryId,
      page: 1, // 筛选时重置到第一页
    }));
  }, []);

  // 行点击处理（打开详情抽屉）
  const handleRowClick = useCallback((record: StoreInventoryItem) => {
    setSelectedInventoryId(record.id);
    setDrawerOpen(true);
  }, []);

  // 关闭详情抽屉
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setSelectedInventoryId(undefined);
  }, []);

  // 调整按钮点击处理
  const handleAdjustClick = useCallback((record: StoreInventoryItem) => {
    setSelectedInventoryForAdjust(record);
    setAdjustmentModalOpen(true);
  }, []);

  // 关闭调整弹窗
  const handleAdjustmentModalClose = useCallback(() => {
    setAdjustmentModalOpen(false);
    setSelectedInventoryForAdjust(null);
  }, []);

  // 调整成功回调
  const handleAdjustmentSuccess = useCallback(() => {
    setAdjustmentModalOpen(false);
    setSelectedInventoryForAdjust(null);
    // 刷新库存列表
    refetch();
  }, [refetch]);

  // 错误状态
  if (isError) {
    return (
      <Card>
        <Alert
          type="error"
          message="加载失败"
          description={error?.message || '无法加载库存数据，请稍后重试'}
          action={
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  // 空数据状态
  const isEmpty = !isLoading && (!data?.data || data.data.length === 0);

  return (
    <div className="inventory-page">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }} data-testid="page-title">库存查询</Title>
          <Space>
            <SearchInput
              value={queryParams.keyword}
              onChange={handleSearch}
              placeholder="搜索SKU编码/名称"
              style={{ width: 240 }}
            />
          </Space>
        </div>

        {/* 筛选栏 */}
        <InventoryFilterBar onFilterChange={handleFilterChange} />

        {/* 加载中 */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" tip="加载中..." />
          </div>
        )}

        {/* 空状态 */}
        {isEmpty && (
          <Empty
            description="暂无库存数据"
            style={{ padding: 48 }}
          />
        )}

        {/* 库存表格 */}
        {!isLoading && !isEmpty && (
          <InventoryTable
            data={data?.data || []}
            loading={isLoading}
            total={data?.total || 0}
            page={queryParams.page}
            pageSize={queryParams.pageSize}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
            onAdjustClick={handleAdjustClick}
          />
        )}
      </Card>

      {/* 库存详情抽屉 */}
      <InventoryDetailDrawer
        inventoryId={selectedInventoryId}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />

      {/* 库存调整弹窗 */}
      <AdjustmentModal
        open={adjustmentModalOpen}
        inventory={selectedInventoryForAdjust}
        onClose={handleAdjustmentModalClose}
        onSuccess={handleAdjustmentSuccess}
      />
    </div>
  );
}

export default InventoryPage;
