import React, { useState } from 'react';
import {
  Card,
  Spin,
  Empty,
  Select,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import {
  LineChartOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface InventoryTrendsChartProps {
  data?: any;
  loading?: boolean;
  title?: string;
}

// 模拟趋势数据
const mockTrendsData = {
  trends: [
    {
      date: '2024-01-10',
      totalInventory: 12000,
      availableInventory: 10000,
      reservedInventory: 1500,
      inTransitInventory: 300,
      damagedInventory: 150,
      expiredInventory: 50,
      inventoryValue: 480000,
      turnoverRate: 0.85
    },
    {
      date: '2024-01-11',
      totalInventory: 12300,
      availableInventory: 10200,
      reservedInventory: 1600,
      inTransitInventory: 320,
      damagedInventory: 130,
      expiredInventory: 50,
      inventoryValue: 492000,
      turnoverRate: 0.87
    },
    {
      date: '2024-01-12',
      totalInventory: 11900,
      availableInventory: 9800,
      reservedInventory: 1400,
      inTransitInventory: 400,
      damagedInventory: 200,
      expiredInventory: 100,
      inventoryValue: 476000,
      turnoverRate: 0.82
    },
    {
      date: '2024-01-13',
      totalInventory: 12500,
      availableInventory: 10500,
      reservedInventory: 1700,
      inTransitInventory: 200,
      damagedInventory: 80,
      expiredInventory: 20,
      inventoryValue: 500000,
      turnoverRate: 0.90
    },
    {
      date: '2024-01-14',
      totalInventory: 11800,
      availableInventory: 9600,
      reservedInventory: 1800,
      inTransitInventory: 250,
      damagedInventory: 100,
      expiredInventory: 50,
      inventoryValue: 472000,
      turnoverRate: 0.78
    },
    {
      date: '2024-01-15',
      totalInventory: 12200,
      availableInventory: 10100,
      reservedInventory: 1500,
      inTransitInventory: 400,
      damagedInventory: 150,
      expiredInventory: 50,
      inventoryValue: 488000,
      turnoverRate: 0.86
    },
    {
      date: '2024-01-16',
      totalInventory: 12450,
      availableInventory: 10350,
      reservedInventory: 1650,
      inTransitInventory: 300,
      damagedInventory: 120,
      expiredInventory: 30,
      inventoryValue: 498000,
      turnoverRate: 0.89
    }
  ],
  summary: {
    periodStart: '2024-01-10',
    periodEnd: '2024-01-16',
    avgInventory: 12186,
    avgValue: 486571,
    totalTransactions: 2847,
    peakInventory: 12500,
    lowStockDays: 2,
    totalTransactions: 2847,
    avgTurnoverRate: 0.85
  }
};

const InventoryTrendsChart: React.FC<InventoryTrendsChartProps> = ({
  data,
  loading = false,
  title = '库存趋势分析'
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [metricType, setMetricType] = useState<'quantity' | 'value' | 'distribution'>('quantity');

  const trendsData = data || mockTrendsData;
  const chartData = trendsData.trends.map(item => ({
    ...item,
    date: dayjs(item.date).format('MM-DD'),
    displayDate: dayjs(item.date).format('YYYY-MM-DD')
  }));

  // 格式化数值显示
  const formatValue = (value: number, type: string) => {
    if (type === 'value') {
      return `¥${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // 自定义tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            {data.displayDate}
          </p>
          {metricType === 'quantity' && (
            <>
              <p style={{ margin: '4px 0', color: '#1890ff' }}>
                总库存: {data.totalInventory.toLocaleString()}件
              </p>
              <p style={{ margin: '4px 0', color: '#52c41a' }}>
                可用库存: {data.availableInventory.toLocaleString()}件
              </p>
              <p style={{ margin: '4px 0', color: '#faad14' }}>
                预留库存: {data.reservedInventory.toLocaleString()}件
              </p>
              <p style={{ margin: '4px 0', color: '#722ed1' }}>
                在途库存: {data.inTransitInventory.toLocaleString()}件
              </p>
              <p style={{ margin: '4px 0', color: '#ff4d4f' }}>
                问题库存: {(data.damagedInventory + data.expiredInventory).toLocaleString()}件
              </p>
            </>
          )}
          {metricType === 'value' && (
            <>
              <p style={{ margin: '4px 0', color: '#cf1322' }}>
                库存价值: ¥{(data.inventoryValue / 1000).toFixed(1)}K
              </p>
              <p style={{ margin: '4px 0', color: '#1890ff' }}>
                周转率: {(data.turnoverRate * 100).toFixed(1)}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // 渲染图表
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (metricType === 'quantity') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalInventory"
                stroke="#1890ff"
                strokeWidth={2}
                name="总库存"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="availableInventory"
                stroke="#52c41a"
                strokeWidth={2}
                name="可用库存"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="reservedInventory"
                stroke="#faad14"
                strokeWidth={2}
                name="预留库存"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="inTransitInventory"
                stroke="#722ed1"
                strokeWidth={2}
                name="在途库存"
                dot={{ r: 4 }}
              />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="availableInventory"
                stackId="1"
                stroke="#52c41a"
                fill="#52c41a"
                fillOpacity={0.6}
                name="可用库存"
              />
              <Area
                type="monotone"
                dataKey="reservedInventory"
                stackId="1"
                stroke="#faad14"
                fill="#faad14"
                fillOpacity={0.6}
                name="预留库存"
              />
              <Area
                type="monotone"
                dataKey="inTransitInventory"
                stackId="1"
                stroke="#722ed1"
                fill="#722ed1"
                fillOpacity={0.6}
                name="在途库存"
              />
            </AreaChart>
          ) : (
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="availableInventory" fill="#52c41a" name="可用库存" />
              <Bar dataKey="reservedInventory" fill="#faad14" name="预留库存" />
              <Bar dataKey="inTransitInventory" fill="#722ed1" name="在途库存" />
            </BarChart>
          )}
        </ResponsiveContainer>
      );
    }

    if (metricType === 'value') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="inventoryValue"
              stroke="#cf1322"
              strokeWidth={2}
              name="库存价值(千元)"
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="turnoverRate"
              stroke="#1890ff"
              strokeWidth={2}
              name="周转率(%)"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Card title={title}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card title={title}>
        <Empty description="暂无趋势数据" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined />
          {title}
          <Tag color="blue">
            {dayjs(trendsData.summary.periodStart).format('MM-DD')} - {dayjs(trendsData.summary.periodEnd).format('MM-DD')}
          </Tag>
        </Space>
      }
      extra={
        <Space>
          <Select
            value={metricType}
            onChange={setMetricType}
            style={{ width: 100 }}
            size="small"
          >
            <Option value="quantity">库存量</Option>
            <Option value="value">价值</Option>
          </Select>
          <Select
            value={chartType}
            onChange={setChartType}
            style={{ width: 80 }}
            size="small"
          >
            <Option value="line">
              <LineChartOutlined />
            </Option>
            <Option value="area">
              <AreaChartOutlined />
            </Option>
            <Option value="bar">
              <BarChartOutlined />
            </Option>
          </Select>
        </Space>
      }
    >
      {/* 统计摘要 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="平均库存"
            value={trendsData.summary.avgInventory}
            suffix="件"
            prefix={<InfoCircleOutlined />}
            valueStyle={{ fontSize: '16px' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="峰值库存"
            value={trendsData.summary.peakInventory}
            suffix="件"
            prefix={<TrendingUpOutlined />}
            valueStyle={{ fontSize: '16px', color: '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="平均价值"
            value={trendsData.summary.avgValue}
            prefix="¥"
            precision={0}
            valueStyle={{ fontSize: '16px', color: '#cf1322' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="平均周转率"
            value={trendsData.summary.avgTurnoverRate * 100}
            suffix="%"
            precision={1}
            valueStyle={{ fontSize: '16px', color: '#1890ff' }}
          />
        </Col>
      </Row>

      {/* 警报提示 */}
      {trendsData.summary.lowStockDays > 0 && (
        <Row style={{ marginBottom: '16px' }}>
          <Col span={24}>
            <Space>
              <TrendingDownOutlined style={{ color: '#ff4d4f' }} />
              <Text type="danger">
                {trendsData.summary.lowStockDays}天出现低库存情况，需要关注
              </Text>
            </Space>
          </Col>
        </Row>
      )}

      {/* 图表区域 */}
      <div style={{ minHeight: '300px' }}>
        {renderChart()}
      </div>

      {/* 趋势分析 */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card size="small" title="趋势分析">
            <Row gutter={16}>
              <Col span={8}>
                <Space direction="vertical" size="small">
                  <Text strong>库存趋势</Text>
                  {(() => {
                    const first = chartData[0];
                    const last = chartData[chartData.length - 1];
                    const change = last.totalInventory - first.totalInventory;
                    const changePercent = ((change / first.totalInventory) * 100).toFixed(1);
                    return (
                      <Space>
                        {change >= 0 ? (
                          <TrendingUpOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <TrendingDownOutlined style={{ color: '#ff4d4f' }} />
                        )}
                        <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
                          {change >= 0 ? '+' : ''}{changePercent}%
                        </Text>
                      </Space>
                    );
                  })()}
                </Space>
              </Col>
              <Col span={8}>
                <Space direction="vertical" size="small">
                  <Text strong>价值趋势</Text>
                  {(() => {
                    const first = chartData[0];
                    const last = chartData[chartData.length - 1];
                    const change = last.inventoryValue - first.inventoryValue;
                    const changePercent = ((change / first.inventoryValue) * 100).toFixed(1);
                    return (
                      <Space>
                        {change >= 0 ? (
                          <TrendingUpOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <TrendingDownOutlined style={{ color: '#ff4d4f' }} />
                        )}
                        <Text style={{ color: change >= 0 ? '#52c41a' : '#ff4d4f' }}>
                          {change >= 0 ? '+' : ''}{changePercent}%
                        </Text>
                      </Space>
                    );
                  })()}
                </Space>
              </Col>
              <Col span={8}>
                <Space direction="vertical" size="small">
                  <Text strong>周转效率</Text>
                  <Space>
                    <Text>平均周转率: {(trendsData.summary.avgTurnoverRate * 100).toFixed(1)}%</Text>
                    {trendsData.summary.avgTurnoverRate >= 0.8 ? (
                      <Tag color="green">良好</Tag>
                    ) : trendsData.summary.avgTurnoverRate >= 0.6 ? (
                      <Tag color="orange">一般</Tag>
                    ) : (
                      <Tag color="red">较差</Tag>
                    )}
                  </Space>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default InventoryTrendsChart;