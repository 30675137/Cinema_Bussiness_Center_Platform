/**
 * StoreSelector Component
 *
 * 门店多选组件，用于场景包编辑页面选择关联门店。
 * 复用 Ant Design Tag.CheckableTag 实现多选交互。
 *
 * Features:
 * - 展示所有活跃门店列表
 * - 支持多选切换
 * - 支持搜索筛选（按名称和区域）
 * - 显示已选中/未选中状态
 * - 处理加载和错误状态
 *
 * @author Cinema Platform
 * @since 2025-12-21
 * Feature: 019-store-association
 */

import React, { useState, useMemo } from 'react';
import { Tag, Input, Empty, Spin, Alert, Space } from 'antd';
import { SearchOutlined, ShopOutlined } from '@ant-design/icons';
import { useActiveStores } from '../../hooks/useStores';
import type { StoreSelectorProps } from '../../types';

/**
 * 门店选择器组件
 *
 * @param value 已选中的门店ID列表
 * @param onChange 选中状态变化回调
 * @param disabled 是否禁用
 * @param required 是否必填（至少选择一个）
 */
export const StoreSelector: React.FC<StoreSelectorProps> = ({
  value = [],
  onChange,
  disabled = false,
  required = true,
}) => {
  // 搜索关键词状态
  const [searchText, setSearchText] = useState('');

  // 获取活跃门店列表
  const { data: stores = [], isLoading, isError, error } = useActiveStores();

  // 前端搜索过滤
  const filteredStores = useMemo(() => {
    if (!searchText.trim()) return stores;
    const lowerSearch = searchText.toLowerCase().trim();
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(lowerSearch) ||
        (store.region?.toLowerCase().includes(lowerSearch) ?? false)
    );
  }, [stores, searchText]);

  // 切换选中状态
  const handleToggle = (storeId: string) => {
    if (disabled) return;
    const newValue = value.includes(storeId)
      ? value.filter((id) => id !== storeId)
      : [...value, storeId];
    onChange(newValue);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin tip="加载门店列表..." />
      </div>
    );
  }

  // 错误状态
  if (isError) {
    return (
      <Alert
        type="error"
        message="加载门店列表失败"
        description={(error as Error)?.message || '请稍后重试'}
        showIcon
      />
    );
  }

  // 空列表状态
  if (stores.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="暂无可用门店，请先添加门店"
      />
    );
  }

  return (
    <div>
      {/* 搜索输入框 */}
      <Input
        placeholder="搜索门店名称或区域"
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 12 }}
        allowClear
        disabled={disabled}
      />

      {/* 门店选择标签列表 */}
      <Space wrap style={{ width: '100%' }}>
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <Tag.CheckableTag
              key={store.id}
              checked={value.includes(store.id)}
              onChange={() => handleToggle(store.id)}
              style={{
                padding: '4px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: 16,
                backgroundColor: value.includes(store.id)
                  ? '#1890ff'
                  : 'transparent',
                color: value.includes(store.id) ? '#fff' : 'inherit',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <ShopOutlined style={{ marginRight: 4 }} />
              {store.name}
              {store.region && (
                <span style={{ opacity: 0.7, marginLeft: 4 }}>
                  ({store.region})
                </span>
              )}
            </Tag.CheckableTag>
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={`未找到包含"${searchText}"的门店`}
            style={{ margin: '12px auto' }}
          />
        )}
      </Space>

      {/* 必填验证提示 */}
      {required && value.length === 0 && (
        <div style={{ color: '#ff4d4f', marginTop: 8, fontSize: 14 }}>
          请至少选择一个门店
        </div>
      )}

      {/* 已选数量提示 */}
      {value.length > 0 && (
        <div style={{ color: '#8c8c8c', marginTop: 8, fontSize: 12 }}>
          已选择 {value.length} 个门店
        </div>
      )}
    </div>
  );
};

export default StoreSelector;
