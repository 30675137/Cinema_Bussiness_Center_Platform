import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from './AppLayout';
import ErrorBoundary from '../ErrorBoundary';

// 懒加载页面组件
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ProductList = lazy(() => import('@/pages/product/ProductList'));
const ProductForm = lazy(() => import('@/pages/product/ProductForm'));
const PricingConfig = lazy(() => import('@/pages/pricing/PricingConfig'));
const PriceManagement = lazy(() => import('@/pages/price/PriceManagement'));
const ReviewPanel = lazy(() => import('@/pages/review/ReviewPanel'));
const InventoryTrace = lazy(() => import('@/pages/inventory/InventoryTrace'));
const InventoryLedger = lazy(() => import('@/pages/inventory/InventoryLedger'));
const InventoryMovements = lazy(() => import('@/pages/inventory/InventoryMovements'));
const InventoryAudit = lazy(() => import('@/pages/inventory/InventoryAudit'));
// 暂时使用现有组件替代，后续可以实现具体页面
const PricingPreview = lazy(() => import('@/pages/pricing/PricingConfig'));
const AuditPending = lazy(() => import('@/pages/product/ProductList'));
const AuditHistory = lazy(() => import('@/pages/product/ProductList'));
const InventoryOperations = lazy(() => import('@/pages/inventory/InventoryOperations'));
const InventoryQuery = lazy(() => import('@/pages/inventory/InventoryMovements'));
const InventoryTransactions = lazy(() => import('@/pages/inventory/InventoryMovements'));
const TransferManagement = lazy(() => import('@/pages/inventory/TransferManagement'));
const ProcurementTransfer = lazy(() => import('@/pages/inventory/TransferManagement'));
const Stocktaking = lazy(() => import('@/pages/inventory/Stocktaking'));
const InventoryReservation = lazy(() => import('@/pages/inventory/InventoryReservation'));
const PurchaseOrders = lazy(() => import('@/pages/procurement/PurchaseOrders'));
const PurchaseOrderList = lazy(() => import('@/pages/procurement/PurchaseOrderList'));

// 暂时使用现有组件替代
const Profile = lazy(() => import('@/pages/product/ProductList'));
const Settings = lazy(() => import('@/pages/product/ProductList'));

const Login = lazy(() => import('@/pages/product/ProductList'));
const NotFound = lazy(() => import('@/pages/product/ProductList'));

// 加载组件
const LoadingSpinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
    }}
  >
    <Spin size="large" />
  </div>
);

// 受保护路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 公开路由组件
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <ErrorBoundary>
            <Login />
          </ErrorBoundary>
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Navigate to="/dashboard" replace />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 商品管理路由
  {
    path: '/products',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductList />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products/create',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductForm mode="create" />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products/:id/edit',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductForm mode="edit" />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductForm mode="edit" />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 价格配置路由
  {
    path: '/pricing',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <PriceManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/price-management',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <PriceManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pricing/configs',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <PricingConfig />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/pricing/preview',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <PricingPreview />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 审核流程路由
  {
    path: '/review',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ReviewPanel />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/review-panel',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ReviewPanel />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit/pending',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <AuditPending />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit/history',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <AuditHistory />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 库存追溯路由
  {
    path: '/inventory',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryTrace />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory-trace',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryTrace />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory/ledger',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryLedger />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory/movements',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryAudit />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory/operations',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryOperations />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory/query',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryQuery />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory/transactions',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryTransactions />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 采购订单管理路由
  {
    path: '/purchase-management/orders',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <PurchaseOrders />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 采购订单列表路由
  {
    path: '/purchase-management/orders/list',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <PurchaseOrderList />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 采购管理路由
  {
    path: '/procurement/transfer',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ProcurementTransfer />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 库存调拨路由
  {
    path: '/inventory/transfer',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <TransferManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 库存预占/释放管理路由
  {
    path: '/inventory/reservation',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryReservation />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 盘点模块路由
  {
    path: '/inventory/stocktaking',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Stocktaking />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 个人中心路由
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Settings />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 404页面
  {
    path: '*',
    element: (
      <AppLayout>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        </ErrorBoundary>
      </AppLayout>
    ),
  },
]);

export default router;