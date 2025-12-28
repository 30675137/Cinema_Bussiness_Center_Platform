/**
 * ReservationSettingsTable Component
 *
 * Displays list of stores with their reservation settings.
 * Shows: store name, region, reservation enabled status, max reservation days
 */

import React, { useState } from 'react';
import { Table, Tag, Empty, Badge, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { Store } from '../../stores/types/store.types';
import type { StoreReservationSettings } from '../types/reservation-settings.types';

interface StoreWithSettings extends Store {
  reservationSettings?: StoreReservationSettings;
}

interface ReservationSettingsTableProps {
  stores: Store[];
  reservationSettings: StoreReservationSettings[];
  loading?: boolean;
  onEdit?: (store: Store, settings?: StoreReservationSettings) => void;
  onBatchEdit?: (selectedStoreIds: string[]) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

/**
 * Reservation Settings Table Component
 * Displays stores with their reservation settings in a table format
 */
const ReservationSettingsTable: React.FC<ReservationSettingsTableProps> = ({
  stores,
  reservationSettings,
  loading = false,
  onEdit,
  onBatchEdit,
  pagination,
}) => {
  // State for row selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Merge stores with their reservation settings
  const storesWithSettings: StoreWithSettings[] = stores.map((store) => {
    const settings = reservationSettings.find(
      (s) => s.storeId === store.id
    );
    return {
      ...store,
      reservationSettings: settings,
    };
  });

  // Row selection configuration
  const rowSelection: TableRowSelection<StoreWithSettings> | undefined = onBatchEdit
    ? {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
          setSelectedRowKeys(newSelectedRowKeys);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          // Handle select all
        },
      }
    : undefined;

  // Get reservation status color
  const getReservationStatusColor = (enabled: boolean) => {
    return enabled ? 'green' : 'default';
  };

  // Get reservation status text
  const getReservationStatusText = (enabled: boolean) => {
    return enabled ? '已开放' : '未开放';
  };

  const columns: ColumnsType<StoreWithSettings> = [
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: StoreWithSettings) => (
        <div className="store-name-cell">
          <div>
            <span className="store-name-text" title={text}>
              {text}
            </span>
            {record.code && (
              <div style={{ fontSize: '12px', color: '#999' }}>
                {record.code}
              </div>
            )}
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region',
      width: 150,
      render: (text: string | null) => (
        <span className="region-text">
          {text || '-'}
        </span>
      ),
      sorter: (a, b) => (a.region || '').localeCompare(b.region || ''),
    },
    {
      title: '预约状态',
      key: 'reservationEnabled',
      width: 120,
      render: (_, record: StoreWithSettings) => {
        const enabled = record.reservationSettings?.isReservationEnabled ?? false;
        return (
          <Tag color={getReservationStatusColor(enabled)}>
            {getReservationStatusText(enabled)}
          </Tag>
        );
      },
      filters: [
        { text: '已开放', value: true },
        { text: '未开放', value: false },
      ],
      onFilter: (value, record) => {
        const enabled = record.reservationSettings?.isReservationEnabled ?? false;
        return enabled === value;
      },
    },
    {
      title: '可预约天数',
      key: 'maxReservationDays',
      width: 120,
      render: (_, record: StoreWithSettings) => {
        const days = record.reservationSettings?.maxReservationDays ?? 0;
        const enabled = record.reservationSettings?.isReservationEnabled ?? false;
        
        if (!enabled) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        return (
          <Badge
            count={days}
            showZero
            style={{ backgroundColor: days > 0 ? '#52c41a' : '#999' }}
          />
        );
      },
      sorter: (a, b) => {
        const daysA = a.reservationSettings?.maxReservationDays ?? 0;
        const daysB = b.reservationSettings?.maxReservationDays ?? 0;
        return daysA - daysB;
      },
    },
    {
      title: '门店状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const color = status.toLowerCase() === 'active' ? 'green' : 'red';
        const text = status.toLowerCase() === 'active' ? '启用' : '停用';
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '启用', value: 'active' },
        { text: '停用', value: 'disabled' },
      ],
      onFilter: (value, record) => record.status.toLowerCase() === value,
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record: StoreWithSettings) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record, record.reservationSettings)}
          >
            设置
          </Button>
        </Space>
      ),
    },
  ];

  // If no data and not loading, show empty state
  if (!loading && storesWithSettings.length === 0) {
    return (
      <div className="reservation-settings-table-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无门店数据"
        />
      </div>
    );
  }

  // Handle batch edit button click
  const handleBatchEdit = () => {
    if (onBatchEdit && selectedRowKeys.length > 0) {
      onBatchEdit(selectedRowKeys.map((key) => key.toString()));
      setSelectedRowKeys([]); // Clear selection after opening modal
    }
  };

  return (
    <div className="reservation-settings-table-wrapper">
      {/* Batch Action Toolbar */}
      {onBatchEdit && selectedRowKeys.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            background: '#f0f2f5',
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            已选择 <strong>{selectedRowKeys.length}</strong> 个门店
          </span>
          <Space>
            <Button onClick={() => setSelectedRowKeys([])}>取消选择</Button>
            <Button type="primary" onClick={handleBatchEdit}>
              批量设置
            </Button>
          </Space>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={storesWithSettings}
        rowKey="id"
        rowSelection={rowSelection}
        loading={loading}
        pagination={pagination ? {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: pagination.onChange,
          onShowSizeChange: pagination.onChange,
          pageSizeOptions: ['10', '20', '50', '100'],
        } : false}
        scroll={{ x: 1000 }}
        className="reservation-settings-table"
        size="middle"
      />
    </div>
  );
};

export default ReservationSettingsTable;

