/**
 * 路由配置
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 直接导入页面组件（暂时移除懒加载进行测试）
import Dashboard from '@/pages/Dashboard';
import TestComponent from '@/pages/Products/TestComponent';
import ProductsWorkspace from '@/pages/Products/ProductsWorkspace';
import PricingList from '@/pages/pricing/PricingList';
import ReviewList from '@/pages/review/ReviewList';
import InventoryList from '@/pages/inventory/InventoryList';

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
    element: <ProductsWorkspace />,
  },
  {
    path: '/product/list',
    element: <ProductsWorkspace />,
  },
  {
    path: '/product/workspace',
    element: <ProductsWorkspace />,
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
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
  },
});

/**
 * 路由提供者组件
 */
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default router;