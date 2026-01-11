/**
 * @spec N001-purchase-inbound
 * 收货入库列表页面
 * 路由: /purchase-management/receipts
 */
import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, Row, Col, Spin, message, Popconfirm } from 'antd';
import {
  PlusOutlined,
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  useGoodsReceipts,
  useConfirmGoodsReceipt,
  useCancelGoodsReceipt,
} from '@/features/procurement/hooks/useGoodsReceipts';
import type { GoodsReceipt, GoodsReceiptQueryParams } from '@/features/procurement/types';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 收货入库列表页面
 */
const ReceivingList: React.FC = () => {
  const navigate = useNavigate();
  const [queryParams, setQueryParams] = useState<GoodsReceiptQueryParams>({
    page: 1,
    pageSize: 10,
  });

  // 获取收货单列表
  const { data: receiptsData, isLoading, refetch } = useGoodsReceipts(queryParams);
  const receipts = receiptsData?.data || [];
  const total = receiptsData?.total || 0;

  // 确认收货
  const confirmMutation = useConfirmGoodsReceipt();
  // 取消收货单
  const cancelMutation = useCancelGoodsReceipt();

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: '待确认', color: 'processing' },
    CONFIRMED: { label: '已确认', color: 'success' },
    CANCELLED: { label: '已取消', color: 'default' },
  };

  // 质检状态映射
  const qualityStatusMap: Record<string, { label: string; color: string }> = {
    PENDING_CHECK: { label: '待质检', color: 'default' },
    QUALIFIED: { label: '合格', color: 'success' },
    UNQUALIFIED: { label: '不合格', color: 'error' },
  };

  // 确认收货
  const handleConfirm = async (id: string) => {
    try {
      await confirmMutation.mutateAsync(id);
      message.success('收货确认成功，库存已更新');
    } catch (error: any) {
      message.error(error.message || '确认失败');
    }
  };

  // 取消收货单
  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      message.success('收货单已取消');
    } catch (error: any) {
      message.error(error.message || '取消失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<GoodsReceipt> = [
    {
      title: '收货单号',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 160,
      fixed: 'left',
    },
    {
      title: '采购单号',
      dataIndex: ['purchaseOrder', 'orderNumber'],
      key: 'purchaseOrderNumber',
      width: 160,
      render: (text: string, record) => (
        <a
          style={{ color: '#1890ff' }}
          onClick={() => navigate(`/purchase-management/orders/${record.purchaseOrder?.id}`)}
        >
          {text}
        </a>
      ),
    },
    {
      title: '供应商',
      dataIndex: ['purchaseOrder', 'supplier', 'name'],
      key: 'supplier',
      width: 150,
    },
    {
      title: '目标门店',
      dataIndex: ['store', 'name'],
      key: 'store',
      width: 120,
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
      title: '收货时间',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '-'),
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/purchase-management/receipts/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm
                title="确认收货后将更新库存，确定要确认吗？"
                onConfirm={() => handleConfirm(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  loading={confirmMutation.isPending}
                >
                  确认
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确定要取消该收货单吗？"
                onConfirm={() => handleCancel(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  loading={cancelMutation.isPending}
                >
                  取消
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    console.log('搜索:', value);
    // TODO: 实现搜索功能
  };

  const handleRefresh = () => {
    refetch();
    message.success('列表已刷新');
  };

  const handleExport = () => {
    message.info('导出功能开发中');
  };

  const handleCreate = () => {
    navigate('/purchase-management/receipts/create');
  };

  // 状态筛选
  const handleStatusChange = (status: string | undefined) => {
    setQueryParams((prev) => ({ ...prev, status: status as any, page: 1 }));
  };

  // 分页变化
  const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
    setQueryParams((prev) => ({
      ...prev,
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  // 计算统计数据
  const pendingCount = receipts.filter((r) => r.status === 'PENDING').length;
  const confirmedCount = receipts.filter((r) => r.status === 'CONFIRMED').length;
  const cancelledCount = receipts.filter((r) => r.status === 'CANCELLED').length;

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title="收货入库列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
              刷新
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建收货单
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索收货单号、采购单号或供应商"
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="收货状态"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusChange}
              value={queryParams.status}
            >
              <Option value="PENDING">待确认</Option>
              <Option value="CONFIRMED">已确认</Option>
              <Option value="CANCELLED">已取消</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Col>
        </Row>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>{pendingCount}</div>
                <div style={{ color: '#666' }}>待确认</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{confirmedCount}</div>
                <div style={{ color: '#666' }}>已确认</div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#999' }}>{cancelledCount}</div>
                <div style={{ color: '#666' }}>已取消</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 表格 */}
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={receipts}
            rowKey="id"
            scroll={{ x: 1500 }}
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

export default ReceivingList;
