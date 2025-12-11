/**
 * 库存流水页面
 * 用户故事2的核心页面：库存流水追踪与对账
 */

import React, { useState, useCallback } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Empty, Spin, Modal, Descriptions, Tag } from 'antd';
import {
  HistoryOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  SettingOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { InventoryMovement } from '@types/inventory';
import ResponsiveLayout, { StatisticsLayout } from '@/components/Inventory/ResponsiveLayout';
import MovementsFilters from '@/components/Inventory/MovementsFilters';
import MovementsTable from '@/components/Inventory/MovementsTable';
import PermissionGuard from '@/components/Inventory/PermissionGuard';
import UserRoleSelector from '@/components/Inventory/UserRoleSelector';
import { inventoryMockService } from '@/services/inventoryMockData';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { usePermissions } from '@/hooks/usePermissions';

const { Title, Text, Paragraph } = Typography;

const InventoryMovementsPage: React.FC = () => {
  const { withErrorHandling, handleBusinessError, handleNetworkError } = useErrorHandling();
  const { canRead, canExport, canAdjust } = usePermissions();
  const [data, setData] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});
  const [sort, setSort] = useState({ sortBy: 'operationTime', sortOrder: 'desc' });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryMovement | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 获取流水数据
  const fetchMovements = useCallback(async (params?: any) => {
    if (!canRead) return;

    setLoading(true);
    try {
      const response = await inventoryMockService.getInventoryMovements({
        current: pagination.current,
        pageSize: pagination.pageSize,
        filters: params?.filters || filters,
        sort: params?.sort || sort,
      });

      setData(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('权限')) {
          handleBusinessError('没有权限访问库存流水', { action: 'get_movements' });
        } else if (error.message.includes('网络')) {
          handleNetworkError(error, { action: 'get_movements' });
        } else {
          handleBusinessError('获取库存流水失败', { action: 'get_movements', error });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [canRead, filters, sort, pagination, handleBusinessError, handleNetworkError]);

  // 获取统计数据
  const fetchStatistics = useCallback(async () => {
    if (!canRead) return;

    try {
      const stats = await inventoryMockService.getMovementsStatistics(filters);
      setStatistics(stats);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }, [canRead, filters]);

  // 初始化数据
  React.useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // 获取统计数据
  React.useEffect(() => {
    if (data.length > 0) {
      fetchStatistics();
    }
  }, [data, fetchStatistics]);

  // 处理筛选条件变化
  const handleFiltersChange = useCallback((newFilters: any) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchMovements({ filters: updatedFilters });
  }, [filters, fetchMovements]);

  // 处理排序变化
  const handleSortChange = useCallback((newSort: any) => {
    setSort(newSort);
    fetchMovements({ sort: newSort });
  }, [fetchMovements]);

  // 处理分页变化
  const handlePaginationChange = useCallback((newPagination: any) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
    fetchMovements({ pagination: newPagination });
  }, [fetchMovements]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    fetchMovements();
    fetchStatistics();
  }, [fetchMovements, fetchStatistics]);

  // 处理导出
  const handleExport = useCallback(async () => {
    if (!canExport) return;

    await withErrorHandling(
      async () => {
        const blob = await inventoryMockService.exportInventoryMovements(filters);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `库存流水_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        return true;
      },
      'data',
      {
        loadingMessage: '正在导出数据...',
        errorType: 'business' as const,
        errorSeverity: 'medium' as const,
        context: { action: 'export_movements' },
      }
    );
  }, [canExport, filters, withErrorHandling]);

  // 处理查看详情
  const handleViewDetails = useCallback((item: InventoryMovement) => {
    setSelectedItem(item);
    setDetailsVisible(true);
  }, []);

  // 处理冲销
  const handleReverse = useCallback(async (item: InventoryMovement) => {
    Modal.confirm({
      title: '确认冲销',
      content: (
        <div>
          <Paragraph>
            确定要冲销这条流水记录吗？
          </Paragraph>
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="SKU">{item.sku}</Descriptions.Item>
            <Descriptions.Item label="商品名称">{item.productName}</Descriptions.Item>
            <Descriptions.Item label="变动数量">{item.quantity}</Descriptions.Item>
            <Descriptions.Item label="操作时间">{item.operationTime}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
      onOk: async () => {
        await withErrorHandling(
          async () => {
            // 模拟冲销操作
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('冲销成功');
            handleRefresh();
            return true;
          },
          'data',
          {
            loadingMessage: '正在冲销...',
            errorType: 'business' as const,
            errorSeverity: 'high' as const,
            context: { action: 'reverse_movement', item },
          }
        );
      },
    });
  }, [handleRefresh, withErrorHandling]);

  // 渲染统计卡片
  const renderStatistics = () => {
    if (!statistics) return null;

    const statCards = [
      {
        title: '总流水记录',
        value: statistics.totalMovements,
        icon: <HistoryOutlined />,
        color: '#1890ff',
        precision: 0,
      },
      {
        title: '入库记录',
        value: statistics.inboundMovements,
        icon: <ArrowUpOutlined />,
        color: '#52c41a',
        precision: 0,
      },
      {
        title: '出库记录',
        value: statistics.outboundMovements,
        icon: <ArrowDownOutlined />,
        color: '#f5222d',
        precision: 0,
      },
      {
        title: '调拨记录',
        value: statistics.transferMovements,
        icon: <SwapOutlined />,
        color: '#722ed1',
        precision: 0,
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
      <Title level={3}>库存流水</Title>
      <Text type="secondary">
        库存变动历史记录追踪，支持时间范围筛选、单据类型筛选
      </Text>
    </Space>
  );

  // 渲染筛选器区域
  const renderFilters = () => (
    <MovementsFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onClear={() => handleFiltersChange({})}
      onReset={() => {
        setFilters({});
        setPagination({ current: 1, pageSize: 20, total: 0 });
        fetchMovements({ filters: {} });
      }}
      loading={loading}
    />
  );

  // 渲染表格区域
  const renderTable = () => {
    if (!canRead) {
      return (
        <Card>
          <Empty
            description="没有权限访问库存流水数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      );
    }

    return (
      <MovementsTable
        data={data}
        loading={loading}
        sort={sort}
        pagination={pagination}
        onSortChange={handleSortChange}
        onPaginationChange={handlePaginationChange}
        onExport={canExport ? handleExport : undefined}
        onViewDetails={handleViewDetails}
        onReverse={canAdjust ? handleReverse : undefined}
        selectedRowKeys={selectedRowKeys}
        selectedRows={data.filter(item => selectedRowKeys.includes(item.id)).map(item => item.id)}
        onSelectionChange={setSelectedRowKeys}
        keyword={filters.keyword}
        refreshData={handleRefresh}
      />
    );
  };

  // 渲染详情弹窗
  const renderDetailsModal = () => (
    <Modal
      title="流水详情"
      open={detailsVisible}
      onCancel={() => setDetailsVisible(false)}
      footer={null}
      width={800}
    >
      {selectedItem && (
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="流水ID">{selectedItem.id}</Descriptions.Item>
          <Descriptions.Item label="事务ID">{selectedItem.transactionId}</Descriptions.Item>
          <Descriptions.Item label="SKU">{selectedItem.sku}</Descriptions.Item>
          <Descriptions.Item label="商品名称">{selectedItem.productName}</Descriptions.Item>
          <Descriptions.Item label="商品类别">{selectedItem.categoryName || '-'}</Descriptions.Item>
          <Descriptions.Item label="仓库">{selectedItem.locationName}</Descriptions.Item>
          <Descriptions.Item label="变动类型">
            <Tag color={selectedItem.movementType.includes('in') || selectedItem.movementType.includes('positive') ? 'green' : 'red'}>
              {selectedItem.movementSubtype}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="变动数量">
            <Text strong style={{ color: selectedItem.quantity > 0 ? '#52c41a' : '#f5222d' }}>
              {selectedItem.quantity > 0 ? '+' : ''}{selectedItem.quantity}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="变动前余额">{selectedItem.balanceBefore}</Descriptions.Item>
          <Descriptions.Item label="变动后余额">{selectedItem.balanceAfter}</Descriptions.Item>
          <Descriptions.Item label="成本价">{selectedItem.costPrice ? `¥${selectedItem.costPrice}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="总价值">{selectedItem.totalValue ? `¥${selectedItem.totalValue}` : '-'}</Descriptions.Item>
          <Descriptions.Item label="单据类型">{selectedItem.referenceType}</Descriptions.Item>
          <Descriptions.Item label="单据号">{selectedItem.referenceNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="操作员">{selectedItem.operatorName}</Descriptions.Item>
          <Descriptions.Item label="操作时间">{selectedItem.operationTime}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={
              selectedItem.status === 'completed' ? 'green' :
              selectedItem.status === 'confirmed' ? 'blue' :
              selectedItem.status === 'pending' ? 'orange' : 'default'
            }>
              {selectedItem.status === 'completed' ? '已完成' :
               selectedItem.status === 'confirmed' ? '已确认' :
               selectedItem.status === 'pending' ? '待确认' : selectedItem.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="是否冲销">{selectedItem.isReversed ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{selectedItem.remark || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间" span={2}>{selectedItem.createdAt}</Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  return (
    <PermissionGuard permission="read">
      <ResponsiveLayout
        title="库存管理"
        subtitle="库存流水追踪与对账"
        extra={
          <Space>
            <UserRoleSelector compact showCurrentRole />
          </Space>
        }
      >
        <Spin spinning={loading && data.length === 0}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 统计卡片 */}
            {renderStatistics()}

            {/* 数据表格 */}
            {renderTable()}
          </Space>
        </Spin>

        {/* 详情弹窗 */}
        {renderDetailsModal()}
      </ResponsiveLayout>
    </PermissionGuard>
  );
};

export default InventoryMovementsPage;