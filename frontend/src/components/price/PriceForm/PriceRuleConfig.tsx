import React, { useState, useEffect } from 'react';
import {
  Form,
  InputNumber,
  Select,
  Input,
  Switch,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { RuleType, PriceRuleType } from '@/types/price';

const { Title, Text } = Typography;
const { Option } = Select;

interface PriceRuleConfigProps {
  ruleType: PriceRuleType;
  value?: any;
  onChange: (config: any) => void;
}

const PriceRuleConfig: React.FC<PriceRuleConfigProps> = ({ ruleType, value, onChange }) => {
  const [config, setConfig] = useState({
    discountType: 'percentage' as 'fixed' | 'percentage' | 'fixed_amount',
    discountValue: 0,
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
    applyConditions: {},
    excludeConditions: {},
  });

  useEffect(() => {
    if (value) {
      setConfig(value);
    }
  }, [value]);

  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const updateConfig = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 渲染特定规则类型的配置
  const renderRuleSpecificConfig = () => {
    switch (ruleType) {
      case PriceRuleType.FIXED_DISCOUNT:
        return (
          <div>
            <Alert
              message="固定折扣规则"
              description="为指定的商品设置固定的折扣金额或折扣比例"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="折扣类型" required>
                  <Select
                    value={config.discountType}
                    onChange={(value) => updateConfig('discountType', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="fixed">固定金额</Option>
                    <Option value="percentage">百分比</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="折扣值" required>
                  <InputNumber
                    value={config.discountValue}
                    onChange={(value) => updateConfig('discountValue', value || 0)}
                    style={{ width: '100%' }}
                    placeholder={config.discountType === 'percentage' ? '0-100' : '0'}
                    min={0}
                    max={config.discountType === 'percentage' ? 100 : undefined}
                    precision={config.discountType === 'percentage' ? 0 : 2}
                    addonAfter={config.discountType === 'percentage' ? '%' : '元'}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case PriceRuleType.PERCENTAGE_DISCOUNT:
        return (
          <div>
            <Alert
              message="百分比折扣规则"
              description="基于商品价格设置百分比折扣"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="折扣比例" required>
                  <InputNumber
                    value={config.discountValue}
                    onChange={(value) => updateConfig('discountValue', value || 0)}
                    style={{ width: '100%' }}
                    placeholder="0-100"
                    min={0}
                    max={100}
                    addonAfter="%"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="最大折扣金额">
                  <InputNumber
                    value={config.maxDiscountAmount}
                    onChange={(value) => updateConfig('maxDiscountAmount', value)}
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    addonAfter="元"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case PriceRuleType.FIXED_AMOUNT:
        return (
          <div>
            <Alert
              message="固定金额规则"
              description="直接设置商品的固定价格"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="固定价格" required>
                  <InputNumber
                    value={config.discountValue}
                    onChange={(value) => updateConfig('discountValue', value || 0)}
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    min={0}
                    precision={2}
                    addonBefore="¥"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case PriceRuleType.BULK_PURCHASE:
        return (
          <div>
            <Alert
              message="批量采购规则"
              description="根据购买数量设置不同的价格折扣"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 0]}>
              <Col span={8}>
                <Form.Item label="最小购买量">
                  <InputNumber
                    value={config.applyConditions?.minQuantity || 1}
                    onChange={(value) =>
                      updateConfig('applyConditions', {
                        ...config.applyConditions,
                        minQuantity: value || 1,
                      })
                    }
                    style={{ width: '100%' }}
                    placeholder="1"
                    min={1}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="折扣类型">
                  <Select
                    value={config.discountType}
                    onChange={(value) => updateConfig('discountType', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="percentage">百分比</Option>
                    <Option value="fixed">固定金额</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="折扣值">
                  <InputNumber
                    value={config.discountValue}
                    onChange={(value) => updateConfig('discountValue', value || 0)}
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    addonAfter={config.discountType === 'percentage' ? '%' : '元'}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case PriceRuleType.TIME_BASED:
        return (
          <div>
            <Alert
              message="时效价格规则"
              description="在特定时间段内应用的价格规则"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="生效时段">
                  <Input
                    placeholder="例如: 09:00-18:00"
                    value={config.applyConditions?.timeRange}
                    onChange={(e) =>
                      updateConfig('applyConditions', {
                        ...config.applyConditions,
                        timeRange: e.target.value,
                      })
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="适用星期">
                  <Select
                    mode="multiple"
                    placeholder="请选择适用星期"
                    value={config.applyConditions?.weekdays || []}
                    onChange={(value) =>
                      updateConfig('applyConditions', {
                        ...config.applyConditions,
                        weekdays: value,
                      })
                    }
                    style={{ width: '100%' }}
                  >
                    <Option value="1">周一</Option>
                    <Option value="2">周二</Option>
                    <Option value="3">周三</Option>
                    <Option value="4">周四</Option>
                    <Option value="5">周五</Option>
                    <Option value="6">周六</Option>
                    <Option value="0">周日</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="折扣类型">
                  <Select
                    value={config.discountType}
                    onChange={(value) => updateConfig('discountType', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="percentage">百分比</Option>
                    <Option value="fixed">固定金额</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="折扣值">
                  <InputNumber
                    value={config.discountValue}
                    onChange={(value) => updateConfig('discountValue', value || 0)}
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    addonAfter={config.discountType === 'percentage' ? '%' : '元'}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case PriceRuleType.MEMBER_LEVEL:
        return (
          <div>
            <Alert
              message="会员等级规则"
              description="根据会员等级设置不同的价格"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="适用会员等级">
                  <Select
                    mode="multiple"
                    placeholder="请选择会员等级"
                    value={config.applyConditions?.memberLevels || []}
                    onChange={(value) =>
                      updateConfig('applyConditions', {
                        ...config.applyConditions,
                        memberLevels: value,
                      })
                    }
                    style={{ width: '100%' }}
                  >
                    <Option value="bronze">青铜会员</Option>
                    <Option value="silver">白银会员</Option>
                    <Option value="gold">黄金会员</Option>
                    <Option value="platinum">铂金会员</Option>
                    <Option value="diamond">钻石会员</Option>
                    <Option value="vip">VIP会员</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="折扣类型">
                  <Select
                    value={config.discountType}
                    onChange={(value) => updateConfig('discountType', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="percentage">百分比</Option>
                    <Option value="fixed">固定金额</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Form.Item label="折扣值">
                  <InputNumber
                    value={config.discountValue}
                    onChange={(value) => updateConfig('discountValue', value || 0)}
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    max={config.discountType === 'percentage' ? 100 : undefined}
                    addonAfter={config.discountType === 'percentage' ? '%' : '元'}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="最低消费">
                  <InputNumber
                    value={config.minOrderValue}
                    onChange={(value) => updateConfig('minOrderValue', value)}
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    addonBefore="¥"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case PriceRuleType.CHANNEL_BASED:
        return (
          <div>
            <Alert
              message="渠道定价规则"
              description="为不同的销售渠道设置专属价格"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="适用渠道">
                  <Select
                    mode="multiple"
                    placeholder="请选择适用渠道"
                    value={config.applyConditions?.channels || []}
                    onChange={(value) =>
                      updateConfig('applyConditions', {
                        ...config.applyConditions,
                        channels: value,
                      })
                    }
                    style={{ width: '100%' }}
                  >
                    <Option value="online">线上渠道</Option>
                    <Option value="offline">线下门店</Option>
                    <Option value="wechat">微信小程序</Option>
                    <Option value="app">APP应用</Option>
                    <Option value="website">官方网站</Option>
                    <Option value="partner">合作伙伴</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="加价类型">
                  <Select
                    value={config.applyConditions?.priceAdjustmentType || 'percentage'}
                    onChange={(value) =>
                      updateConfig('applyConditions', {
                        ...config.applyConditions,
                        priceAdjustmentType: value,
                      })
                    }
                    style={{ width: '100%' }}
                  >
                    <Option value="percentage">百分比加价</Option>
                    <Option value="fixed">固定金额</Option>
                    <Option value="fixed_price">固定价格</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Form.Item label="加价值">
                  <InputNumber
                    value={config.applyConditions?.priceAdjustmentValue || 0}
                    onChange={(value) =>
                      updateConfig('applyConditions', {
                        ...config.applyConditions,
                        priceAdjustmentValue: value || 0,
                      })
                    }
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={
                      config.applyConditions?.priceAdjustmentType === 'fixed_price' ? 0 : undefined
                    }
                    addonAfter={
                      config.applyConditions?.priceAdjustmentType === 'percentage'
                        ? '%'
                        : config.applyConditions?.priceAdjustmentType === 'fixed_price'
                          ? '元'
                          : '元'
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      default:
        return (
          <Alert
            message="未知规则类型"
            description="请选择有效的价格规则类型"
            type="warning"
            showIcon
          />
        );
    }
  };

  return (
    <div>
      <Title level={5}>规则配置</Title>
      <Divider />
      {renderRuleSpecificConfig()}

      {/* 通用条件配置 */}
      <Divider />
      <Title level={5}>通用条件</Title>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item label="最小订单金额">
            <InputNumber
              value={config.minOrderValue}
              onChange={(value) => updateConfig('minOrderValue', value)}
              style={{ width: '100%' }}
              placeholder="0"
              min={0}
              addonBefore="¥"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="最大折扣金额">
            <InputNumber
              value={config.maxDiscountAmount}
              onChange={(value) => updateConfig('maxDiscountAmount', value)}
              style={{ width: '100%' }}
              placeholder="不限制"
              min={0}
              addonBefore="¥"
            />
          </Form.Item>
        </Col>
      </Row>

      <Alert
        message="规则说明"
        description="配置的价格规则将在满足条件时自动应用。多个规则同时满足时，将按优先级执行。"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default PriceRuleConfig;
