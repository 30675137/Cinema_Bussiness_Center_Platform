import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Suspense } from 'react'

// Layout components
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import ContentLayout from '@/components/layout/Content'
import QueryProvider from '@/services/QueryProvider'

// Common components
import Loading from '@/components/common/Loading'

// Lazy load page components
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))

// SPU Pages
const SPUList = React.lazy(() => import('@/pages/SPUList'))
const SPUCreate = React.lazy(() => import('@/pages/SPUCreate'))
const SPUDetail = React.lazy(() => import('@/pages/SPUDetail'))

// Category Pages
const CategoryManagement = React.lazy(() => import('@/pages/mdm-pim/category/CategoryManagement'))

// Brand Pages
const BrandManagement = React.lazy(() => import('@/pages/BrandManagement'))

// Attribute Template Pages
const AttributeTemplate = React.lazy(() => import('@/pages/AttributeTemplate'))

// Legacy product pages
const ProductList = React.lazy(() => import('@/pages/product/ProductList'))
const ProductForm = React.lazy(() => import('@/pages/product/ProductForm'))

// Other existing pages
const PriceManagement = React.lazy(() => import('@/pages/price/PriceManagement'))
const PricingConfig = React.lazy(() => import('@/pages/pricing/PricingConfig'))
const InventoryTrace = React.lazy(() => import('@/pages/inventory/InventoryTrace'))

// Loading component for lazy loaded pages
const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px'
  }}>
    <Loading size="large" />
  </div>
)

// Main App Layout component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <QueryProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
          <ContentLayout title="">
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </ContentLayout>
        </div>
      </div>
    </QueryProvider>
  )
}

// Route wrapper with layout
const withLayout = (Component: React.ComponentType) => {
  return () => (
    <AppLayout>
      <Component />
    </AppLayout>
  )
}

// Create router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/dashboard',
    element: withLayout(Dashboard),
  },
  {
    path: '/spu',
    element: withLayout(SPUList),
  },
  {
    path: '/spu/create',
    element: withLayout(SPUCreate),
  },
  {
    path: '/spu/:id',
    element: withLayout(SPUDetail),
  },
  {
    path: '/mdm-pim/category',
    element: withLayout(CategoryManagement),
  },
  {
    path: '/mdm-pim/category/:id',
    element: withLayout(CategoryManagement),
  },
  {
    path: '/brand',
    element: withLayout(BrandManagement),
  },
  {
    path: '/attribute-template',
    element: withLayout(AttributeTemplate),
  },
  {
    path: '/product',
    element: withLayout(ProductList),
  },
  {
    path: '/product/new',
    element: withLayout(ProductForm),
  },
  {
    path: '/product/:id/edit',
    element: withLayout(ProductForm),
  },
  {
    path: '/price',
    element: withLayout(PriceManagement),
  },
  {
    path: '/pricing/config',
    element: withLayout(PricingConfig),
  },
  {
    path: '/inventory/trace',
    element: withLayout(InventoryTrace),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])

// Router provider component
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

export default AppRouter