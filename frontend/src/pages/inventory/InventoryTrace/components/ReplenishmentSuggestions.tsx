import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Tooltip,
  Progress,
  Alert,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Modal,
  message
} from 'antd';
import {
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ReplenishmentSuggestionsProps {
  data?: any;
  loading?: boolean;
}

// 模拟补货建议数据
const mockReplenishmentData = {
  suggestions: [
    {
      skuId: 'SKU002',
      skuName: '爆米花中份',
      storeId: 'STORE001',
      storeName: '万达影城CBD店',
      currentStock: 25,
      reorderPoint: 40,
      maxStock: 200,
      suggestedQuantity: 60,
      urgency: 'critical',
      reason: '当前库存远低于重购点，预计2天内售罄',
      estimatedCost: 1200,
      daysOfSupply: 3,
      leadTime: 7
    },
    {
      skuId: 'SKU001',
      skuName: '可口可乐330ml',
      storeId: 'STORE001',
      storeName: '万达影城CBD店',
      currentStock: 80,
      reorderPoint: 50,
      maxStock: 300,
      suggestedQuantity: 40,
      urgency: 'high',
      reason: '接近重购点，建议及时补货',
      estimatedCost: 140,
      daysOfSupply: 8,
      leadTime: 5
    },
    {
      skuId: 'SKU004',
      skuName: '3D眼镜',
      storeId: 'STORE002',
      storeName: '万达影城三里屯店',
      currentStock: 15,
      reorderPoint: 30,
      maxStock: 150,
      suggestedQuantity: 35,
      urgency: 'high',
      reason: '周末需求增加，库存不足',
      estimatedCost: 700,
      daysOfSupply: 5,
      leadTime: 3
    },
    {
      skuId: 'SKU005',
      skuName: '热狗套餐',
      storeId: 'STORE003',
      storeName: '万达影城五道口店',
      currentStock: 35,
      reorderPoint: 25,
      maxStock: 100,
      suggestedQuantity: 20,
      urgency: 'medium',
      reason: '维持安全库存水平',
      estimatedCost: 400,
      daysOfSupply: 12,
      leadTime: 5
    }
  ],
  summary: {
    totalSuggestions: 4,
    estimatedTotalCost: 2440,
    criticalItems: 1,
    highPriorityItems: 2
  }
};

const ReplenishmentSuggestions: React.FC<ReplenishmentSuggestionsProps> = ({
  data,
  loading = false
}) => {
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

  const replenishmentData = data || mockReplenishmentData;
  const suggestions = replenishmentData.suggestions;

  // 过滤建议
  const filteredSuggestions = selectedUrgency === 'all'
    ? suggestions
    : suggestions.filter(item => item.urgency === selectedUrgency);

  // 获取紧急程度信息
  const getUrgencyInfo = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return { color: 'red', text: '紧急', icon: <ExclamationCircleOutlined /> };
      case 'high':
        return { color: 'orange', text: '高', icon: <WarningOutlined /> };
      case 'medium':
        return { color: 'blue', text: '中', icon: <ClockCircleOutlined /> };
      case 'low':
        return { color: 'green', text: '低', icon: <CheckCircleOutlined /> };
      default:
        return { color: 'default', text: '未知', icon: <InfoCircleOutlined /> };
    }
  };

  // 计算库存健康度
  const getInventoryHealth = (current: number, max: number) => {
    const health = Math.round((current / max) * 100);
    if (health >= 80) return { score: health, color: '#52c41a', status: '充足' };
    if (health >= 60) return { score: health, color: '#faad14', status: '适中' };
    if (health >= 30) return { score: health, color: '#fa8c16', status: '偏低' };
    return { score: health, color: '#f5222d', status: '不足' };
  };

  // 处理创建采购订单
  const handleCreatePurchaseOrder = (suggestion: any) => {
    Modal.confirm({
      title: '创建采购订单',
      content: `是否为 ${suggestion.skuName} 创建采购订单？\n建议采购数量：${suggestion.suggestedQuantity} ${suggestion.unit || '件'}`,
      onOk: () => {
        message.success('采购订单创建成功');
      }
    });
  };

  // 处理查看详情
  const handleViewDetail = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    setDetailModalVisible(true);
  };

  // 表格列定义
  const columns: ColumnsType<any> = [
    {
      title: '商品信息',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.skuName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.skuId}
          </Text>
        </Space>
      )
    },
    {
      title: '门店',
      dataIndex: 'storeName',
      key: 'store',
      width: 150,
      render: (text) => (
        <Text>{text}</Text>
      )
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 100,
      render: (urgency) => {
        const urgencyInfo = getUrgencyInfo(urgency);
        return (
          <Tag color={urgencyInfo.color} icon={urgencyInfo.icon}>
            {urgencyInfo.text}
          </Tag>
        );
      },
      filters: [
        { text: '紧急', value: 'critical' },
        { text: '高', value: 'high' },
        { text: '中', value: 'medium' },
        { text: '低', value: 'low' }
      ],
      onFilter: (value, record) => record.urgency === value
    },
    {
      title: '库存状态',
      key: 'inventoryStatus',
      width: 150,
      render: (_, record) => {
        const health = getInventoryHealth(record.currentStock, record.maxStock);
        return (
          <Space direction="vertical" size="small" style={{ width: '100px' }}>
            <Progress
              percent={health.score}
              strokeColor={health.color}
              size="small"
              format={() => `${health.score}%`}
            />
            <Text style={{ fontSize: '12px', color: health.color }}>
              {health.status}
            </Text>
          </Space>
        );
      }
    },
    {
      title: '当前库存',
      key: 'currentStock',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: '14px' }}>{record.currentStock}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            重购点: {record.reorderPoint}
          </Text>
        </Space>
      )
    },
    {
      title: '建议采购',
      key: 'suggestion',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
            +{record.suggestedQuantity}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            预计: ¥{record.estimatedCost}
          </Text>
        </Space>
      )
    },
    {
      title: '供应天数',
      dataIndex: 'daysOfSupply',
      key: 'daysOfSupply',
      width: 100,
      render: (days, record) => (
        <Space direction="vertical" size="small">
          <Text>{days}天</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            交期: {record.leadTime}天
          </Text>
        </Space>
      )
    },
    {
      title: '建议原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="创建采购单">
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleCreatePurchaseOrder(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <ShoppingCartOutlined />
          补货建议
          <Badge count={replenishmentData.summary.totalSuggestions} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        <Space>
          <Button
            size="small"
            icon={<FilterOutlined />}
            onClick={() => setSelectedUrgency('all')}
          >
            全部 ({replenishmentData.summary.totalSuggestions})
          </Button>
          <Button
            size="small"
            danger
            onClick={() => setSelectedUrgency('critical')}
          >
            紧急 ({replenishmentData.summary.criticalItems})
          </Button>
          <Button
            size="small"
            onClick={() => setSelectedUrgency('high')}
          >
            高优先级 ({replenishmentData.summary.highPriorityItems})
          </Button>
        </Space>
      }
    >
      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="建议总数"
              value={replenishmentData.summary.totalSuggestions}
              suffix="个"
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="预计总成本"
              value={replenishmentData.summary.estimatedTotalCost}
              prefix="¥"
              precision={0}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="紧急补货"
              value={replenishmentData.summary.criticalItems}
              suffix="个"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="高优先级"
              value={replenishmentData.summary.highPriorityItems}
              suffix="个"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 警报提示 */}
      {replenishmentData.summary.criticalItems > 0 && (
        <Alert
          message="紧急补货提醒"
          description={`有 ${replenishmentData.summary.criticalItems} 个商品需要紧急补货，请立即处理`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 补货建议表格 */}
      <Table
        columns={columns}
        dataSource={filteredSuggestions}
        rowKey="skuId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
        scroll={{ x: 1200 }}
        size="small"
      />

      {/* 详情模态框 */}
      <Modal
        title="补货建议详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedSuggestion(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setDetailModalVisible(false)}>
            取消
          </Button>,
          <Button key="create" type="primary" onClick={() => {
            if (selectedSuggestion) {
              handleCreatePurchaseOrder(selectedSuggestion);
              setDetailModalVisible(false);
            }
          }}>
            创建采购单
          </Button>
        ]}
        width={600}
      >
        {selectedSuggestion && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>商品信息</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text>商品名称：</Text>
                  <Text strong>{selectedSuggestion.skuName}</Text>
                </Col>
                <Col span={12}>
                  <Text>商品编码：</Text>
                  <Text code>{selectedSuggestion.skuId}</Text>
                </Col>
              </Row>
            </div>

            <div>
              <Title level={5}>库存状态</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="当前库存"
                    value={selectedSuggestion.currentStock}
                    suffix="件"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="重购点"
                    value={selectedSuggestion.reorderPoint}
                    suffix="件"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="最大库存"
                    value={selectedSuggestion.maxStock}
                    suffix="件"
                  />
                </Col>
              </Row>
            </div>

            <div>
              <Title level={5}>补货建议</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="建议采购数量"
                    value={selectedSuggestion.suggestedQuantity}
                    suffix="件"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="预计成本"
                    value={selectedSuggestion.estimatedCost}
                    prefix="¥"
                    precision={2}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Col>
              </Row>
            </div>

            <div>
              <Title level={5}>时间信息</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text>当前供应天数：</Text>
                  <Text strong>{selectedSuggestion.daysOfSupply} 天</Text>
                </Col>
                <Col span={12}>
                  <Text>采购交期：</Text>
                  <Text strong>{selectedSuggestion.leadTime} 天</Text>
                </Col>
              </Row>
            </div>

            <div>
              <Title level={5}>建议原因</Title>
              <Text>{selectedSuggestion.reason}</Text>
            </div>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

export default ReplenishmentSuggestions;