/**
 * StoreSearch Component
 *
 * Search input for filtering stores by name
 * Follows pattern from BrandSearchForm
 */

import React, { useState } from 'react';
import { Input, Button, Space, Form } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface StoreSearchProps {
  onSearch: (name: string) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * Store Search Component
 * Provides search input for filtering stores by name
 */
const StoreSearch: React.FC<StoreSearchProps> = ({ onSearch, onReset, loading = false }) => {
  const [form] = Form.useForm();

  // Handle search
  const handleSearch = () => {
    const values = form.getFieldsValue();
    onSearch(values.name || '');
  };

  // Handle reset
  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  // Handle Enter key press
  const handlePressEnter = () => {
    handleSearch();
  };

  return (
    <div className="store-search-wrapper">
      <Form form={form} layout="inline" onFinish={handleSearch}>
        <Form.Item name="name" label="门店名称">
          <Input
            placeholder="请输入门店名称"
            onPressEnter={handlePressEnter}
            allowClear
            style={{ width: 200 }}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default StoreSearch;
