/**
 * 采购订单页面
 */
import React from 'react';
import PurchaseOrderList from '@/components/purchase/PurchaseOrderList';
import { PurchaseOrder } from '@/types/purchase';

const PurchaseOrderPage: React.FC = () => {
  const handleOrderSelect = (order: PurchaseOrder) => {
    // 处理订单选择，可以跳转到详情页面
    console.log('Selected order:', order);
  };

  const handleOrderEdit = (order: PurchaseOrder) => {
    // 处理订单编辑
    console.log('Edit order:', order);
  };

  const handleOrderView = (order: PurchaseOrder) => {
    // 处理订单查看
    console.log('View order:', order);
  };

  const handleOrderCreate = () => {
    // 处理创建新订单
    console.log('Create new order');
  };

  return (
    <PurchaseOrderList
      onOrderSelect={handleOrderSelect}
      onOrderEdit={handleOrderEdit}
      onOrderView={handleOrderView}
      onOrderCreate={handleOrderCreate}
    />
  );
};

export default PurchaseOrderPage;