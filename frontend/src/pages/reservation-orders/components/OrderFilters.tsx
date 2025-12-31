/**
 * 预约单列表筛选组件
 *
 * 提供按状态、日期范围、关键词筛选功能
 */

import React, { useCallback, memo } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type {
  ReservationFilterFormValues,
  OrderFiltersProps,
} from '../types/reservation-order.types';
import { RESERVATION_STATUS_CONFIG } from '../types/reservation-order.types';
import type { ReservationStatus } from '@/types/reservationOrder';

const { RangePicker } = DatePicker;

/**
 * 状态选项
 */
const STATUS_OPTIONS = (Object.keys(RESERVATION_STATUS_CONFIG) as ReservationStatus[]).map(
  (key) => ({
    value: key,
    label: RESERVATION_STATUS_CONFIG[key].label,
  })
);

/**
 * 预约单列表筛选组件
 */
const OrderFilters: React.FC<OrderFiltersProps> = ({ onFilterChange, loading }) => {
  const [form] = Form.useForm<ReservationFilterFormValues>();

  /**
   * 处理筛选条件变更
   */
  const handleFilter = useCallback(
    (values: ReservationFilterFormValues) => {
      onFilterChange(values);
    },
    [onFilterChange]
  );

  /**
   * 处理重置
   */
  const handleReset = useCallback(() => {
    form.resetFields();
    onFilterChange({});
  }, [form, onFilterChange]);

  /**
   * 处理搜索
   */
  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    handleFilter(values);
  }, [form, handleFilter]);

  return (
    <Form
      form={form}
      layout="inline"
      onValuesChange={(_, allValues) => handleFilter(allValues)}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        {/* 关键词搜索 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="orderNumber" style={{ marginBottom: 0, width: '100%' }}>
            <Input
              placeholder="搜索预约单号/手机号"
              prefix={<SearchOutlined />}
              allowClear
              onPressEnter={handleSearch}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* 状态筛选 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="statuses" style={{ marginBottom: 0, width: '100%' }}>
            <Select
              mode="multiple"
              placeholder="选择状态"
              options={STATUS_OPTIONS}
              allowClear
              maxTagCount={2}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>

        {/* 预订日期范围 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="dateRange" style={{ marginBottom: 0, width: '100%' }}>
            <RangePicker placeholder={['预订开始', '预订结束']} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        {/* 操作按钮 */}
        <Col xs={24} sm={12} md={8} lg={6}>
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
        </Col>
      </Row>
    </Form>
  );
};

export default memo(OrderFilters);
