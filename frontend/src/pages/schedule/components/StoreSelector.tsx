/**
 * StoreSelector Component
 *
 * Dropdown for selecting a store or "all stores" for filtering halls
 * Used in HallResources page
 */

import React from 'react';
import { Select, Space } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import type { Store } from '@/pages/stores/types/store.types';

interface StoreSelectorProps {
  stores: Store[];
  value?: string;
  onChange: (storeId: string | undefined) => void;
  loading?: boolean;
}

/**
 * Store Selector Component
 * Provides dropdown for store selection with "all stores" option
 */
const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  value,
  onChange,
  loading = false,
}) => {
  const handleChange = (selectedValue: string) => {
    // If "all" is selected, pass undefined to show all halls
    onChange(selectedValue === 'all' ? undefined : selectedValue);
  };

  // Build options from stores
  const options = [
    { label: '全部门店', value: 'all' },
    ...stores.map((store) => ({
      label: store.name,
      value: store.id,
    })),
  ];

  return (
    <div className="store-selector-wrapper">
      <Space>
        <ShopOutlined />
        <span>选择门店:</span>
        <Select
          value={value || 'all'}
          onChange={handleChange}
          style={{ width: 200 }}
          options={options}
          loading={loading}
          placeholder="请选择门店"
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Space>
    </div>
  );
};

export default StoreSelector;
