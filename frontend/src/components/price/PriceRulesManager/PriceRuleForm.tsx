import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Divider,
  Alert,
  Tag
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  PriceRule,
  PriceRuleInput,
  PriceRuleSchema,
  PriceRuleType,
  PriceRuleTypeConfig
} from '@/types/price';
import PriceRuleConfig from '../PriceForm/PriceRuleConfig';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface PriceRuleFormProps {
  mode: 'create' | 'edit';
  rule?: PriceRule;
  onSuccess?: () => void;
}

const PriceRuleForm: React.FC<PriceRuleFormProps> = ({
  mode,
  rule,
  onSuccess
}) => {
  const form = useForm<PriceRuleInput>({
    resolver: zodResolver(PriceRuleSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      type: PriceRuleType.FIXED_DISCOUNT,
      description: '',
      config: {
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: undefined,
        maxDiscountAmount: undefined
      },
      isActive: true,
      priority: 1
    }
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, touched, isValid }
  } = form;

  // 编辑模式加载数据
  useEffect(() => {
    if (mode === 'edit' && rule) {
      Object.keys(rule).forEach(key => {
        if (key in getValues()) {
          setValue(key as keyof PriceRuleInput, rule[key as any]);
        }
      });
    }
  }, [mode, rule, setValue, getValues]);

  // 提交表单
  const onSubmit = async (data: PriceRuleInput) => {
    try {
      if (mode === 'create') {
        // 这里需要调用创建规则API
        console.log('创建规则:', data);
      } else {
        // 这里需要调用更新规则API
        console.log('更新规则:', data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  // 重置表单
  const handleReset = () => {
    form.reset();
  };

  // 规则类型变化时重置配置
  const handleRuleTypeChange = (value: PriceRuleType) => {
    setValue('type', value);
    setValue('config', {
      discountType: 'percentage',
      discountValue: 0,
      minOrderValue: undefined,
      maxDiscountAmount: undefined
    });
  };

  // 折扣类型配置
  const discountTypeConfig = {
    percentage: { label: '百分比折扣', placeholder: '0-100', suffix: '%' },
    fixed: { label: '固定金额', placeholder: '0.00', suffix: '元' },
    fixed_amount: { label: '固定金额', placeholder: '0.00', suffix: '元' }
  };

  // 条件类型配置
  const conditionTypeConfig = {
    product_category: { label: '商品类目', options: [] },
    member_level: { label: '会员等级', options: ['青铜会员', '白银会员', '黄金会员', '铂金会员', '钻石会员'] },
    quantity_range: { label: '购买数量', options: [] },
    date_range: { label: '日期范围', options: [] },
    channel: { label: '销售渠道', options: ['线上渠道', '线下门店', '微信小程序', 'APP应用'] }
  };

  // 添加条件
  const [conditions, setConditions] = useState<any[]>([]);

  const addCondition = () => {
    setConditions([...conditions, {
      id: Date.now().toString(),
      type: 'product_category',
      operator: 'equals',
      field: '',
      value: '',
      logic: 'and'
    }]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: string, value: any) => {
    setConditions(conditions.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // 添加动作
  const [actions, setActions] = useState<any[]>([]);

  const addAction = () => {
    setActions([...actions, {
      id: Date.now().toString(),
      type: 'discount',
      config: {
        discountType: 'percentage',
        discountValue: 0
      }
    }]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter(a => a.id !== id));
  };

  const updateAction = (id: string, field: string, value: any) => {
    setActions(actions.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  return (
    <Form layout="vertical" onSubmit={handleSubmit(onSubmit)}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基础信息 */}
        <Card title="基础信息" size="small">
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="规则名称"
                required
                validateStatus={errors.name ? 'error' : undefined}
                help={errors.name?.message as string}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="请输入规则名称"
                      maxLength={100}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="规则类型"
                required
                validateStatus={errors.type ? 'error' : undefined}
                help={errors.type?.message as string}
              >
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="请选择规则类型"
                      onChange={handleRuleTypeChange}
                    >
                      {Object.entries(PriceRuleTypeConfig).map(([value, config]) => (
                        <Option key={value} value={value}>
                          <Tag color="blue">{config.text}</Tag>
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Form.Item
                label="规则描述"
                validateStatus={errors.description ? 'error' : undefined}
                help={errors.description?.message as string}
              >
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      {...field}
                      placeholder="请输入规则描述（可选）"
                      rows={3}
                      maxLength={500}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="优先级"
                required
                validateStatus={errors.priority ? 'error' : undefined}
                help={errors.priority?.message as string}
              >
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="1"
                      min={1}
                      max={100}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="启用状态">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      {...field}
                      checkedChildren="启用"
                      unCheckedChildren="停用"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 折扣配置 */}
        <Card title="折扣配置" size="small">
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="折扣类型">
                <Controller
                  name="config.discountType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      style={{ width: '100%' }}
                    >
                      <Option value="percentage">百分比折扣</Option>
                      <Option value="fixed">固定金额</Option>
                      <Option value="fixed_amount">固定金额</Option>
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="折扣值"
                required
              >
                <Controller
                  name="config.discountValue"
                  control={control}
                  render={({ field }) => {
                    const discountType = watch('config.discountType');
                    const config = discountTypeConfig[discountType as keyof typeof discountTypeConfig];

                    return (
                      <InputNumber
                        {...field}
                        style={{ width: '100%' }}
                        placeholder={config.placeholder}
                        min={0}
                        max={discountType === 'percentage' ? 100 : undefined}
                        precision={discountType === 'percentage' ? 0 : 2}
                        addonAfter={config.suffix}
                      />
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="最低订单金额">
                <Controller
                  name="config.minOrderValue"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="不限制"
                      min={0}
                      addonBefore="¥"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大折扣金额">
                <Controller
                  name="config.maxDiscountAmount"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="不限制"
                      min={0}
                      addonBefore="¥"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 高级配置 */}
        <Card
          title="高级配置"
          size="small"
          extra={
            <Space>
              <Button size="small" onClick={addCondition}>
                添加条件
              </Button>
              <Button size="small" onClick={addAction}>
                添加动作
              </Button>
            </Space>
          }
        >
          <Title level={5}>触发条件</Title>
          {conditions.length === 0 ? (
            <Alert
              message="暂无触发条件"
              description="点击&quot;添加条件&quot;按钮来创建触发条件，当满足条件时将应用此价格规则。"
              type="info"
              style={{ marginBottom: 16 }}
            />
          ) : (
            <div style={{ marginBottom: 16 }}>
              {conditions.map((condition, index) => (
                <Card
                  key={condition.id}
                  size="small"
                  style={{ marginBottom: 8 }}
                  title={`条件 ${index + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => removeCondition(condition.id)}
                    >
                      删除
                    </Button>
                  }
                >
                  <Row gutter={8}>
                    <Col span={6}>
                      <Select
                        value={condition.type}
                        onChange={(value) => updateCondition(condition.id, 'type', value)}
                        style={{ width: '100%' }}
                      >
                        {Object.entries(conditionTypeConfig).map(([value, config]) => (
                          <Option key={value} value={value}>
                            {config.label}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Select
                        value={condition.operator}
                        onChange={(value) => updateCondition(condition.id, 'operator', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value="equals">等于</Option>
                        <Option value="in">包含</Option>
                        <Option value="greater_than">大于</Option>
                        <Option value="less_than">小于</Option>
                        <Option value="between">介于</Option>
                      </Select>
                    </Col>
                    <Col span={6}>
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                        placeholder="条件值"
                      />
                    </Col>
                    <Col span={4}>
                      <Select
                        value={condition.logic}
                        onChange={(value) => updateCondition(condition.id, 'logic', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value="and">并且</Option>
                        <Option value="or">或者</Option>
                      </Select>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          )}

          <Title level={5}>执行动作</Title>
          {actions.length === 0 ? (
            <Alert
              message="暂无执行动作"
              description="点击“添加动作”按钮来创建执行动作，当规则触发时将执行这些动作。"
              type="info"
              style={{ marginBottom: 16 }}
            />
          ) : (
            <div>
              {actions.map((action, index) => (
                <Card
                  key={action.id}
                  size="small"
                  style={{ marginBottom: 8 }}
                  title={`动作 ${index + 1}`}
                  extra={
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => removeAction(action.id)}
                    >
                      删除
                    </Button>
                  }
                >
                  <Row gutter={8}>
                    <Col span={8}>
                      <Select
                        value={action.type}
                        onChange={(value) => updateAction(action.id, 'type', value)}
                        style={{ width: '100%' }}
                      >
                        <Option value="discount">折扣</Option>
                        <Option value="fixed_price">固定价格</Option>
                        <Option value="free_shipping">免运费</Option>
                        <Option value="gift">赠品</Option>
                      </Select>
                    </Col>
                    <Col span={16}>
                      <Input
                        value={JSON.stringify(action.config)}
                        onChange={(e) => {
                          try {
                            const config = JSON.parse(e.target.value);
                            updateAction(action.id, 'config', config);
                          } catch (error) {
                            console.error('JSON解析错误:', error);
                          }
                        }}
                        placeholder="动作配置（JSON格式）"
                      />
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* 规则说明 */}
        <Alert
          message="规则执行说明"
          description="1. 系统会按照优先级从高到低检查规则 2. 规则条件满足时会执行相应动作 3. 多个条件可以使用'并且'或'或者'逻辑连接 4. 规则支持设置多个执行动作"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginTop: 16 }}
        />

        {/* 操作按钮 */}
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={handleReset}>
                重置
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isValid}
              >
                {mode === 'create' ? '创建规则' : '保存修改'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Space>
    </Form>
  );
};

export default PriceRuleForm;