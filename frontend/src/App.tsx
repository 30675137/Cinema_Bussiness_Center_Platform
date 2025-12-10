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

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const PerformanceDashboard = lazy(() => import('./monitoring/PerformanceDashboard'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

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
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/performance"
                  element={
                    <LazyLoadWrapper
                      loader={() => import('./monitoring/PerformanceDashboard')}
                    />
                  }
                />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </Suspense>
          </div>
        </PerformanceProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;