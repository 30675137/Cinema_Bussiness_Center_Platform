/**
 * @spec N001-purchase-inbound
 * 采购订单列表页面
 * 路由: /purchase-management/orders/list
 */
import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, Row, Col, Spin, message, Popconfirm } from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { ColumnsType, ExpandableConfig } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import {
  usePurchaseOrders,
  usePurchaseOrder,
  useDeletePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSuppliers,
  useProcurementStores,
} from '@/features/procurement/hooks/usePurchaseOrders';
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderQueryParams } from '@/features/procurement/types';

const { Search } = Input;
const { RangePicker } = DatePicker;

/**
 * 采购订单列表页面
 */
const PurchaseOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [queryParams, setQueryParams] = useState<PurchaseOrderQueryParams>({
    page: 1,
    pageSize: 10,
  });
  // 展开行状态
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  // 获取采购订单列表
  const { data: ordersData, isLoading, refetch } = usePurchaseOrders(queryParams);
  const orders = ordersData?.data || [];
  const total = ordersData?.total || 0;

  // 删除采购订单
  const deleteMutation = useDeletePurchaseOrder();
  // 提交审核
  const submitMutation = useSubmitPurchaseOrder();
  // 审批通过
  const approveMutation = useApprovePurchaseOrder();
  // 审批拒绝
  const rejectMutation = useRejectPurchaseOrder();

  // 获取供应商列表（用于筛选）
  const { data: suppliersData } = useSuppliers('ACTIVE');
  const suppliers = suppliersData?.data || [];

  // 获取门店列表（用于筛选）
  const stores = useProcurementStores();

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    DRAFT: { label: '草稿', color: 'default' },
    PENDING_APPROVAL: { label: '待审核', color: 'processing' },
    APPROVED: { label: '已审核', color: 'success' },
    REJECTED: { label: '已拒绝', color: 'error' },
    RECEIVING: { label: '收货中', color: 'blue' },
    COMPLETED: { label: '已完成', color: 'green' },
    CANCELLED: { label: '已取消', color: 'default' },
  };

  // 表格列定义
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: '订单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 150,
      fixed: 'left',
    },
    {
      title: '供应商',
      dataIndex: ['supplier', 'name'],
      key: 'supplierName',
      width: 150,
    },
    {
      title: '目标门店',
      dataIndex: ['store', 'name'],
      key: 'storeName',
      width: 120,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${(amount || 0).toFixed(2)}`,
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '计划到货日期',
      dataIndex: 'plannedArrivalDate',
      key: 'plannedArrivalDate',
      width: 120,
      render: (date: string) => date || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleString('zh-CN') : '-',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      ellipsis: true,
      render: (remarks: string) => remarks || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/purchase-management/orders/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'DRAFT' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleSubmit(record.id)}
                loading={submitMutation.isPending}
              >
                提交
              </Button>
              <Popconfirm
                title="确定删除该订单？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending}
                >
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record.id)}
                loading={approveMutation.isPending}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
                loading={rejectMutation.isPending}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 搜索
  const handleSearch = (value: string) => {
    console.log('搜索:', value);
    // TODO: 实现搜索功能
  };

  // 刷新
  const handleRefresh = () => {
    refetch();
    message.success('列表已刷新');
  };

  // 导出
  const handleExport = () => {
    message.info('导出功能开发中');
  };

  // 创建订单
  const handleCreate = () => {
    navigate('/purchase-management/orders');
  };

  // 删除订单
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('订单删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 提交审核
  const handleSubmit = async (id: string) => {
    try {
      await submitMutation.mutateAsync(id);
      message.success('提交审核成功');
    } catch (error) {
      message.error('提交失败');
    }
  };

  // 审批通过
  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      message.success('审批通过');
    } catch (error) {
      message.error('审批失败');
    }
  };

  // 审批拒绝
  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id, reason: '审批拒绝' });
      message.success('已拒绝');
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 状态筛选
  const handleStatusChange = (status: string | undefined) => {
    setQueryParams((prev) => ({ ...prev, status, page: 1 }));
  };

  // 供应商筛选
  const handleSupplierChange = (supplierId: string | undefined) => {
    setQueryParams((prev) => ({ ...prev, supplierId, page: 1 }));
  };

  // 门店筛选
  const handleStoreChange = (storeId: string | undefined) => {
    setQueryParams((prev) => ({ ...prev, storeId, page: 1 }));
  };

  // 分页变化
  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setQueryParams((prev) => ({
      ...prev,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  // 展开行内容组件
  const ExpandedRowContent: React.FC<{ orderId: string }> = ({ orderId }) => {
    const { data: orderDetail, isLoading: detailLoading } = usePurchaseOrder(orderId);
    const items = orderDetail?.data?.items || [];

    if (detailLoading) {
      return (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <LoadingOutlined style={{ marginRight: 8 }} />
          加载中...
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div style={{ padding: '16px', color: '#999', textAlign: 'center' }}>
          暂无商品明细
        </div>
      );
    }

    // 明细表格列
    const itemColumns: ColumnsType<PurchaseOrderItem> = [
      {
        title: '商品编码',
        dataIndex: ['sku', 'code'],
        key: 'skuCode',
        width: 120,
      },
      {
        title: '商品名称',
        dataIndex: ['sku', 'name'],
        key: 'skuName',
        width: 200,
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
        width: 80,
        align: 'right',
        render: (qty: number) => qty || 0,
      },
      {
        title: '待收货',
        dataIndex: 'pendingQty',
        key: 'pendingQty',
        width: 80,
        align: 'right',
        render: (qty: number) => qty || 0,
      },
    ];

    return (
      <div style={{ padding: '8px 48px', background: '#fafafa' }}>
        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
        />
      </div>
    );
  };

  // 展开配置
  const expandableConfig: ExpandableConfig<PurchaseOrder> = {
    expandedRowKeys,
    onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
    expandedRowRender: (record) => <ExpandedRowContent orderId={record.id} />,
    rowExpandable: () => true,
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title="采购订单列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
              刷新
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建订单
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search placeholder="搜索订单编号" onSearch={handleSearch} allowClear />
          </Col>
          <Col span={5}>
            <Select
              placeholder="供应商"
              style={{ width: '100%' }}
              allowClear
              showSearch
              optionFilterProp="children"
              onChange={handleSupplierChange}
              value={queryParams.supplierId}
            >
              {suppliers.map((s) => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <Select
              placeholder="目标门店"
              style={{ width: '100%' }}
              allowClear
              showSearch
              optionFilterProp="children"
              onChange={handleStoreChange}
              value={queryParams.storeId}
            >
              {(stores.data || []).map((store) => (
                <Select.Option key={store.id} value={store.id}>{store.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="订单状态"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusChange}
              value={queryParams.status}
            >
              <Select.Option value="DRAFT">草稿</Select.Option>
              <Select.Option value="PENDING_APPROVAL">待审核</Select.Option>
              <Select.Option value="APPROVED">已审核</Select.Option>
              <Select.Option value="REJECTED">已拒绝</Select.Option>
              <Select.Option value="RECEIVING">收货中</Select.Option>
              <Select.Option value="COMPLETED">已完成</Select.Option>
              <Select.Option value="CANCELLED">已取消</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Col>
        </Row>

        {/* 表格 */}
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            scroll={{ x: 1400 }}
            expandable={expandableConfig}
            pagination={{
              current: queryParams.page,
              pageSize: queryParams.pageSize,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={(pagination) => handleTableChange(pagination)}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default PurchaseOrderList;
