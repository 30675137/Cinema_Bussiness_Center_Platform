import React from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, ExportOutlined, ReloadOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  title: string;
  supplier: string;
  totalAmount: number;
  status: string;
  priority: string;
  orderDate: string;
  expectedDeliveryDate: string;
  creator: string;
}

/**
 * 采购订单列表页面
 * 路由: /purchase-management/orders/list
 */
const PurchaseOrderList: React.FC = () => {
  // Mock数据
  const mockData: PurchaseOrder[] = [
    {
      id: '1',
      orderNumber: 'PO202512110001',
      title: '12月爆米花原料采购',
      supplier: '供应商A',
      totalAmount: 15800,
      status: 'pending',
      priority: 'high',
      orderDate: '2025-12-11',
      expectedDeliveryDate: '2025-12-15',
      creator: '张三'
    },
    {
      id: '2',
      orderNumber: 'PO202512110002',
      title: '饮料杯采购',
      supplier: '供应商B',
      totalAmount: 8500,
      status: 'approved',
      priority: 'normal',
      orderDate: '2025-12-10',
      expectedDeliveryDate: '2025-12-14',
      creator: '李四'
    },
  ];

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'default' },
    pending: { label: '待审核', color: 'processing' },
    approved: { label: '已审核', color: 'success' },
    rejected: { label: '已拒绝', color: 'error' },
    completed: { label: '已完成', color: 'success' },
  };

  // 优先级映射
  const priorityMap: Record<string, { label: string; color: string }> = {
    low: { label: '低', color: 'default' },
    normal: { label: '普通', color: 'blue' },
    high: { label: '高', color: 'orange' },
    urgent: { label: '紧急', color: 'red' },
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
      title: '订单标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
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
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const priorityInfo = priorityMap[priority] || { label: priority, color: 'default' };
        return <Tag color={priorityInfo.color}>{priorityInfo.label}</Tag>;
      },
    },
    {
      title: '下单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      sorter: (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
    },
    {
      title: '预计交付',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 120,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    console.log('搜索:', value);
  };

  const handleRefresh = () => {
    console.log('刷新列表');
  };

  const handleExport = () => {
    console.log('导出数据');
  };

  const handleCreate = () => {
    console.log('创建订单');
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title="采购订单列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
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
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索订单编号、标题或供应商"
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select placeholder="订单状态" style={{ width: '100%' }} allowClear>
              <Option value="draft">草稿</Option>
              <Option value="pending">待审核</Option>
              <Option value="approved">已审核</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="优先级" style={{ width: '100%' }} allowClear>
              <Option value="low">低</Option>
              <Option value="normal">普通</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          scroll={{ x: 1300 }}
          pagination={{
            total: mockData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default PurchaseOrderList;
