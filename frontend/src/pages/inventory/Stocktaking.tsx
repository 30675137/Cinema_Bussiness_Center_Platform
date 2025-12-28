import React from 'react';
import { Card, Tabs, Row, Col, Statistic, Empty, Typography, Space, Badge, Alert } from 'antd';
import {
  FileSearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 盘点模块页面
 * 功能：盘点计划、盘点执行、盘点审核、盘点报表
 */
const Stocktaking: React.FC = () => {
  const tabItems = [
    {
      key: 'overview',
      label: '盘点概览',
      children: (
        <>
          {/* 提示信息 */}
          <Alert
            message="库存盘点提醒"
            description="本月盘点计划已生成，请各门店/仓库及时完成盘点任务。逾期未完成的盘点任务将自动上报。"
            type="info"
            showIcon
            closable
            style={{ marginBottom: 16 }}
          />

          {/* 今日统计 */}
          <Card title="盘点任务统计" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="待盘点任务"
                    value={5}
                    prefix={<FileSearchOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="盘点中任务"
                    value={3}
                    prefix={<EditOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="待审核任务"
                    value={7}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="已完成任务"
                    value={28}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 盘点差异统计 */}
          <Card title="本月盘点差异" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="盘盈数量"
                    value={156}
                    prefix={<RiseOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                    suffix="件"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    盘盈金额：¥12,580
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false} style={{ textAlign: 'center' }}>
                  <Statistic
                    title="盘亏数量"
                    value={89}
                    prefix={<FallOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                    suffix="件"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    盘亏金额：¥8,960
                  </Text>
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
                    <FileSearchOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    创建盘点计划
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    新建库存盘点任务
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
                    <EditOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    执行盘点
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    进行现场盘点作业
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
                    盘点审核
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    审核盘点结果差异
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
                    <FileTextOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                  </div>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    盘点报表
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    查看盘点统计报表
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* 功能说明 */}
          <Card title="盘点流程说明">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={5}>
                  <Badge status="processing" />
                  <FileSearchOutlined style={{ color: '#1890ff', marginLeft: 8, marginRight: 8 }} />
                  1. 盘点计划
                </Title>
                <Text type="secondary">
                  根据盘点周期（月度/季度/年度）或临时需求创建盘点计划。支持全盘、抽盘、循环盘点等多种盘点方式。系统自动生成盘点单并分配任务。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="processing" />
                  <EditOutlined style={{ color: '#52c41a', marginLeft: 8, marginRight: 8 }} />
                  2. 盘点执行
                </Title>
                <Text type="secondary">
                  现场人员扫描商品条码或手动录入实际库存数量。支持移动端盘点，实时上传盘点数据。系统自动计算账面数量与实际数量的差异。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="warning" />
                  <CheckCircleOutlined style={{ color: '#faad14', marginLeft: 8, marginRight: 8 }} />
                  3. 盘点审核
                </Title>
                <Text type="secondary">
                  管理员审核盘点结果，重点关注盘盈盘亏较大的商品。可要求重新盘点或确认差异原因。审核通过后系统自动调整账面库存。
                </Text>
              </div>
              <div>
                <Title level={5}>
                  <Badge status="success" />
                  <FileTextOutlined style={{ color: '#722ed1', marginLeft: 8, marginRight: 8 }} />
                  4. 盘点报表
                </Title>
                <Text type="secondary">
                  生成盘点汇总报表、差异分析报表、盘点历史记录等。支持按门店、仓库、商品类别等维度统计分析，为库存管理优化提供数据支持。
                </Text>
              </div>
            </Space>
          </Card>
        </>
      ),
    },
    {
      key: 'plan',
      label: (
        <span>
          盘点计划 <Badge count={5} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="盘点计划功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'execute',
      label: (
        <span>
          盘点执行 <Badge count={3} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="盘点执行功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'review',
      label: (
        <span>
          盘点审核 <Badge count={7} style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <Card>
          <Empty description="盘点审核功能开发中..." />
        </Card>
      ),
    },
    {
      key: 'report',
      label: '盘点报表',
      children: (
        <Card>
          <Empty description="盘点报表功能开发中..." />
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <FileSearchOutlined style={{ marginRight: 8 }} />
        盘点模块
      </Title>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default Stocktaking;
