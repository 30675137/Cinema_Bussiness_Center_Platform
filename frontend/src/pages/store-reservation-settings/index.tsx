/**
 * Store Reservation Settings Page
 *
 * Main page for store reservation settings management featuring:
 * - Store list with reservation settings display
 * - Search by store name
 * - Filter by reservation status and store status
 * - Frontend pagination
 */

import React, { useState, useMemo } from 'react';
import { Card, Typography, Space, message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useStoresQuery } from '../stores/hooks/useStoresQuery';
import { useAllStoresReservationSettings, useUpdateStoreReservationSettings, useBatchUpdateStoreReservationSettings } from './hooks/useReservationSettingsQuery';
import ReservationSettingsTable from './components/ReservationSettingsTable';
import ReservationSettingsModal from './components/ReservationSettingsModal';
import BatchReservationSettingsModal from './components/BatchReservationSettingsModal';
import StoreSearch from '../stores/components/StoreSearch';
import StatusFilter from '../stores/components/StatusFilter';
import type { Store } from '../stores/types/store.types';
import type { StoreReservationSettings, BatchUpdateResult } from './types/reservation-settings.types';
import type { ReservationSettingsFormData } from './types/reservation-settings.schema';

const { Title } = Typography;

/**
 * Store Reservation Settings Page Component
 * Integrates ReservationSettingsTable, StoreSearch, and StatusFilter
 */
const StoreReservationSettingsPage: React.FC = () => {
  // State for filters
  const [searchName, setSearchName] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // State for pagination (frontend pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // State for edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingSettings, setEditingSettings] = useState<StoreReservationSettings | undefined>(undefined);

  // State for batch edit modal
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [batchUpdateResult, setBatchUpdateResult] = useState<BatchUpdateResult | null>(null);

  // Fetch stores data with status filter
  const { 
    data: stores = [], 
    isLoading: storesLoading,
    error: storesError,
  } = useStoresQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  // Extract store IDs for fetching reservation settings
  const storeIds = useMemo(() => stores.map((store) => store.id), [stores]);

  // Fetch reservation settings for all stores
  const {
    data: reservationSettings = [],
    isLoading: settingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useAllStoresReservationSettings(storeIds);

  const isLoading = storesLoading || settingsLoading;
  const hasError = storesError || settingsError;

  // Show error message if any
  React.useEffect(() => {
    if (storesError) {
      message.error(`加载门店数据失败: ${storesError.message}`);
    }
    if (settingsError) {
      message.error(`加载预约设置失败: ${settingsError.message}`);
    }
  }, [storesError, settingsError]);

  // Mutation hook for updating settings
  const updateMutation = useUpdateStoreReservationSettings(
    editingStore?.id || ''
  );

  // Mutation hook for batch updating settings
  const batchUpdateMutation = useBatchUpdateStoreReservationSettings();

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

  // Handle edit button click
  const handleEdit = (store: Store, settings?: StoreReservationSettings) => {
    setEditingStore(store);
    setEditingSettings(settings);
    setEditModalVisible(true);
  };

  // Handle form submission
  const handleFormSubmit = async (data: ReservationSettingsFormData) => {
    if (!editingStore) {
      throw new Error('未选择门店');
    }

    await updateMutation.mutateAsync(data);
    
    // Close modal and refresh data
    setEditModalVisible(false);
    setEditingStore(null);
    setEditingSettings(undefined);
    
    // Refetch settings to update the table
    await refetchSettings();
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setEditModalVisible(false);
    setEditingStore(null);
    setEditingSettings(undefined);
  };

  // Handle batch edit button click
  const handleBatchEdit = (storeIds: string[]) => {
    setSelectedStoreIds(storeIds);
    setBatchModalVisible(true);
    setBatchUpdateResult(null); // Clear previous result
  };

  // Handle batch form submission
  const handleBatchFormSubmit = async (data: ReservationSettingsFormData) => {
    try {
      const result = await batchUpdateMutation.mutateAsync({
        storeIds: selectedStoreIds,
        settings: data,
      });

      setBatchUpdateResult(result);

      // Show success/error message based on result
      if (result.failureCount === 0) {
        message.success(`批量更新成功：${result.successCount} 个门店已更新`);
        // Close modal and refresh data after a short delay
        setTimeout(() => {
          setBatchModalVisible(false);
          setSelectedStoreIds([]);
          setBatchUpdateResult(null);
          refetchSettings();
        }, 2000);
      } else if (result.successCount > 0) {
        message.warning(`批量更新完成：成功 ${result.successCount} 个，失败 ${result.failureCount} 个`);
        // Keep modal open to show failure details
      } else {
        message.error(`批量更新失败：所有 ${result.failureCount} 个门店更新失败`);
        // Keep modal open to show failure details
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '批量更新失败，请重试');
      throw error;
    }
  };

  // Handle batch modal cancel
  const handleBatchModalCancel = () => {
    setBatchModalVisible(false);
    setSelectedStoreIds([]);
    setBatchUpdateResult(null);
  };

  // Get selected store names for display
  const selectedStoreNames = useMemo(() => {
    return stores
      .filter((store) => selectedStoreIds.includes(store.id))
      .map((store) => store.name);
  }, [stores, selectedStoreIds]);

  return (
    <div className="store-reservation-settings-page-container">
      {/* Page Header */}
      <div className="store-reservation-settings-page-header" style={{ marginBottom: 16 }}>
        <Title level={2}>
          <Space>
            <CalendarOutlined />
            门店预约设置
          </Space>
        </Title>
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

      {/* Reservation Settings Table */}
      <Card>
        <ReservationSettingsTable
          stores={paginatedStores}
          reservationSettings={reservationSettings}
          loading={isLoading}
          onEdit={handleEdit}
          onBatchEdit={handleBatchEdit}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredStores.length,
            onChange: handlePaginationChange,
          }}
        />
      </Card>

      {/* Edit Modal - 使用新的 ReservationSettingsModal 组件 */}
      {editingStore && (
        <ReservationSettingsModal
          visible={editModalVisible}
          storeId={editingStore.id}
          storeName={editingStore.name}
          initialData={editingSettings}
          onSubmit={handleFormSubmit}
          onCancel={handleModalCancel}
          loading={updateMutation.isPending}
        />
      )}

      {/* Batch Edit Modal */}
      <BatchReservationSettingsModal
        visible={batchModalVisible}
        selectedStoreIds={selectedStoreIds}
        selectedStoreNames={selectedStoreNames}
        onSubmit={handleBatchFormSubmit}
        onCancel={handleBatchModalCancel}
        loading={batchUpdateMutation.isPending}
        result={batchUpdateResult}
      />
    </div>
  );
};

export default StoreReservationSettingsPage;

