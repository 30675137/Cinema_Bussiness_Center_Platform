/**
 * P003-inventory-query: 库存表格组件
 * P004-inventory-adjustment: 添加调整按钮
 *
 * 显示库存列表，包含7列：SKU编码、名称、现存数量、可用数量、预占数量、状态、单位
 * 以及操作列（调整按钮）
 */

import { Table, Typography, Button, Space } from 'antd';
import type { TableProps } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { StoreInventoryItem } from '../types';
import { InventoryStatusTag } from './InventoryStatusTag';

const { Text } = Typography;

interface InventoryTableProps {
  data: StoreInventoryItem[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onRowClick?: (record: StoreInventoryItem) => void;
  /** 调整按钮点击回调 */
  onAdjustClick?: (record: StoreInventoryItem) => void;
}

/**
 * 库存表格组件
 *
 * 根据 FR-001 规范显示7列信息：
 * - SKU编码
 * - SKU名称
 * - 现存数量
 * - 可用数量
 * - 预占数量
 * - 库存状态
 * - 库存单位
 */
export function InventoryTable({
  data,
  loading = false,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onRowClick,
  onAdjustClick,
}: InventoryTableProps) {
  const columns: TableProps<StoreInventoryItem>['columns'] = [
    {
      title: 'SKU编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 140,
      fixed: 'left',
      render: (text: string) => <Text copyable>{text}</Text>,
    },
    {
      title: 'SKU名称',
      dataIndex: 'skuName',
      key: 'skuName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '现存数量',
      dataIndex: 'onHandQty',
      key: 'onHandQty',
      width: 100,
      align: 'right',
      render: (value: number) => value?.toFixed(2) ?? '-',
    },
    {
      title: '可用数量',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 100,
      align: 'right',
      render: (value: number) => value?.toFixed(2) ?? '-',
    },
    {
      title: '预占数量',
      dataIndex: 'reservedQty',
      key: 'reservedQty',
      width: 100,
      align: 'right',
      render: (value: number) => value?.toFixed(2) ?? '-',
    },
    {
      title: '库存状态',
      dataIndex: 'inventoryStatus',
      key: 'inventoryStatus',
      width: 100,
      align: 'center',
      render: (status) => <InventoryStatusTag status={status} />,
    },
    {
      title: '单位',
      dataIndex: 'mainUnit',
      key: 'mainUnit',
      width: 80,
      align: 'center',
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // 阻止行点击事件
              onAdjustClick?.(record);
            }}
            data-testid={`adjust-btn-${record.id}`}
          >
            调整
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<StoreInventoryItem>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      size="middle"
      scroll={{ x: 820 }}
      pagination={{
        current: page,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: onPageChange,
      }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        style: { cursor: onRowClick ? 'pointer' : 'default' },
      })}
    />
  );
}

export default InventoryTable;
