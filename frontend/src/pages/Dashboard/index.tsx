/**
 * 仪表盘页面
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Progress,
  List,
  Avatar
} from 'antd';
import {
  ShopOutlined,
  DollarOutlined,
  AuditOutlined,
  EyeOutlined,
  PlusOutlined,
  SettingOutlined,
  ExportOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/services/mockApi';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface DashboardStats {
  productCount: number;
  activeProducts: number;
  pricingCount: number;
  activePricing: number;
  pendingReviews: number;
  approvedReviews: number;
  totalInventory: number;
  todayInventory: number;
}

/**
 * 仪表盘页面组件
 */
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    activeProducts: 0,
    pricingCount: 0,
    activePricing: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    totalInventory: 0,
    todayInventory: 0,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  /**
   * 加载仪表盘统计数据
   */
  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await mockApi.getDashboardStats();
      if (response.code === 200) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadStats();
  }, []);

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  /**
   * 快速导航处理
   */
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // 计算百分比
  const activeProductRate = stats.productCount > 0
    ? Math.round((stats.activeProducts / stats.productCount) * 100)
    : 0;

  const activePricingRate = stats.pricingCount > 0
    ? Math.round((stats.activePricing / stats.pricingCount) * 100)
    : 0;

  // 待审核记录列配置
  const reviewColumns: ColumnsType<any> = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeConfig = {
          product: { color: 'blue', text: '商品' },
          pricing: { color: 'green', text: '定价' },
          inventory: { color: 'purple', text: '库存' },
        };
        const config = typeConfig[type as keyof typeof typeConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 80,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 120,
    },
  ];

  // 模拟待审核数据
  const mockReviewData = [
    {
      key: '1',
      type: 'product',
      title: '新增商品审核',
      applicant: '张三',
      applyTime: '2025-12-10 10:30',
    },
    {
      key: '2',
      type: 'pricing',
      title: '价格调整审核',
      applicant: '李四',
      applyTime: '2025-12-10 09:15',
    },
    {
      key: '3',
      type: 'inventory',
      title: '库存变动审核',
      applicant: '王五',
      applyTime: '2025-12-10 08:45',
    },
  ];

  return (
    <div className="dashboard-page">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">仪表盘</Title>
        <Space>
          <Button
            icon={<SyncOutlined />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            刷新数据
          </Button>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={() => handleNavigate('/product')}
          >
            导出报表
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="商品总数"
              value={stats.productCount}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <Text type="secondary" className="text-xs">
                  活跃 {stats.activeProducts}
                </Text>
              }
            />
            <Progress
              percent={activeProductRate}
              size="small"
              className="mt-2"
              strokeColor="#1890ff"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="价格规则"
              value={stats.pricingCount}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <Text type="secondary" className="text-xs">
                  生效 {stats.activePricing}
                </Text>
              }
            />
            <Progress
              percent={activePricingRate}
              size="small"
              className="mt-2"
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="待审核"
              value={stats.pendingReviews}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix={
                <Text type="secondary" className="text-xs">
                  已审 {stats.approvedReviews}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="库存记录"
              value={stats.totalInventory}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <Text type="secondary" className="text-xs">
                  今日 {stats.todayInventory}
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 快速操作 */}
        <Col xs={24} lg={8}>
          <Card title="快速操作" className="h-full">
            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                block
                onClick={() => handleNavigate('/product')}
              >
                新增商品
              </Button>
              <Button
                icon={<DollarOutlined />}
                block
                onClick={() => handleNavigate('/pricing')}
              >
                创建价格规则
              </Button>
              <Button
                icon={<AuditOutlined />}
                block
                onClick={() => handleNavigate('/review')}
              >
                处理审核
              </Button>
              <Button
                icon={<EyeOutlined />}
                block
                onClick={() => handleNavigate('/inventory')}
              >
                库存管理
              </Button>
              <Button
                icon={<SettingOutlined />}
                block
              >
                系统设置
              </Button>
            </Space>
          </Card>
        </Col>

        {/* 待审核列表 */}
        <Col xs={24} lg={16}>
          <Card
            title="待审核事项"
            extra={
              <Button
                type="link"
                onClick={() => handleNavigate('/review')}
              >
                查看全部
              </Button>
            }
            className="h-full"
          >
            <Table
              columns={reviewColumns}
              dataSource={mockReviewData}
              pagination={false}
              size="small"
              scroll={{ y: 240 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24}>
          <Card title="系统状态">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div className="text-center p-4">
                  <Avatar size={64} style={{ backgroundColor: '#52c41a' }}>
                    ✓
                  </Avatar>
                  <Title level={5} className="mt-3 mb-2">系统运行正常</Title>
                  <Text type="secondary">所有服务正常运行</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center p-4">
                  <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                    📊
                  </Avatar>
                  <Title level={5} className="mt-3 mb-2">数据同步正常</Title>
                  <Text type="secondary">最后同步: 5分钟前</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center p-4">
                  <Avatar size={64} style={{ backgroundColor: '#722ed1' }}>
                    🔒
                  </Avatar>
                  <Title level={5} className="mt-3 mb-2">安全状态良好</Title>
                  <Text type="secondary">无安全威胁</Text>
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