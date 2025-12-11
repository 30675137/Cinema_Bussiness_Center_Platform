/**
 * 主应用组件
 * 库存管理系统的根组件
 */

import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import AppRouter from '@/router';
import '@/styles/inventory.css';

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// 错误边界回调
const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  return (
    <div
      style={{
        padding: '48px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h2>出现了一个错误</h2>
      <pre style={{ textAlign: 'left', maxWidth: '600px', margin: '20px 0' }}>
        {error.message}
      </pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
              wireframe: false,
            },
            components: {
              Table: {
                headerBg: '#fafafa',
                headerBorderRadius: 0,
              },
              Card: {
                borderRadius: 6,
              },
              Button: {
                borderRadius: 6,
              },
              Input: {
                borderRadius: 6,
              },
              Select: {
                borderRadius: 6,
              },
            },
          }}
        >
          <AntdApp>
            <div className="inventory-layout">
              <AppRouter />
            </div>
          </AntdApp>
        </ConfigProvider>

        {/* 开发工具 - 只在开发环境显示 */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;