import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
  message,
  Modal,
  Drawer,
  Tooltip,
  Badge,
  Form,
  Switch,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  CopyOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  usePriceRulesQuery,
  useCreatePriceRuleMutation,
  useUpdatePriceRuleMutation,
  useDeletePriceRuleMutation,
  useApplyPriceRuleMutation,
} from '@/stores/priceStore';
import {
  PriceRule,
  PriceRuleType,
  PriceRuleTypeConfig,
  PriceRuleSchema,
  PriceRuleInput,
} from '@/types/price';
import PriceRuleForm from './PriceRuleForm';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const PriceRulesManager: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PriceRule | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const { data: priceRules = [], isLoading, refetch } = usePriceRulesQuery();

  const createMutation = useCreatePriceRuleMutation();
  const updateMutation = useUpdatePriceRuleMutation();
  const deleteMutation = useDeletePriceRuleMutation();
  const applyMutation = useApplyPriceRuleMutation();

  // 创建规则
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  // 编辑规则
  const handleEdit = (rule: PriceRule) => {
    setSelectedRule(rule);
    setEditModalVisible(true);
  };

  // 删除规则
  const handleDelete = async (ruleId: string) => {
    try {
      await deleteMutation.mutateAsync(ruleId);
      message.success('规则删除成功');
      refetch();
    } catch (error) {
      message.error('规则删除失败');
    }
  };

  // 应用规则
  const handleApply = (rule: PriceRule) => {
    setSelectedRule(rule);
    setApplyModalVisible(true);
  };

  // 执行规则应用
  const handleApplyRule = async () => {
    if (!selectedRule || selectedProductIds.length === 0) {
      message.warning('请选择要应用规则的商品');
      return;
    }

    try {
      const result = await applyMutation.mutateAsync({
        ruleId: selectedRule.id,
        productIds: selectedProductIds,
      });

      message.success(`成功应用规则到 ${result.applied} 个商品`);
      if (result.failed > 0) {
        message.warning(`${result.failed} 个商品应用失败`);
      }
      setApplyModalVisible(false);
      setSelectedProductIds([]);
    } catch (error) {
      message.error('规则应用失败');
    }
  };

  // 切换规则状态
  const handleToggleActive = async (rule: PriceRule) => {
    try {
      await updateMutation.mutateAsync({
        id: rule.id,
        data: { isActive: !rule.isActive },
      });
      message.success(`规则已${rule.isActive ? '停用' : '启用'}`);
      refetch();
    } catch (error) {
      message.error('规则状态更新失败');
    }
  };

  // 复制规则
  const handleCopy = (rule: PriceRule) => {
    const newRule = {
      ...rule,
      name: `${rule.name} (副本)`,
      isActive: false,
    };
    delete (newRule as any).id;
    delete (newRule as any).createdAt;
    delete (newRule as any).updatedAt;

    setCreateModalVisible(true);
    // 这里需要传递复制的规则数据
  };

  // 规则类型标签
  const getRuleTypeTag = (type: PriceRuleType) => {
    const config = PriceRuleTypeConfig[type];
    return <Tag color="blue">{config.text}</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PriceRule) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '规则类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: PriceRuleType) => getRuleTypeTag(type),
    },
    {
      title: '折扣配置',
      key: 'config',
      width: 150,
      render: (_, record: PriceRule) => (
        <div>
          <div>{record.config.discountType === 'percentage' ? '百分比' : '固定金额'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.config.discountValue}
            {record.config.discountType === 'percentage' ? '%' : '元'}
          </Text>
        </div>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) => <Tag color={priority > 5 ? 'red' : 'blue'}>{priority}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean, record: PriceRule) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record: PriceRule) => (
        <Space>
          <Tooltip title="应用规则">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleApply(record)}
              disabled={!record.isActive}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此规则吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计信息
  const renderStatistics = () => {
    const activeRules = priceRules.filter((rule) => rule.isActive).length;
    const inactiveRules = priceRules.filter((rule) => !rule.isActive).length;

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                {priceRules.length}
              </Title>
              <Text type="secondary">总规则数</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                {activeRules}
              </Title>
              <Text type="secondary">启用中</Text>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#faad14', margin: 0 }}>
                {inactiveRules}
              </Title>
              <Text type="secondary">已停用</Text>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="price-rules-manager">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              价格规则管理
              <Badge count={priceRules.length} style={{ marginLeft: 8 }} />
            </Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<SettingOutlined />}>规则设置</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建规则
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索规则名称或描述"
              allowClear
              enterButton
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Select placeholder="规则类型" style={{ width: 150 }} allowClear>
              <Option value={PriceRuleType.FIXED_DISCOUNT}>固定折扣</Option>
              <Option value={PriceRuleType.PERCENTAGE_DISCOUNT}>百分比折扣</Option>
              <Option value={PriceRuleType.FIXED_AMOUNT}>固定金额</Option>
              <Option value={PriceRuleType.BULK_PURCHASE}>批量采购</Option>
              <Option value={PriceRuleType.TIME_BASED}>时效价格</Option>
              <Option value={PriceRuleType.MEMBER_LEVEL}>会员等级</Option>
              <Option value={PriceRuleType.CHANNEL_BASED}>渠道定价</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      {renderStatistics()}

      {/* 规则说明 */}
      <Alert
        message="价格规则说明"
        description="价格规则可以根据不同的条件自动计算和应用折扣。系统会按照优先级从高到低依次检查规则，找到第一个匹配的规则后停止。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* 规则列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={priceRules}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 创建规则弹窗 */}
      <Modal
        title="新建价格规则"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <PriceRuleForm
          mode="create"
          onSuccess={() => {
            setCreateModalVisible(false);
            refetch();
          }}
        />
      </Modal>

      {/* 编辑规则弹窗 */}
      <Modal
        title="编辑价格规则"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedRule(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedRule && (
          <PriceRuleForm
            mode="edit"
            rule={selectedRule}
            onSuccess={() => {
              setEditModalVisible(false);
              setSelectedRule(null);
              refetch();
            }}
          />
        )}
      </Modal>

      {/* 应用规则弹窗 */}
      <Modal
        title="应用价格规则"
        open={applyModalVisible}
        onCancel={() => {
          setApplyModalVisible(false);
          setSelectedRule(null);
          setSelectedProductIds([]);
        }}
        onOk={handleApplyRule}
        okText="应用"
        cancelText="取消"
        width={600}
      >
        {selectedRule && (
          <div>
            <Alert
              message={`规则: ${selectedRule.name}`}
              description={selectedRule.description}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item label="选择商品">
              <Select
                mode="multiple"
                placeholder="请选择要应用规则的商品（可搜索商品ID或SKU）"
                style={{ width: '100%' }}
                value={selectedProductIds}
                onChange={setSelectedProductIds}
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                }
                options={[]}
              />
            </Form.Item>

            <Text type="secondary" style={{ fontSize: 12 }}>
              注意：规则将覆盖商品现有的价格配置
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PriceRulesManager;
