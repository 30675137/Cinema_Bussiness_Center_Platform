/**
 * 路由配置
 * 库存管理系统路由设置
 */

import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import PermissionGuard from '@/components/Inventory/PermissionGuard';

// 懒加载组件
const InventoryLedger = React.lazy(() => import('@/pages/inventory/InventoryLedger'));
const InventoryMovements = React.lazy(() => import('@/pages/inventory/InventoryMovements'));
const InventoryAdjustments = React.lazy(() => import('@/pages/inventory/InventoryAdjustments'));

// 加载组件
const PageLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  }}>
    <Spin size="large" tip="页面加载中..." />
  </div>
);

// 布局组件
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="inventory-layout">
      <Suspense fallback={<PageLoading />}>
        {children}
      </Suspense>
    </div>
  );
};

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/inventory/ledger" replace />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // 库存管理相关路由
      {
        path: 'inventory',
        children: [
          {
            index: true,
            element: <Navigate to="/inventory/ledger" replace />,
          },
          {
            path: 'ledger',
            element: (
              <PermissionGuard permission="read">
                <InventoryLedger />
              </PermissionGuard>
            ),
          },
          // 预留其他库存管理路由
          {
            path: 'movements',
            element: (
              <PermissionGuard permission="read">
                <InventoryMovements />
              </PermissionGuard>
            ),
          },
          {
            path: 'adjustments',
            element: (
              <PermissionGuard permission="read">
                <InventoryAdjustments />
              </PermissionGuard>
            ),
          },
        ],
      },
      // 其他功能模块路由 (预留)
      {
        path: 'dashboard',
        element: (
          <PermissionGuard permission="read">
            <div>仪表板页面 (待实现)</div>
          </PermissionGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <PermissionGuard permission="admin">
            <div>系统设置页面 (待实现)</div>
          </PermissionGuard>
        ),
      },
    ],
  },
  // 404页面
  {
    path: '*',
    element: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
      }}>
        <h1>404</h1>
        <p>页面不存在</p>
        <a href="/inventory/ledger">返回库存台账</a>
      </div>
    ),
  },
]);

// 路由提供者组件
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;