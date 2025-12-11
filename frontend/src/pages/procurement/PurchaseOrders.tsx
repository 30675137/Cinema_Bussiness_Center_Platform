import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

/**
 * 采购订单 (PO) 管理页面
 * 路由: /purchase-management/orders
 */
const PurchaseOrders: React.FC = () => {
  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <ShoppingCartOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
          <Title level={2}>采购订单 (PO) 管理</Title>
          <Paragraph type="secondary">
            此页面用于管理所有采购订单，包括创建、审核、跟踪和管理采购流程
          </Paragraph>
          <Empty
            description="采购订单功能正在开发中"
            style={{ marginTop: 40 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default PurchaseOrders;
