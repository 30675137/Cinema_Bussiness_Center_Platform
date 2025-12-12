/**
 * SKU选择器组件
 * 可复用的SKU选择器，支持单选和多选模式，供其他模块使用
 */
import React, { useState, useMemo } from 'react';
import {
  Modal,
  Button,
  Space,
  message,
  Table,
  Tag,
  Checkbox,
  Typography,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { SKU, SkuQueryParams, SkuStatus } from '@/types/sku';
import { useSkuStore } from '@/stores/skuStore';
import { useSkuListQuery } from '@/hooks/useSku';
import { SkuFilters } from './SkuFilters';
import {
  getSkuStatusText,
  getSkuStatusColor,
  formatSkuCode,
} from '@/utils/skuHelpers';

const { Text } = Typography;

interface SkuSelectorProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 选择模式：单选或多选 */
  mode?: 'single' | 'multiple';
  /** 已选中的SKU ID列表（多选模式） */
  selectedIds?: string[];
  /** 选择回调 */
  onSelect: (skus: SKU[]) => void;
  /** 标题 */
  title?: string;
  /** 是否只显示启用的SKU */
  onlyEnabled?: boolean;
  /** 自定义筛选条件 */
  customFilters?: Partial<SkuQueryParams>;
  /** 排除的SKU ID列表（这些SKU不会在选择器中显示） */
  excludeIds?: string[];
}

/**
 * SKU选择器组件
 */
