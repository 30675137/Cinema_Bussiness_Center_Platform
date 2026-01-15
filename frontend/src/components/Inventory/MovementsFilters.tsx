import React from 'react';
import { Form, Input, Select, Button, Space, DatePicker, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { InventoryQueryParams } from '@/types/inventory';
import { TransactionType, SourceType } from '@/types/inventory';
import { useResponsive } from '@/hooks/useResponsive';
import { getTransactionTypeLabel, getSourceTypeLabel } from '@/utils/inventoryHelpers';

const { RangePicker } = DatePicker;

interface MovementsFiltersProps {
  onFilter: (values: Partial<InventoryQueryParams>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * 库存流水筛选器组件
 * 支持SKU、门店、交易类型、时间范围等多维度筛选
 */
export const MovementsFilters: React.FC<MovementsFiltersProps> = ({
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
      transactionType: values.transactionType,
      sourceType: values.sourceType,
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

  // 交易类型选项
  const transactionTypeOptions = Object.values(TransactionType).map((type) => {
    const { label, color } = getTransactionTypeLabel(type);
    return {
      label,
      value: type,
    };
  });

  // 来源类型选项
  const sourceTypeOptions = Object.values(SourceType).map((type) => {
    const { label } = getSourceTypeLabel(type);
    return {
      label,
      value: type,
    };
  });

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
            <Input placeholder="SKU编码/单据号" prefix={<SearchOutlined />} allowClear />
          </Form.Item>

          <Form.Item label="门店/仓库" name="storeId" style={{ marginBottom: 0 }}>
            <Select placeholder="选择门店" options={storeOptions} allowClear />
          </Form.Item>

          <Form.Item label="交易类型" name="transactionType" style={{ marginBottom: 0 }}>
            <Select
              mode="multiple"
              placeholder="选择交易类型"
              options={transactionTypeOptions}
              allowClear
              maxTagCount="responsive"
            />
          </Form.Item>

          <Form.Item label="来源类型" name="sourceType" style={{ marginBottom: 0 }}>
            <Select
              mode="multiple"
              placeholder="选择来源类型"
              options={sourceTypeOptions}
              allowClear
              maxTagCount="responsive"
            />
          </Form.Item>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Form.Item
            label="交易时间"
            name="dateRange"
            labelCol={{ span: isMobile ? 24 : 3 }}
            wrapperCol={{ span: isMobile ? 24 : 21 }}
            style={{ marginBottom: 0 }}
          >
            <RangePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
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

export default MovementsFilters;
