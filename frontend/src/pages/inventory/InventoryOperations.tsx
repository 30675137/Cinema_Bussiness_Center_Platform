import React from 'react';
import { Card, Tabs, Row, Col, Statistic, Empty, Typography, Space } from 'antd';
import {
  InboxOutlined,
  ExportOutlined,
  DeleteOutlined,
  RollbackOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 库存操作页面
 * 功能：入库、出库、报损、退库等操作
 */
const InventoryOperations: React.FC = () => {
  // 快捷操作配置
  const operations = [
    {
      key: 'in',
      title: '入库操作',
      icon: <InboxOutlined />,
      color: '#52c41a',
      description: '商品入库、采购入库',
      onClick: () => console.log('入库操作'),
    },
    {
      key: 'out',
      title: '出库操作',
      icon: <ExportOutlined />,
      color: '#1890ff',
      description: '销售出库、调拨出库',
      onClick: () => console.log('出库操作'),
    },
    {
      key: 'loss',
      title: '报损操作',
      icon: <DeleteOutlined />,
      color: '#ff4d4f',
      description: '库存报损、过期报损',
      onClick: () => console.log('报损操作'),
    },
    {
      key: 'return',
      title: '退库操作',
      icon: <RollbackOutlined />,
      color: '#faad14',
      description: '销售退库、采购退库',
      onClick: () => console.log('退库操作'),
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: '操作概览',
      children: (
        <>
          {/* 今日统计 */}
          <Card title="今日操作统计" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="入库单数"
                    value={12}
                    prefix={<InboxOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                    suffix={
                      <span style={{ fontSize: 14 }}>
                        <ArrowUpOutlined /> 8.5%
                      </span>
                    }
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="出库单数"
                    value={28}
                    prefix={<ExportOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                    suffix={
                      <span style={{ fontSize: 14 }}>
                        <ArrowUpOutlined /> 12.3%
                      </span>
                    }
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="报损单数"
                    value={3}
                    prefix={<DeleteOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                    suffix={
                      <span style={{ fontSize: 14 }}>
                        <ArrowDownOutlined /> 2.1%
                      </span>
                    }
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="退库单数"
                    value={5}
                    prefix={<RollbackOutlined />}
                    valueStyle={{ color: '#faad14' }}
                    suffix={
                      <span style={{ fontSize: 14 }}>
                        <ArrowUpOutlined /> 5.2%
                      </span>
                    }
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 快捷操作 */}
          <Card title="快捷操作" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              {operations.map((op) => (
                <Col span={6} key={op.key}>
                  <Card
                    hoverable
                    onClick={op.onClick}
                    style={{
                      textAlign: 'center',
                      transition: 'all 0.3s',
                    }}
                    bodyStyle={{ padding: '24px' }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `${op.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <div style={{ fontSize: 32, color: op.color }}>{op.icon}</div>
                    </div>
                    <Title level={5} style={{ marginBottom: 8 }}>
                      {op.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {op.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 功能说明 */}
          <Card title="功能说明">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>
                  <InboxOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  入库操作
                </Title>
                <Text type="secondary">
                  支持采购入库、调拨入库、盘盈入库等多种入库场景。自动更新库存数量，支持批次管理和过期时间设置。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <ExportOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  出库操作
                </Title>
                <Text type="secondary">
                  支持销售出库、调拨出库、领用出库等场景。按照先进先出原则自动分配批次，确保库存准确性。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <DeleteOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  报损操作
                </Title>
                <Text type="secondary">
                  记录商品损耗、过期、破损等情况。支持多种报损原因选择，自动扣减库存并生成报损记录。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <RollbackOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  退库操作
                </Title>
                <Text type="secondary">
                  处理销售退货、采购退货等退库业务。支持原批次退库，自动恢复库存数量。
                </Text>
              </div>
            </Space>
          </Card>
        </>
      ),
    },
    {
      key: 'in',
      label: '入库操作',
      children: (
        <Card>
          <Empty description="入库操作功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'out',
      label: '出库操作',
      children: (
        <Card>
          <Empty description="出库操作功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'loss',
      label: '报损操作',
      children: (
        <Card>
          <Empty description="报损操作功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'return',
      label: '退库操作',
      children: (
        <Card>
          <Empty description="退库操作功能开发中..." />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        入库/出库/报损/退库操作
      </Title>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default InventoryOperations;
