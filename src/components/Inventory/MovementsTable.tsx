/**
 * 库存流水表格组件
 * 提供库存流水数据的展示、排序、选择和操作功能
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Dropdown,
  Modal,
  message,
  Badge,
} from 'antd';
import type {
  ColumnsType,
  TableProps,
  TablePaginationConfig,
} from 'antd/es/table';
import {
  EyeOutlined,
  EditOutlined,
  SettingOutlined,
  ExportOutlined,
  MoreOutlined,
  ReloadOutlined,
  LinkOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import type { InventoryMovement, SortParams, Pagination } from '@types/inventory';
import {
  getMovementTypeConfig,
  formatCurrency,
  formatDate,
  formatNumber,
  highlightSearchText,
} from '@/utils/inventoryHelpers';
import { useResponsive } from '@/hooks/useResponsive';
import { usePermissions } from '@/hooks/usePermissions';

const { Text, Link } = Typography;

interface MovementsTableProps {
  data: InventoryMovement[];
  loading: boolean;
  sort: SortParams;
  pagination: Pagination;
  onSortChange: (sort: SortParams) => void;
  onPaginationChange: (pagination: Partial<Pagination>) => void;
  onExport?: () => void;
  onViewDetails?: (item: InventoryMovement) => void;
  onReverse?: (item: InventoryMovement) => void;
  selectedRowKeys?: React.Key[];
  selectedRows?: string[];
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: string[]) => void;
  keyword?: string;
  refreshData?: () => void;
}

// 表格列配置
const MovementsTable: React.FC<MovementsTableProps> = ({
  data,
  loading,
  sort,
  pagination,
  onSortChange,
  onPaginationChange,
  onExport,
  onViewDetails,
  onReverse,
  selectedRowKeys = [],
  selectedRows = [],
  onSelectionChange,
  keyword,
  refreshData,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { canRead, canWrite, canAdjust, canExport } = usePermissions();
  const [columnSettings, setColumnSettings] = useState({
    showCostPrice: true,
    showTotalValue: true,
    showBalanceBefore: true,
    showReference: true,
    showBatchNo: true,
  });

  // 自定义列管理
  const handleColumnSettingsChange = useCallback((key: string, checked: boolean) => {
    setColumnSettings(prev => ({
      ...prev,
      [key]: checked,
    }));
  }, []);

  // 排序处理
  const handleTableChange = useCallback((
    newPagination: TablePaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    if (sorter.field) {
      onSortChange({
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
      });
    }

    if (newPagination.current !== pagination.current || newPagination.pageSize !== pagination.pageSize) {
      onPaginationChange({
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      });
    }
  }, [sort, pagination, onSortChange, onPaginationChange]);

  // 选择处理
  const handleRowSelection = useCallback((selectedRowKeys: React.Key[], selectedRows: any[]) => {
    const selectedIds = selectedRows.map((row: InventoryMovement) => row.id);
    onSelectionChange?.(selectedRowKeys, selectedIds);
  }, [onSelectionChange]);

  // 渲染变动类型标签
  const renderMovementType = useCallback((type: string, subtype: string) => {
    const config = getMovementTypeConfig(type);
    return (
      <Space direction="vertical" size="small">
        <Tag color={config.color}>
          {config.prefix}{config.text}
        </Tag>
        {subtype && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {subtype}
          </Text>
        )}
      </Space>
    );
  }, []);

  // 渲染状态标签
  const renderStatus = useCallback((status: string) => {
    const statusConfig = {
      pending: { color: 'warning', text: '待确认' },
      confirmed: { color: 'processing', text: '已确认' },
      completed: { color: 'success', text: '已完成' },
      cancelled: { color: 'default', text: '已取消' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config?.color}>
        {config?.text || status}
      </Tag>
    );
  }, []);

  // 渲染数量列
  const renderQuantity = useCallback((quantity: number, record: InventoryMovement) => {
    const typeConfig = getMovementTypeConfig(record.movementType);
    const isNegative = quantity < 0;
    const absQuantity = Math.abs(quantity);

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text strong style={{ color: isNegative ? '#f5222d' : '#52c41a' }}>
          {typeConfig.prefix}{formatNumber(absQuantity)}
        </Text>
        {record.balanceBefore !== undefined && record.balanceAfter !== undefined && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.balanceBefore} → {record.balanceAfter}
          </Text>
        )}
      </Space>
    );
  }, []);

  // 渲染货币金额
  const renderCurrency = useCallback((amount: number) => (
    <Text>{formatCurrency(amount)}</Text>
  ), []);

  // 渲染时间
  const renderDateTime = useCallback((dateString: string) => (
    <Space direction="vertical" size="small">
      <Text>{formatDate(dateString, 'MM-DD HH:mm')}</Text>
      <Text type="secondary" style={{ fontSize: '12px' }}>
        {formatDate(dateString, 'YYYY-MM-DD')}
      </Text>
    </Space>
  ), []);

  // 渲染高亮搜索文本
  const renderHighlightText = useCallback((text: string) => {
    if (!keyword) return text;
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: highlightSearchText(text, keyword),
        }}
      />
    );
  }, [keyword]);

  // 渲染单据号链接
  const renderReferenceNo = useCallback((item: InventoryMovement) => {
    if (!item.referenceNo) return '-';

    return (
      <Link
        onClick={() => onViewDetails?.(item)}
        style={{ cursor: 'pointer' }}
      >
        {item.referenceNo}
      </Link>
    );
  }, [onViewDetails]);

  // 渲染操作列
  const renderActions = useCallback((record: InventoryMovement) => {
    const items = [
      {
        key: 'view',
        label: '查看详情',
        icon: <EyeOutlined />,
        onClick: () => onViewDetails?.(record),
      },
    ];

    if (record.referenceNo) {
      items.push({
        key: 'reference',
        label: '查看单据',
        icon: <LinkOutlined />,
        onClick: () => onViewDetails?.(record),
      });
    }

    if (canAdjust && !record.isReversed && record.status === 'completed') {
      items.push({
        key: 'reverse',
        label: '冲销',
        icon: <RollbackOutlined />,
        onClick: () => onReverse?.(record),
        danger: true,
      });
    }

    return (
      <Space>
        <Tooltip title="查看详情">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails?.(record)}
          />
        </Tooltip>
        <Dropdown
          menu={{ items }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="link"
            size="small"
            icon={<MoreOutlined />}
          />
        </Dropdown>
      </Space>
    );
  }, [canAdjust, onViewDetails, onReverse]);

  // 基础列配置
  const baseColumns: ColumnsType<InventoryMovement> = [
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 150,
      fixed: 'left',
      render: renderDateTime,
      sorter: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: renderHighlightText,
      sorter: true,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{renderHighlightText(text)}</Text>
          {record.categoryName && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.categoryName}
            </Text>
          )}
        </Space>
      ),
      sorter: true,
    },
    {
      title: '仓库',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 100,
      render: renderHighlightText,
      sorter: true,
    },
    {
      title: '变动类型',
      dataIndex: 'movementType',
      key: 'movementType',
      width: 150,
      render: (type, record) => renderMovementType(type, record.movementSubtype),
      sorter: true,
    },
    {
      title: '变动数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      align: 'right',
      render: renderQuantity,
      sorter: true,
    },
    {
      title: '变动前余额',
      dataIndex: 'balanceBefore',
      key: 'balanceBefore',
      width: 120,
      align: 'right',
      render: quantity => <Text>{formatNumber(quantity)}</Text>,
      sorter: true,
      hidden: !columnSettings.showBalanceBefore,
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 100,
      align: 'right',
      render: renderCurrency,
      sorter: true,
      hidden: !columnSettings.showCostPrice,
    },
    {
      title: '总价值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right',
      render: renderCurrency,
      sorter: true,
      hidden: !columnSettings.showTotalValue,
    },
    {
      title: '单据类型',
      dataIndex: 'referenceType',
      key: 'referenceType',
      width: 100,
      render: (type) => {
        const typeMap: Record<string, string> = {
          purchase_order: '采购订单',
          sales_order: '销售订单',
          transfer_order: '调拨单',
          adjustment_order: '调整单',
          stocktaking_order: '盘点单',
          return_order: '退货单',
        };
        return typeMap[type] || type;
      },
      hidden: !columnSettings.showReference,
    },
    {
      title: '单据号',
      dataIndex: 'referenceNo',
      key: 'referenceNo',
      width: 140,
      render: (_, record) => renderReferenceNo(record),
      hidden: !columnSettings.showReference,
    },
    {
      title: '批次号',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 100,
      hidden: !columnSettings.showBatchNo,
    },
    {
      title: '操作员',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100,
      render: renderHighlightText,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: renderStatus,
      sorter: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => renderActions(record),
    },
  ].filter(column => !column.hidden);

  // 响应式列配置
  const columns = useMemo(() => {
    if (isMobile) {
      // 移动端只显示关键列
      return baseColumns.filter(col => [
        'operationTime',
        'productName',
        'movementType',
        'quantity',
        'actions',
      ].includes(col.key as string));
    }

    if (isTablet) {
      // 平板端隐藏部分列
      return baseColumns.filter(col => ![
        'costPrice',
        'totalValue',
        'balanceBefore',
        'batchId',
      ].includes(col.key as string));
    }

    return baseColumns;
  }, [baseColumns, isMobile, isTablet]);

  // 列设置菜单
  const columnSettingsItems = [
    {
      key: 'costPrice',
      label: '成本价',
      checked: columnSettings.showCostPrice,
    },
    {
      key: 'totalValue',
      label: '总价值',
      checked: columnSettings.showTotalValue,
    },
    {
      key: 'balanceBefore',
      label: '变动前余额',
      checked: columnSettings.showBalanceBefore,
    },
    {
      key: 'reference',
      label: '单据信息',
      checked: columnSettings.showReference,
    },
    {
      key: 'batchNo',
      label: '批次号',
      checked: columnSettings.showBatchNo,
    },
  ];

  // 表格工具栏
  const TableToolbar = () => (
    <Space>
      {refreshData && (
        <Tooltip title="刷新数据">
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
          />
        </Tooltip>
      )}
      {canExport && onExport && (
        <Button
          icon={<ExportOutlined />}
          onClick={onExport}
        >
          导出
        </Button>
      )}
      <Dropdown
        menu={{
          items: columnSettingsItems.map(item => ({
            key: item.key,
            label: item.label,
            onClick: () => handleColumnSettingsChange(item.key, !item.checked),
          })),
        }}
        trigger={['click']}
      >
        <Button icon={<SettingOutlined />}>
          列设置
        </Button>
      </Dropdown>
    </Space>
  );

  // 表格配置
  const tableConfig: TableProps<InventoryMovement> = {
    columns,
    dataSource: data,
    loading,
    rowKey: 'id',
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
      pageSizeOptions: ['10', '20', '50', '100'],
      size: isMobile ? 'small' : 'default',
    },
    onChange: handleTableChange,
    scroll: {
      x: columns.reduce((width, col) => width + (col.width || 120), 0),
      y: isMobile ? undefined : 600,
    },
    size: isMobile ? 'small' : 'middle',
    bordered: true,
    rowSelection: onSelectionChange ? {
      selectedRowKeys,
      onChange: handleRowSelection,
      getCheckboxProps: (record: InventoryMovement) => ({
        disabled: !canRead || record.status === 'cancelled',
      }),
    } : undefined,
    title: () => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Text strong>库存流水</Text>
          {selectedRowKeys.length > 0 && (
            <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#52c41a' }} />
          )}
        </Space>
        <TableToolbar />
      </div>
    ),
    rowClassName: (record) => {
      if (record.status === 'cancelled') return 'cancelled-row';
      if (record.isReversed) return 'reversed-row';
      return '';
    },
  };

  return <Table {...tableConfig} />;
};

export default MovementsTable;