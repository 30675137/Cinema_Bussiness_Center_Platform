/**
 * @spec O003-beverage-order
 * B端订单列表页面
 */
import React, { useState } from 'react';
import { Card, Table, Space, Button, Select, Input, Typography, type TableColumnsType } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useBeverageOrders } from '../../../hooks/useBeverageOrders';
import { BeverageOrderStatusBadge, OrderActionButtons } from '../components';
import type { BeverageOrderDTO, BeverageOrderStatus } from '../../../types/beverageOrder';

const { Title } = Typography;

/**
 * B端订单列表页面
 *
 * 功能：
 * - 显示所有订单（分页）
 * - 按状态筛选
 * - 按订单号搜索
 * - 快捷操作
 */
export const OrderListPage: React.FC = () => {
  const [storeId] = useState('00000000-0000-0000-0000-000000000001');
  const [statusFilter, setStatusFilter] = useState<BeverageOrderStatus | undefined>();
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: orderPage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useBeverageOrders({
    storeId,
    status: statusFilter,
    page,
    pageSize,
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatSpecs = (specsJson: string) => {
    try {
      const specs = JSON.parse(specsJson);
      return Object.values(specs).filter(Boolean).join(' · ');
    } catch {
      return specsJson;
    }
  };

  const columns: TableColumnsType<BeverageOrderDTO> = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 180,
      fixed: 'left',
    },
    {
      title: '取餐号',
      dataIndex: 'queueNumber',
      key: 'queueNumber',
      width: 100,
      render: (queueNumber) => queueNumber || '--',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: BeverageOrderStatus) => <BeverageOrderStatusBadge status={status} />,
    },
    {
      title: '商品',
      key: 'items',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.items.map((item, index) => (
            <div key={index}>
              {item.beverageName} × {item.quantity}
              <br />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {formatSpecs(item.selectedSpecs)}
              </Typography.Text>
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      render: (totalPrice: number) => `¥${(totalPrice / 100).toFixed(2)}`,
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: formatTime,
    },
    {
      title: '支付时间',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 160,
      render: (paidAt) => (paidAt ? formatTime(paidAt) : '--'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <OrderActionButtons
          orderId={record.id}
          orderNumber={record.orderNumber}
          status={record.status}
          compact
        />
      ),
    },
  ];

  // 客户端搜索过滤
  const filteredData = orderPage?.data.filter((order) =>
    searchText ? order.orderNumber.includes(searchText) : true
  );

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 页面头部 */}
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            订单管理
          </Title>
          <Space>
            <Select
              placeholder="按状态筛选"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: '待制作', value: 'PENDING_PRODUCTION' },
                { label: '制作中', value: 'PRODUCING' },
                { label: '已完成', value: 'COMPLETED' },
                { label: '已交付', value: 'DELIVERED' },
                { label: '已取消', value: 'CANCELLED' },
              ]}
            />
            <Input
              placeholder="搜索订单号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isRefetching}>
              刷新
            </Button>
          </Space>
        </Space>

        {/* 订单表格 */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1400 }}
          pagination={{
            current: page + 1,
            pageSize,
            total: orderPage?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage - 1);
              setPageSize(newPageSize);
            },
          }}
        />

        {error && (
          <div style={{ textAlign: 'center', color: 'red', marginTop: 16 }}>
            加载失败: {error.message}
          </div>
        )}
      </Card>
    </div>
  );
};
