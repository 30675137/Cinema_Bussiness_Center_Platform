import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tabs,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  message,
  Badge,
  Row,
  Col,
  Statistic,
  Table,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  AuditOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import PricingStrategyForm from '@/components/pricing/PricingStrategyForm';
import ChannelPriceManager from '@/components/pricing/ChannelPriceManager';
import PricingApproval from '@/components/pricing/PricingApproval';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface PricingStrategy {
  id: string;
  name: string;
  type: 'fixed' | 'percentage' | 'tiered' | 'dynamic';
  value: number | string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

const PricingConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('strategies');
  const [strategies, setStrategies] = useState<PricingStrategy[]>([
    {
      id: '1',
      name: '标准定价策略',
      type: 'fixed',
      value: 100,
      description: '基础商品的标准定价策略',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'VIP会员折扣',
      type: 'percentage',
      value: 0.85,
      description: 'VIP会员享受85折优惠',
      status: 'active',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
    },
    {
      id: '3',
      name: '阶梯定价',
      type: 'tiered',
      value: '100-500:0.9,500-1000:0.8,1000+:0.7',
      description: '根据购买数量提供不同折扣',
      status: 'draft',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-05',
    },
  ]);

  const [strategyModalVisible, setStrategyModalVisible] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<PricingStrategy | null>(null);
  const [strategyFormVisible, setStrategyFormVisible] = useState(false);

  // 统计数据
  const stats = {
    totalStrategies: strategies.length,
    activeStrategies: strategies.filter((s) => s.status === 'active').length,
    pendingApprovals: 3, // 模拟待审批数量
    channelPrices: 6, // 模拟渠道价格数量
  };

  // 定价策略表格列
  const strategyColumns: ColumnsType<PricingStrategy> = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PricingStrategy) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.type === 'fixed' && '固定价格'}
            {record.type === 'percentage' && '百分比折扣'}
            {record.type === 'tiered' && '阶梯定价'}
            {record.type === 'dynamic' && '动态定价'}
          </div>
        </div>
      ),
    },
    {
      title: '策略值',
      dataIndex: 'value',
      key: 'value',
      render: (value: number | string, record: PricingStrategy) => {
        if (record.type === 'fixed') {
          return `¥${value}`;
        } else if (record.type === 'percentage' && typeof value === 'number') {
          return `${((1 - value) * 100).toFixed(1)}%`;
        } else {
          return (
            <Tooltip title={typeof value === 'string' ? value : String(value)}>
              <span>查看详情</span>
            </Tooltip>
          );
        }
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', text: '已启用' },
          inactive: { color: 'red', text: '已禁用' },
          draft: { color: 'orange', text: '草稿' },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: PricingStrategy) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditStrategy(record)}>
            编辑
          </Button>
          <Button type="link" icon={<CopyOutlined />} onClick={() => handleCopyStrategy(record)}>
            复制
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteStrategy(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理定价策略操作
  const handleEditStrategy = (strategy: PricingStrategy) => {
    setEditingStrategy(strategy);
  };

  const handleCopyStrategy = (strategy: PricingStrategy) => {
    const newStrategy = {
      ...strategy,
      id: Date.now().toString(),
      name: `${strategy.name} (副本)`,
      status: 'draft' as const,
    };
    setStrategies([...strategies, newStrategy]);
    message.success('策略复制成功');
  };

  const handleDeleteStrategy = (strategy: PricingStrategy) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除定价策略"${strategy.name}"吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        setStrategies(strategies.filter((s) => s.id !== strategy.id));
        message.success('策略删除成功');
      },
    });
  };

  return (
    <div>
      <Title level={3}>价格配置单</Title>

      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总策略数"
              value={stats.totalStrategies}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="生效策略"
              value={stats.activeStrategies}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="渠道价格"
              value={stats.channelPrices}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批"
              value={stats.pendingApprovals}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              定价策略
            </span>
          }
          key="strategies"
        >
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Input.Search placeholder="搜索策略名称" style={{ width: 250 }} />
                <Select placeholder="策略类型" style={{ width: 120 }} allowClear>
                  <Option value="fixed">固定价格</Option>
                  <Option value="percentage">百分比折扣</Option>
                  <Option value="tiered">阶梯定价</Option>
                  <Option value="dynamic">动态定价</Option>
                </Select>
                <Select placeholder="状态" style={{ width: 100 }} allowClear>
                  <Option value="active">已启用</Option>
                  <Option value="inactive">已禁用</Option>
                  <Option value="draft">草稿</Option>
                </Select>
              </Space>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingStrategy(null);
                    setStrategyFormVisible(true);
                  }}
                >
                  新建策略
                </Button>
                <Button icon={<SettingOutlined />} onClick={() => setStrategyFormVisible(true)}>
                  高级配置
                </Button>
              </Space>
            </div>

            <Table
              columns={strategyColumns}
              dataSource={strategies}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ShoppingCartOutlined />
              渠道价格
            </span>
          }
          key="channels"
        >
          <ChannelPriceManager />
        </TabPane>

        <TabPane
          tab={
            <span>
              <Badge count={stats.pendingApprovals} size="small">
                <AuditOutlined />
                审批工作流
              </Badge>
            </span>
          }
          key="approval"
        >
          <PricingApproval />
        </TabPane>
      </Tabs>

      {/* 高级定价策略配置弹窗 */}
      <Modal
        title={editingStrategy ? '编辑定价策略' : '新建定价策略'}
        open={strategyFormVisible}
        onCancel={() => {
          setStrategyFormVisible(false);
          setEditingStrategy(null);
        }}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <PricingStrategyForm
          initialValues={
            editingStrategy
              ? {
                  type: editingStrategy.type,
                  basePrice:
                    editingStrategy.type === 'fixed'
                      ? typeof editingStrategy.value === 'number'
                        ? editingStrategy.value
                        : 0
                      : undefined,
                  discountRate:
                    editingStrategy.type === 'percentage'
                      ? typeof editingStrategy.value === 'number'
                        ? editingStrategy.value
                        : 0
                      : undefined,
                }
              : undefined
          }
          onSubmit={(config) => {
            const strategyData = {
              name: editingStrategy?.name || `新建策略_${Date.now()}`,
              type: config.type,
              value:
                config.type === 'fixed'
                  ? config.basePrice || 0
                  : config.type === 'percentage'
                    ? config.discountRate || 0
                    : JSON.stringify({
                        tierRules: config.tierRules,
                        dynamicRules: config.dynamicRules,
                      }),
              description: `${config.type}类型定价策略`,
              status: 'draft' as const,
            };

            if (editingStrategy) {
              setStrategies(
                strategies.map((s) =>
                  s.id === editingStrategy.id
                    ? { ...s, ...strategyData, updatedAt: dayjs().format('YYYY-MM-DD') }
                    : s
                )
              );
              message.success('策略更新成功');
            } else {
              const newStrategy = {
                ...strategyData,
                id: Date.now().toString(),
                createdAt: dayjs().format('YYYY-MM-DD'),
                updatedAt: dayjs().format('YYYY-MM-DD'),
              };
              setStrategies([...strategies, newStrategy]);
              message.success('策略创建成功');
            }

            setStrategyFormVisible(false);
            setEditingStrategy(null);
          }}
          onCancel={() => {
            setStrategyFormVisible(false);
            setEditingStrategy(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default PricingConfig;
