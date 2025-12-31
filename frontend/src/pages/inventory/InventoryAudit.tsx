import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Row,
  Col,
  Statistic,
  Empty,
  Typography,
  Space,
  Badge,
  Alert,
  Table,
  Tag,
} from 'antd';
import {
  AuditOutlined,
  FileSearchOutlined,
  HistoryOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 库存变动日志/审计页面
 * 功能：库存变动记录、审计追踪、异常监控
 */
const InventoryAudit: React.FC = () => {
  // 模拟审计数据
  const auditColumns = [
    {
      title: '操作时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
    },
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          入库: 'green',
          出库: 'blue',
          调拨: 'purple',
          盘点: 'orange',
          报损: 'red',
          退库: 'gold',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '商品信息',
      dataIndex: 'product',
      key: 'product',
      width: 200,
    },
    {
      title: '变动数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number) => (
        <span
          style={{
            color: quantity > 0 ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold',
          }}
        >
          {quantity > 0 ? `+${quantity}` : quantity}
        </span>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
    },
    {
      title: '门店/仓库',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          正常: { color: 'success', icon: <CheckCircleOutlined /> },
          异常: { color: 'error', icon: <WarningOutlined /> },
          待审核: { color: 'warning', icon: <ClockCircleOutlined /> },
        };
        return (
          <Tag color={config[status]?.color || 'default'} icon={config[status]?.icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '审计概览',
      children: (
        <>
          {/* 审计提示 */}
          <Alert
            message="库存审计说明"
            description="库存变动日志记录了所有库存相关操作的详细信息，包括操作时间、操作人、变动数量等。支持按时间、类型、操作人等维度查询和审计，确保库存数据的可追溯性和准确性。"
            type="info"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />

          {/* 今日审计统计 */}
          <Card title="今日审计统计" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="总操作次数"
                    value={458}
                    prefix={<AuditOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="正常记录"
                    value={442}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="异常记录"
                    value={12}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="待审核记录"
                    value={4}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 操作类型分布 */}
          <Card title="操作类型分布" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={4}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="入库"
                    value={125}
                    valueStyle={{ color: '#52c41a', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="出库"
                    value={198}
                    valueStyle={{ color: '#1890ff', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="调拨"
                    value={68}
                    valueStyle={{ color: '#722ed1', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="盘点"
                    value={45}
                    valueStyle={{ color: '#faad14', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="报损"
                    value={15}
                    valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="退库"
                    value={7}
                    valueStyle={{ color: '#13c2c2', fontSize: 20 }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 快捷操作 */}
          <Card title="审计功能" style={{ marginBottom: 16 }}>
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
                    <HistoryOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    变动历史
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    查看所有库存变动记录
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
                    <WarningOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    异常监控
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    查看异常操作记录
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
                    <UserOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    操作人追踪
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    按操作人查询记录
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
                      background: '#722ed115',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <FileSearchOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    审计报表
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    生成审计分析报表
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 功能说明 */}
          <Card title="审计功能说明">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>
                  <Badge status="processing" />
                  <HistoryOutlined style={{ color: '#1890ff', marginLeft: 8, marginRight: 8 }} />
                  1. 变动历史追踪
                </Title>
                <Text type="secondary">
                  记录所有库存变动操作，包括入库、出库、调拨、盘点、报损、退库等。每条记录包含操作时间、操作人、变动数量、变动前后库存等详细信息，确保库存数据完全可追溯。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="error" />
                  <WarningOutlined style={{ color: '#ff4d4f', marginLeft: 8, marginRight: 8 }} />
                  2. 异常操作监控
                </Title>
                <Text type="secondary">
                  自动识别和标记异常操作，如大额出库、频繁调拨、超量报损等。支持设置预警规则，异常操作自动触发审核流程，防止库存数据错误和恶意操作。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="success" />
                  <UserOutlined style={{ color: '#52c41a', marginLeft: 8, marginRight: 8 }} />
                  3. 操作人追踪
                </Title>
                <Text type="secondary">
                  记录每次操作的执行人员信息，支持按操作人查询其所有操作记录。便于责任追溯和绩效考核，确保库存管理的规范性和可问责性。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="default" />
                  <FileSearchOutlined style={{ color: '#722ed1', marginLeft: 8, marginRight: 8 }} />
                  4. 审计报表分析
                </Title>
                <Text type="secondary">
                  生成库存变动分析报表，包括操作频次统计、操作人员排行、异常操作汇总等。支持按时间段、门店、商品类别等多维度分析，为库存管理决策提供数据支持。
                </Text>
              </div>
            </Space>
          </Card>
        </>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          变动历史 <Badge count={458} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Table
            columns={auditColumns}
            dataSource={[]}
            pagination={{ pageSize: 20 }}
            locale={{
              emptyText: <Empty description="暂无变动记录，完整功能开发中..." />,
            }}
          />
        </Card>
      ),
    },
    {
      key: 'exceptions',
      label: (
        <span>
          异常监控 <Badge count={12} style={{ marginLeft: 8 }} status="error" />
        </span>
      ),
      children: (
        <Card>
          <Empty description="异常监控功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'operators',
      label: '操作人追踪',
      children: (
        <Card>
          <Empty description="操作人追踪功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'reports',
      label: '审计报表',
      children: (
        <Card>
          <Empty description="审计报表功能开发中..." />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <AuditOutlined style={{ marginRight: 8 }} />
        库存变动日志 / 审计
      </Title>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default InventoryAudit;
