/**
 * 采购订单详情组件
 */
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Table,
  Tag,
  Space,
  Button,
  Timeline,
  Modal,
  Divider,
  Alert,
  Image,
  Tooltip,
  Typography,
  Statistic,
  Progress,
  List,
  Avatar,
} from 'antd';
import {
  EditOutlined,
  PrinterOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchase';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import StatusTag from '@/components/common/StatusTag';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface PurchaseOrderDetailProps {
  orderId: string;
  onEdit?: (order: PurchaseOrder) => void;
  onBack?: () => void;
  showActions?: boolean;
}

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({
  orderId,
  onEdit,
  onBack,
  showActions = true,
}) => {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [timelineVisible, setTimelineVisible] = useState(false);

  // 模拟加载订单详情
  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取订单详情
      // const orderData = await purchaseOrderService.getOrderById(orderId);

      // 模拟数据
      const mockOrder: PurchaseOrder = {
        id: orderId,
        orderNumber: `PO-${orderId.slice(-6)}`,
        title: '影院爆米花原料采购订单',
        description: '为各影院采购爆米花原料，包括玉米粒、食用油、调味料等',
        status: PurchaseOrderStatus.APPROVED,
        priority: 'HIGH',
        orderDate: '2024-01-15T10:30:00Z',
        expectedDeliveryDate: '2024-01-25T00:00:00Z',
        approvedAt: '2024-01-16T14:20:00Z',
        totalAmount: 15680.0,
        budgetAmount: 20000.0,
        items: [
          {
            id: 'item_001',
            productId: 'prod_001',
            productName: '黄金爆米花玉米粒',
            productCode: 'POP-001',
            specifications: '50kg/袋， premium grade',
            unit: '袋',
            quantity: 20,
            unitPrice: 280.0,
            discountRate: 5,
            taxRate: 0.13,
            discountAmount: 280.0,
            taxAmount: 672.0,
            subtotal: 5320.0,
            remarks: '优质原料，生产日期2024年1月',
          },
          {
            id: 'item_002',
            productId: 'prod_002',
            productName: '爆米花专用椰油',
            productCode: 'OIL-001',
            specifications: '20L/桶，食品级',
            unit: '桶',
            quantity: 15,
            unitPrice: 180.0,
            discountRate: 3,
            taxRate: 0.13,
            discountAmount: 81.0,
            taxAmount: 341.46,
            subtotal: 2619.0,
            remarks: '耐高温，适合连续爆制',
          },
          {
            id: 'item_003',
            productId: 'prod_003',
            productName: '焦糖调味粉',
            productCode: 'SUGAR-001',
            specifications: '10kg/箱，甜味适中',
            unit: '箱',
            quantity: 30,
            unitPrice: 150.0,
            discountRate: 0,
            taxRate: 0.13,
            discountAmount: 0,
            taxAmount: 585.0,
            subtotal: 4500.0,
            remarks: '经典焦糖口味',
          },
          {
            id: 'item_004',
            productId: 'prod_004',
            productName: '爆米花专用盐',
            productCode: 'SALT-001',
            specifications: '5kg/袋，细颗粒',
            unit: '袋',
            quantity: 25,
            unitPrice: 80.0,
            discountRate: 0,
            taxRate: 0.13,
            discountAmount: 0,
            taxAmount: 260.0,
            subtotal: 2000.0,
            remarks: '低钠健康配方',
          },
        ],
        supplier: {
          id: 'supplier_002',
          name: '上海食品原料供应商',
          contactPerson: '李经理',
          phone: '13800138002',
          email: 'li.manager@shanghai-food.com',
          address: '上海市浦东新区食品工业园区88号',
        },
        department: {
          id: 'dept_001',
          name: '采购部',
          manager: '王经理',
        },
        requester: {
          id: 'user_001',
          name: '张采购员',
          email: 'zhang.caigou@cinema.com',
          phone: '13900139001',
        },
        approver: {
          id: 'user_002',
          name: '刘总监',
          email: 'liuzongjian@cinema.com',
        },
        attachments: [
          {
            name: '供应商资质证书.pdf',
            url: '/files/supplier-cert.pdf',
            size: 2048576,
            type: 'application/pdf',
          },
          {
            name: '产品报价单.xlsx',
            url: '/files/quotation.xlsx',
            size: 1024000,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        ],
        remarks: '请在预期交付日期前完成配送，确保产品质量符合标准。配送时请提供产品质检报告。',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
      };

      setOrder(mockOrder);
    } catch (error) {
      console.error('Load order detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 订单项表格列定义
  const itemColumns = [
    {
      title: '产品信息',
      key: 'product',
      width: 300,
      render: (record: PurchaseOrder['items'][0]) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>编码: {record.productCode}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>规格: {record.specifications}</div>
        </div>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record: PurchaseOrder['items'][0]) => (
        <div>
          <div>{quantity}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.unit}</div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '折扣',
      key: 'discount',
      width: 100,
      render: (record: PurchaseOrder['items'][0]) => (
        <div>
          <div>{record.discountRate}%</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            -{formatCurrency(record.discountAmount)}
          </div>
        </div>
      ),
    },
    {
      title: '税额',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 100,
      render: (tax: number) => (
        <div>
          <div>{formatCurrency(tax)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {((record: any) => record.taxRate * 100).toFixed(0)}%
          </div>
        </div>
      ),
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (subtotal: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(subtotal)}
        </Text>
      ),
    },
  ];

  // 操作记录时间线
  const timelineItems = [
    {
      children: (
        <div>
          <div style={{ fontWeight: 600 }}>订单创建</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {order?.requester?.name} 于 {formatDateTime(order?.createdAt)} 创建订单
          </div>
        </div>
      ),
      dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
    },
    {
      children: (
        <div>
          <div style={{ fontWeight: 600 }}>订单审核</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {order?.approver?.name} 于 {formatDateTime(order?.approvedAt)} 审核通过
          </div>
          <div style={{ color: '#52c41a', fontSize: '12px' }}>
            审核意见：原料质量符合要求，价格合理，同意采购
          </div>
        </div>
      ),
      dot: <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />,
      color: 'green',
    },
  ];

  if (!order) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert message="订单不存在" description="未找到指定的采购订单信息" type="error" showIcon />
        {onBack && (
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ marginTop: '16px' }}
          >
            返回列表
          </Button>
        )}
      </div>
    );
  }

  const remainingDays = dayjs(order.expectedDeliveryDate).diff(dayjs(), 'day');
  const progressPercentage = Math.min(100, Math.max(0, 100 - (remainingDays / 7) * 100));

  return (
    <div style={{ padding: '24px' }}>
      {/* 头部操作栏 */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {onBack && (
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              返回
            </Button>
          )}
          <Title level={3} style={{ margin: 0 }}>
            采购订单详情
          </Title>
        </Space>

        {showActions && (
          <Space>
            <Button icon={<ClockCircleOutlined />} onClick={() => setTimelineVisible(true)}>
              操作记录
            </Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
              打印
            </Button>
            {onEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onEdit(order)}
                disabled={order.status !== PurchaseOrderStatus.DRAFT}
              >
                编辑
              </Button>
            )}
          </Space>
        )}
      </div>

      {/* 状态和进度概览 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单状态"
              value={order.status}
              formatter={() => <StatusTag status={order.status} type="purchase" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总金额"
              value={order.totalAmount}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>交付进度</div>
              <Progress
                percent={progressPercentage}
                status={remainingDays <= 0 ? 'exception' : remainingDays <= 2 ? 'active' : 'normal'}
              />
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                {remainingDays > 0
                  ? `剩余 ${remainingDays} 天`
                  : remainingDays === 0
                    ? '今日到期'
                    : `已逾期 ${Math.abs(remainingDays)} 天`}
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预算使用率"
              value={(order.totalAmount / order.budgetAmount) * 100}
              precision={1}
              suffix="%"
              valueStyle={{
                color: order.totalAmount > order.budgetAmount ? '#cf1322' : '#3f8600',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 基本信息 */}
      <Card title="基本信息" style={{ marginBottom: '16px' }}>
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="订单编号">{order.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="订单标题">{order.title}</Descriptions.Item>
              <Descriptions.Item label="订单描述">{order.description}</Descriptions.Item>
              <Descriptions.Item label="订单日期">{formatDate(order.orderDate)}</Descriptions.Item>
              <Descriptions.Item label="预期交付日期">
                <span style={{ color: remainingDays <= 0 ? '#ff4d4f' : undefined }}>
                  {formatDate(order.expectedDeliveryDate)}
                  {remainingDays <= 0 && (
                    <Tag color="red" style={{ marginLeft: '8px' }}>
                      逾期
                    </Tag>
                  )}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="优先级">
                <Tag
                  color={
                    order.priority === 'URGENT'
                      ? 'magenta'
                      : order.priority === 'HIGH'
                        ? 'red'
                        : order.priority === 'MEDIUM'
                          ? 'orange'
                          : 'blue'
                  }
                >
                  {order.priority === 'URGENT'
                    ? '紧急'
                    : order.priority === 'HIGH'
                      ? '高'
                      : order.priority === 'MEDIUM'
                        ? '中'
                        : '低'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="采购部门">{order.department?.name}</Descriptions.Item>
              <Descriptions.Item label="申请人员">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{order.requester?.name}</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="审核人员">
                {order.approver ? (
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{order.approver.name}</span>
                  </Space>
                ) : (
                  <Text type="secondary">暂无</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDateTime(order.createdAt)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* 供应商信息 */}
      <Card
        title={
          <Space>
            <ShopOutlined />
            供应商信息
          </Space>
        }
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="供应商名称">{order.supplier?.name}</Descriptions.Item>
              <Descriptions.Item label="联系人">{order.supplier?.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{order.supplier?.phone}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="邮箱地址">{order.supplier?.email}</Descriptions.Item>
              <Descriptions.Item label="地址">{order.supplier?.address}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* 订单明细 */}
      <Card title="订单明细" style={{ marginBottom: '16px' }}>
        <Table
          dataSource={order.items}
          columns={itemColumns}
          rowKey="id"
          pagination={false}
          size="small"
          summary={(pageData) => {
            const totalDiscount = pageData.reduce((sum, item) => sum + item.discountAmount, 0);
            const totalTax = pageData.reduce((sum, item) => sum + item.taxAmount, 0);
            const totalAmount = pageData.reduce((sum, item) => sum + item.subtotal, 0);

            return (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <Text strong>合计</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <Text type="danger">-{formatCurrency(totalDiscount)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <Text>{formatCurrency(totalTax)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                      {formatCurrency(totalAmount)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>

      {/* 附件信息 */}
      {order.attachments && order.attachments.length > 0 && (
        <Card
          title={
            <Space>
              <FileTextOutlined />
              附件信息
            </Space>
          }
          style={{ marginBottom: '16px' }}
        >
          <List
            dataSource={order.attachments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(item.url)}
                  >
                    下载
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`大小: ${(item.size / 1024 / 1024).toFixed(2)} MB`}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 备注信息 */}
      {order.remarks && (
        <Card title="备注信息" style={{ marginBottom: '16px' }}>
          <Paragraph>{order.remarks}</Paragraph>
        </Card>
      )}

      {/* 操作记录模态框 */}
      <Modal
        title="操作记录"
        open={timelineVisible}
        onCancel={() => setTimelineVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTimelineVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <Timeline items={timelineItems} />
      </Modal>
    </div>
  );
};

export default PurchaseOrderDetail;
