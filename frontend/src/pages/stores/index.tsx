/**
 * Stores Management Page
 *
 * Main page for store management featuring:
 * - Store list display
 * - Search by name
 * - Filter by status
 * - Frontend pagination
 */

import React, { useState, useMemo } from 'react';
import { Card, Typography, Space } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useStoresQuery } from './hooks/useStoresQuery';
import StoreTable from './components/StoreTable';
import StoreEditModal from './components/StoreEditModal';
import StoreSearch from './components/StoreSearch';
import StatusFilter from './components/StatusFilter';
import type { Store } from './types/store.types';

const { Title } = Typography;

/**
 * Stores Page Component
 * Integrates StoreTable, StoreSearch, and StatusFilter
 */
const StoresPage: React.FC = () => {
  // State for filters
  const [searchName, setSearchName] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // 020-store-address: State for edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // State for pagination (frontend pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Fetch stores data with status filter
  const { data: stores = [], isLoading } = useStoresQuery(
    statusFilter ? { status: statusFilter } : undefined
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

  // 020-store-address: Handle edit store
  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setEditModalOpen(true);
  };

  // 020-store-address: Handle close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingStore(null);
  };

  return (
    <div className="stores-page-container">
      {/* Page Header */}
      <div className="stores-page-header" style={{ marginBottom: 16 }}>
        <Title level={2}>
          <Space>
            <ShopOutlined />
            门店管理
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

      {/* Store Table */}
      <Card>
        <StoreTable
          stores={paginatedStores}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredStores.length,
            onChange: handlePaginationChange,
          }}
          onEdit={handleEditStore}
        />
      </Card>

      {/* 020-store-address: Edit Modal */}
      <StoreEditModal
        open={editModalOpen}
        store={editingStore}
        onClose={handleCloseEditModal}
      />
    </div>
  );
};

export default StoresPage;
