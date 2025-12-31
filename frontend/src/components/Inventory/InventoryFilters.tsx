import React from 'react';
import { Form, Input, Select, Button, Space, DatePicker, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { InventoryQueryParams } from '@/types/inventory';
import { useResponsive } from '@/hooks/useResponsive';

const { RangePicker } = DatePicker;

interface InventoryFiltersProps {
  onFilter: (values: Partial<InventoryQueryParams>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * 库存台账筛选器组件
 * 支持SKU、门店、状态等多维度筛选
 */
export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  onFilter,
  onReset,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { isMobile, isTablet } = useResponsive();

  const handleFinish = (values: any) => {
    const params: Partial<InventoryQueryParams> = {
      keyword: values.keyword,
      storeId: values.storeId,
      status: values.status,
    };

    if (values.dateRange) {
      params.dateRange = [
        values.dateRange[0].format('YYYY-MM-DD'),
        values.dateRange[1].format('YYYY-MM-DD'),
      ];
    }

    onFilter(params);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  // 库存状态选项
  const statusOptions = [
    { label: '全部', value: undefined },
    { label: '缺货', value: 'out_of_stock' },
    { label: '低于安全库存', value: 'low_stock' },
    { label: '正常', value: 'normal' },
    { label: '超库存', value: 'overstock' },
  ];

  // 门店选项（模拟数据）
  const storeOptions = [
    { label: '全部门店', value: undefined },
    { label: '中央仓库', value: 'warehouse-001' },
    { label: '北京门店', value: 'store-beijing' },
    { label: '上海门店', value: 'store-shanghai' },
    { label: '深圳门店', value: 'store-shenzhen' },
  ];

  const formLayout = isMobile
    ? { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    : { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Form form={form} onFinish={handleFinish} {...formLayout} style={{ marginBottom: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Form.Item label="关键词" name="keyword" style={{ marginBottom: 0 }}>
            <Input placeholder="SKU编码/名称" prefix={<SearchOutlined />} allowClear />
          </Form.Item>

          <Form.Item label="门店/仓库" name="storeId" style={{ marginBottom: 0 }}>
            <Select placeholder="选择门店" options={storeOptions} allowClear />
          </Form.Item>

          <Form.Item label="库存状态" name="status" style={{ marginBottom: 0 }}>
            <Select placeholder="选择状态" options={statusOptions} allowClear />
          </Form.Item>

          <Form.Item label="更新时间" name="dateRange" style={{ marginBottom: 0 }}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item style={{ marginBottom: 0, textAlign: isMobile ? 'center' : 'right' }}>
          <Space>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              重置
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
              查询
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InventoryFilters;
