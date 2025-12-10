/**
 * 路由配置
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy } from 'react';

// 懒加载页面组件
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ProductList = lazy(() => import('@/pages/product/ProductList'));
const PricingList = lazy(() => import('@/pages/pricing/PricingList'));
const ReviewList = lazy(() => import('@/pages/review/ReviewList'));
const InventoryList = lazy(() => import('@/pages/inventory/InventoryList'));

// 路由配置
const routes = [
  {
    path: '/',
    element: <Dashboard />,
    index: true,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/product',
    children: [
      {
        index: true,
        element: <ProductList />,
      },
      {
        path: 'list',
        element: <ProductList />,
      },
    ],
  },
  {
    path: '/pricing',
    children: [
      {
        index: true,
        element: <PricingList />,
      },
      {
        path: 'list',
        element: <PricingList />,
      },
    ],
  },
  {
    path: '/review',
    children: [
      {
        index: true,
        element: <ReviewList />,
      },
      {
        path: 'list',
        element: <ReviewList />,
      },
    ],
  },
  {
    path: '/inventory',
    children: [
      {
        index: true,
        element: <InventoryList />,
      },
      {
        path: 'list',
        element: <InventoryList />,
      },
    ],
  },
];

// 创建路由实例
const router = createBrowserRouter(routes);

/**
 * 路由提供者组件
 */
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default router;