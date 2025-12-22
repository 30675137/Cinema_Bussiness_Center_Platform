/**
 * StoreTable Component
 *
 * Displays list of stores with columns: name, region, status, reservation info
 * Follows Ant Design Table patterns from BrandTable
 */

import React from 'react';
import { Table, Tag, Empty, Button, Space, Tooltip, Badge, Popconfirm, Modal, message } from 'antd';
import { EnvironmentOutlined, SettingOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Store, StoreStatusEnum } from '../types/store.types';
import type { StoreReservationSettings } from '../../store-reservation-settings/types/reservation-settings.types';
import { useToggleStoreStatus } from '../hooks/useToggleStoreStatus';
import { useDeleteStore } from '../hooks/useDeleteStore';

// 门店与预约设置结合类型
interface StoreWithSettings extends Store {
  reservationSettings?: StoreReservationSettings;
}

interface StoreTableProps {
  stores: Store[];
  /** 预约设置数据 @since 016-store-reservation-settings */
  reservationSettings?: StoreReservationSettings[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  /** 编辑门店地址回调 @since 020-store-address */
  onEdit?: (store: Store) => void;
  /** 编辑门店信息回调 @since 022-store-crud */
  onEditStore?: (store: Store) => void;
  /** 预约设置回调 @since 016-store-reservation-settings */
  onReservationSettings?: (store: Store) => void;
}

/**
 * Store Table Component
 * Displays stores in a table format with name, region, and status columns
 */
const StoreTable: React.FC<StoreTableProps> = ({
  stores,
  reservationSettings = [],
  loading = false,
  pagination,
  onEdit,
  onEditStore,
  onReservationSettings,
}) => {
  // 022-store-crud: Toggle status hook
  const toggleStatusMutation = useToggleStoreStatus();
  // 022-store-crud: Delete store hook
  const deleteStoreMutation = useDeleteStore();
  // 将预约设置合并到门店数据
  const storesWithSettings: StoreWithSettings[] = React.useMemo(() => {
    const settingsMap = new Map(
      reservationSettings.map(s => [s.storeId, s])
    );
    return stores.map(store => ({
      ...store,
      reservationSettings: settingsMap.get(store.id),
    }));
  }, [stores, reservationSettings]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // Get status color for tag
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'disabled':
        return 'red';
      default:
        return 'default';
    }
  };

