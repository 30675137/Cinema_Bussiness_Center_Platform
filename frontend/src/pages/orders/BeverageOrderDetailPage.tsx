/**
 * @spec O003-beverage-order
 * @spec O012-order-inventory-reservation
 * 饮品订单详情页面（B端）
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Space,
  Spin,
  Result,
  message,
  Descriptions,
  Table,
  Tag,
  Timeline,
  Alert,
  Tooltip,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beverageOrderManagementService } from '../../services/beverageOrderManagementService';
import type {
  BeverageOrderDTO,
  BeverageOrderStatus,
  OrderReservationStatus,
} from '../../types/beverageOrder';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * 订单状态配置
 */
const ORDER_STATUS_CONFIG: Record<
  BeverageOrderStatus,
  { label: string; color: string }
> = {
  PENDING_PAYMENT: { label: '待支付', color: 'warning' },
  PAID: { label: '已支付', color: 'processing' },
  PENDING_PRODUCTION: { label: '待制作', color: 'default' },
  IN_PRODUCTION: { label: '制作中', color: 'processing' },
  COMPLETED: { label: '已完成', color: 'success' },
  DELIVERED: { label: '已交付', color: 'success' },
  CANCELLED: { label: '已取消', color: 'error' },
};

/**
 * 预占状态配置 (O012)
 */
const RESERVATION_STATUS_CONFIG: Record<
  OrderReservationStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  RESERVED: {
    label: '已预占',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
  PARTIAL_RESERVED: {
    label: '部分预占',
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
  },
  FAILED: {
    label: '预占失败',
    color: 'error',
    icon: <ExclamationCircleOutlined />,
  },
  RELEASED: {
    label: '已释放',
    color: 'default',
    icon: <ClockCircleOutlined />,
  },
  EXPIRED: {
    label: '已过期',
    color: 'default',
    icon: <ClockCircleOutlined />,
  },
};

/**
 * 饮品订单详情页面组件
 */
const BeverageOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 查询订单详情
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery<BeverageOrderDTO>({
    queryKey: ['beverageOrder', id],
    queryFn: () => beverageOrderManagementService.getOrderById(id!),
    enabled: !!id,
  });

  // 取消订单 Mutation (O012: 自动释放预占)
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      beverageOrderManagementService.cancelOrder(orderId, '管理员取消'),
    onSuccess: (response) => {
      message.success('订单已取消，库存预占已释放');
      queryClient.invalidateQueries({ queryKey: ['beverageOrder', id] });

      // 显示释放的库存清单
      if (response.data.releasedItems && response.data.releasedItems.length > 0) {
        Modal.info({
          title: '库存已释放',
          content: (
            <div>
              <p>以下库存已释放：</p>
              <ul>
                {response.data.releasedItems.map(
                  (
                    item: { skuId: string; releasedQty: number; unit: string },
                    index: number
                  ) => (
                    <li key={index}>
                      {item.skuId}: {item.releasedQty} {item.unit}
                    </li>
                  )
                )}
              </ul>
            </div>
          ),
        });
      }
    },
    onError: (err: any) => {
      message.error(err.message || '取消订单失败');
    },
  });

  // 错误处理
  React.useEffect(() => {
    if (isError && error) {
      message.error('加载订单详情失败');
    }
  }, [isError, error]);

  // 处理取消订单
  const handleCancelOrder = () => {
    if (!order) return;

    Modal.confirm({
      title: '确认取消订单？',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>订单号：{order.orderNumber}</p>
          <p>金额：¥{order.totalPrice}</p>
          {order.reservationStatus === 'RESERVED' && (
            <Alert
              message="此订单已预占库存，取消后将自动释放预占库存"
              type="info"
              showIcon
              style={{ marginTop: 12 }}
            />
          )}
        </div>
      ),
      okText: '确认取消',
      okType: 'danger',
      cancelText: '返回',
      onOk: () => {
        cancelOrderMutation.mutate(order.id);
      },
    });
  };

  // 订单商品列表列定义
  const itemColumns = [
    {
      title: '商品名称',
      dataIndex: 'beverageName',
      key: 'beverageName',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
  ];

  // 预占商品列表列定义 (O012)
  const reservedItemColumns = [
    {
      title: 'SKU名称',
      dataIndex: 'skuName',
      key: 'skuName',
    },
    {
      title: '预占数量',
      dataIndex: 'reservedQty',
      key: 'reservedQty',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 页面头部 */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/orders/beverage')}
              >
                返回列表
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                饮品订单详情
              </Title>
            </Space>
            {/* 订单操作按钮 */}
            {!isLoading && !isError && order && (
              <Space>
                {['PENDING_PAYMENT', 'PAID'].includes(order.status) && (
                  <Button
                    danger
                    loading={cancelOrderMutation.isPending}
                    onClick={handleCancelOrder}
                  >
                    取消订单
                  </Button>
                )}
              </Space>
            )}
          </Space>
        </Card>

        {/* 加载状态 */}
        {isLoading && (
          <Card>
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          </Card>
        )}

        {/* 错误状态 */}
        {isError && (
          <Card>
            <Result
              status="error"
              title="加载失败"
              subTitle="无法加载订单详情，请稍后重试"
              extra={
                <Space>
                  <Button onClick={() => window.location.reload()}>重新加载</Button>
                  <Button type="primary" onClick={() => navigate('/orders/beverage')}>
                    返回列表
                  </Button>
                </Space>
              }
            />
          </Card>
        )}

        {/* 订单详情内容 */}
        {!isLoading && !isError && order && (
          <>
            {/* 基本信息 */}
            <Card title="订单基本信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="订单号">
                  <Text strong>{order.orderNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="订单状态">
                  <Tag color={ORDER_STATUS_CONFIG[order.status].color}>
                    {ORDER_STATUS_CONFIG[order.status].label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="订单金额">
                  <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                    ¥{order.totalPrice.toFixed(2)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                {order.paidAt && (
                  <Descriptions.Item label="支付时间">
                    {dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                )}
                {order.completedAt && (
                  <Descriptions.Item label="完成时间">
                    {dayjs(order.completedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                )}
                {order.cancelledAt && (
                  <Descriptions.Item label="取消时间">
                    {dayjs(order.cancelledAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                )}
                {order.storeName && (
                  <Descriptions.Item label="门店">
                    {order.storeName}
                  </Descriptions.Item>
                )}
                {order.queueNumber && (
                  <Descriptions.Item label="取餐号">
                    <Text strong style={{ fontSize: 18 }}>
                      {order.queueNumber}
                    </Text>
                  </Descriptions.Item>
                )}
                {order.customerNote && (
                  <Descriptions.Item label="备注" span={2}>
                    {order.customerNote}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* 库存预占信息 (O012) */}
            {order.reservationStatus && (
              <Card title="库存预占信息">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="预占状态">
                      <Tag
                        color={
                          RESERVATION_STATUS_CONFIG[order.reservationStatus].color
                        }
                        icon={RESERVATION_STATUS_CONFIG[order.reservationStatus].icon}
                      >
                        {RESERVATION_STATUS_CONFIG[order.reservationStatus].label}
                      </Tag>
                    </Descriptions.Item>
                    {order.reservationExpiry && (
                      <Descriptions.Item label="预占过期时间">
                        {(() => {
                          const expiryTime = dayjs(order.reservationExpiry);
                          const now = dayjs();
                          const minutesLeft = expiryTime.diff(now, 'minute');

                          if (order.reservationStatus !== 'RESERVED') {
                            return expiryTime.format('YYYY-MM-DD HH:mm:ss');
                          }

                          if (minutesLeft < 0) {
                            return (
                              <Text type="danger">
                                已过期 ({expiryTime.format('YYYY-MM-DD HH:mm:ss')})
                              </Text>
                            );
                          }

                          return (
                            <Tooltip
                              title={expiryTime.format('YYYY-MM-DD HH:mm:ss')}
                            >
                              <Text type={minutesLeft < 10 ? 'warning' : 'secondary'}>
                                <ClockCircleOutlined /> {minutesLeft}分钟后过期
                              </Text>
                            </Tooltip>
                          );
                        })()}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  {/* 预占商品清单 */}
                  {order.reservedItems && order.reservedItems.length > 0 && (
                    <div>
                      <Title level={5}>已预占商品清单</Title>
                      <Table
                        columns={reservedItemColumns}
                        dataSource={order.reservedItems}
                        rowKey="skuId"
                        pagination={false}
                        size="small"
                      />
                    </div>
                  )}

                  {/* 预占提示信息 */}
                  {order.reservationStatus === 'RESERVED' && (
                    <Alert
                      message="库存预占提示"
                      description="此订单已预占库存，如需取消订单，预占的库存将自动释放。预占超时后将自动释放库存，请尽快完成支付和制作。"
                      type="info"
                      showIcon
                    />
                  )}
                  {order.reservationStatus === 'EXPIRED' && (
                    <Alert
                      message="预占已过期"
                      description="订单预占已超时自动释放，库存已归还到可用库存。"
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              </Card>
            )}

            {/* 订单商品 */}
            <Card title="订单商品">
              <Table
                columns={itemColumns}
                dataSource={order.items}
                rowKey="id"
                pagination={false}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Text strong>合计</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong style={{ color: '#ff4d4f' }}>
                          ¥{order.totalPrice.toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>

            {/* 支付信息 */}
            {order.paymentMethod && (
              <Card title="支付信息">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="支付方式">
                    {order.paymentMethod}
                  </Descriptions.Item>
                  {order.transactionId && (
                    <Descriptions.Item label="交易号">
                      {order.transactionId}
                    </Descriptions.Item>
                  )}
                  {order.paidAt && (
                    <Descriptions.Item label="支付时间" span={2}>
                      {dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* 订单时间线 */}
            <Card title="订单时间线">
              <Timeline
                items={[
                  {
                    color: 'green',
                    children: (
                      <>
                        <Text strong>订单创建</Text>
                        <br />
                        <Text type="secondary">
                          {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Text>
                        {order.reservationStatus === 'RESERVED' && (
                          <>
                            <br />
                            <Tag
                              color="success"
                              icon={<CheckCircleOutlined />}
                              style={{ marginTop: 4 }}
                            >
                              库存已预占
                            </Tag>
                          </>
                        )}
                      </>
                    ),
                  },
                  ...(order.paidAt
                    ? [
                        {
                          color: 'blue',
                          children: (
                            <>
                              <Text strong>支付成功</Text>
                              <br />
                              <Text type="secondary">
                                {dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss')}
                              </Text>
                            </>
                          ),
                        },
                      ]
                    : []),
                  ...(order.completedAt
                    ? [
                        {
                          color: 'green',
                          children: (
                            <>
                              <Text strong>制作完成</Text>
                              <br />
                              <Text type="secondary">
                                {dayjs(order.completedAt).format(
                                  'YYYY-MM-DD HH:mm:ss'
                                )}
                              </Text>
                            </>
                          ),
                        },
                      ]
                    : []),
                  ...(order.deliveredAt
                    ? [
                        {
                          color: 'green',
                          children: (
                            <>
                              <Text strong>已交付</Text>
                              <br />
                              <Text type="secondary">
                                {dayjs(order.deliveredAt).format(
                                  'YYYY-MM-DD HH:mm:ss'
                                )}
                              </Text>
                            </>
                          ),
                        },
                      ]
                    : []),
                  ...(order.cancelledAt
                    ? [
                        {
                          color: 'red',
                          children: (
                            <>
                              <Text strong>订单取消</Text>
                              <br />
                              <Text type="secondary">
                                {dayjs(order.cancelledAt).format(
                                  'YYYY-MM-DD HH:mm:ss'
                                )}
                              </Text>
                              {(order.reservationStatus === 'RELEASED' ||
                                order.reservationStatus === 'EXPIRED') && (
                                <>
                                  <br />
                                  <Tag color="default" style={{ marginTop: 4 }}>
                                    库存已释放
                                  </Tag>
                                </>
                              )}
                            </>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </Card>
          </>
        )}
      </Space>
    </div>
  );
};

export default BeverageOrderDetailPage;
