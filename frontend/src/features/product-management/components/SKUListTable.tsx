/**
 * @spec O004-beverage-sku-reuse
 * SKU List Table Component
 *
 * SKU 列表表格组件,展示 SKU 数据并提供批量操作、排序、筛选功能
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import React, { useMemo, useCallback } from 'react';
import { Table, Tag, Button, Space, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SKU, SkuStatus, SkuType } from '@/types/sku';
import { useSkuManagementStore } from '@/stores/skuManagementStore';
import { useToggleSKUStatus } from '@/hooks/useSKUs';

/**
 * SKU 状态标签映射
 */
const SKU_STATUS_CONFIG: Record<SkuStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  enabled: { label: '启用', color: 'success' },
  disabled: { label: '禁用', color: 'error' },
};

/**
 * SKU 类型标签映射
 */
const SKU_TYPE_CONFIG: Record<SkuType, { label: string; color: string }> = {
  raw_material: { label: '原料', color: 'blue' },
  packaging: { label: '包材', color: 'cyan' },
  finished_product: { label: '成品', color: 'green' },
  combo: { label: '套餐', color: 'purple' },
};

/**
 * SKU List Table Props
 */
export interface SKUListTableProps {
  /** SKU 列表数据 */
  dataSource: SKU[];

  /** 是否加载中 */
  loading?: boolean;

  /** 分页配置 */
  pagination: TablePaginationConfig;

  /** 编辑 SKU 回调 */
  onEdit: (sku: SKU) => void;

  /** 删除 SKU 回调 */
  onDelete: (sku: SKU) => void;
}

/**
 * SKU List Table Component
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useSKUs(queryParams);
 *
 * <SKUListTable
 *   dataSource={data?.items || []}
 *   loading={isLoading}
 *   pagination={{
 *     current: data?.page || 1,
 *     pageSize: data?.pageSize || 20,
 *     total: data?.total || 0,
 *     onChange: (page, pageSize) => {
 *       setQueryParams({ page, pageSize });
 *     },
 *   }}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export const SKUListTable = React.memo<SKUListTableProps>(
  ({ dataSource, loading = false, pagination, onEdit, onDelete }) => {
    const { selectedSkuIds, setSelectedSkuIds } = useSkuManagementStore();
    const toggleStatus = useToggleSKUStatus();

    /**
     * 处理状态切换 (useCallback 优化)
     */
    const handleToggleStatus = useCallback(
      async (sku: SKU) => {
        const newStatus: SkuStatus = sku.status === 'enabled' ? 'disabled' : 'enabled';
        const statusLabel = SKU_STATUS_CONFIG[newStatus].label;

        try {
          await toggleStatus.mutateAsync({ id: sku.id, status: newStatus });
          message.success(`SKU "${sku.name}" 已${statusLabel}`);
        } catch (error) {
          message.error(`状态切换失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      },
      [toggleStatus]
    );

    /**
     * 表格列定义 (useMemo 缓存,避免每次渲染重新创建)
     */
    const columns: ColumnsType<SKU> = useMemo(
      () => [
        {
          title: 'SKU 编码',
          dataIndex: 'code',
          key: 'code',
          width: 150,
          fixed: 'left',
          render: (code: string) => (
            <Tooltip title={code}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{code}</span>
            </Tooltip>
          ),
        },
        {
          title: 'SKU 名称',
          dataIndex: 'name',
          key: 'name',
          width: 200,
          fixed: 'left',
          ellipsis: {
            showTitle: false,
          },
          render: (name: string) => (
            <Tooltip placement="topLeft" title={name}>
              {name}
            </Tooltip>
          ),
        },
        {
          title: 'SKU 类型',
          dataIndex: 'skuType',
          key: 'skuType',
          width: 100,
          filters: [
            { text: '原料', value: 'raw_material' },
            { text: '包材', value: 'packaging' },
            { text: '成品', value: 'finished_product' },
            { text: '套餐', value: 'combo' },
          ],
          onFilter: (value, record) => record.skuType === value,
          render: (skuType: SkuType) => {
            const config = SKU_TYPE_CONFIG[skuType];
            return <Tag color={config.color}>{config.label}</Tag>;
          },
        },
        {
          title: 'SPU 名称',
          dataIndex: 'spuName',
          key: 'spuName',
          width: 150,
          ellipsis: {
            showTitle: false,
          },
          render: (spuName: string) => (
            <Tooltip placement="topLeft" title={spuName}>
              {spuName || '-'}
            </Tooltip>
          ),
        },
        {
          title: '品牌',
          dataIndex: 'brand',
          key: 'brand',
          width: 120,
          render: (brand: string) => brand || '-',
        },
        {
          title: '类目',
          dataIndex: 'category',
          key: 'category',
          width: 120,
          render: (category: string) => category || '-',
        },
        {
          title: '主单位',
          dataIndex: 'mainUnit',
          key: 'mainUnit',
          width: 80,
          align: 'center',
        },
        {
          title: '标准成本',
          dataIndex: 'standardCost',
          key: 'standardCost',
          width: 120,
          align: 'right',
          render: (cost: number | undefined) => (cost !== undefined ? `¥${cost.toFixed(2)}` : '-'),
        },
        {
          title: '零售价',
          dataIndex: 'price',
          key: 'price',
          width: 120,
          align: 'right',
          render: (price: number | undefined) =>
            price !== undefined ? `¥${price.toFixed(2)}` : '-',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          width: 100,
          filters: [
            { text: '草稿', value: 'draft' },
            { text: '启用', value: 'enabled' },
            { text: '禁用', value: 'disabled' },
          ],
          onFilter: (value, record) => record.status === value,
          render: (status: SkuStatus) => {
            const config = SKU_STATUS_CONFIG[status];
            return <Tag color={config.color}>{config.label}</Tag>;
          },
        },
        {
          title: '操作',
          key: 'actions',
          width: 200,
          fixed: 'right',
          render: (_, record) => (
            <Space size="small">
              <Tooltip title="编辑">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(record)}
                >
                  编辑
                </Button>
              </Tooltip>

              <Tooltip title={record.status === 'enabled' ? '禁用' : '启用'}>
                <Button
                  type="link"
                  size="small"
                  icon={record.status === 'enabled' ? <StopOutlined /> : <CheckCircleOutlined />}
                  onClick={() => handleToggleStatus(record)}
                  loading={toggleStatus.isPending}
                  disabled={record.status === 'draft'} // 草稿状态不可切换
                >
                  {record.status === 'enabled' ? '禁用' : '启用'}
                </Button>
              </Tooltip>

              <Tooltip title="删除">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(record)}
                >
                  删除
                </Button>
              </Tooltip>
            </Space>
          ),
        },
      ],
      [handleToggleStatus, toggleStatus.isPending, onEdit, onDelete]
    );

    /**
     * 行选择配置 (useMemo 缓存)
     */
    const rowSelection = useMemo(
      () => ({
        selectedRowKeys: selectedSkuIds,
        onChange: (selectedRowKeys: React.Key[]) => {
          setSelectedSkuIds(selectedRowKeys as string[]);
        },
        getCheckboxProps: (record: SKU) => ({
          disabled: record.status === 'draft', // 草稿状态不可选择(批量操作限制)
        }),
      }),
      [selectedSkuIds, setSelectedSkuIds]
    );

    return (
      <Table<SKU>
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        rowSelection={rowSelection}
        scroll={{ x: 1500 }} // 横向滚动,确保在小屏幕上可用
        size="middle"
        bordered
      />
    );
  }
);