  // Get status text for display
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '启用';
      case 'disabled':
      case 'inactive':
        return '停用';
      default:
        return status;
    }
  };

  // 022-store-crud: Handle toggle status
  const handleToggleStatus = (store: Store) => {
    const newStatus = store.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? '启用' : '停用';

    Modal.confirm({
      title: `确认${actionText}门店`,
      content: `确定要${actionText}门店「${store.name}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await toggleStatusMutation.mutateAsync({
            storeId: store.id,
            data: { status: newStatus as unknown as StoreStatusEnum },
          });
          message.success(`门店已${actionText}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `${actionText}失败`;
          message.error(errorMessage);
        }
      },
    });
  };

  // 022-store-crud: Handle delete store
  const handleDeleteStore = (store: Store) => {
    Modal.confirm({
      title: '确认删除门店',
      content: `删除后无法恢复，确定要删除门店「${store.name}」吗？`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteStoreMutation.mutateAsync(store.id);
          message.success('门店删除成功');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '删除失败';
          message.error(errorMessage);
        }
      },
    });
  };

  // 016-store-reservation-settings: 获取预约状态显示
  const getReservationStatusColor = (enabled: boolean) => {
    return enabled ? 'green' : 'default';
  };

  const getReservationStatusText = (enabled: boolean) => {
    return enabled ? '已开放' : '未开放';
  };

  const columns: ColumnsType<StoreWithSettings> = [
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string, record: StoreWithSettings) => (
        <div className="store-name-cell">
          <div>
            <span className="store-name-text" title={text}>
              {text}
            </span>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.code}
            </div>
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
      render: (_: string, record: Store) => {
        // 优先显示 region，否则显示城市
        const displayRegion = record.region || record.city || '-';
        return (
          <span className="region-text">
            {displayRegion}
          </span>
        );
      },
      sorter: (a, b) => (a.region || a.city || '').localeCompare(b.region || b.city || ''),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '启用', value: 'active' },
        { text: '停用', value: 'disabled' },
      ],
      onFilter: (value, record) => record.status.toLowerCase() === value,
    },
    // 016-store-reservation-settings: 预约状态列
    {
      title: '预约状态',
      key: 'reservationEnabled',
      width: 100,
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
    // 016-store-reservation-settings: 可预约天数列
    {
      title: '可预约天数',
      key: 'maxReservationDays',
      width: 110,
      render: (_, record: StoreWithSettings) => {
        const days = record.reservationSettings?.maxReservationDays ?? 0;
        const enabled = record.reservationSettings?.isReservationEnabled ?? false;
        
        if (!enabled) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        return (
          <Badge
            count={`${days}天`}
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
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <span className="created-time-text">
          {formatDate(date)}
        </span>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    // 020-store-address: 添加地址摘要列
    {
      title: '地址',
      dataIndex: 'addressSummary',
      key: 'addressSummary',
      width: 180,
      ellipsis: true,
      render: (_: string, record: StoreWithSettings) => {
        // 构建完整地址
        const fullAddress = [
          record.province,
          record.city,
          record.district,
          record.address
        ].filter(Boolean).join('');
        
        // 简短显示：城市+区县+详细地址
        const shortAddress = [
          record.city,
          record.district,
          record.address
        ].filter(Boolean).join(' ');
        
        if (!shortAddress) {
          return <span style={{ color: '#999' }}>未配置</span>;
        }
        
        return (
          <Tooltip title={fullAddress || shortAddress}>
            <span className="address-summary-text">
              {shortAddress}
            </span>
          </Tooltip>
        );
      },
    },
    // 020-store-address + 016-store-reservation-settings + 022-store-crud: 操作列
    {
      title: '操作',
      key: 'action',
      width: 260,
      fixed: 'right' as const,
      render: (_: unknown, record: StoreWithSettings) => (
        <Space size="small" wrap>
          {/* 022-store-crud: 编辑按钮 */}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditStore?.(record)}
            aria-label={`编辑${record.name}`}
          >
            编辑
          </Button>
          {/* 020-store-address: 地址按钮 */}
          <Button
            type="link"
            size="small"
            icon={<EnvironmentOutlined />}
            onClick={() => onEdit?.(record)}
            aria-label={`编辑${record.name}的地址`}
          >
            地址
          </Button>
          {/* 016-store-reservation-settings: 预约设置 */}
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => onReservationSettings?.(record)}
            aria-label={`设置${record.name}的预约配置`}
          >
            预约
          </Button>
          {/* 022-store-crud: 状态切换 */}
          <Tooltip title={record.status === 'active' ? '停用门店' : '启用门店'}>
            <Button
              type="link"
              size="small"
              icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
              danger={record.status === 'active'}
              aria-label={record.status === 'active' ? `停用${record.name}` : `启用${record.name}`}
            >
              {record.status === 'active' ? '停用' : '启用'}
            </Button>
          </Tooltip>
          {/* 022-store-crud: 删除按钮 */}
          <Button
            type="link"
            size="small"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteStore(record)}
            aria-label={`删除${record.name}`}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // If no data and not loading, show empty state
  if (!loading && stores.length === 0) {
    return (
      <div className="store-table-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无门店数据"
        />
      </div>
    );
  }

  return (
    <div className="store-table-wrapper">
      <Table
        columns={columns}
        dataSource={storesWithSettings}
        rowKey="id"
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
        scroll={{ x: 800 }}
        className="store-table"
        size="middle"
      />
    </div>
  );
};

export default StoreTable;
