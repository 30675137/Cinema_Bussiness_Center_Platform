import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Typography,
  Alert,
  Timeline,
  Modal,
  message,
  Tooltip,
  Divider,
  Progress,
  Badge,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  HistoryOutlined,
  AlertOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import {
  InventoryItem,
  InventoryOperation,
  InventoryStatus,
  InventoryAlert,
  InventoryCheck,
  InventoryOperationType,
} from '@/types/inventory';
import { useInventoryStore } from '@/stores/inventoryStore';
import { formatCurrency, formatDate } from '@/utils/formatters';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface InventoryDetailProps {
  inventoryId: string;
  onEdit?: (record: InventoryItem) => void;
}

const InventoryDetail: React.FC<InventoryDetailProps> = ({
  inventoryId,
  onEdit,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const {
    inventoryItems,
    operations,
    alerts,
    currentInventory,
    loading: storeLoading,
    fetchInventoryById,
    fetchInventoryOperations,
    fetchInventoryAlerts,
    updateInventoryItem,
    createInventoryOperation,
  } = useInventoryStore();

  const inventoryItem = inventoryItems.find(item => item.id === inventoryId) || currentInventory;

  // 组件挂载时获取数据
  useEffect(() => {
    if (inventoryId) {
      loadInventoryData();
    }
  }, [inventoryId]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchInventoryById(inventoryId),
        fetchInventoryOperations({ inventoryItemId: inventoryId }),
        fetchInventoryAlerts({ inventoryItemId: inventoryId }),
      ]);
    } catch (error) {
      message.error('获取库存详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 返回列表页
  const handleBack = () => {
    navigate('/inventory');
  };

  // 编辑库存项
  const handleEdit = () => {
    if (inventoryItem && onEdit) {
      onEdit(inventoryItem);
    }
  };

  // 快速库存调整
  const handleQuickAdjust = async (type: 'in' | 'out', quantity: number) => {
    if (!inventoryItem) return;

    Modal.confirm({
      title: `确认${type === 'in' ? '入库' : '出库'}`,
      icon: <ExclamationCircleOutlined />,
      content: `确定要${type === 'in' ? '入库' : '出库'} ${quantity} 个 ${inventoryItem.productName} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await createInventoryOperation({
            inventoryItemId: inventoryItem.id,
            operationType: type === 'in' ? InventoryOperationType.STOCK_IN : InventoryOperationType.STOCK_OUT,
            quantity: type === 'in' ? quantity : -quantity,
            unitPrice: inventoryItem.averageCost,
            reason: type === 'in' ? '手动入库' : '手动出库',
          });
          message.success(`${type === 'in' ? '入库' : '出库'}成功`);
          loadInventoryData();
        } catch (error) {
          message.error(`${type === 'in' ? '入库' : '出库'}失败`);
        }
      },
    });
  };

  // 获取状态标签
  const getStatusTag = (status: InventoryStatus) => {
    const statusConfig = {
      [InventoryStatus.IN_STOCK]: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        text: '有库存',
      },
      [InventoryStatus.LOW_STOCK]: {
        color: 'orange',
        icon: <WarningOutlined />,
        text: '库存不足',
      },
      [InventoryStatus.OUT_OF_STOCK]: {
        color: 'red',
        icon: <ExclamationCircleOutlined />,
        text: '无库存',
      },
      [InventoryStatus.DISCONTINUED]: {
        color: 'gray',
        icon: <SyncOutlined />,
        text: '停产',
      },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 计算库存利用率
  const getStockUtilization = () => {
    if (!inventoryItem) return 0;
    return (inventoryItem.currentStock / inventoryItem.maxStock) * 100;
  };

  // 获取库存健康度
  const getStockHealth = () => {
    if (!inventoryItem) return { level: 'unknown', color: 'gray', text: '未知' };

    const { currentStock, minStock, maxStock } = inventoryItem;

    if (currentStock === 0) return { level: 'critical', color: 'red', text: '严重缺货' };
    if (currentStock <= minStock) return { level: 'warning', color: 'orange', text: '库存不足' };
    if (currentStock >= maxStock) return { level: 'overstock', color: 'blue', text: '库存过量' };

    const ratio = currentStock / minStock;
    if (ratio >= 1.5 && ratio <= 2.5) return { level: 'optimal', color: 'green', text: '库存健康' };
    if (ratio > 2.5) return { level: 'high', color: 'purple', text: '库存充足' };

    return { level: 'normal', color: 'cyan', text: '库存正常' };
  };

  // 操作记录表格列
  const operationColumns: ColumnsType<InventoryOperation> = [
    {
      title: '操作时间',
      dataIndex: 'operationDate',
      key: 'operationDate',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 100,
      render: (type: InventoryOperationType) => {
        const typeConfig = {
          [InventoryOperationType.STOCK_IN]: { color: 'green', text: '入库' },
          [InventoryOperationType.STOCK_OUT]: { color: 'red', text: '出库' },
          [InventoryOperationType.TRANSFER_IN]: { color: 'blue', text: '调拨入库' },
          [InventoryOperationType.TRANSFER_OUT]: { color: 'orange', text: '调拨出库' },
          [InventoryOperationType.ADJUSTMENT]: { color: 'purple', text: '盘点调整' },
          [InventoryOperationType.DAMAGED]: { color: 'red', text: '损坏' },
          [InventoryOperationType.RETURNED]: { color: 'cyan', text: '退货' },
        };

        const config = typeConfig[type];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '数量变化',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (quantity: number, record: InventoryOperation) => (
        <Text strong type={quantity > 0 ? 'success' : 'danger'}>
          {quantity > 0 ? '+' : ''}{quantity} {record.unit}
        </Text>
      ),
    },
    {
      title: '操作前后',
      key: 'stockChange',
      width: 150,
      render: (_, record: InventoryOperation) => (
        <div>
          <div>
            <Text type="secondary">操作前: </Text>
            <Text>{record.beforeStock}</Text>
          </div>
          <div>
            <Text type="secondary">操作后: </Text>
            <Text strong>{record.afterStock}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      align: 'right',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '操作原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100,
    },
  ];

  // 预警记录表格列
  const alertColumns: ColumnsType<InventoryAlert> = [
    {
      title: '预警时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: '预警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 100,
      render: (type: string) => {
        const typeConfig = {
          low_stock: { color: 'orange', text: '库存不足' },
          out_of_stock: { color: 'red', text: '缺货' },
          overstock: { color: 'blue', text: '库存过量' },
          expiring: { color: 'purple', text: '即将过期' },
        };

        const config = typeConfig[type as keyof typeof typeConfig];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => {
        const severityConfig = {
          low: { color: 'blue', text: '低' },
          medium: { color: 'orange', text: '中' },
          high: { color: 'red', text: '高' },
          critical: { color: 'red', text: '紧急' },
        };

        const config = severityConfig[severity as keyof typeof severityConfig];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: '预警信息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '当前值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 100,
      align: 'right',
    },
    {
      title: '阈值',
      dataIndex: 'thresholdValue',
      key: 'thresholdValue',
      width: 100,
      align: 'right',
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 80,
      render: (isRead: boolean) => (
        <Badge status={isRead ? 'default' : 'error'} text={isRead ? '已读' : '未读'} />
      ),
    },
  ];

  if (!inventoryItem) {
    return (
      <Card>
        <Empty description="库存项不存在" />
      </Card>
    );
  }

  const stockHealth = getStockHealth();
  const stockUtilization = getStockUtilization();

  return (
    <div className="inventory-detail">
      {/* 头部操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
              >
                返回列表
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                {inventoryItem.productName}
              </Title>
              {getStatusTag(inventoryItem.status)}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleQuickAdjust('in', 10)}
              >
                快速入库
              </Button>
              <Button
                icon={<MinusCircleOutlined />}
                onClick={() => handleQuickAdjust('out', 10)}
              >
                快速出库
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="当前库存"
              value={inventoryItem.currentStock}
              suffix={inventoryItem.unit}
              valueStyle={{
                color: inventoryItem.currentStock === 0 ? '#cf1322' : '#3f8600',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="库存价值"
              value={inventoryItem.totalValue}
              prefix="¥"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="库存利用率"
              value={stockUtilization}
              suffix="%"
              valueStyle={{
                color: stockUtilization > 90 ? '#cf1322' : stockUtilization > 70 ? '#fa8c16' : '#3f8600',
              }}
            />
            <Progress
              percent={stockUtilization}
              size="small"
              style={{ marginTop: 8 }}
              strokeColor={
                stockUtilization > 90 ? '#cf1322' : stockUtilization > 70 ? '#fa8c16' : '#3f8600'
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="库存健康度"
              value={stockHealth.text}
              valueStyle={{ color: stockHealth.color }}
            />
          </Card>
        </Col>
      </Row>

      {/* 库存预警 */}
      {alerts.filter(alert => !alert.isRead).length > 0 && (
        <Alert
          message="库存预警"
          description={`当前有 ${alerts.filter(alert => !alert.isRead).length} 个未处理预警，请及时关注！`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="info">
            <Descriptions title="商品信息" bordered column={2}>
              <Descriptions.Item label="商品编码">
                {inventoryItem.productCode}
              </Descriptions.Item>
              <Descriptions.Item label="商品名称">
                {inventoryItem.productName}
              </Descriptions.Item>
              <Descriptions.Item label="商品分类">
                {inventoryItem.productCategory}
              </Descriptions.Item>
              <Descriptions.Item label="商品规格">
                {inventoryItem.productSpec}
              </Descriptions.Item>
              <Descriptions.Item label="计量单位">
                {inventoryItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="存储位置">
                {inventoryItem.locationName}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="库存配置" bordered column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="当前库存">
                <Text strong style={{ fontSize: '16px' }}>
                  {inventoryItem.currentStock} {inventoryItem.unit}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="库存状态">
                {getStatusTag(inventoryItem.status)}
              </Descriptions.Item>
              <Descriptions.Item label="最小库存">
                {inventoryItem.minStock} {inventoryItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="最大库存">
                {inventoryItem.maxStock} {inventoryItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="安全库存">
                {inventoryItem.safeStock} {inventoryItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="平均成本">
                {formatCurrency(inventoryItem.averageCost)}
              </Descriptions.Item>
              <Descriptions.Item label="库存总值">
                {formatCurrency(inventoryItem.totalValue)}
              </Descriptions.Item>
              <Descriptions.Item label="库存利用率">
                <Space>
                  <Progress
                    percent={stockUtilization}
                    size="small"
                    style={{ width: 100 }}
                  />
                  <Text>{stockUtilization.toFixed(1)}%</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="时间信息" bordered column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="最后入库">
                {inventoryItem.lastInboundDate ? formatDate(inventoryItem.lastInboundDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最后出库">
                {inventoryItem.lastOutboundDate ? formatDate(inventoryItem.lastOutboundDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最后更新" span={2}>
                {formatDate(inventoryItem.lastUpdated)}
              </Descriptions.Item>
            </Descriptions>

            {inventoryItem.remark && (
              <Descriptions title="备注信息" bordered column={1} style={{ marginTop: 24 }}>
                <Descriptions.Item label="备注">
                  {inventoryItem.remark}
                </Descriptions.Item>
              </Descriptions>
            )}
          </TabPane>

          <TabPane
            tab={
              <Space>
                <HistoryOutlined />
                操作记录
                <Badge count={operations.length} showZero />
              </Space>
            }
            key="operations"
          >
            <Table
              columns={operationColumns}
              dataSource={operations}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              size="middle"
            />
          </TabPane>

          <TabPane
            tab={
              <Space>
                <AlertOutlined />
                预警记录
                <Badge count={alerts.filter(a => !a.isRead).length} />
              </Space>
            }
            key="alerts"
          >
            <Table
              columns={alertColumns}
              dataSource={alerts}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              size="middle"
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default InventoryDetail;