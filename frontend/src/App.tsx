import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { PerformanceProvider } from './monitoring/PerformanceProvider';
import { performanceInterceptor } from './monitoring/PerformanceInterceptor';
import { webVitalsMonitor } from './monitoring/WebVitalsMonitor';
import { bundleAnalyzer } from './monitoring/BundleAnalyzer';
import { PERFORMANCE_CONFIG } from './monitoring/config';
import { LazyLoadWrapper } from './optimization/LazyLoadWrapper';
import LoadingSpinner from './components/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const PerformanceDashboard = lazy(() => import('./monitoring/PerformanceDashboard'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// 商品管理相关页面
const ProductList = lazy(() => import('./pages/product/ProductList'));
const ProductForm = lazy(() => import('./pages/product/ProductForm'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 价格管理页面
const PriceManagement = lazy(() => import('./pages/price/PriceManagement'));

// 审核流程页面
const ReviewPanel = lazy(() => import('./pages/review/ReviewPanel'));

// 库存追溯页面
const InventoryTrace = lazy(() => import('./pages/inventory/InventoryTrace'));

// 库存台账页面
const InventoryLedger = lazy(() => import('./pages/inventory/InventoryLedger'));

// 库存流水页面
const InventoryMovements = lazy(() => import('./pages/inventory/InventoryMovements'));

// 登录页面
const LoginPage = lazy(() => import('./pages/auth/Login'));

// SPU管理页面
const SPUListPage = lazy(() => import('./pages/SPUList'));
const SPUListTest = lazy(() => import('./pages/SPUList/test'));
const SPUDetailPage = lazy(() => import('./pages/SPUDetail'));

// 基础数据管理页面
const CategoryManagementPage = lazy(() => import('./pages/mdm-pim/category/CategoryManagement'));
const BrandManagementPage = lazy(() => import('./pages/BrandManagement'));

// 属性模板管理页面
const AttributeTemplatePage = lazy(() => import('./pages/AttributeTemplate'));

// 初始化性能监控
const initializePerformanceMonitoring = () => {
  if (!PERFORMANCE_CONFIG.monitoring.enabled) {
    return;
  }

  try {
    // 初始化Web Vitals监控
    webVitalsMonitor;

    // 初始化Bundle分析
    bundleAnalyzer;

    // 将性能监控器暴露到全局，供其他模块使用
    (window as any).__performanceMonitor = {
      recordAPICall: performanceInterceptor.getAllMetrics,
      getMetrics: () => webVitalsMonitor.getMetrics(),
      getBundleAnalysis: () => bundleAnalyzer.getAnalysis(),
    };

    console.log('✅ 性能监控系统已初始化');
  } catch (error) {
    console.warn('⚠️ 性能监控系统初始化失败:', error);
  }
};

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('应用错误:', error, errorInfo);

    // 在生产环境中，可以发送错误报告到监控服务
    if (process.env.NODE_ENV === 'production') {
      // sendErrorReport(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h1>应用出现错误</h1>
          <p>抱歉，应用遇到了一个错误。</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()}>
            重新加载页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  // 在应用启动时初始化性能监控
  React.useEffect(() => {
    initializePerformanceMonitoring();

    // 清理函数
    return () => {
      bundleAnalyzer.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN}>
        <PerformanceProvider>
          <div className="App">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* 默认首页重定向到商品管理 */}
                <Route path="/" element={<ProductList />} />

                {/* 商品管理路由 */}
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/new" element={<ProductForm />} />
                <Route path="/products/:id" element={<ProductForm />} />
                <Route path="/products/:id/edit" element={<ProductForm />} />

                {/* 仪表板 */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* 价格管理 */}
                <Route path="/pricing" element={<PriceManagement />} />
                <Route path="/price-management" element={<PriceManagement />} />

                {/* 审核流程 */}
                <Route path="/review" element={<ReviewPanel />} />
                <Route path="/review-panel" element={<ReviewPanel />} />

                {/* 库存追溯 */}
                <Route path="/inventory" element={<InventoryTrace />} />
                <Route path="/inventory-trace" element={<InventoryTrace />} />

                {/* 库存台账 */}
                <Route path="/inventory/ledger" element={<InventoryLedger />} />

                {/* 库存流水 */}
                <Route path="/inventory/movements" element={<InventoryMovements />} />

                {/* 性能监控 */}
                <Route
                  path="/performance"
                  element={
                    <LazyLoadWrapper
                      loader={() => import('./monitoring/PerformanceDashboard')}
                    />
                  }
                />

                {/* SPU管理 */}
                <Route path="/spu" element={<SPUListPage />} />
                <Route path="/spu/test" element={<SPUListTest />} />
                <Route path="/spu/:id" element={<SPUDetailPage />} />
                <Route path="/spu/:id/edit" element={<SPUDetailPage />} />

                {/* 基础数据管理 */}
                <Route path="/mdm-pim/category" element={<CategoryManagementPage />} />
                <Route path="/brands" element={<BrandManagementPage />} />

                {/* 属性模板管理 */}
                <Route path="/attribute-templates" element={<AttributeTemplatePage />} />

                {/* 其他页面 */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </Suspense>
          </div>
        </PerformanceProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;