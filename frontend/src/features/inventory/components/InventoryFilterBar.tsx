import React, { useCallback } from 'react';
import { Space, Select, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useFilterStore } from '../stores/filterStore';
import { useCategories, useAccessibleStores } from '../hooks/useInventory';
import { INVENTORY_STATUS_OPTIONS, type InventoryStatus } from '../types';

/**
 * InventoryFilterBar 组件属性
 */
export interface InventoryFilterBarProps {
  /** 筛选变化回调 */
  onFilterChange?: (filters: {
    storeId?: string;
    statuses?: InventoryStatus[];
    categoryId?: string;
  }) => void;
}

/**
 * 库存筛选栏组件
 * 提供门店、库存状态、商品分类的多维度筛选功能。
 * 
 * @example
 * ```tsx
 * <InventoryFilterBar onFilterChange={handleFilterChange} />
 * ```
 * 
 * @since P003-inventory-query US3
 */
export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  onFilterChange,
}) => {
  // 从 Zustand store 获取筛选状态
  const { storeId, statuses, categoryId, setStoreId, setStatuses, setCategoryId, resetFilters } = useFilterStore();

  // 获取分类列表
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // 获取可访问门店列表
  const { data: storesData, isLoading: storesLoading } = useAccessibleStores();

  // 门店变化处理
  const handleStoreChange = useCallback((value: string | undefined) => {
    setStoreId(value);
    onFilterChange?.({ storeId: value, statuses, categoryId });
  }, [setStoreId, onFilterChange, statuses, categoryId]);

  // 状态变化处理
  const handleStatusChange = useCallback((value: InventoryStatus[]) => {
    setStatuses(value);
    onFilterChange?.({ storeId, statuses: value, categoryId });
  }, [setStatuses, onFilterChange, storeId, categoryId]);

  // 分类变化处理
  const handleCategoryChange = useCallback((value: string | undefined) => {
    setCategoryId(value);
    onFilterChange?.({ storeId, statuses, categoryId: value });
  }, [setCategoryId, onFilterChange, storeId, statuses]);

  // 重置筛选
  const handleReset = useCallback(() => {
    resetFilters();
    onFilterChange?.({ storeId: undefined, statuses: [], categoryId: undefined });
  }, [resetFilters, onFilterChange]);

  // 分类选项 - 兼容两种格式: {data: [...]} 或 {data: {list: [...]}}
  const categoryOptions = (() => {
    const data = categoriesData?.data;
    // 如果是分页格式 {list: [...]}
    if (data && 'list' in data && Array.isArray(data.list)) {
      return data.list.map((cat: { id: string; name: string }) => ({
        label: cat.name,
        value: cat.id,
      }));
    }
    // 如果是数组格式
    if (Array.isArray(data)) {
      return data.map((cat) => ({
        label: cat.name,
        value: cat.id,
      }));
    }
    return [];
  })();

  // 门店选项 - 兼容两种格式: {data: [...]} 或 {data: {list: [...]}}
  const storeOptions = (() => {
    const data = storesData?.data;
    // 如果是分页格式 {list: [...]}
    if (data && 'list' in data && Array.isArray(data.list)) {
      return data.list.map((store: { id: string; name: string }) => ({
        label: store.name,
        value: store.id,
      }));
    }
    // 如果是数组格式
    if (Array.isArray(data)) {
      return data.map((store) => ({
        label: store.name,
        value: store.id,
      }));
    }
    return [];
  })();

  return (
    <Space wrap className="inventory-filter-bar" style={{ marginBottom: 16 }}>
      {/* 门店筛选 */}
      <Select
        placeholder="选择门店"
        value={storeId}
        onChange={handleStoreChange}
        allowClear
        loading={storesLoading}
        style={{ width: 160 }}
        options={storeOptions}
        data-testid="filter-store"
        className="store-filter"
      />

      {/* 库存状态筛选 (多选) */}
      <Select
        mode="multiple"
        placeholder="库存状态"
        value={statuses}
        onChange={handleStatusChange}
        allowClear
        style={{ minWidth: 180 }}
        options={INVENTORY_STATUS_OPTIONS}
        data-testid="filter-status"
        className="status-filter"
        maxTagCount="responsive"
      />

      {/* 商品分类筛选 */}
      <Select
        placeholder="商品分类"
        value={categoryId}
        onChange={handleCategoryChange}
        allowClear
        loading={categoriesLoading}
        style={{ width: 160 }}
        options={categoryOptions}
        data-testid="filter-category"
        className="category-filter"
      />

      {/* 重置按钮 */}
      <Button
        icon={<ReloadOutlined />}
        onClick={handleReset}
        data-testid="reset-filter"
      >
        重置
      </Button>
    </Space>
  );
};

export default InventoryFilterBar;
