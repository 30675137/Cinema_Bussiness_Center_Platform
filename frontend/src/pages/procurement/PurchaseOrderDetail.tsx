/**
 * @spec N001-purchase-inbound
 * 采购订单详情页面
 * 路由: /purchase-management/orders/:id
 */
import React from 'react';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Spin,
  Timeline,
  message,
  Popconfirm,
  Result,
} from 'antd';
import {
  ArrowLeftOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  usePurchaseOrder,
  usePurchaseOrderHistory,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
} from '@/features/procurement/hooks/usePurchaseOrders';
import type { PurchaseOrderItem, PurchaseOrderStatusHistory } from '@/features/procurement/types';

/**
 * 采购订单详情页面
 */
const PurchaseOrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 获取采购订单详情
  const { data: orderData, isLoading, error } = usePurchaseOrder(id || '');
  const order = orderData?.data;

  // 获取状态变更历史
  const { data: historyData } = usePurchaseOrderHistory(id);
  const history = historyData || [];

  // 操作 mutations
  const submitMutation = useSubmitPurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: '草稿', color: 'default' },
    PENDING_APPROVAL: { label: '待审核', color: 'processing' },
    APPROVED: { label: '已审核', color: 'success' },
    REJECTED: { label: '已拒绝', color: 'error' },
    PARTIAL_RECEIVED: { label: '部分收货', color: 'blue' },
    FULLY_RECEIVED: { label: '全部收货', color: 'green' },
    CLOSED: { label: '已关闭', color: 'default' },
  };

  // 订单明细表格列定义
  const itemColumns: ColumnsType<PurchaseOrderItem> = [
    {
      title: '商品名称',
      dataIndex: ['sku', 'name'],
      key: 'skuName',
      width: 150,
    },
    {
      title: '商品编码',
      dataIndex: ['sku', 'code'],
      key: 'skuCode',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: ['sku', 'mainUnit'],
      key: 'unit',
      width: 80,
      render: (unit: string) => unit || '个',
    },
    {
      title: '采购数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (price: number) => `¥${(price || 0).toFixed(2)}`,
    },
    {
      title: '小计',
      dataIndex: 'lineAmount',
      key: 'lineAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => `¥${(amount || 0).toFixed(2)}`,
    },
    {
      title: '已收货',
      dataIndex: 'receivedQty',
      key: 'receivedQty',
      width: 100,
      align: 'right',
      render: (qty: number) => qty || 0,
    },
    {
      title: '待收货',
      dataIndex: 'pendingQty',
      key: 'pendingQty',
      width: 100,
      align: 'right',
      render: (qty: number) => qty || 0,
    },
  ];

  // 操作处理函数
  const handleBack = () => {
    navigate('/purchase-management/orders/list');
  };

  const handleSubmit = async () => {
    if (!id) return;
    try {
      await submitMutation.mutateAsync(id);
      message.success('提交审核成功');
    } catch {
      message.error('提交失败');
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
      message.success('审批通过');
    } catch {
      message.error('审批失败');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await rejectMutation.mutateAsync({ id, reason: '审批拒绝' });
      message.success('已拒绝');
    } catch {
      message.error('操作失败');
    }
  };

  const handleCreateReceipt = () => {
    navigate(`/purchase-management/receipts/create?orderId=${id}`);
  };

  // 格式化时间
  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 渲染状态变更历史时间线
  const renderTimeline = () => {
    if (!history || history.length === 0) {
      return <div style={{ color: '#999', padding: '16px 0' }}>暂无状态变更记录</div>;
    }

    return (
      <Timeline
        items={history.map((item: PurchaseOrderStatusHistory) => ({
          color: item.toStatus === 'REJECTED' ? 'red' : 'blue',
          children: (
            <div>
              <div>
                <strong>
                  {item.fromStatus ? statusMap[item.fromStatus]?.label || item.fromStatus : '创建'}
                </strong>
                {' → '}
                <strong>{statusMap[item.toStatus]?.label || item.toStatus}</strong>
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                {formatDateTime(item.createdAt)}
                {item.changedByName && ` · ${item.changedByName}`}
              </div>
              {item.remarks && (
                <div style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                  备注: {item.remarks}
                </div>
              )}
            </div>
          ),
        }))}
      />
    );
  };

  // 加载状态
  if (isLoading) {
    return (
      <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
        <Spin tip="加载中..." size="large">
          <div style={{ height: 400 }} />
        </Spin>
      </div>
    );
  }

  // 错误状态
  if (error || !order) {
    return (
      <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
        <Result
          status="error"
          title="加载失败"
          subTitle="无法获取采购订单详情，请稍后重试"
          extra={
            <Button type="primary" onClick={handleBack}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = statusMap[order.status] || { label: order.status, color: 'default' };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text" />
            <span>采购订单详情</span>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </Space>
        }
        extra={
          <Space>
            {/* 草稿状态可提交审核 */}
            {order.status === 'DRAFT' && (
              <Button
                icon={<SendOutlined />}
                onClick={handleSubmit}
                loading={submitMutation.isPending}
              >
                提交审核
              </Button>
            )}

            {/* 待审核状态可审批 */}
            {order.status === 'PENDING_APPROVAL' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleApprove}
                  loading={approveMutation.isPending}
                >
                  审批通过
                </Button>
                <Popconfirm
                  title="确定拒绝该订单？"
                  onConfirm={handleReject}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={rejectMutation.isPending}
                  >
                    拒绝
                  </Button>
                </Popconfirm>
              </>
            )}

            {/* 已审核或部分收货状态可创建收货单 */}
            {(order.status === 'APPROVED' || order.status === 'PARTIAL_RECEIVED') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateReceipt}
              >
                创建收货单
              </Button>
            )}
          </Space>
        }
      >
        {/* 基本信息 */}
        <Card type="inner" title="基本信息" style={{ marginBottom: 16 }}>
          <Descriptions column={3}>
            <Descriptions.Item label="订单编号">{order.orderNumber}</Descriptions.Item>
            <Descriptions.Item label="供应商">{order.supplier?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="目标门店">{order.store?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="订单金额">
              ¥{(order.totalAmount || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="计划到货日期">
              {order.plannedArrivalDate || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatDateTime(order.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>
              {order.remarks || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 订单明细 */}
        <Card type="inner" title="订单明细" style={{ marginBottom: 16 }}>
          <Table
            columns={itemColumns}
            dataSource={order.items || []}
            rowKey="id"
            pagination={false}
            scroll={{ x: 900 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong>合计</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong>¥{(order.totalAmount || 0).toFixed(2)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* 状态变更历史 */}
        <Card type="inner" title="状态变更历史">
          {renderTimeline()}
        </Card>
      </Card>
    </div>
  );
};

export default PurchaseOrderDetail;
