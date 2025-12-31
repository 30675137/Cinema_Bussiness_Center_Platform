import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Switch,
  Divider,
  Alert,
  Tag,
  message,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';

import {
  PriceConfig,
  PriceFormData,
  PriceConfigSchema,
  PriceType,
  PriceStatus,
  PriceRuleType,
  PriceTypeConfig,
} from '@/types/price';
import { useCreatePriceMutation, useUpdatePriceMutation } from '@/stores/priceStore';
import PriceRuleConfig from './PriceRuleConfig';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface PriceFormProps {
  mode: 'create' | 'edit';
  price?: PriceConfig;
  onSuccess?: () => void;
  productId?: string;
}

const PriceForm: React.FC<PriceFormProps> = ({ mode, price, onSuccess, productId }) => {
  const createMutation = useCreatePriceMutation();
  const updateMutation = useUpdatePriceMutation();
  const [showRuleConfig, setShowRuleConfig] = useState(false);

  const form = useForm<PriceFormData>({
    resolver: zodResolver(PriceConfigSchema),
    mode: 'onChange',
    defaultValues: {
      priceType: PriceType.BASE,
      basePrice: 0,
      currentPrice: 0,
      originalPrice: undefined,
      currency: 'CNY',
      effectiveFrom: dayjs().format('YYYY-MM-DD'),
      effectiveTo: undefined,
      priority: 1,
      channels: [],
      memberLevels: [],
      minQuantity: undefined,
      maxQuantity: undefined,
      ruleType: undefined,
      ruleConfig: undefined,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, touched, isValid },
    trigger,
  } = form;

  // 监听价格类型变化
  const priceType = watch('priceType');
  const ruleType = watch('ruleType');

  // 编辑模式加载数据
  useEffect(() => {
    if (mode === 'edit' && price) {
      Object.keys(price).forEach((key) => {
        if (key in getValues()) {
          setValue(key as keyof PriceFormData, price[key as any]);
        }
      });
    }
  }, [mode, price, setValue, getValues]);

  // 监听基础价格变化，自动更新当前价格
  useEffect(() => {
    const basePrice = watch('basePrice');
    const currentPrice = watch('currentPrice');

    if (basePrice !== undefined && currentPrice === 0) {
      setValue('currentPrice', basePrice);
    }
  }, [watch('basePrice'), watch('currentPrice'), setValue]);

  // 提交表单
  const onSubmit = async (data: PriceFormData) => {
    try {
      if (mode === 'create') {
        const priceData = {
          ...data,
          productId: productId || '',
          status: PriceStatus.ACTIVE,
        };
        await createMutation.mutateAsync(priceData);
        message.success('价格创建成功');
      } else {
        await updateMutation.mutateAsync({
          id: price!.id,
          data,
        });
        message.success('价格更新成功');
      }
      onSuccess?.();
    } catch (error) {
      message.error(mode === 'create' ? '价格创建失败' : '价格更新失败');
    }
  };

  // 重置表单
  const handleReset = () => {
    form.reset();
  };

  // 货币选项
  const currencyOptions = [
    { value: 'CNY', label: '人民币 (CNY)' },
    { value: 'USD', label: '美元 (USD)' },
    { value: 'EUR', label: '欧元 (EUR)' },
    { value: 'GBP', label: '英镑 (GBP)' },
    { value: 'JPY', label: '日元 (JPY)' },
    { value: 'HKD', label: '港币 (HKD)' },
  ];

  // 渠道选项
  const channelOptions = [
    { value: 'online', label: '线上渠道' },
    { value: 'offline', label: '线下门店' },
    { value: 'wechat', label: '微信小程序' },
    { value: 'app', label: 'APP应用' },
    { value: 'website', label: '官方网站' },
    { value: 'partner', label: '合作伙伴' },
  ];

  // 会员等级选项
  const memberLevelOptions = [
    { value: 'bronze', label: '青铜会员' },
    { value: 'silver', label: '白银会员' },
    { value: 'gold', label: '黄金会员' },
    { value: 'platinum', label: '铂金会员' },
    { value: 'diamond', label: '钻石会员' },
    { value: 'vip', label: 'VIP会员' },
  ];

  // 价格规则类型选项
  const ruleTypeOptions = [
    { value: PriceRuleType.FIXED_DISCOUNT, label: '固定折扣' },
    { value: PriceRuleType.PERCENTAGE_DISCOUNT, label: '百分比折扣' },
    { value: PriceRuleType.FIXED_AMOUNT, label: '固定金额' },
    { value: PriceRuleType.BULK_PURCHASE, label: '批量采购' },
    { value: PriceRuleType.TIME_BASED, label: '时效价格' },
    { value: PriceRuleType.MEMBER_LEVEL, label: '会员等级' },
    { value: PriceRuleType.CHANNEL_BASED, label: '渠道定价' },
  ];

  // 计算折扣金额
  const calculateDiscount = () => {
    const basePrice = watch('basePrice');
    const currentPrice = watch('currentPrice');

    if (basePrice && currentPrice && basePrice > currentPrice) {
      const discountAmount = basePrice - currentPrice;
      const discountPercentage = ((discountAmount / basePrice) * 100).toFixed(2);
      return {
        amount: discountAmount,
        percentage: parseFloat(discountPercentage),
      };
    }
    return null;
  };

  const discount = calculateDiscount();

  return (
    <Form layout="vertical" onSubmit={handleSubmit(onSubmit)}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基础信息 */}
        <Card title="基础信息" size="small">
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="价格类型"
                required
                validateStatus={errors.priceType ? 'error' : undefined}
                help={errors.priceType?.message as string}
              >
                <Controller
                  name="priceType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} placeholder="请选择价格类型">
                      {Object.entries(PriceTypeConfig).map(([value, config]) => (
                        <Option key={value} value={value}>
                          <Tag color={config.color} style={{ marginRight: 8 }}>
                            {config.text}
                          </Tag>
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="货币类型"
                required
                validateStatus={errors.currency ? 'error' : undefined}
                help={errors.currency?.message as string}
              >
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} placeholder="请选择货币类型">
                      {currencyOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 价格设置 */}
        <Card title="价格设置" size="small">
          <Row gutter={[16, 0]}>
            <Col span={8}>
              <Form.Item
                label="基础价格"
                required
                validateStatus={errors.basePrice ? 'error' : undefined}
                help={errors.basePrice?.message as string}
              >
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="0.00"
                      min={0}
                      precision={2}
                      addonBefore="¥"
                      onChange={(value) => {
                        field.onChange(value);
                        // 如果当前价格为0，自动更新
                        const currentPrice = getValues('currentPrice');
                        if (currentPrice === 0) {
                          setValue('currentPrice', value || 0);
                        }
                      }}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="当前价格"
                required
                validateStatus={errors.currentPrice ? 'error' : undefined}
                help={errors.currentPrice?.message as string}
              >
                <Controller
                  name="currentPrice"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="0.00"
                      min={0}
                      precision={2}
                      addonBefore="¥"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="原价"
                validateStatus={errors.originalPrice ? 'error' : undefined}
                help={errors.originalPrice?.message as string}
              >
                <Controller
                  name="originalPrice"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="0.00"
                      min={0}
                      precision={2}
                      addonBefore="¥"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 折扣信息 */}
          {discount && (
            <Alert
              message="折扣信息"
              description={
                <div>
                  <div>折扣金额: ¥{discount.amount.toFixed(2)}</div>
                  <div>折扣比例: {discount.percentage}%</div>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* 生效条件 */}
        <Card title="生效条件" size="small">
          <Row gutter={[16, 0]}>
            <Col span={8}>
              <Form.Item
                label="生效时间"
                required
                validateStatus={errors.effectiveFrom ? 'error' : undefined}
                help={errors.effectiveFrom?.message as string}
              >
                <Controller
                  name="effectiveFrom"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="请选择生效时间"
                      format="YYYY-MM-DD"
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="失效时间"
                validateStatus={errors.effectiveTo ? 'error' : undefined}
                help={errors.effectiveTo?.message as string}
              >
                <Controller
                  name="effectiveTo"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="请选择失效时间（可选）"
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {
                        const effectiveFrom = getValues('effectiveFrom');
                        return effectiveFrom && current && current < dayjs(effectiveFrom);
                      }}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
          </Row>

          <Alert
            message="优先级说明"
            description="优先级数字越大，价格规则优先级越高。当存在多个价格规则时，系统会优先使用优先级最高的规则。"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* 适用条件 */}
        <Card
          title="适用条件"
          size="small"
          extra={
            <Switch
              checkedChildren="高级"
              unCheckedChildren="基础"
              onChange={(checked) => setShowRuleConfig(checked)}
            />
          }
        >
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="适用渠道">
                <Controller
                  name="channels"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      mode="multiple"
                      placeholder="请选择适用渠道（可选）"
                      style={{ width: '100%' }}
                    >
                      {channelOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="会员等级">
                <Controller
                  name="memberLevels"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      mode="multiple"
                      placeholder="请选择会员等级（可选）"
                      style={{ width: '100%' }}
                    >
                      {memberLevelOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Form.Item label="最小数量">
                <Controller
                  name="minQuantity"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="最小购买数量"
                      min={1}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="最大数量">
                <Controller
                  name="maxQuantity"
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: '100%' }}
                      placeholder="最大购买数量"
                      min={1}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 高级规则配置 */}
        {showRuleConfig && (
          <Card title="价格规则配置" size="small">
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="规则类型">
                  <Controller
                    name="ruleType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择规则类型（可选）"
                        allowClear
                        onChange={(value) => {
                          field.onChange(value);
                          // 清空规则配置
                          setValue('ruleConfig', undefined);
                        }}
                      >
                        {ruleTypeOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>

            {ruleType && (
              <PriceRuleConfig
                ruleType={ruleType}
                value={getValues('ruleConfig')}
                onChange={(config) => setValue('ruleConfig', config)}
              />
            )}
          </Card>
        )}

        {/* 操作按钮 */}
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                disabled={!isValid}
              >
                {mode === 'create' ? '创建价格' : '保存修改'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Space>
    </Form>
  );
};

export default PriceForm;
