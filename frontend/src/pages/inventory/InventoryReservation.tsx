import React from 'react';
import { Card, Tabs, Row, Col, Statistic, Empty, Typography, Space, Badge, Alert } from 'antd';
import {
  LockOutlined,
  UnlockOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 库存预占/释放管理页面
 * 功能：订单预占、取消释放、退款释放、预占查询
 */
const InventoryReservation: React.FC = () => {
  const tabItems = [
    {
      key: 'overview',
      label: '预占概览',
      children: (
        <>
          {/* 提示信息 */}
          <Alert
            message="库存预占说明"
            description="库存预占用于锁定订单商品库存，防止超卖。订单取消或退款后，系统将自动释放预占库存。超时未支付的订单预占将在30分钟后自动释放。"
            type="info"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />

          {/* 今日统计 */}
          <Card title="今日预占统计" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="当前预占订单"
                    value={156}
                    prefix={<LockOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="预占库存数量"
                    value={2845}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                    suffix="件"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="今日释放次数"
                    value={89}
                    prefix={<UnlockOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="超时待释放"
                    value={12}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 预占类型统计 */}
          <Card title="预占类型分布" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="订单预占"
                    value={128}
                    valueStyle={{ color: '#1890ff' }}
                    suffix="单"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    预占数量：2,450件
                  </Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="活动预占"
                    value={23}
                    valueStyle={{ color: '#722ed1' }}
                    suffix="单"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    预占数量：350件
                  </Text>
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="其他预占"
                    value={5}
                    valueStyle={{ color: '#13c2c2' }}
                    suffix="单"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    预占数量：45件
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card hoverable style={{ textAlign: 'center' }} bodyStyle={{ padding: '24px' }}>
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
                    <LockOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    订单预占
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    锁定订单商品库存
                  </Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card hoverable style={{ textAlign: 'center' }} bodyStyle={{ padding: '24px' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#ff4d4f15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    取消释放
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    订单取消释放库存
                  </Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card hoverable style={{ textAlign: 'center' }} bodyStyle={{ padding: '24px' }}>
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
                    <RollbackOutlined style={{ fontSize: 32, color: '#faad14' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    退款释放
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    退款退货释放库存
                  </Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card hoverable style={{ textAlign: 'center' }} bodyStyle={{ padding: '24px' }}>
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
                    <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    预占查询
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    查询预占记录详情
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 功能说明 */}
          <Card title="预占管理说明">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>
                  <Badge status="processing" />
                  <LockOutlined style={{ color: '#1890ff', marginLeft: 8, marginRight: 8 }} />
                  1. 订单预占
                </Title>
                <Text type="secondary">
                  客户下单后，系统自动预占订单商品库存，确保库存可用性。预占的库存将从可销售库存中扣除，但不影响账面库存总量。支持批量预占和单品预占。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="error" />
                  <CloseCircleOutlined
                    style={{ color: '#ff4d4f', marginLeft: 8, marginRight: 8 }}
                  />
                  2. 取消释放
                </Title>
                <Text type="secondary">
                  订单取消时，系统自动释放已预占的库存，恢复为可销售状态。支持部分取消释放。超时未支付的订单将在设定时间后自动取消并释放库存。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="warning" />
                  <RollbackOutlined style={{ color: '#faad14', marginLeft: 8, marginRight: 8 }} />
                  3. 退款释放
                </Title>
                <Text type="secondary">
                  客户退货退款时，根据退货数量释放对应的预占库存。退货商品入库后，库存恢复可销售状态。支持部分退款的库存释放处理。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="success" />
                  <CheckCircleOutlined
                    style={{ color: '#52c41a', marginLeft: 8, marginRight: 8 }}
                  />
                  4. 预占查询
                </Title>
                <Text type="secondary">
                  实时查询当前预占库存情况，包括预占订单列表、预占商品明细、预占时长统计等。支持按订单号、商品、门店等多维度查询，便于库存监控和异常处理。
                </Text>
              </div>
            </Space>
          </Card>
        </>
      ),
    },
    {
      key: 'reservation',
      label: (
        <span>
          订单预占 <Badge count={156} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="订单预占功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'cancel',
      label: (
        <span>
          取消释放 <Badge count={12} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="取消释放功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'refund',
      label: '退款释放',
      children: (
        <Card>
          <Empty description="退款释放功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'query',
      label: '预占查询',
      children: (
        <Card>
          <Empty description="预占查询功能开发中..." />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <LockOutlined style={{ marginRight: 8 }} />
        库存预占 / 释放管理
      </Title>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default InventoryReservation;