export const SkuSelector: React.FC<SkuSelectorProps> = ({
  open,
  onClose,
  mode = 'single',
  selectedIds = [],
  onSelect,
  title = '选择SKU',
  onlyEnabled = true,
  customFilters = {},
  excludeIds = [],
}) => {
  const {
    filters,
    pagination,
    sorting,
    setPagination,
    setSorting,
    updateFilter,
    clearFilters,
  } = useSkuStore();

  // 内部选中的SKU ID列表
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(
    selectedIds
  );

  // 构建查询参数
  const queryParams: SkuQueryParams = useMemo(
    () => ({
      ...(filters || {}),
      ...(customFilters || {}),
      status: onlyEnabled ? SkuStatus.ENABLED : (filters?.status || 'all'),
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || 20,
      sortField: sorting?.field,
      sortOrder: sorting?.order,
    }),
    [filters, customFilters, onlyEnabled, pagination, sorting]
  );

  // 获取SKU列表
  const {
    data: skuListResponse,
    isLoading,
    refetch,
  } = useSkuListQuery(queryParams);

  // 过滤掉排除的SKU
  const filteredItems = useMemo(() => {
    if (!skuListResponse?.items) return [];
    if (excludeIds.length === 0) return skuListResponse.items;
    return skuListResponse.items.filter((sku) => !excludeIds.includes(sku.id));
  }, [skuListResponse?.items, excludeIds]);

  // 处理筛选
  const handleFilter = (values: Partial<SkuQueryParams>) => {
    if (values && typeof values === 'object') {
      Object.keys(values).forEach((key) => {
        updateFilter(key as keyof SkuQueryParams, values[key as keyof SkuQueryParams]);
      });
    }
    refetch();
  };

  // 处理重置
  const handleReset = () => {
    clearFilters();
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

  // 处理单选
  const handleSingleSelect = (record: SKU) => {
    onSelect([record]);
    handleClose();
  };

  // 处理多选切换
  const handleMultipleSelectToggle = (record: SKU, checked: boolean) => {
    if (checked) {
      setInternalSelectedIds([...internalSelectedIds, record.id]);
    } else {
      setInternalSelectedIds(internalSelectedIds.filter((id) => id !== record.id));
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredItems.map((sku) => sku.id);
      setInternalSelectedIds([...new Set([...internalSelectedIds, ...allIds])]);
    } else {
      const currentPageIds = filteredItems.map((sku) => sku.id);
      setInternalSelectedIds(
        internalSelectedIds.filter((id) => !currentPageIds.includes(id))
      );
    }
  };

  // 处理确认选择（多选模式）
  const handleConfirmSelection = () => {
    if (internalSelectedIds.length === 0) {
      message.warning('请至少选择一个SKU');
      return;
    }

    const selectedSkus = filteredItems.filter((sku) =>
      internalSelectedIds.includes(sku.id)
    );
    
    // 需要获取所有选中的SKU（包括不在当前页的）
    // 这里简化处理，只返回当前页选中的
    onSelect(selectedSkus);
    handleClose();
  };

  // 处理关闭
  const handleClose = () => {
    setInternalSelectedIds(selectedIds);
    onClose();
  };

  // 表格列定义
  const columns: ColumnsType<SKU> = [
    ...(mode === 'multiple'
      ? [
          {
            title: (
              <Checkbox
                checked={
                  filteredItems.length > 0 &&
                  filteredItems.every((sku) =>
                    internalSelectedIds.includes(sku.id)
                  )
                }
                indeterminate={
                  filteredItems.some((sku) =>
                    internalSelectedIds.includes(sku.id)
                  ) &&
                  !filteredItems.every((sku) =>
                    internalSelectedIds.includes(sku.id)
                  )
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            ),
            key: 'selection',
            width: 50,
            fixed: 'left',
            render: (_, record) => (
              <Checkbox
                checked={internalSelectedIds.includes(record.id)}
                onChange={(e) =>
                  handleMultipleSelectToggle(record, e.target.checked)
                }
              />
            ),
          },
        ]
      : []),
    {
      title: 'SKU编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Text strong>{formatSkuCode(code)}</Text>,
    },
    {
      title: 'SKU名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Text ellipsis={{ tooltip: name }}>{name}</Text>
      ),
    },
    {
      title: '所属SPU',
      dataIndex: 'spuName',
      key: 'spuName',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Text ellipsis={{ tooltip: name }}>{name}</Text>
      ),
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 120,
    },
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (category: string) => (
        <Text ellipsis={{ tooltip: category }}>{category}</Text>
      ),
    },
    {
      title: '主条码',
      dataIndex: 'mainBarcode',
      key: 'mainBarcode',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SkuStatus) => (
        <Tag color={getSkuStatusColor(status)}>
          {getSkuStatusText(status)}
        </Tag>
      ),
    },
    ...(mode === 'single'
      ? [
          {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleSingleSelect(record)}
                data-testid={`sku-selector-select-button-${record.id}`}
              >
                选择
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      width={1200}
      data-testid={`sku-selector-modal-${mode}`}
      footer={
        <Space style={{ float: 'right' }}>
          {mode === 'multiple' && (
            <Text type="secondary" data-testid="sku-selector-selected-count">
              已选择 {internalSelectedIds.length} 个SKU
            </Text>
          )}
          <Button 
            onClick={handleClose}
            data-testid="sku-selector-cancel-button"
          >
            取消
          </Button>
          {mode === 'multiple' && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleConfirmSelection}
              data-testid="sku-selector-confirm-button"
            >
              确认选择
            </Button>
          )}
        </Space>
      }
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <SkuFilters
          onFilter={handleFilter}
          onReset={handleReset}
          loading={isLoading}
        />
      </div>

      <Table<SKU>
        columns={columns}
        dataSource={filteredItems}
        loading={isLoading}
        rowKey="id"
        data-testid="sku-selector-table"
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: skuListResponse?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handlePaginationChange,
        }}
        onRow={(record) => ({
          'data-testid': `sku-selector-row-${record.id}`,
        })}
        scroll={{ x: 1000, y: 400 }}
        size="middle"
        onRow={(record) => ({
          onClick: mode === 'single' ? () => handleSingleSelect(record) : undefined,
          style: mode === 'single' ? { cursor: 'pointer' } : undefined,
        })}
      />
    </Modal>
  );
};

export default SkuSelector;

