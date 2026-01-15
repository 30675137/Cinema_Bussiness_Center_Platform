/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * Channel Product Filter Component
 */

import React from 'react';
import { Form, Select, Input, Row, Col, Space, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { ChannelProductStatus, ChannelType, CHANNEL_PRODUCT_STATUS_LABELS } from '../types';
import { useChannelProductStore } from '../stores/useChannelProductStore';
import { CategorySelect } from './CategorySelect';

export const ChannelProductFilter: React.FC = () => {
  const { filters, setFilters, resetFilters } = useChannelProductStore();
  const [form] = Form.useForm();

  // Sync form with store
  React.useEffect(() => {
    form.setFieldsValue(filters);
  }, [filters, form]);

  const handleValuesChange = (_: any, allValues: any) => {
    setFilters(allValues);
  };

  const handleReset = () => {
    form.resetFields();
    resetFilters();
  };

  return (
    <Form
      form={form}
      layout="inline"
      onValuesChange={handleValuesChange}
      style={{ marginBottom: 24 }}
    >
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        {/* Channel Type Filter (Hidden for MVP as we focus on MINI_PROGRAM, but kept for future) */}
        <Col span={6} hidden>
          <Form.Item name="channelType" label="渠道">
            <Select placeholder="选择渠道" disabled>
              {Object.values(ChannelType).map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name="categoryId" label="分类" style={{ width: '100%' }}>
            <CategorySelect mode="create" placeholder="全部分类" allowClear />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name="status" label="状态" style={{ width: '100%' }}>
            <Select placeholder="全部状态" allowClear style={{ width: 120 }}>
              {Object.values(ChannelProductStatus).map((status) => (
                <Select.Option key={status} value={status}>
                  {CHANNEL_PRODUCT_STATUS_LABELS[status]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name="keyword" style={{ width: '100%' }}>
            <Input placeholder="搜索名称或 SKU 编码" prefix={<SearchOutlined />} allowClear />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};
