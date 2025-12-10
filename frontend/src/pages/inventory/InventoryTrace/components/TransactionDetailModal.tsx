import React from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Space,
  Button,
  Divider,
  Timeline,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Badge,
  Tooltip
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CalendarOutlined,
  UserOutlined,
  ShopOutlined,
  BarcodeOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  PackageOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { TransactionDetail } from '@/types/inventory';
import {
  TransactionType,
  SourceType,
  TRANSACTION_TYPE_OPTIONS,
  SOURCE_TYPE_OPTIONS
} from '@/types/inventory';

const { Title, Text, Paragraph } = Typography;

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: TransactionDetail | null;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose
}) => {
  if (!transaction) return null;

  // 获取交易类型信息
  const getTransactionTypeInfo = (type: TransactionType) => {
    const option = TRANSACTION_TYPE_OPTIONS.find(opt => opt.value === type);
    const isInbound = [
      TransactionType.PURCHASE_IN,
      TransactionType.TRANSFER_IN,
      TransactionType.ADJUSTMENT_IN,
      TransactionType.RETURN_IN,
      TransactionType.PRODUCTION_IN
    ].includes(type);

    return {
      label: option?.label,
      color: option?.color,
      isInbound
    };
  };

  // 获取来源类型信息
  const getSourceTypeInfo = (type: SourceType) => {
    const option = SOURCE_TYPE_OPTIONS.find(opt => opt.value === type);
    return {
      label: option?.label,
      color: option?.color
    };
  };

  const transactionType = getTransactionTypeInfo(transaction.transactionType);
  const sourceType = getSourceTypeInfo(transaction.sourceType);

  // 计算库存变化
  const stockChange = transaction.stockAfter - transaction.stockBefore;
  const availableChange = transaction.availableAfter - transaction.availableBefore;

  return (
    <Modal
      title={
        <Space>
          <PackageOutlined />
          交易详情
          <Tag color={transactionType.color}>{transactionType.label}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="print" icon={<PrinterOutlined />}>
          打印详情
        </Button>,
        <Button key="export" icon={<DownloadOutlined />} type="primary">
          导出记录
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      <div className="transaction-detail-modal">
        {/* 关键信息概览 */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="交易数量"
                value={transaction.quantity}
                suffix={transaction.sku.unit}
                prefix={
                  transactionType.isInbound ? (
                    <Text style={{ color: '#52c41a' }}>+</Text>
                  ) : (
                    <Text style={{ color: '#ff4d4f' }}>-</Text>
                  )
                }
                valueStyle={{
                  color: transactionType.isInbound ? '#52c41a' : '#ff4d4f'
                }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="库存变化"
                value={Math.abs(stockChange)}
                suffix={transaction.sku.unit}
                prefix={
                  stockChange >= 0 ? (
                    <Text style={{ color: '#52c41a' }}>+</Text>
                  ) : (
                    <Text style={{ color: '#ff4d4f' }}>-</Text>
                  )
                }
                valueStyle={{
                  color: stockChange >= 0 ? '#52c41a' : '#ff4d4f'
                }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="交易金额"
                value={transaction.totalCost || 0}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="单价"
                value={transaction.unitCost || 0}
                prefix="¥"
                precision={2}
              />
            </Col>
          </Row>
        </Card>

        {/* 基本信息 */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              基本信息
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="交易ID" span={2}>
              <Text code>{transaction.id}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="交易时间" span={1}>
              <Space>
                <CalendarOutlined />
                <Text>{dayjs(transaction.transactionTime).format('YYYY-MM-DD HH:mm:ss')}</Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="交易类型" span={1}>
              <Tag color={transactionType.color} icon={
                transactionType.isInbound ? '↑' : '↓'
              }>
                {transactionType.label}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="来源类型" span={1}>
              <Tag color={sourceType.color}>{sourceType.label}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="来源单号" span={1}>
              {transaction.sourceDocument ? (
                <Space>
                  <FileTextOutlined />
                  <Text>{transaction.sourceDocument}</Text>
                </Space>
              ) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 商品信息 */}
        <Card
          title={
            <Space>
              <BarcodeOutlined />
              商品信息
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="商品名称" span={2}>
              <Text strong>{transaction.sku.name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="商品编码" span={1}>
              <Text code>{transaction.sku.skuCode}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="商品分类" span={1}>
              <Tag>{transaction.sku.category}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="商品描述" span={2}>
              <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                {transaction.sku.description || '暂无描述'}
              </Paragraph>
            </Descriptions.Item>

            {transaction.sku.weight && (
              <Descriptions.Item label="重量" span={1}>
                {transaction.sku.weight} kg
              </Descriptions.Item>
            )}

            {transaction.sku.dimensions && (
              <Descriptions.Item label="尺寸" span={1}>
                {transaction.sku.dimensions.length} × {transaction.sku.dimensions.width} × {transaction.sku.dimensions.height} cm
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 门店信息 */}
        <Card
          title={
            <Space>
              <ShopOutlined />
              门店信息
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="门店名称" span={1}>
              <Text strong>{transaction.store.name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="门店编码" span={1}>
              <Text code>{transaction.store.code}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="门店地址" span={2}>
              {transaction.store.address || '暂无地址信息'}
            </Descriptions.Item>

            {transaction.store.contactInfo && (
              <Descriptions.Item label="联系方式" span={1}>
                {transaction.store.contactInfo}
              </Descriptions.Item>
            )}

            {transaction.store.managerInfo && (
              <Descriptions.Item label="负责人" span={1}>
                {transaction.store.managerInfo}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 库存变化详情 */}
        <Card
          title={
            <Space>
              <PackageOutlined />
              库存变化详情
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>总库存</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>交易前:</Text>
                  <Text strong>{transaction.stockBefore}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>交易后:</Text>
                  <Text strong style={{ color: stockChange >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {transaction.stockAfter}
                  </Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>变化:</Text>
                  <Text strong style={{ color: stockChange >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {stockChange >= 0 ? '+' : ''}{stockChange}
                  </Text>
                </div>
              </Space>
            </Col>

            <Col span={12}>
              <Title level={5}>可用库存</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>交易前:</Text>
                  <Text strong>{transaction.availableBefore}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>交易后:</Text>
                  <Text strong style={{ color: availableChange >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {transaction.availableAfter}
                  </Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>变化:</Text>
                  <Text strong style={{ color: availableChange >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {availableChange >= 0 ? '+' : ''}{availableChange}
                  </Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 批次信息 */}
        {transaction.batchNumber && (
          <Card
            title={
              <Space>
                <PackageOutlined />
                批次信息
              </Space>
            }
            size="small"
            style={{ marginBottom: '16px' }}
          >
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="批次号" span={1}>
                <Text code>{transaction.batchNumber}</Text>
              </Descriptions.Item>

              {transaction.expiryDate && (
                <Descriptions.Item label="到期日期" span={1}>
                  <Space>
                    <CalendarOutlined />
                    <Text>{dayjs(transaction.expiryDate).format('YYYY-MM-DD')}</Text>
                    {dayjs(transaction.expiryDate).diff(dayjs(), 'day') < 30 && (
                      <Tooltip title="即将到期">
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      </Tooltip>
                    )}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* 操作人信息 */}
        <Card
          title={
            <Space>
              <UserOutlined />
              操作人信息
            </Space>
          }
          size="small"
          style={{ marginBottom: '16px' }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="操作人姓名" span={1}>
              <Text strong>{transaction.operator.name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="用户名" span={1}>
              <Text code>{transaction.operator.username}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="部门" span={1}>
              {transaction.operator.department || '-'}
            </Descriptions.Item>

            <Descriptions.Item label="职位" span={1}>
              {transaction.operator.position || '-'}
            </Descriptions.Item>

            {transaction.operator.email && (
              <Descriptions.Item label="邮箱" span={2}>
                {transaction.operator.email}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 备注和元数据 */}
        {(transaction.remarks || transaction.metadata) && (
          <Card
            title={
              <Space>
                <FileTextOutlined />
                补充信息
              </Space>
            }
            size="small"
            style={{ marginBottom: '16px' }}
          >
            {transaction.remarks && (
              <div style={{ marginBottom: '16px' }}>
                <Title level={5}>备注</Title>
                <Paragraph>{transaction.remarks}</Paragraph>
              </div>
            )}

            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div>
                <Title level={5}>元数据</Title>
                <Descriptions column={1} size="small" bordered>
                  {Object.entries(transaction.metadata).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {String(value)}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            )}
          </Card>
        )}

        {/* 系统信息 */}
        <Card
          title={
            <Space>
              <ClockCircleOutlined />
              系统信息
            </Space>
          }
          size="small"
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="创建时间" span={1}>
              {dayjs(transaction.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>

            <Descriptions.Item label="更新时间" span={1}>
              {dayjs(transaction.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;