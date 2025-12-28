import React from 'react';
import { Card, Tabs, Row, Col, Statistic, Empty, Typography, Space, Badge } from 'antd';
import {
  SwapOutlined,
  ExportOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 调拨管理页面
 * 功能：调拨申请、调拨出库、在途查询、调拨收货
 */
const TransferManagement: React.FC = () => {
  const tabItems = [
    {
      key: 'overview',
      label: '调拨概览',
      children: (
        <>
          {/* 今日统计 */}
          <Card title="今日调拨统计" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="待审核申请"
                    value={8}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="待出库单据"
                    value={12}
                    prefix={<ExportOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="在途调拨"
                    value={15}
                    prefix={<CarOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="待收货单据"
                    value={10}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#1890ff15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <SwapOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    创建调拨申请
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    门店间商品调拨申请
                  </Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#52c41a15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <ExportOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    调拨出库
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    处理待出库调拨单
                  </Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#722ed115',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CarOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    在途查询
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    查看在途调拨单据
                  </Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  style={{ textAlign: 'center' }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#faad1415',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CheckCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    调拨收货
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    处理待收货调拨单
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 功能说明 */}
          <Card title="调拨流程说明">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>
                  <Badge status="processing" />
                  <SwapOutlined style={{ color: '#1890ff', marginLeft: 8, marginRight: 8 }} />
                  1. 调拨申请
                </Title>
                <Text type="secondary">
                  门店或仓库之间根据库存需求创建调拨申请，填写调出方、调入方、商品明细等信息。申请提交后进入待审核状态。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="processing" />
                  <ExportOutlined style={{ color: '#52c41a', marginLeft: 8, marginRight: 8 }} />
                  2. 调拨出库
                </Title>
                <Text type="secondary">
                  调拨申请审核通过后，调出方进行出库操作。扫描或选择商品批次，确认实际出库数量，系统自动扣减调出方库存。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="processing" />
                  <CarOutlined style={{ color: '#722ed1', marginLeft: 8, marginRight: 8 }} />
                  3. 在途管理
                </Title>
                <Text type="secondary">
                  商品出库后进入在途状态，可实时查询调拨单的物流信息和预计到达时间。支持在途追踪和异常处理。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="success" />
                  <CheckCircleOutlined style={{ color: '#faad14', marginLeft: 8, marginRight: 8 }} />
                  4. 调拨收货
                </Title>
                <Text type="secondary">
                  调入方收到商品后进行收货确认，核对商品信息和数量。收货完成后，系统自动增加调入方库存，调拨流程结束。
                </Text>
              </div>
            </Space>
          </Card>
        </>
      ),
    },
    {
      key: 'apply',
      label: (
        <span>
          调拨申请 <Badge count={8} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="调拨申请功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'out',
      label: (
        <span>
          调拨出库 <Badge count={12} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="调拨出库功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'transit',
      label: (
        <span>
          在途查询 <Badge count={15} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="在途查询功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'receive',
      label: (
        <span>
          调拨收货 <Badge count={10} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="调拨收货功能开发中..." />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <SwapOutlined style={{ marginRight: 8 }} />
        调拨管理
      </Title>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default TransferManagement;
