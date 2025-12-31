import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Table,
  Modal,
  message,
  Divider,
  Tooltip,
  Tag,
  Switch,
} from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TextArea } = Input;

interface TierRule {
  id: string;
  minQuantity: number;
  maxQuantity?: number;
  discount: number;
  price: number;
}

interface DynamicRule {
  id: string;
  condition: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
  value: string | number;
  adjustment: number;
  adjustmentType: 'percentage' | 'fixed';
}

interface PricingStrategyConfig {
  type: 'fixed' | 'percentage' | 'tiered' | 'dynamic';
  basePrice?: number;
  discountRate?: number;
  tierRules?: TierRule[];
  dynamicRules?: DynamicRule[];
  roundTo?: number;
  applyTax?: boolean;
  taxRate?: number;
}

interface PricingStrategyFormProps {
  initialValues?: Partial<PricingStrategyConfig>;
  onSubmit: (values: PricingStrategyConfig) => void;
  onCancel: () => void;
}

const PricingStrategyForm: React.FC<PricingStrategyFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [strategyType, setStrategyType] = useState<'fixed' | 'percentage' | 'tiered' | 'dynamic'>(
    initialValues?.type || 'fixed'
  );
  const [tierRules, setTierRules] = useState<TierRule[]>(initialValues?.tierRules || []);
  const [dynamicRules, setDynamicRules] = useState<DynamicRule[]>(
    initialValues?.dynamicRules || []
  );

  const handleSubmit = (values: any) => {
    const config: PricingStrategyConfig = {
      type: strategyType,
      ...values,
      tierRules: strategyType === 'tiered' ? tierRules : undefined,
      dynamicRules: strategyType === 'dynamic' ? dynamicRules : undefined,
    };

    onSubmit(config);
  };

  // 添加阶梯规则
  const addTierRule = () => {
    const newRule: TierRule = {
      id: Date.now().toString(),
      minQuantity:
        tierRules.length > 0 ? Math.max(...tierRules.map((r) => r.maxQuantity || 0)) + 1 : 1,
      discount: 0.1,
      price: 100,
    };
    setTierRules([...tierRules, newRule]);
  };

  // 更新阶梯规则
  const updateTierRule = (id: string, field: keyof TierRule, value: any) => {
    setTierRules(tierRules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
  };

  // 删除阶梯规则
  const removeTierRule = (id: string) => {
    setTierRules(tierRules.filter((rule) => rule.id !== id));
  };

  // 添加动态规则
  const addDynamicRule = () => {
    const newRule: DynamicRule = {
      id: Date.now().toString(),
      condition: 'customer_level',
      operator: 'eq',
      value: 'vip',
      adjustment: 0.15,
      adjustmentType: 'percentage',
    };
    setDynamicRules([...dynamicRules, newRule]);
  };

  // 更新动态规则
  const updateDynamicRule = (id: string, field: keyof DynamicRule, value: any) => {
    setDynamicRules(
      dynamicRules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule))
    );
  };

  // 删除动态规则
  const removeDynamicRule = (id: string) => {
    setDynamicRules(dynamicRules.filter((rule) => rule.id !== id));
  };

  // 阶梯规则表格列
  const tierColumns: ColumnsType<TierRule> = [
    {
      title: '最小数量',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      render: (value: number, record: TierRule) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => updateTierRule(record.id, 'minQuantity', val || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '最大数量',
      dataIndex: 'maxQuantity',
      key: 'maxQuantity',
      render: (value: number | undefined, record: TierRule) => (
        <InputNumber
          min={1}
          value={value}
          placeholder="无限制"
          onChange={(val) => updateTierRule(record.id, 'maxQuantity', val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '折扣率',
      dataIndex: 'discount',
      key: 'discount',
      render: (value: number, record: TierRule) => (
        <InputNumber
          min={0}
          max={1}
          step={0.01}
          value={value}
          formatter={(value) => `${((value || 0) * 100).toFixed(1)}%`}
          parser={(value) => {
            const parsed = parseFloat((value || '').replace('%', '')) / 100;
            return isNaN(parsed) ? 0 : parsed;
          }}
          onChange={(val) => updateTierRule(record.id, 'discount', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (value: number, record: TierRule) => (
        <InputNumber
          min={0}
          precision={2}
          value={value}
          formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value!.replace(/¥\s?|(,*)/g, '')) as 0}
          onChange={(val) => updateTierRule(record.id, 'price', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TierRule) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeTierRule(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  // 动态规则表格列
  const dynamicColumns: ColumnsType<DynamicRule> = [
    {
      title: '条件',
      dataIndex: 'condition',
      key: 'condition',
      render: (value: string, record: DynamicRule) => (
        <Select
          value={value}
          onChange={(val) => updateDynamicRule(record.id, 'condition', val)}
          style={{ width: '100%' }}
        >
          <Option value="customer_level">客户等级</Option>
          <Option value="order_total">订单总额</Option>
          <Option value="purchase_count">购买次数</Option>
          <Option value="time_of_day">购买时间</Option>
          <Option value="season">季节</Option>
          <Option value="location">地区</Option>
        </Select>
      ),
    },
    {
      title: '操作符',
      dataIndex: 'operator',
      key: 'operator',
      render: (value: string, record: DynamicRule) => (
        <Select
          value={value}
          onChange={(val) => updateDynamicRule(record.id, 'operator', val)}
          style={{ width: '100%' }}
        >
          <Option value="eq">等于</Option>
          <Option value="gt">大于</Option>
          <Option value="lt">小于</Option>
          <Option value="gte">大于等于</Option>
          <Option value="lte">小于等于</Option>
          <Option value="between">介于</Option>
        </Select>
      ),
    },
    {
      title: '比较值',
      dataIndex: 'value',
      key: 'value',
      render: (value: string | number, record: DynamicRule) => (
        <Input
          value={value}
          onChange={(e) => updateDynamicRule(record.id, 'value', e.target.value)}
          placeholder="输入比较值"
        />
      ),
    },
    {
      title: '调整类型',
      dataIndex: 'adjustmentType',
      key: 'adjustmentType',
      render: (value: string, record: DynamicRule) => (
        <Select
          value={value}
          onChange={(val) => updateDynamicRule(record.id, 'adjustmentType', val)}
          style={{ width: '100%' }}
        >
          <Option value="percentage">百分比</Option>
          <Option value="fixed">固定金额</Option>
        </Select>
      ),
    },
    {
      title: '调整值',
      dataIndex: 'adjustment',
      key: 'adjustment',
      render: (value: number, record: DynamicRule) => (
        <InputNumber
          min={-1}
          max={1}
          step={0.01}
          value={value}
          formatter={(val) =>
            record.adjustmentType === 'percentage' ? `${((val || 0) * 100).toFixed(1)}%` : `¥${val}`
          }
          parser={(val) => parseFloat((val || '').replace(/[¥%]/g, '')) as 0}
          onChange={(val) => updateDynamicRule(record.id, 'adjustment', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: DynamicRule) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeDynamicRule(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit}>
      <Card title="基础配置" size="small" style={{ marginBottom: 16 }}>
        <Form.Item
          name="type"
          label="策略类型"
          rules={[{ required: true, message: '请选择策略类型' }]}
        >
          <Select value={strategyType} onChange={setStrategyType} placeholder="请选择策略类型">
            <Option value="fixed">固定价格</Option>
            <Option value="percentage">百分比折扣</Option>
            <Option value="tiered">阶梯定价</Option>
            <Option value="dynamic">动态定价</Option>
          </Select>
        </Form.Item>

        {strategyType === 'fixed' && (
          <Form.Item
            name="basePrice"
            label="基础价格"
            rules={[{ required: true, message: '请输入基础价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入基础价格"
              precision={2}
              min={0}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/¥\s?|(,*)/g, '')) as 0}
            />
          </Form.Item>
        )}

        {strategyType === 'percentage' && (
          <Form.Item
            name="discountRate"
            label="折扣率"
            rules={[{ required: true, message: '请输入折扣率' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入折扣率 (0.1 = 9折)"
              precision={3}
              min={0}
              max={1}
              formatter={(value) => `${((1 - (value || 0)) * 100).toFixed(1)}%`}
              parser={(value) => {
                const parsed = parseFloat((value || '').replace('%', '')) / 100;
                return isNaN(parsed) ? (1 as 0 | 1) : ((1 - parsed) as 0 | 1);
              }}
            />
          </Form.Item>
        )}
      </Card>

      {strategyType === 'tiered' && (
        <Card
          title={
            <Space>
              <span>阶梯规则配置</span>
              <Tooltip title="根据购买数量设置不同的价格或折扣">
                <InfoCircleOutlined style={{ color: '#666' }} />
              </Tooltip>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addTierRule} block>
              添加阶梯规则
            </Button>
          </div>

          <Table
            columns={tierColumns}
            dataSource={tierRules}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {strategyType === 'dynamic' && (
        <Card
          title={
            <Space>
              <span>动态规则配置</span>
              <Tooltip title="根据各种条件动态调整价格">
                <InfoCircleOutlined style={{ color: '#666' }} />
              </Tooltip>
            </Space>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addDynamicRule} block>
              添加动态规则
            </Button>
          </div>

          <Table
            columns={dynamicColumns}
            dataSource={dynamicRules}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      <Card title="高级配置" size="small" style={{ marginBottom: 16 }}>
        <Form.Item name="roundTo" label="价格舍入到" tooltip="最终价格将舍入到指定的小数位">
          <InputNumber
            min={0}
            max={2}
            placeholder="2"
            formatter={(value) => `${value} 位小数`}
            parser={(value) => {
              const parsed = parseInt((value || '').replace(/[^\d]/g, ''));
              return isNaN(parsed) ? (0 as 0 | 2) : (parsed as 0 | 2);
            }}
          />
        </Form.Item>

        <Form.Item name="applyTax" label="应用税费" valuePropName="checked">
          <Switch /> 是否应用税费计算
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.applyTax !== currentValues.applyTax
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('applyTax') ? (
              <Form.Item
                name="taxRate"
                label="税率"
                rules={[{ required: true, message: '请输入税率' }]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.01}
                  placeholder="0.13"
                  formatter={(value) => `${((value || 0) * 100).toFixed(1)}%`}
                  parser={(value) => {
                    const parsed = parseFloat((value || '').replace('%', '')) / 100;
                    return isNaN(parsed) ? (0 as 0 | 1) : (parsed as 0 | 1);
                  }}
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </Card>

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            保存策略
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default PricingStrategyForm;
