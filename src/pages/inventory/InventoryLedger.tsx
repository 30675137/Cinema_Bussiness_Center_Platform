/**
 * 库存台账页面
 * 用户故事1的核心页面：库存台账查看与筛选
 */

import React, { useState, useCallback } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Empty, Spin, Button } from 'antd';
import {
  InventoryOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { InventoryLedger } from '@/types/inventory';
import { useInventoryData } from '@/hooks/useInventoryData';
import { usePermissions } from '@/hooks/usePermissions';
import ResponsiveLayout, { StatisticsLayout } from '@/components/Inventory/ResponsiveLayout';
import InventoryFilters from '@/components/Inventory/InventoryFilters';
import InventoryTable from '@/components/Inventory/InventoryTable';
import PermissionGuard from '@/components/Inventory/PermissionGuard';
import UserRoleSelector from '@/components/Inventory/UserRoleSelector';
import AdjustmentModal from '@/components/Inventory/AdjustmentModal';
import InventoryDetailModal from '@/components/Inventory/InventoryDetailModal';
import { useInventoryAdjustment } from '@/hooks/useInventoryAdjustment';
import { getStockStatusConfig, formatCurrency } from '@/utils/inventoryHelpers';

const { Title, Text } = Typography;

const InventoryLedgerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    total,
    isLoading,
    error,
    statistics,
    filters,
    sort,
    pagination,
    updateFilters,
    clearFilters,
    resetFilters,
    updateSort,
    updatePagination,
    refreshData,
    exportData,
    isEmpty,
    hasData,
  } = useInventoryData();

  const { canRead, canExport, canAdjust, canTransfer } = usePermissions();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryLedger | null>(null);
  const [adjustmentVisible, setAdjustmentVisible] = useState(false);
  const [adjustmentItem, setAdjustmentItem] = useState<InventoryLedger | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<InventoryLedger | null>(null);

  // 使用库存调整Hook
  const {
    createAdjustment,
    approveAdjustment,
    executeAdjustment,
    isCreating,
  } = useInventoryAdjustment();

  // 处理查看详情
  const handleViewDetails = useCallback((item: InventoryLedger) => {
    setSelectedItem(item);
    setDetailsVisible(true);
  }, []);

  // 处理库存详情弹窗
  const handleInventoryDetail = useCallback((item: InventoryLedger) => {
    setDetailItem(item);
    setDetailVisible(true);
  }, []);

  // 处理详情弹窗关闭
  const handleDetailCancel = useCallback(() => {
    setDetailVisible(false);
    setDetailItem(null);
  }, []);

  // 处理库存调拨（模拟）
  const handleTransfer = useCallback((item: InventoryLedger) => {
    console.log('库存调拨:', item);
    // TODO: 实现库存调拨功能
  }, []);

  // 处理打印详情（模拟）
  const handlePrint = useCallback((item: InventoryLedger) => {
    console.log('打印详情:', item);
    // TODO: 实现打印功能
  }, []);

  // 处理库存调整
  const handleAdjustment = useCallback((item: InventoryLedger) => {
    setAdjustmentItem(item);
    setAdjustmentVisible(true);
  }, []);

  // 处理调整弹窗取消
  const handleAdjustmentCancel = useCallback(() => {
    setAdjustmentVisible(false);
    setAdjustmentItem(null);
  }, []);

  // 处理调整申请提交
  const handleAdjustmentSubmit = useCallback(async (values: any) => {
    if (!adjustmentItem) return;

    try {
      await createAdjustment(values);
      setAdjustmentVisible(false);
      setAdjustmentItem(null);
      // 刷新库存数据
      refreshData();
    } catch (error) {
      console.error('提交调整申请失败:', error);
    }
  }, [adjustmentItem, createAdjustment, refreshData]);

  // 处理查看流水
  const handleViewMovements = useCallback((item: InventoryLedger) => {
    navigate('/inventory/movements', {
      state: {
        sku: item.sku,
        productName: item.productName,
        locationId: item.locationId,
        locationName: item.locationName,
      }
    });
  }, [navigate]);

  // 处理导出
  const handleExport = useCallback(async () => {
    if (!canExport) {
      return;
    }

    try {
      await exportData();
    } catch (error) {
      console.error('导出失败:', error);
    }
  }, [exportData, canExport]);

  // 渲染统计卡片
  const renderStatistics = () => {
    if (!statistics || isEmpty) return null;

    const statCards = [
      {
        title: '总商品数',
        value: statistics.totalItems,
        icon: <InventoryOutlined />,
        color: '#1890ff',
        precision: 0,
      },
      {
        title: '库存不足',
        value: statistics.lowStockItems,
        icon: <WarningOutlined />,
        color: '#faad14',
        precision: 0,
        suffix: statistics.lowStockRate ? ` (${statistics.lowStockRate}%)` : undefined,
      },
      {
        title: '缺货商品',
        value: statistics.outOfStockItems,
        icon: <CheckCircleOutlined />,
        color: '#f5222d',
        precision: 0,
        suffix: statistics.outOfStockRate ? ` (${statistics.outOfStockRate}%)` : undefined,
      },
      {
        title: '库存总值',
        value: statistics.totalValue,
        icon: <DollarOutlined />,
        color: '#52c41a',
        precision: 2,
        formatter: (value: number) => formatCurrency(value),
      },
    ];

    return (
      <StatisticsLayout columns={4}>
        {statCards.map((stat, index) => (
          <Card key={index} size="small">
            <Statistic
              title={
                <Space>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <Text>{stat.title}</Text>
                </Space>
              }
              value={stat.value}
              precision={stat.precision}
              formatter={stat.formatter}
              suffix={stat.suffix}
              valueStyle={{ color: stat.color }}
            />
          </Card>
        ))}
      </StatisticsLayout>
    );
  };

  // 渲染页面头部
  const renderPageHeader = () => (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Title level={3}>库存台账</Title>
      <Text type="secondary">
        实时库存数据查询和管理，支持多维度筛选和排序
      </Text>
    </Space>
  );

  // 渲染筛选器区域
  const renderFilters = () => (
    <InventoryFilters
      filters={filters}
      onFiltersChange={updateFilters}
      onClear={clearFilters}
      onReset={resetFilters}
      loading={isLoading}
    />
  );

  // 渲染表格区域
  const renderTable = () => {
    if (!canRead) {
      return (
        <Card>
          <Empty
            description="没有权限访问库存数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <Empty
            description="加载失败，请重试"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    if (isEmpty && !isLoading) {
      return (
        <Card>
          <Empty
            description="暂无库存数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <InventoryTable
        data={data}
        loading={isLoading}
        sort={sort}
        pagination={pagination}
        onSortChange={updateSort}
        onPaginationChange={updatePagination}
        onViewDetails={handleViewDetails}
        onAdjustment={handleAdjustment}
        onViewMovements={handleViewMovements}
        onInventoryDetail={handleInventoryDetail}
        onExport={canExport ? handleExport : undefined}
        keyword={filters.keyword}
        refreshData={refreshData}
      />
    );
  };

  // 渲染侧边栏内容
  const renderSidebar = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 用户角色选择器 */}
      <UserRoleSelector showPermissions />

      {/* 快速统计 */}
      {statistics && (
        <Card title="快速统计" size="small">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Row justify="space-between">
              <Col><Text type="secondary">总商品数:</Text></Col>
              <Col><Text strong>{statistics.totalItems}</Text></Col>
            </Row>
            <Row justify="space-between">
              <Col><Text type="secondary">库存不足:</Text></Col>
              <Col><Text type="warning">{statistics.lowStockItems}</Text></Col>
            </Row>
            <Row justify="space-between">
              <Col><Text type="secondary">缺货商品:</Text></Col>
              <Col><Text type="danger">{statistics.outOfStockItems}</Text></Col>
            </Row>
            <Row justify="space-between">
              <Col><Text type="secondary">库存总值:</Text></Col>
              <Col><Text strong>{formatCurrency(statistics.totalValue)}</Text></Col>
            </Row>
          </Space>
        </Card>
      )}
    </Space>
  );

  return (
    <PermissionGuard permission="read">
      <ResponsiveLayout
        title="库存管理"
        subtitle="库存台账查看与筛选"
        siderContent={renderSidebar()}
        filterContent={renderFilters()}
        extra={
          <Space>
            {canAdjust && (
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => navigate('/inventory/adjustments')}
              >
                调整历史
              </Button>
            )}
            <UserRoleSelector compact showCurrentRole />
          </Space>
        }
      >
        <Spin spinning={isLoading && isEmpty}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 统计卡片 */}
            {renderStatistics()}

            {/* 数据表格 */}
            {renderTable()}
          </Space>
        </Spin>

        {/* 库存调整弹窗 */}
        <AdjustmentModal
          visible={adjustmentVisible}
          onCancel={handleAdjustmentCancel}
          mode="create"
          inventoryItem={adjustmentItem}
          onSubmit={handleAdjustmentSubmit}
        />

        {/* 库存详情弹窗 */}
        <InventoryDetailModal
          visible={detailVisible}
          onCancel={handleDetailCancel}
          inventoryItem={detailItem}
          onAdjust={canAdjust ? handleAdjustment : undefined}
          onTransfer={canTransfer ? handleTransfer : undefined}
          onViewMovements={handleViewMovements}
          onPrint={handlePrint}
        />
      </ResponsiveLayout>
    </PermissionGuard>
  );
};

export default InventoryLedgerPage;