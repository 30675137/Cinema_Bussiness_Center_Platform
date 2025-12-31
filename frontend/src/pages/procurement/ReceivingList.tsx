import React from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, DatePicker, Row, Col, Badge } from 'antd';
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

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReceivingRecord {
  id: string;
  receivingNumber: string;
  purchaseOrderNumber: string;
  supplier: string;
  receivingDate: string;
  totalQuantity: number;
  receivedQuantity: number;
  status: string;
  warehouse: string;
  receiver: string;
  qualityStatus: string;
}

/**
 * 收货入库列表页面
 * 路由: /procurement/receiving/list
 */
const ReceivingList: React.FC = () => {
  const navigate = useNavigate();

  // Mock数据
  const mockData: ReceivingRecord[] = [
    {
      id: '1',
      receivingNumber: 'RCV202512110001',
      purchaseOrderNumber: 'PO202512110001',
      supplier: '供应商A',
      receivingDate: '2025-12-11 14:30:00',
      totalQuantity: 500,
      receivedQuantity: 500,
      status: 'completed',
      warehouse: '中心仓库',
      receiver: '王五',
      qualityStatus: 'passed',
    },
    {
      id: '2',
      receivingNumber: 'RCV202512110002',
      purchaseOrderNumber: 'PO202512110002',
      supplier: '供应商B',
      receivingDate: '2025-12-11 10:15:00',
      totalQuantity: 300,
      receivedQuantity: 280,
      status: 'partial',
      warehouse: '门店仓库A',
      receiver: '赵六',
      qualityStatus: 'checking',
    },
    {
      id: '3',
      receivingNumber: 'RCV202512100001',
      purchaseOrderNumber: 'PO202512090005',
      supplier: '供应商C',
      receivingDate: '2025-12-10 16:00:00',
      totalQuantity: 1000,
      receivedQuantity: 0,
      status: 'pending',
      warehouse: '中心仓库',
      receiver: '李四',
      qualityStatus: 'waiting',
    },
  ];

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待收货', color: 'default' },
    partial: { label: '部分收货', color: 'processing' },
    completed: { label: '已完成', color: 'success' },
    rejected: { label: '已拒收', color: 'error' },
  };

  // 质检状态映射
  const qualityStatusMap: Record<string, { label: string; color: string }> = {
    waiting: { label: '待质检', color: 'default' },
    checking: { label: '质检中', color: 'processing' },
    passed: { label: '质检通过', color: 'success' },
    failed: { label: '质检不合格', color: 'error' },
  };

  // 表格列定义
  const columns: ColumnsType<ReceivingRecord> = [
    {
      title: '收货单号',
      dataIndex: 'receivingNumber',
      key: 'receivingNumber',
      width: 150,
      fixed: 'left',
    },
    {
      title: '采购单号',
      dataIndex: 'purchaseOrderNumber',
      key: 'purchaseOrderNumber',
      width: 150,
      render: (text: string) => <a style={{ color: '#1890ff' }}>{text}</a>,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120,
    },
    {
      title: '收货数量',
      key: 'quantity',
      width: 150,
      render: (_, record) => (
        <span>
          {record.receivedQuantity} / {record.totalQuantity}
          {record.receivedQuantity < record.totalQuantity && (
            <Badge
              count={record.totalQuantity - record.receivedQuantity}
              style={{ backgroundColor: '#faad14', marginLeft: 8 }}
              title="未收货数量"
            />
          )}
        </span>
      ),
    },
    {
      title: '收货状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '质检状态',
      dataIndex: 'qualityStatus',
      key: 'qualityStatus',
      width: 110,
      render: (status: string) => {
        const statusInfo = qualityStatusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '收货仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 120,
    },
    {
      title: '收货时间',
      dataIndex: 'receivingDate',
      key: 'receivingDate',
      width: 160,
      sorter: (a, b) => new Date(a.receivingDate).getTime() - new Date(b.receivingDate).getTime(),
    },
    {
      title: '收货人',
      dataIndex: 'receiver',
      key: 'receiver',
      width: 100,
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
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" icon={<CheckOutlined />}>
                收货
              </Button>
              <Button type="link" size="small" danger icon={<CloseOutlined />}>
                拒收
              </Button>
            </>
          )}
          {record.status === 'partial' && (
            <Button type="link" size="small" icon={<CheckOutlined />}>
              继续收货
            </Button>
          )}
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
    navigate('/purchase-management/receipts/create');
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title="收货入库列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
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
            <Select placeholder="收货状态" style={{ width: '100%' }} allowClear>
              <Option value="pending">待收货</Option>
              <Option value="partial">部分收货</Option>
              <Option value="completed">已完成</Option>
              <Option value="rejected">已拒收</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="质检状态" style={{ width: '100%' }} allowClear>
              <Option value="waiting">待质检</Option>
              <Option value="checking">质检中</Option>
              <Option value="passed">质检通过</Option>
              <Option value="failed">质检不合格</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Col>
        </Row>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>3</div>
                <div style={{ color: '#666' }}>待收货</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>1</div>
                <div style={{ color: '#666' }}>部分收货</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>5</div>
                <div style={{ color: '#666' }}>已完成</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>0</div>
                <div style={{ color: '#666' }}>已拒收</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          scroll={{ x: 1500 }}
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

export default ReceivingList;
