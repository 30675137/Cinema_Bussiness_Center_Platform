import React, { useState } from 'react';
import { Card, Space, Button, Alert, Drawer } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { InventoryFilters } from '@/components/Inventory/InventoryFilters';
import { InventoryTable } from '@/components/Inventory/InventoryTable';
import { UserRoleSelector } from '@/components/Inventory/UserRoleSelector';
import { PermissionGuard, PermissionHide } from '@/components/Inventory/PermissionGuard';
import { useInventoryLedger, useExportInventory } from '@/hooks/useInventoryData';
import { useResponsivePageSize, useResponsive } from '@/hooks/useResponsive';
import { Permission } from '@/hooks/usePermissions';
import type { InventoryQueryParams, CurrentInventory } from '@/types/inventory';

/**
 * 库存台账页面
 * 用户故事1：库存台账查看与筛选
 */
export const InventoryLedger: React.FC = () => {
  const { isMobile } = useResponsive();
  const defaultPageSize = useResponsivePageSize();
  
  const [filters, setFilters] = useState<Partial<InventoryQueryParams>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRecord, setSelectedRecord] = useState<CurrentInventory | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 获取库存数据
  const { data, isLoading, refetch } = useInventoryLedger({
    ...filters,
    page,
    pageSize,
  });

  // 导出功能
  const exportMutation = useExportInventory();

  const handleFilter = (values: Partial<InventoryQueryParams>) => {
    setFilters(values);
    setPage(1); // 重置到第一页
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
  };

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleViewDetails = (record: CurrentInventory) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const handleExport = () => {
    exportMutation.mutate({
      format: 'excel',
      reportType: 'inventory_ledger',
      ...filters,
    });
  };

  const inventoryData = data?.data || [];
  const pagination = data?.pagination || { current: page, pageSize, total: 0 };

  return (
    <PermissionGuard permissions={Permission.VIEW_INVENTORY}>
      <div style={{ padding: isMobile ? 12 : 24 }}>
        {/* 页面头部 */}
        <Card
          title="库存台账管理"
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
              >
                {!isMobile && '刷新'}
              </Button>
              <PermissionHide permissions={Permission.EXPORT_INVENTORY}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  loading={exportMutation.isPending}
                >
                  {!isMobile && '导出'}
                </Button>
              </PermissionHide>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          {/* 角色选择器（仅用于演示） */}
          <UserRoleSelector />
        </Card>

        {/* 提示信息 */}
        <Alert
          message="提示"
          description="这是前端纯实现的库存台账功能，使用Mock数据进行演示。您可以通过切换角色来体验不同的权限控制。"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />

        {/* 筛选器 */}
        <InventoryFilters
          onFilter={handleFilter}
          onReset={handleReset}
          loading={isLoading}
        />

        {/* 数据表格 */}
        <Card>
          <InventoryTable
            data={inventoryData}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onViewDetails={handleViewDetails}
          />
        </Card>

        {/* 详情抽屉 */}
        <Drawer
          title="库存详情"
          placement="right"
          width={isMobile ? '100%' : 600}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {selectedRecord && (
            <div>
              <p><strong>SKU编码:</strong> {selectedRecord.sku?.skuCode}</p>
              <p><strong>SKU名称:</strong> {selectedRecord.sku?.name}</p>
              <p><strong>门店/仓库:</strong> {selectedRecord.store?.name}</p>
              <p><strong>现存数量:</strong> {selectedRecord.onHandQty}</p>
              <p><strong>可用数量:</strong> {selectedRecord.availableQty}</p>
              <p><strong>预占数量:</strong> {selectedRecord.reservedQty}</p>
              <p><strong>在途数量:</strong> {selectedRecord.inTransitQty}</p>
              <p><strong>安全库存:</strong> {selectedRecord.safetyStock}</p>
            </div>
          )}
        </Drawer>
      </div>
    </PermissionGuard>
  );
};

export default InventoryLedger;
