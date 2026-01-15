import React, { useState } from 'react';
import { Card, Space, Button, Alert, Drawer, Descriptions, Tag } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { MovementsFilters } from '@/components/Inventory/MovementsFilters';
import { MovementsTable } from '@/components/Inventory/MovementsTable';
import { UserRoleSelector } from '@/components/Inventory/UserRoleSelector';
import { PermissionGuard, PermissionHide } from '@/components/Inventory/PermissionGuard';
import { useInventoryMovements } from '@/hooks/useInventoryMovements';
import { useExportInventory } from '@/hooks/useInventoryData';
import { useResponsivePageSize, useResponsive } from '@/hooks/useResponsive';
import { Permission } from '@/hooks/usePermissions';
import type { InventoryQueryParams, TransactionDetail } from '@/types/inventory';
import {
  formatDateTime,
  formatQuantity,
  formatCurrency,
  getTransactionTypeLabel,
  getSourceTypeLabel,
} from '@/utils/inventoryHelpers';

/**
 * 库存流水页面
 * 用户故事2：库存流水追踪与对账
 */
export const InventoryMovements: React.FC = () => {
  const { isMobile } = useResponsive();
  const defaultPageSize = useResponsivePageSize();

  const [filters, setFilters] = useState<Partial<InventoryQueryParams>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRecord, setSelectedRecord] = useState<TransactionDetail | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 获取流水数据
  const { data, isLoading, refetch } = useInventoryMovements({
    ...filters,
    page,
    pageSize,
    sortBy: 'transactionTime',
    sortOrder: 'desc',
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

  const handleViewDetails = (record: TransactionDetail) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const handleExport = () => {
    exportMutation.mutate({
      format: 'excel',
      reportType: 'inventory_movements',
      ...filters,
    });
  };

  const movementsData = data?.data || [];
  const pagination = data?.pagination || { current: page, pageSize, total: 0 };

  return (
    <PermissionGuard permissions={Permission.VIEW_MOVEMENTS}>
      <div style={{ padding: isMobile ? 12 : 24 }}>
        {/* 页面头部 */}
        <Card
          title="库存流水追踪"
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                {!isMobile && '刷新'}
              </Button>
              <PermissionHide permissions={Permission.EXPORT_MOVEMENTS}>
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
          description="库存流水记录了所有库存变动历史，包括入库、出库、调拨、盘点等操作。您可以通过筛选条件快速查找特定的流水记录。"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />

        {/* 筛选器 */}
        <MovementsFilters onFilter={handleFilter} onReset={handleReset} loading={isLoading} />

        {/* 数据表格 */}
        <Card>
          <MovementsTable
            data={movementsData}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onViewDetails={handleViewDetails}
          />
        </Card>

        {/* 详情抽屉 */}
        <Drawer
          title="流水详情"
          placement="right"
          width={isMobile ? '100%' : 720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {selectedRecord && (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="交易时间">
                {formatDateTime(selectedRecord.transactionTime)}
              </Descriptions.Item>
              <Descriptions.Item label="SKU编码">{selectedRecord.sku?.skuCode}</Descriptions.Item>
              <Descriptions.Item label="SKU名称">{selectedRecord.sku?.name}</Descriptions.Item>
              <Descriptions.Item label="门店/仓库">{selectedRecord.store?.name}</Descriptions.Item>
              <Descriptions.Item label="交易类型">
                {(() => {
                  const { label, color } = getTransactionTypeLabel(selectedRecord.transactionType);
                  return <Tag color={color}>{label}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="变动数量">
                <span style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {formatQuantity(selectedRecord.quantity, selectedRecord.sku?.unit)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="库存前">
                {formatQuantity(selectedRecord.stockBefore, selectedRecord.sku?.unit)}
              </Descriptions.Item>
              <Descriptions.Item label="库存后">
                {formatQuantity(selectedRecord.stockAfter, selectedRecord.sku?.unit)}
              </Descriptions.Item>
              <Descriptions.Item label="可用库存前">
                {formatQuantity(selectedRecord.availableBefore, selectedRecord.sku?.unit)}
              </Descriptions.Item>
              <Descriptions.Item label="可用库存后">
                {formatQuantity(selectedRecord.availableAfter, selectedRecord.sku?.unit)}
              </Descriptions.Item>
              {selectedRecord.unitCost && (
                <Descriptions.Item label="单价">
                  {formatCurrency(selectedRecord.unitCost)}
                </Descriptions.Item>
              )}
              {selectedRecord.totalCost && (
                <Descriptions.Item label="总价">
                  {formatCurrency(selectedRecord.totalCost)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="来源类型">
                {(() => {
                  const { label, color } = getSourceTypeLabel(selectedRecord.sourceType);
                  return <Tag color={color}>{label}</Tag>;
                })()}
              </Descriptions.Item>
              {selectedRecord.sourceDocument && (
                <Descriptions.Item label="单据号">
                  {selectedRecord.sourceDocument}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="操作人">{selectedRecord.operator?.name}</Descriptions.Item>
              {selectedRecord.batchNumber && (
                <Descriptions.Item label="批次号">{selectedRecord.batchNumber}</Descriptions.Item>
              )}
              {selectedRecord.remarks && (
                <Descriptions.Item label="备注">{selectedRecord.remarks}</Descriptions.Item>
              )}
              <Descriptions.Item label="创建时间">
                {formatDateTime(selectedRecord.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Drawer>
      </div>
    </PermissionGuard>
  );
};

export default InventoryMovements;
