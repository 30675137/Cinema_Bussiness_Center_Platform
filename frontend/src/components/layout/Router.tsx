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
// SPU 和 SKU 管理页面
const SPUListPage = lazy(() => import('@/pages/SPUList'));
const SPUDetailPage = lazy(() => import('@/pages/SPUDetail'));
const SkuListPage = lazy(() => import('@/pages/product/sku/SkuListPage'));
// 类目和品牌管理页面
const CategoryManagement = lazy(() => import('@/pages/mdm-pim/category/CategoryManagement'));
const BrandManagement = lazy(() => import('@/pages/mdm-pim/brand/BrandManagement'));
// 属性字典管理页面
const AttributeManagement = lazy(() => import('@/pages/mdm-pim/attribute'));
// 排期管理页面
const ScheduleManagement = lazy(() => import('@/pages/schedule'));
// 影厅资源管理页面
const HallResources = lazy(() => import('@/pages/schedule/HallResources'));
// 门店管理页面
const StoresPage = lazy(() => import('@/pages/stores'));
// 门店预约设置页面
const StoreReservationSettingsPage = lazy(() => import('@/pages/store-reservation-settings'));
// 场景包管理页面
const ScenarioPackageList = lazy(() => import('@/pages/scenario-packages/list'));
const ScenarioPackageCreate = lazy(() => import('@/pages/scenario-packages/create'));
// 新的多标签页编辑器
const ScenarioPackageEdit = lazy(() => import('@/features/scenario-package-editor/ScenarioPackageEditorPage'));
const ScenarioPackagePreview = lazy(() => import('@/pages/scenario-packages/preview'));
// 预约单管理页面
const ReservationOrderList = lazy(() => import('@/pages/reservation-orders/ReservationOrderList'));
const ReservationOrderDetail = lazy(() => import('@/pages/reservation-orders/ReservationOrderDetail'));
// 商品订单管理页面 (O001-product-order-list)
const OrderListPage = lazy(() => import('@/pages/orders/OrderListPage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));
// 单位换算管理页面 (P002-unit-conversion)
const ConversionPage = lazy(() => import('@/pages/bom/ConversionPage'));
// 暂时使用现有组件替代，后续可以实现具体页面
const PricingPreview = lazy(() => import('@/pages/pricing/PricingConfig'));
const AuditPending = lazy(() => import('@/pages/product/ProductList'));
const AuditHistory = lazy(() => import('@/pages/product/ProductList'));
const InventoryOperations = lazy(() => import('@/pages/inventory/InventoryOperations'));
const InventoryQuery = lazy(() => import('@/pages/inventory/InventoryPage'));
const InventoryTransactions = lazy(() => import('@/pages/inventory/InventoryMovements'));
const TransferManagement = lazy(() => import('@/pages/inventory/TransferManagement'));
const ProcurementTransfer = lazy(() => import('@/pages/inventory/TransferManagement'));
const Stocktaking = lazy(() => import('@/pages/inventory/Stocktaking'));
const InventoryReservation = lazy(() => import('@/pages/inventory/InventoryReservation'));
const PurchaseOrders = lazy(() => import('@/pages/procurement/PurchaseOrders'));
const PurchaseOrderList = lazy(() => import('@/pages/procurement/PurchaseOrderList'));
const ReceivingList = lazy(() => import('@/pages/procurement/ReceivingList'));
const ReceivingForm = lazy(() => import('@/pages/procurement/ReceivingForm'));
const ReceivingDetail = lazy(() => import('@/pages/procurement/ReceivingDetail'));
const SupplierList = lazy(() => import('@/pages/procurement/SupplierList'));
const SupplierDetail = lazy(() => import('@/pages/procurement/SupplierDetail'));

// MDM/PIM 模块 - 类目管理

// 暂时使用现有组件替代
const Profile = lazy(() => import('@/pages/product/ProductList'));
const Settings = lazy(() => import('@/pages/product/ProductList'));

const Login = lazy(() => import('@/pages/product/ProductList'));

// 库存审批页面
const InventoryApproval = lazy(() => import('@/pages/inventory/ApprovalPage'));

// 404 页面组件
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/dashboard">返回首页</a>
  </div>
);

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
  // SPU 管理页面（必须在 /products/:id 之前，避免被匹配）
  {
    path: '/products/spu',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SPUListPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // MDM/PIM - 类目管理路由
  {
    path: '/mdm-pim/category',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/mdm-pim/category/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // MDM/PIM - 品牌管理路由
  {
    path: '/mdm-pim/brands',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <BrandManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // MDM/PIM - 属性字典管理路由
  {
    path: '/mdm-pim/attribute',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <AttributeManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 排期管理 - 创建排期路由
  {
    path: '/schedule/create',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ScheduleManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 排期管理 - 影厅资源管理路由
  {
    path: '/schedule/hall-resources',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <HallResources />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 排期管理 - 甘特图视图路由
  {
    path: '/schedule/gantt',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ScheduleManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 门店管理路由
  {
    path: '/stores',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <StoresPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 016-store-reservation-settings: 已整合到门店管理页面，保留路由但重定向到门店管理
  {
    path: '/store-reservation-settings',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              {/* 重定向到门店管理页面，预约设置已整合其中 */}
              <StoreReservationSettingsPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 场景包管理路由
  {
    path: '/scenario-packages',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ScenarioPackageList />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/scenario-packages/create',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ScenarioPackageCreate />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/scenario-packages/:id/edit',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ScenarioPackageEdit />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/scenario-packages/:id/preview',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ScenarioPackagePreview />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 预约单管理路由
  {
    path: '/reservation-orders',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ReservationOrderList />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/reservation-orders/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ReservationOrderDetail />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 商品订单管理路由 (O001-product-order-list)
  {
    path: '/orders/list',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <OrderListPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <OrderDetailPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // SPU 详情和编辑路由（必须在 /products/:id 之前，避免被匹配）
  {
    path: '/spu/:id/edit',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SPUDetailPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/spu/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SPUDetailPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // SKU 管理页面（必须在 /products/:id 之前，避免被匹配）
  {
    path: '/products/sku',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SkuListPage />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 类目管理页面
  {
    path: '/category',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryManagement />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 品牌管理页面
  {
    path: '/brand',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <BrandManagement />
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
  // 库存审批管理路由
  {
    path: '/inventory/approvals',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryApproval />
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
  // 供应商管理路由
  {
    path: '/purchase-management/suppliers',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SupplierList />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 供应商详情路由
  {
    path: '/purchase-management/suppliers/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <SupplierDetail />
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
  // 新建收货入库路由
  {
    path: '/purchase-management/receipts/create',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ReceivingForm />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 收货入库详情路由
  {
    path: '/purchase-management/receipts/:id',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ReceivingDetail />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
  // 到货验收 & 收货入库列表路由
  {
    path: '/purchase-management/receipts',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ReceivingList />
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
  // 单位换算管理路由 (P002-unit-conversion)
  {
    path: '/bom/conversion',
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <ConversionPage />
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