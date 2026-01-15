/**
 * 库存调整历史页面
 * 提供库存调整记录的查看、筛选和管理功能
 */

import React, { useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Empty, Spin, Button } from 'antd';
import {
  HistoryOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { InventoryAdjustment } from '@/types/inventory';
import { useInventoryAdjustment } from '@/hooks/useInventoryAdjustment';
import { usePermissions } from '@/hooks/usePermissions';
import ResponsiveLayout, { StatisticsLayout } from '@/components/Inventory/ResponsiveLayout';
import AdjustmentFilters from '@/components/Inventory/AdjustmentFilters';
import AdjustmentTable from '@/components/Inventory/AdjustmentTable';
import PermissionGuard from '@/components/Inventory/PermissionGuard';
import UserRoleSelector from '@/components/Inventory/UserRoleSelector';
import { formatNumber, formatCurrency } from '@/utils/inventoryHelpers';

const { Title, Text } = Typography;

const InventoryAdjustmentsPage: React.FC = () => {
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
    approveAdjustment,
    executeAdjustment,
    isEmpty,
    hasData,
    isApproving,
    isExecuting,
  } = useInventoryAdjustment();

  const { canRead, canExport, canAdmin } = usePermissions();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<InventoryAdjustment | null>(null);

  // 处理查看详情
  const handleViewDetails = useCallback((adjustment: InventoryAdjustment) => {
    setSelectedAdjustment(adjustment);
    setDetailsVisible(true);
  }, []);

  // 处理审批
  const handleApprove = useCallback(
    async (adjustment: InventoryAdjustment, approved: boolean, remark?: string) => {
      try {
        await approveAdjustment(adjustment.id, approved, remark);
        // 刷新数据
        refreshData();
      } catch (error) {
        console.error('审批失败:', error);
      }
    },
    [approveAdjustment, refreshData]
  );

  // 处理执行
  const handleExecute = useCallback(
    async (adjustment: InventoryAdjustment) => {
      try {
        await executeAdjustment(adjustment.id, '当前操作员');
        // 刷新数据
        refreshData();
      } catch (error) {
        console.error('执行失败:', error);
      }
    },
    [executeAdjustment, refreshData]
  );

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

  // 返回库存台账
  const handleBackToLedger = useCallback(() => {
    navigate('/inventory/ledger');
  }, [navigate]);

  // 渲染统计卡片
  const renderStatistics = () => {
    if (!statistics || isEmpty) return null;

    const statCards = [
      {
        title: '总申请数',
        value: statistics.totalApplications,
        icon: <FileTextOutlined />,
        color: '#1890ff',
        precision: 0,
      },
      {
        title: '待审批',
        value: statistics.pendingApplications,
        icon: <ClockCircleOutlined />,
        color: '#faad14',
        precision: 0,
        suffix: statistics.pendingRate ? ` (${statistics.pendingRate}%)` : undefined,
      },
      {
        title: '已批准',
        value: statistics.approvedApplications,
        icon: <CheckCircleOutlined />,
        color: '#52c41a',
        precision: 0,
        suffix: statistics.approvedRate ? ` (${statistics.approvedRate}%)` : undefined,
      },
      {
        title: '总调整量',
        value: statistics.totalAdjustmentQuantity,
        icon: <HistoryOutlined />,
        color: '#722ed1',
        precision: 0,
        suffix: '件',
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
      <Title level={3}>库存调整历史</Title>
      <Text type="secondary">查看和管理所有库存调整申请记录，支持审批和执行操作</Text>
    </Space>
  );

  // 渲染筛选器区域
  const renderFilters = () => (
    <AdjustmentFilters
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
          <Empty description="没有权限访问调整数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <Empty description="加载失败，请重试" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Card>
      );
    }

    if (isEmpty && !isLoading) {
      return (
        <Card>
          <Empty description="暂无调整记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Card>
      );
    }

    return (
      <AdjustmentTable
        data={data}
        loading={isLoading}
        sort={sort}
        pagination={pagination}
        onSortChange={updateSort}
        onPaginationChange={updatePagination}
        onViewDetails={handleViewDetails}
        onApprove={canAdmin ? handleApprove : undefined}
        onExecute={canAdmin ? handleExecute : undefined}
        onExport={canExport ? handleExport : undefined}
        refreshData={refreshData}
        isApproving={isApproving}
        isExecuting={isExecuting}
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
              <Col>
                <Text type="secondary">总申请数:</Text>
              </Col>
              <Col>
                <Text strong>{statistics.totalApplications}</Text>
              </Col>
            </Row>
            <Row justify="space-between">
              <Col>
                <Text type="secondary">待审批:</Text>
              </Col>
              <Col>
                <Text type="warning">{statistics.pendingApplications}</Text>
              </Col>
            </Row>
            <Row justify="space-between">
              <Col>
                <Text type="secondary">已批准:</Text>
              </Col>
              <Col>
                <Text type="success">{statistics.approvedApplications}</Text>
              </Col>
            </Row>
            <Row justify="space-between">
              <Col>
                <Text type="secondary">总调整量:</Text>
              </Col>
              <Col>
                <Text strong>{formatNumber(statistics.totalAdjustmentQuantity)} 件</Text>
              </Col>
            </Row>
          </Space>
        </Card>
      )}

      {/* 快捷操作 */}
      <Card title="快捷操作" size="small">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button block icon={<ReloadOutlined />} onClick={refreshData} loading={isLoading}>
            刷新数据
          </Button>
          {canExport && (
            <Button block icon={<ExportOutlined />} onClick={handleExport} disabled={isEmpty}>
              导出数据
            </Button>
          )}
          <Button block onClick={handleBackToLedger}>
            返回库存台账
          </Button>
        </Space>
      </Card>
    </Space>
  );

  return (
    <PermissionGuard permission="read">
      <ResponsiveLayout
        title="库存调整历史"
        subtitle="查看和管理库存调整申请记录"
        siderContent={renderSidebar()}
        filterContent={renderFilters()}
        extra={
          <Space>
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
      </ResponsiveLayout>
    </PermissionGuard>
  );
};

export default InventoryAdjustmentsPage;
