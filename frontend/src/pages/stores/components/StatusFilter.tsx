/**
 * StatusFilter Component
 *
 * Dropdown for filtering stores by status (all/active/disabled)
 * Follows Ant Design Select patterns
 */

import React from 'react';
import { Select, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

interface StatusFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

/**
 * Status Filter Component
 * Provides dropdown for filtering stores by status
 */
const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (selectedValue: string) => {
    // If "all" is selected, pass undefined to clear the filter
    onChange(selectedValue === 'all' ? undefined : selectedValue);
  };

  return (
    <div className="status-filter-wrapper">
      <Space>
        <FilterOutlined />
        <span>状态筛选:</span>
        <Select
          value={value || 'all'}
          onChange={handleChange}
          style={{ width: 120 }}
          options={[
            { label: '全部', value: 'all' },
            { label: '启用', value: 'active' },
            { label: '停用', value: 'disabled' },
          ]}
        />
      </Space>
    </div>
  );
};

export default StatusFilter;
