/**
 * @spec O003-beverage-order
 * @spec O012-order-inventory-reservation
 * 饮品订单列表页面（B端）
 */

import React from 'react';
import { Card, Table, Tag, Button, message, Modal, Space, Typography, Tooltip, Alert } from 'antd';
import { ExclamationCircleOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beverageOrderManagementService } from '../../services/beverageOrderManagementService';
import type {
  BeverageOrderDTO,
  BeverageOrderStatus,
  OrderReservationStatus,
  ShortageItem,
} from '../../types/beverageOrder';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * 订单状态标签映射
 */
const ORDER_STATUS_MAP: Record<
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
 * 预占状态标签映射 (O012)
 */
const RESERVATION_STATUS_MAP: Record<
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
 * 饮品订单列表页面组件
 */
const BeverageOrderListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = React.useState<BeverageOrderDTO | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  // 查询订单列表
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['beverageOrders'],
    queryFn: () =>
      beverageOrderManagementService.getOrders({
        page: 1,
        pageSize: 50,
      }),
  });

  // 取消订单 Mutation (O012: 自动释放预占)
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      beverageOrderManagementService.cancelOrder(orderId, '管理员取消'),
    onSuccess: (response) => {
      message.success('订单已取消，库存预占已释放');
      queryClient.invalidateQueries({ queryKey: ['beverageOrders'] });
      setIsDetailModalOpen(false);
      
      // 显示释放的库存清单
      if (response.data.releasedItems && response.data.releasedItems.length > 0) {
        Modal.info({
          title: '库存已释放',
          content: (
            <div>
              <p>以下库存已释放：</p>
              <ul>
                {response.data.releasedItems.map((item: { skuId: string; releasedQty: number; unit: string }, index: number) => (
                  <li key={index}>
                    {item.skuId}: {item.releasedQty} {item.unit}
                  </li>
                ))}
              </ul>
            </div>
          ),
        });
      }
    },
    onError: (error: any) => {
      message.error(error.message || '取消订单失败');
    },
  });

  // 处理取消订单
  const handleCancelOrder = (order: BeverageOrderDTO) => {
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

  // 查看订单详情
  const handleViewDetail = (order: BeverageOrderDTO) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // 表格列定义
  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      render: (text: string, record: BeverageOrderDTO) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: '门店',
      dataIndex: 'storeName',
      key: 'storeName',
      width: 120,
      render: (text?: string) => text || '-',
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: BeverageOrderStatus) => {
        const config = ORDER_STATUS_MAP[status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '预占状态',
      dataIndex: 'reservationStatus',
      key: 'reservationStatus',
      width: 120,
      render: (status?: OrderReservationStatus) => {
        if (!status) return <Text type="secondary">-</Text>;
        const config = RESERVATION_STATUS_MAP[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '预占过期时间',
      dataIndex: 'reservationExpiry',
      key: 'reservationExpiry',
      width: 160,
      render: (expiry: string | undefined, record: BeverageOrderDTO) => {
        if (!expiry || record.reservationStatus !== 'RESERVED') {
          return <Text type="secondary">-</Text>;
        }
        const expiryTime = dayjs(expiry);
        const now = dayjs();
        const minutesLeft = expiryTime.diff(now, 'minute');
        
        if (minutesLeft < 0) {
          return <Text type="danger">已过期</Text>;
        }
        
        return (
          <Tooltip title={expiryTime.format('YYYY-MM-DD HH:mm:ss')}>
            <Text type={minutesLeft < 10 ? 'warning' : 'secondary'}>
              <ClockCircleOutlined /> {minutesLeft}分钟后过期
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: '金额',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: BeverageOrderDTO) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {['PENDING_PAYMENT', 'PAID'].includes(record.status) && (
            <Button
              type="link"
              danger
              size="small"
              loading={cancelOrderMutation.isPending}
              onClick={() => handleCancelOrder(record)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 页面标题 */}
        <Card>
          <Title level={2}>饮品订单管理</Title>
          <Text type="secondary">
            查看和管理饮品订单，包括库存预占状态和过期提醒
          </Text>
        </Card>

        {/* 订单列表表格 */}
        <Card>
          <Table
            columns={columns}
            dataSource={ordersData?.content || []}
            rowKey="id"
            loading={isLoading}
            pagination={{
              total: ordersData?.totalElements || 0,
              pageSize: ordersData?.size || 20,
              current: ordersData?.page ? ordersData.page + 1 : 1,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </Space>

      {/* 订单详情Modal */}
      <Modal
        title="订单详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
          selectedOrder &&
            ['PENDING_PAYMENT', 'PAID'].includes(selectedOrder.status) && (
              <Button
                key="cancel"
                danger
                loading={cancelOrderMutation.isPending}
                onClick={() => selectedOrder && handleCancelOrder(selectedOrder)}
              >
                取消订单
              </Button>
            ),
        ]}
        width={800}
      >
        {selectedOrder && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 基本信息 */}
            <Card size="small" title="基本信息">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text>
                  <strong>订单号：</strong>
                  {selectedOrder.orderNumber}
                </Text>
                <Text>
                  <strong>订单状态：</strong>
                  <Tag color={ORDER_STATUS_MAP[selectedOrder.status].color}>
                    {ORDER_STATUS_MAP[selectedOrder.status].label}
                  </Tag>
                </Text>
                <Text>
                  <strong>金额：</strong>¥{selectedOrder.totalPrice.toFixed(2)}
                </Text>
                <Text>
                  <strong>创建时间：</strong>
                  {dayjs(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </Space>
            </Card>

            {/* 库存预占信息 (O012) */}
            {selectedOrder.reservationStatus && (
              <Card size="small" title="库存预占信息">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text>
                    <strong>预占状态：</strong>
                    <Tag
                      color={
                        RESERVATION_STATUS_MAP[selectedOrder.reservationStatus].color
                      }
                      icon={
                        RESERVATION_STATUS_MAP[selectedOrder.reservationStatus].icon
                      }
                    >
                      {RESERVATION_STATUS_MAP[selectedOrder.reservationStatus].label}
                    </Tag>
                  </Text>
                  {selectedOrder.reservationExpiry && (
                    <Text>
                      <strong>过期时间：</strong>
                      {dayjs(selectedOrder.reservationExpiry).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                    </Text>
                  )}
                  {selectedOrder.reservedItems &&
                    selectedOrder.reservedItems.length > 0 && (
                      <div>
                        <Text strong>已预占商品：</Text>
                        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                          {selectedOrder.reservedItems.map((item, index) => (
                            <li key={index}>
                              {item.skuName}: {item.reservedQty} {item.unit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </Space>
              </Card>
            )}

            {/* 订单商品 */}
            <Card size="small" title="订单商品">
              <ul style={{ paddingLeft: 20 }}>
                {selectedOrder.items.map((item, index) => (
                  <li key={index}>
                    {item.beverageName} × {item.quantity} = ¥
                    {item.subtotal.toFixed(2)}
                  </li>
                ))}
              </ul>
            </Card>

            {/* 备注信息 */}
            {selectedOrder.customerNote && (
              <Card size="small" title="备注">
                <Text>{selectedOrder.customerNote}</Text>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default BeverageOrderListPage;
