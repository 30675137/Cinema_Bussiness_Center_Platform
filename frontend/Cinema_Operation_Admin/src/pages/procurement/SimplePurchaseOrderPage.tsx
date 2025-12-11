/**
 * 简化的采购订单页面 - 用于测试
 */
import React from 'react';
import { Card, Typography, Button, Table } from 'antd';

const { Title } = Typography;

const SimplePurchaseOrderPage: React.FC = () => {
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
    },
  ];

  // Mock数据
  const mockData = [
    {
      key: '1',
      orderNumber: 'PO-001',
      title: '电影票采购订单',
      status: '已审核',
      totalAmount: '¥10,000',
    },
    {
      key: '2',
      orderNumber: 'PO-002',
      title: '爆米花原料采购',
      status: '待审核',
      totalAmount: '¥5,000',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>采购订单管理</Title>
        <Button type="primary" style={{ marginBottom: '16px' }}>
          新建采购订单
        </Button>
        <Table
          columns={columns}
          dataSource={mockData}
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys, selectedRows) => {
              console.log('Selected:', selectedRowKeys, selectedRows);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default SimplePurchaseOrderPage;