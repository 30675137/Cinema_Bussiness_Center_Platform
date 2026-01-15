/**
 * @spec O001-product-order-list
 * 订单筛选组件 - User Story 2
 */

import React from 'react';
import { Form, Select, DatePicker, Input, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { OrderStatus } from '../types/order';
import { ORDER_STATUS_CONFIG } from '../utils/formatOrderStatus';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export interface OrderFilterValues {
  status?: OrderStatus;
  dateRange?: [Dayjs, Dayjs];
  search?: string;
}

export interface OrderFilterProps {
  /**
   * 筛选条件变化回调
   */
  onFilter: (values: OrderFilterValues) => void;

  /**
   * 重置回调
   */
  onReset: () => void;

  /**
   * 默认值
   */
  defaultValues?: OrderFilterValues;

  /**
   * 加载状态
   */
  loading?: boolean;
}

/**
 * 订单筛选组件
 *
 * 包含:
 * - 订单状态下拉选择
 * - 时间范围选择（默认最近30天）
 * - 搜索框（订单号、用户名、手机号）
 * - 查询按钮
 * - 重置按钮
 *
 * @example
 * ```tsx
 * <OrderFilter
 *   onFilter={(values) => setQueryParams({ ...values, page: 1 })}
 *   onReset={() => setQueryParams({ page: 1, pageSize: 20 })}
 *   defaultValues={{
 *     dateRange: [dayjs().subtract(30, 'days'), dayjs()]
 *   }}
 * />
 * ```
 */
export const OrderFilter: React.FC<OrderFilterProps> = React.memo(
  ({ onFilter, onReset, defaultValues, loading = false }) => {
    const [form] = Form.useForm<OrderFilterValues>();

    // 设置默认时间范围为最近30天
    React.useEffect(() => {
      if (defaultValues?.dateRange) {
        form.setFieldsValue({
          dateRange: defaultValues.dateRange,
        });
      } else {
        // 默认最近30天
        form.setFieldsValue({
          dateRange: [dayjs().subtract(30, 'days'), dayjs()],
        });
      }
    }, [form, defaultValues]);

    // 处理表单提交
    const handleFinish = (values: OrderFilterValues) => {
      onFilter(values);
    };

    // 处理重置
    const handleReset = () => {
      form.resetFields();
      // 重置后恢复默认时间范围
      form.setFieldsValue({
        dateRange: [dayjs().subtract(30, 'days'), dayjs()],
      });
      onReset();
    };

    return (
      <Form<OrderFilterValues>
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="order-filter"
      >
        <Row gutter={[16, 16]}>
          {/* 订单状态 */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="订单状态" name="status">
              <Select placeholder="全部状态" allowClear style={{ width: '100%' }}>
                {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                  <Option key={key} value={key}>
                    {config.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* 时间范围 */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="创建时间" name="dateRange">
              <RangePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>

          {/* 搜索框 */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="搜索" name="search">
              <Input placeholder="订单号/用户名/手机号" prefix={<SearchOutlined />} allowClear />
            </Form.Item>
          </Col>

          {/* 操作按钮 */}
          <Col xs={24} sm={12} md={4}>
            <Form.Item label=" " colon={false}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
);

OrderFilter.displayName = 'OrderFilter';

export default OrderFilter;
