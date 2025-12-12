import { lazy } from 'react';

// 懒加载采购管理模块组件
const OrderList = lazy(() => import('../pages/purchase-management/orders/OrderList'));
const OrderDetail = lazy(() => import('../pages/purchase-management/orders/OrderDetail'));
const OrderForm = lazy(() => import('../pages/purchase-management/orders/OrderForm'));

const ReceiptList = lazy(() => import('../pages/purchase-management/receipts/ReceiptList'));
const ReceiptDetail = lazy(() => import('../pages/purchase-management/receipts/ReceiptDetail'));

const SupplierList = lazy(() => import('../pages/purchase-management/suppliers/SupplierList'));
const SupplierDetail = lazy(() => import('../pages/purchase-management/suppliers/SupplierDetail'));

const PurchaseDashboard = lazy(() => import('../pages/purchase-management/dashboard/PurchaseDashboard'));

export const purchaseRoutes = [
  {
    path: '/purchase-management',
    children: [
      {
        index: true,
        element: <PurchaseDashboard />,
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: <OrderList />,
          },
          {
            path: 'new',
            element: <OrderForm mode="create" />,
          },
          {
            path: ':id',
            element: <OrderDetail />,
          },
          {
            path: ':id/edit',
            element: <OrderForm mode="edit" />,
          },
        ],
      },
      {
        path: 'receipts',
        children: [
          {
            index: true,
            element: <ReceiptList />,
          },
          {
            path: ':id',
            element: <ReceiptDetail />,
          },
          {
            path: 'new/:orderId',
            element: <OrderForm mode="receipt" />,
          },
        ],
      },
      {
        path: 'suppliers',
        children: [
          {
            index: true,
            element: <SupplierList />,
          },
          {
            path: ':id',
            element: <SupplierDetail />,
          },
        ],
      },
    ],
  },
];

export default purchaseRoutes;