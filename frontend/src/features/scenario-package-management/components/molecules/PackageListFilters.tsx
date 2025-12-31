/**
 * 场景包列表筛选组件
 *
 * 包含状态筛选、搜索框等筛选功能
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React from 'react';
import { Space, Select, Input, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { PackageStatus } from '../../types';

const { Search } = Input;

interface PackageListFiltersProps {
  /** 当前状态筛选值 */
  status?: PackageStatus;
  /** 当前搜索关键词 */
  keyword?: string;
  /** 状态筛选变更回调 */
  onStatusChange?: (status?: PackageStatus) => void;
  /** 搜索关键词变更回调 */
  onKeywordChange?: (keyword: string) => void;
  /** 搜索提交回调 */
  onSearch?: (keyword: string) => void;
  /** 重置筛选回调 */
  onReset?: () => void;
  /** 是否加载中 */
  loading?: boolean;
}

/** 状态选项 */
const STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '已下架', value: 'UNPUBLISHED' },
];

/**
 * 场景包列表筛选组件
 *
 * 提供状态筛选和关键词搜索功能
 */
export const PackageListFilters: React.FC<PackageListFiltersProps> = ({
  status,
  keyword,
  onStatusChange,
  onKeywordChange,
  onSearch,
  onReset,
  loading = false,
}) => {
  const handleStatusChange = (value: string) => {
    onStatusChange?.((value as PackageStatus) || undefined);
  };

  const handleSearch = (value: string) => {
    onSearch?.(value);
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <Space wrap style={{ marginBottom: 16 }}>
      {/* 状态筛选 */}
      <Select
        value={status || ''}
        onChange={handleStatusChange}
        options={STATUS_OPTIONS}
        style={{ width: 120 }}
        placeholder="状态筛选"
        disabled={loading}
      />

      {/* 搜索框 */}
      <Search
        placeholder="搜索场景包名称"
        value={keyword}
        onChange={(e) => onKeywordChange?.(e.target.value)}
        onSearch={handleSearch}
        style={{ width: 250 }}
        enterButton={<SearchOutlined />}
        allowClear
        disabled={loading}
      />

      {/* 重置按钮 */}
      <Button icon={<ReloadOutlined />} onClick={handleReset} disabled={loading}>
        重置
      </Button>
    </Space>
  );
};

export default PackageListFilters;
