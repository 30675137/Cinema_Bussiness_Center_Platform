import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Statistic,
  Table,
  Tag,
  Divider,
  Progress,
  Result,
} from 'antd';
import {
  PlayCircleOutlined,
  CalculatorOutlined,
  DollarOutlined,
  LineChartOutlined,
  FireOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useCalculatePriceQuery } from '@/stores/priceStore';
import { PriceCalculationResult, PriceType, PriceTypeConfig } from '@/types/price';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface SimulatorFormData {
  productId: string;
  quantity: number;
  memberLevel: string;
  channel: string;
  date: string;
  customerId?: string;
  location?: string;
}

interface SimulationResult {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    ruleType: string;
    discountAmount: number;
    discountType: string;
  }>;
  currency: string;
  effectiveUntil?: string;
  estimatedRevenue: number;
  estimatedMargin: number;
}

const PriceSimulator: React.FC = () => {
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const form = useForm<SimulatorFormData>({
    defaultValues: {
      productId: '',
      quantity: 1,
      memberLevel: 'normal',
      channel: 'online',
      date: dayjs().format('YYYY-MM-DD'),
      customerId: '',
      location: '',
    },
  });

  const { control, handleSubmit, watch, setValue, getValues } = form;

  // 监听表单变化，实时计算价格
  const watchedValues = watch();
  const {
    data: calculationResult,
    isLoading,
    refetch,
  } = useCalculatePriceQuery(watchedValues.productId, {
    quantity: watchedValues.quantity,
    memberLevel: watchedValues.memberLevel,
    channel: watchedValues.channel,
    date: watchedValues.date,
    customerId: watchedValues.customerId,
    location: watchedValues.location,
  });

  useEffect(() => {
    if (calculationResult && watchedValues.productId) {
      const result: SimulationResult = {
        originalPrice: calculationResult.originalPrice,
        finalPrice: calculationResult.finalPrice,
        discountAmount: calculationResult.discountAmount,
        discountPercentage: calculationResult.discountPercentage,
        appliedRules: calculationResult.appliedRules,
        currency: calculationResult.currency,
        effectiveUntil: calculationResult.effectiveUntil,
        estimatedRevenue: calculationResult.finalPrice * (watchedValues.quantity || 1),
        estimatedMargin: calculationResult.metadata?.margin || 0,
      };
      setCurrentResult(result);
    }
  }, [calculationResult, watchedValues]);

  // 执行模拟
  const handleSimulate = async (data: SimulatorFormData) => {
    if (!data.productId) {
      return;
    }

    setIsSimulating(true);
    try {
      await refetch();

      if (currentResult) {
        setSimulationResults([currentResult, ...simulationResults.slice(0, 9)]);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  // 添加到历史记录
  const handleAddToHistory = () => {
    if (currentResult) {
      setSimulationResults([currentResult, ...simulationResults.slice(0, 9)]);
    }
  };

  // 清空历史记录
  const handleClearHistory = () => {
    setSimulationResults([]);
  };

  // 会员等级选项
  const memberLevelOptions = [
    { value: 'normal', label: '普通用户' },
    { value: 'bronze', label: '青铜会员' },
    { value: 'silver', label: '白银会员' },
    { value: 'gold', label: '黄金会员' },
    { value: 'platinum', label: '铂金会员' },
    { value: 'diamond', label: '钻石会员' },
    { value: 'vip', label: 'VIP会员' },
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

  // 商品选项（模拟数据）
  const productOptions = [
    { value: 'PROD001', label: '可乐 330ml', basePrice: 5.5 },
    { value: 'PROD002', label: '爆米花 中份', basePrice: 8.0 },
    { value: 'PROD003', label: '电影票 标准场', basePrice: 35.0 },
    { value: 'PROD004', label: 'VIP座位', basePrice: 68.0 },
    { value: 'PROD005', label: '3D电影票', basePrice: 45.0 },
  ];

  // 历史记录表格列
  const historyColumns = [
    {
      title: '时间',
      key: 'time',
      width: 120,
      render: () => new Date().toLocaleTimeString(),
    },
    {
      title: '商品',
      dataIndex: 'productId',
      key: 'productId',
      render: (productId: string) => {
        const product = productOptions.find((p) => p.value === productId);
        return product ? product.label : productId;
      },
    },
    {
      title: '原价',
      key: 'originalPrice',
      width: 100,
      render: (_: any, record: SimulationResult) => (
        <Text delete>¥{record.originalPrice.toFixed(2)}</Text>
      ),
    },
    {
      title: '最终价',
      dataIndex: 'finalPrice',
      key: 'finalPrice',
      width: 100,
      render: (finalPrice: number) => <Text strong>¥{finalPrice.toFixed(2)}</Text>,
    },
    {
      title: '折扣',
      key: 'discount',
      width: 100,
      render: (_: any, record: SimulationResult) => (
        <Space direction="vertical" size={0}>
          <Tag color="red">-¥{record.discountAmount.toFixed(2)}</Tag>
          <Tag color="blue">{record.discountPercentage}%</Tag>
        </Space>
      ),
    },
    {
      title: '适用规则',
      dataIndex: 'appliedRules',
      key: 'appliedRules',
      width: 200,
      render: (rules: any[]) => (
        <Space wrap size="small">
          {rules.map((rule, index) => (
            <Tag key={index} color="green" size="small">
              {rule.ruleName}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  // 模拟结果统计
  const renderStatistics = () => {
    if (!currentResult) return null;

    const discountRate = (currentResult.discountPercentage / 100).toFixed(2);

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="节省金额"
              value={currentResult.discountAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="折扣率"
              value={discountRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预计收入"
              value={currentResult.estimatedRevenue}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="毛利率"
              value={currentResult.estimatedMargin}
              precision={2}
              suffix="%"
              valueStyle={{
                color: currentResult.estimatedMargin >= 20 ? '#52c41a' : '#fa8c16',
              }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="price-simulator">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <CalculatorOutlined style={{ marginRight: 8 }} />
              价格模拟器
            </Title>
            <Text type="secondary">模拟不同条件下商品的实际价格，帮助优化定价策略</Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<LineChartOutlined />}
                onClick={handleAddToHistory}
                disabled={!currentResult}
              >
                添加到历史
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={handleClearHistory}
                disabled={simulationResults.length === 0}
              >
                清空历史
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        {/* 模拟表单 */}
        <Col span={12}>
          <Card title="模拟参数" style={{ marginBottom: 16 }}>
            <Form layout="vertical" onSubmit={handleSubmit(handleSimulate)}>
              <Form.Item label="商品选择" required>
                <Controller
                  name="productId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="请选择商品"
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {productOptions.map((product) => (
                        <Option key={product.value} value={product.value}>
                          <Space>
                            {product.label}
                            <Tag color="blue">¥{product.basePrice}</Tag>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="购买数量">
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          style={{ width: '100%' }}
                          placeholder="1"
                          min={1}
                          max={999}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="会员等级">
                    <Controller
                      name="memberLevel"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} placeholder="请选择会员等级" style={{ width: '100%' }}>
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

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="销售渠道">
                    <Controller
                      name="channel"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} placeholder="请选择销售渠道" style={{ width: '100%' }}>
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
                  <Form.Item label="生效日期">
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          placeholder="请选择生效日期"
                          style={{ width: '100%' }}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlayCircleOutlined />}
                  loading={isSimulating}
                  disabled={!getValues().productId}
                  block
                >
                  开始模拟
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 模拟结果 */}
        <Col span={12}>
          {currentResult ? (
            <Card title="模拟结果" style={{ marginBottom: 16 }}>
              {renderStatistics()}

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ display: 'inline-block' }}>
                  <div style={{ fontSize: 48, fontWeight: 'bold', color: '#1890ff' }}>
                    ¥{currentResult.finalPrice.toFixed(2)}
                  </div>
                  {currentResult.originalPrice > currentResult.finalPrice && (
                    <div style={{ fontSize: 20, color: '#52c41a', marginTop: 8 }}>
                      <Tag color="red">节省 ¥{currentResult.discountAmount.toFixed(2)}</Tag>
                      <Tag color="blue">{currentResult.discountPercentage}%</Tag>
                    </div>
                  )}
                </div>
              </div>

              {currentResult.appliedRules.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Title level={5}>适用的价格规则：</Title>
                  <Space wrap>
                    {currentResult.appliedRules.map((rule, index) => (
                      <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                        <div>{rule.ruleName}</div>
                        <div style={{ fontSize: 11, opacity: 0.8 }}>{rule.ruleType}</div>
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {currentResult.effectiveUntil && (
                <Alert
                  message="价格有效期"
                  description={`此价格将在 ${dayjs(currentResult.effectiveUntil).format('YYYY-MM-DD HH:mm')} 失效`}
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>
          ) : (
            <Card>
              <Result
                icon={<CalculatorOutlined />}
                title="开始价格模拟"
                subTitle="选择商品和条件，查看实际售价和折扣情况"
              />
            </Card>
          )}
        </Col>
      </Row>

      {/* 历史记录 */}
      {simulationResults.length > 0 && (
        <Card title="模拟历史" style={{ marginBottom: 16 }}>
          <Table
            columns={historyColumns}
            dataSource={simulationResults}
            rowKey={(record, index) => index}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* 使用说明 */}
      <Alert
        message="价格模拟器使用说明"
        description={
          <div>
            <div>1. 选择要模拟的商品和数量</div>
            <div>2. 设置会员等级、销售渠道等条件</div>
            <div>3. 点击"开始模拟"查看实际售价</div>
            <div>4. 查看适用的价格规则和折扣详情</div>
            <div>5. 将结果添加到历史记录进行对比分析</div>
          </div>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />
    </div>
  );
};

export default PriceSimulator;
