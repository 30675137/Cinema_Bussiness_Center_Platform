/**
 * 仪表盘页面
 * 影院商品管理中台的首页
 */

import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Typography, Button } from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  DollarOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useCurrentUser } from '@/stores/userStore';

const { Title, Text } = Typography;

/**
 * 仪表盘页面组件
 */
const Dashboard: React.FC = () => {
  const currentUser = useCurrentUser();

  // 模拟数据
  const statistics = [
    {
      title: '商品总数',
      value: 1234,
      prefix: <ShopOutlined />,
      suffix: '个',
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: '活跃用户',
      value: 89,
      prefix: <UserOutlined />,
      suffix: '人',
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: '今日收入',
      value: 15678,
      prefix: <DollarOutlined />,
      suffix: '元',
      trend: { value: -3.4, isPositive: false }
    },
    {
      title: '库存周转率',
      value: 78.9,
      prefix: <BarChartOutlined />,
      suffix: '%',
      trend: { value: 5.1, isPositive: true }
    }
  ];

  const quickActions = [
    { title: '新增商品', icon: <PlusOutlined />, path: '/product/add' },
    { title: '库存盘点', icon: <BarChartOutlined />, path: '/inventory/check' },
    { title: '价格管理', icon: <DollarOutlined />, path: '/pricing' },
    { title: '用户管理', icon: <UserOutlined />, path: '/system/user' }
  ];

  return (
    <div className="dashboard">
      {/* 欢迎信息 */}
      <div className="dashboard-welcome">
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                欢迎回来，{currentUser?.displayName || currentUser?.username}！
              </Title>
              <Text type="secondary">
                这里是影院商品管理中台的核心数据概览
              </Text>
            </div>
            <Button type="primary" icon={<PlusOutlined />}>
              快速开始
            </Button>
          </div>
        </Card>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="dashboard-statistics">
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{
                  color: stat.trend.isPositive ? '#3f8600' : '#cf1322'
                }}
              />
              <div className="statistic-trend">
                <Space>
                  {stat.trend.isPositive ? (
                    <ArrowUpOutlined style={{ color: '#3f8600' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#cf1322' }} />
                  )}
                  <Text type={stat.trend.isPositive ? 'success' : 'danger'}>
                    {Math.abs(stat.trend.value)}%
                  </Text>
                  <Text type="secondary">较昨日</Text>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速操作和进度 */}
      <Row gutter={[16, 16]} className="dashboard-actions">
        <Col xs={24} lg={12}>
          <Card title="快速操作" extra={<Button type="link">更多</Button>}>
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <div key={index} className="quick-action-item">
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-content">
                    <Text strong>{action.title}</Text>
                    <Text type="secondary">快速访问</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="项目进度" extra={<Button type="link">详情</Button>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>商品管理模块</Text>
                  <Text>85%</Text>
                </div>
                <Progress percent={85} status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>库存管理系统</Text>
                  <Text>72%</Text>
                </div>
                <Progress percent={72} status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>价格体系</Text>
                  <Text>90%</Text>
                </div>
                <Progress percent={90} status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>订单履约</Text>
                  <Text>68%</Text>
                </div>
                <Progress percent={68} status="active" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="系统状态" extra={<Button type="link">监控</Button>}>
            <Row gutter={[32, 32]}>
              <Col xs={12} sm={6}>
                <div className="system-status-item">
                  <div className="status-indicator status-success"></div>
                  <div>
                    <Text strong>数据库连接</Text>
                    <div>
                      <Text type="success">正常</Text>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="system-status-item">
                  <div className="status-indicator status-success"></div>
                  <div>
                    <Text strong>API服务</Text>
                    <div>
                      <Text type="success">正常</Text>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="system-status-item">
                  <div className="status-indicator status-warning"></div>
                  <div>
                    <Text strong>缓存服务</Text>
                    <div>
                      <Text type="warning">警告</Text>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="system-status-item">
                  <div className="status-indicator status-success"></div>
                  <div>
                    <Text strong>文件存储</Text>
                    <div>
                      <Text type="success">正常</Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;