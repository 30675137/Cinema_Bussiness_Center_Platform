import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  return (
    <div>
      <Title level={3}>工作台</Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={1128}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={12}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={8}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月销售额"
              value={128000}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近活动" style={{ marginBottom: 16 }}>
        <p>暂无最近活动数据</p>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="商品状态分布">
            <p>暂无数据</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="销售趋势">
            <p>暂无数据</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
