/**
 * Stores Management Page
 *
 * Main page for store management featuring:
 * - Store list display
 * - Search by name
 * - Filter by status
 * - Frontend pagination
 * - Create new store (022-store-crud)
 * - Store address editing (020-store-address)
 * - Reservation settings configuration (016-store-reservation-settings)
 */

import React, { useState, useMemo } from 'react';
import { Card, Typography, Space, Button, message } from 'antd';
import { ShopOutlined, PlusOutlined } from '@ant-design/icons';
import { useStoresQuery } from './hooks/useStoresQuery';
import StoreTable from './components/StoreTable';
import StoreEditModal from './components/StoreEditModal';
import CreateStoreModal from './components/CreateStoreModal';
import EditStoreModal from './components/EditStoreModal';
import StoreSearch from './components/StoreSearch';
import StatusFilter from './components/StatusFilter';
// 016-store-reservation-settings: 导入预约设置相关组件
import ReservationSettingsModal from '../store-reservation-settings/components/ReservationSettingsModal';
import {
  useStoreReservationSettings,
  useAllStoresReservationSettings,
  useUpdateStoreReservationSettings,
} from '../store-reservation-settings/hooks/useReservationSettingsQuery';
import type { Store } from './types/store.types';
import type { ReservationSettingsFormData } from '../store-reservation-settings/types/reservation-settings.schema';

const { Title } = Typography;

/**
 * Stores Page Component
 * Integrates StoreTable, StoreSearch, StatusFilter, CreateStoreModal, and ReservationSettingsModal
 */
const StoresPage: React.FC = () => {
  // State for filters
  const [searchName, setSearchName] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // 022-store-crud: State for create modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 020-store-address: State for address edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // 022-store-crud: State for full edit modal
  const [fullEditModalOpen, setFullEditModalOpen] = useState(false);
  const [fullEditingStore, setFullEditingStore] = useState<Store | null>(null);

  // 016-store-reservation-settings: State for reservation settings modal
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedStoreForReservation, setSelectedStoreForReservation] = useState<Store | null>(null);

  // State for pagination (frontend pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch stores data with status filter
  const { data: stores = [], isLoading: storesLoading } = useStoresQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  // 016-store-reservation-settings: 提取所有门店ID用于获取预约设置
  const storeIds = useMemo(() => stores.map((store) => store.id), [stores]);

  // 016-store-reservation-settings: 获取所有门店的预约设置
  const { data: allReservationSettings = [], isLoading: settingsLoading } = useAllStoresReservationSettings(storeIds);

  // 综合加载状态
  const isLoading = storesLoading || settingsLoading;

  // 016-store-reservation-settings: Fetch reservation settings for selected store
  const { data: currentReservationSettings } = useStoreReservationSettings(
    selectedStoreForReservation?.id
  );

  // 016-store-reservation-settings: Mutation for updating reservation settings
  const updateReservationMutation = useUpdateStoreReservationSettings(
    selectedStoreForReservation?.id || ''
  );

  // Apply frontend filtering by name
  const filteredStores = useMemo(() => {
    if (!searchName) {
      return stores;
    }
    const lowerSearchName = searchName.toLowerCase();
    return stores.filter((store: Store) =>
      store.name.toLowerCase().includes(lowerSearchName)
    );
  }, [stores, searchName]);

  // Apply frontend pagination
  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStores.slice(startIndex, endIndex);
  }, [filteredStores, currentPage, pageSize]);

  // Handle search
  const handleSearch = (name: string) => {
    setSearchName(name);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle reset
  const handleReset = () => {
    setSearchName('');
    setStatusFilter(undefined);
    setCurrentPage(1);
  };

  // 022-store-crud: Handle open create modal
  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  // 022-store-crud: Handle close create modal
  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  // Handle status filter change
  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  // 020-store-address: Handle edit store address
  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setEditModalOpen(true);
  };

  // 020-store-address: Handle close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingStore(null);
  };

  // 022-store-crud: Handle full edit store
  const handleFullEditStore = (store: Store) => {
    setFullEditingStore(store);
    setFullEditModalOpen(true);
  };

  // 022-store-crud: Handle close full edit modal
  const handleCloseFullEditModal = () => {
    setFullEditModalOpen(false);
    setFullEditingStore(null);
  };

  // 016-store-reservation-settings: Handle open reservation settings modal
  const handleOpenReservationSettings = (store: Store) => {
    setSelectedStoreForReservation(store);
    setReservationModalOpen(true);
  };

  // 016-store-reservation-settings: Handle reservation form submit
  const handleReservationSubmit = async (data: ReservationSettingsFormData) => {
    try {
      await updateReservationMutation.mutateAsync(data);
      message.success('预约设置保存成功');
      setReservationModalOpen(false);
      setSelectedStoreForReservation(null);
    } catch (error) {
      message.error('保存失败，请重试');
    }
  };

  // 016-store-reservation-settings: Handle reservation modal cancel
  const handleReservationCancel = () => {
    setReservationModalOpen(false);
    setSelectedStoreForReservation(null);
  };

  return (
    <div className="stores-page-container">
      {/* Page Header */}
      <div className="stores-page-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <Space>
            <ShopOutlined />
            门店管理
          </Space>
        </Title>
        {/* 022-store-crud: 新建门店按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
        >
          新建门店
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <StoreSearch
            onSearch={handleSearch}
            onReset={handleReset}
            loading={isLoading}
          />
          <StatusFilter
            value={statusFilter}
            onChange={handleStatusChange}
          />
        </Space>
      </Card>

      {/* Store Table */}
      <Card>
        <StoreTable
          stores={paginatedStores}
          reservationSettings={allReservationSettings}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredStores.length,
            onChange: handlePaginationChange,
          }}
          onEdit={handleEditStore}
          onEditStore={handleFullEditStore}
          onReservationSettings={handleOpenReservationSettings}
        />
      </Card>

      {/* 022-store-crud: Create Modal */}
      <CreateStoreModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
      />

      {/* 020-store-address: Edit Modal */}
      <StoreEditModal
        open={editModalOpen}
        store={editingStore}
        onClose={handleCloseEditModal}
      />

      {/* 022-store-crud: Full Edit Modal */}
      <EditStoreModal
        open={fullEditModalOpen}
        store={fullEditingStore}
        onClose={handleCloseFullEditModal}
      />

      {/* 016-store-reservation-settings: Reservation Settings Modal */}
      {selectedStoreForReservation && (
        <ReservationSettingsModal
          visible={reservationModalOpen}
          storeId={selectedStoreForReservation.id}
          storeName={selectedStoreForReservation.name}
          initialData={currentReservationSettings}
          onSubmit={handleReservationSubmit}
          onCancel={handleReservationCancel}
          loading={updateReservationMutation.isPending}
        />
      )}
    </div>
  );
};

export default StoresPage;
