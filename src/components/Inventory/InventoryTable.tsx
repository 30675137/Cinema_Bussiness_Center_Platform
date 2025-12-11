/**
 * 库存台账表格组件
 * 提供库存数据的展示、排序、选择和操作功能
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
  Drawer,
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
  HistoryOutlined,
} from '@ant-design/icons';
import type { InventoryLedger, SortParams, Pagination } from '@types/inventory';
import {
  getStockStatusConfig,
  formatCurrency,
  formatDate,
  formatNumber,
  highlightSearchText,
} from '@/utils/inventoryHelpers';
import { useResponsive } from '@/hooks/useResponsive';
import { usePermissions } from '@/hooks/usePermissions';

const { Text } = Typography;

interface InventoryTableProps {
  data: InventoryLedger[];
  loading: boolean;
  sort: SortParams;
  pagination: Pagination;
  onSortChange: (sort: SortParams) => void;
  onPaginationChange: (pagination: Partial<Pagination>) => void;
  onViewDetails: (item: InventoryLedger) => void;
  onAdjustment?: (item: InventoryLedger) => void;
  onViewMovements?: (item: InventoryLedger) => void;
  onInventoryDetail?: (item: InventoryLedger) => void;
  onExport?: () => void;
  selectedRowKeys?: React.Key[];
  selectedRows?: string[];
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: string[]) => void;
  keyword?: string;
  refreshData?: () => void;
}

// 表格列配置
const InventoryTable: React.FC<InventoryTableProps> = ({
  data,
  loading,
  sort,
  pagination,
  onSortChange,
  onPaginationChange,
  onViewDetails,
  onAdjustment,
  onViewMovements,
  onInventoryDetail,
  onExport,
  selectedRowKeys = [],
  selectedRows = [],
  onSelectionChange,
  keyword,
  refreshData,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { canRead, canAdjust, canExport } = usePermissions();
  const [columnSettings, setColumnSettings] = useState({
    showCostPrice: true,
    showTotalValue: true,
    showInTransit: true,
    showReserved: true,
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
    const selectedIds = selectedRows.map((row: InventoryLedger) => row.id);
    onSelectionChange?.(selectedRowKeys, selectedIds);
  }, [onSelectionChange]);

  // 渲染库存状态标签
  const renderStockStatus = useCallback((status: string) => {
    const config = getStockStatusConfig(status);
    return (
      <Tag color={config.color}>
        {config.text}
      </Tag>
    );
  }, []);

  // 渲染数量列
  const renderQuantity = useCallback((quantity: number, record: InventoryLedger) => {
    const status = getStockStatusConfig(record.stockStatus);
    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text strong>{formatNumber(quantity)}</Text>
        {quantity <= record.safetyStock && (
          <Text type="danger" style={{ fontSize: '12px' }}>
            低于安全库存 ({record.safetyStock})
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
    <Text style={{ fontSize: '12px' }}>
      {formatDate(dateString, 'MM-DD HH:mm')}
    </Text>
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

  // 操作列配置
  const renderActions = useCallback((record: InventoryLedger) => {
    const items = [
      {
        key: 'view',
        label: '查看详情',
        icon: <EyeOutlined />,
        onClick: () => onViewDetails(record),
      },
    ];

    if (canAdjust) {
      items.push({
        key: 'adjust',
        label: '库存调整',
        icon: <EditOutlined />,
        onClick: () => onAdjustment?.(record),
      });
    }

    return (
      <Space>
        <Tooltip title="查看详情">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
          />
        </Tooltip>
        {canAdjust && (
          <Tooltip title="库存调整">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onAdjustment?.(record)}
            />
          </Tooltip>
        )}
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
  }, [canAdjust, onViewDetails, onAdjustment]);

  // 基础列配置
  const baseColumns: ColumnsType<InventoryLedger> = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      fixed: 'left',
      render: renderHighlightText,
      sorter: true,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      fixed: 'left',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{renderHighlightText(text)}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.categoryName}
          </Text>
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
    },
    {
      title: '现存库存',
      dataIndex: 'physicalQuantity',
      key: 'physicalQuantity',
      width: 120,
      align: 'right',
      render: renderQuantity,
      sorter: true,
    },
    {
      title: '可用库存',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 120,
      align: 'right',
      render: (quantity, record) => (
        <Text type={quantity <= record.safetyStock ? 'danger' : undefined}>
          {formatNumber(quantity)}
        </Text>
      ),
      sorter: true,
    },
    {
      title: '预占库存',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 120,
      align: 'right',
      render: quantity => (
        <Text type="warning">{formatNumber(quantity)}</Text>
      ),
      sorter: true,
      hidden: !columnSettings.showReserved,
    },
    {
      title: '在途库存',
      dataIndex: 'inTransitQuantity',
      key: 'inTransitQuantity',
      width: 120,
      align: 'right',
      render: quantity => (
        <Text type="secondary">{formatNumber(quantity)}</Text>
      ),
      sorter: true,
      hidden: !columnSettings.showInTransit,
    },
    {
      title: '库存状态',
      dataIndex: 'stockStatus',
      key: 'stockStatus',
      width: 100,
      align: 'center',
      render: renderStockStatus,
      sorter: true,
    },
    {
      title: '销售单价',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      width: 100,
      align: 'right',
      render: renderCurrency,
      sorter: true,
    },
    {
      title: '库存总值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right',
      render: renderCurrency,
      sorter: true,
      hidden: !columnSettings.showTotalValue,
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: renderDateTime,
      sorter: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => renderActions(record),
    },
  ].filter(column => !column.hidden);

  // 响应式列配置
  const columns = useMemo(() => {
    if (isMobile) {
      // 移动端只显示关键列
      return baseColumns.filter(col => [
        'productName',
        'physicalQuantity',
        'stockStatus',
        'actions',
      ].includes(col.key as string));
    }

    if (isTablet) {
      // 平板端隐藏部分列
      return baseColumns.filter(col => ![
        'locationName',
        'reservedQuantity',
        'inTransitQuantity',
      ].includes(col.key as string));
    }

    return baseColumns;
  }, [baseColumns, isMobile, isTablet]);

  // 列设置菜单
  const columnSettingsItems = [
    {
      key: 'reserved',
      label: '预占库存',
      checked: columnSettings.showReserved,
    },
    {
      key: 'inTransit',
      label: '在途库存',
      checked: columnSettings.showInTransit,
    },
    {
      key: 'totalValue',
      label: '库存总值',
      checked: columnSettings.showTotalValue,
    },
    {
      key: 'costPrice',
      label: '成本价',
      checked: columnSettings.showCostPrice,
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
  const tableConfig: TableProps<InventoryLedger> = {
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
      getCheckboxProps: (record: InventoryLedger) => ({
        disabled: !canRead,
      }),
    } : undefined,
    title: () => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Text strong>库存台账</Text>
          {selectedRowKeys.length > 0 && (
            <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#52c41a' }} />
          )}
        </Space>
        <TableToolbar />
      </div>
    ),
  };

  return <Table {...tableConfig} />;
};

export default InventoryTable;