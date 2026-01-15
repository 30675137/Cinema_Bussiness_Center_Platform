import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import router from './components/layout/Router';
import ErrorBoundary from './components/ErrorBoundary';
import './locales'; // 初始化国际化
import './index.css';

// 导入性能监控系统
import './monitoring/PerformanceInterceptor';
import './monitoring/WebVitalsMonitor';

// 启动应用（根据环境变量决定是否启动 MSW）
async function initApp() {
  console.log('🚀 Starting application initialization...');

  // 使用环境变量控制是否启用 MSW
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';

  if (import.meta.env.DEV && useMock) {
    console.log('🔧 Development mode: Initializing MSW...');
    try {
      const { startMSW } = await import('./mocks/browser');
      console.log('📦 MSW module loaded, starting worker...');
      await startMSW();
      console.log('✅ MSW initialization completed');
    } catch (error) {
      console.error('❌ Failed to initialize MSW:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      // 即使 MSW 启动失败，也继续启动应用
    }
  } else if (import.meta.env.DEV) {
    console.log('✅ Development mode: Using real backend API via Vite proxy');
    console.log(`📡 Backend URL: ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}`);
  } else {
    console.log('ℹ️ Production mode: MSW disabled');
  }

  // MSW 启动完成（或跳过）后，渲染应用
  console.log('🎨 Rendering application...');
  renderApp();
}

function renderApp() {
  // 设置dayjs中文语言
  dayjs.locale('zh-cn');

  // 开发环境下自动设置 Mock Token（方便测试）
  if (import.meta.env.DEV && !localStorage.getItem('access_token')) {
    console.log('🔧 开发模式：自动设置 Mock Token');
    localStorage.setItem('access_token', 'mock-token-for-testing');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
  }

  // 创建React Query客户端
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5分钟内数据认为新鲜
        gcTime: 10 * 60 * 1000, // 10分钟缓存时间
        retry: (failureCount, error) => {
          // 对于4xx错误不重试
          if (error && typeof error === 'object' && 'status' in error) {
            const status = error.status as number;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });

  // 导入自定义主题配置
  import('./theme').then(({ antdTheme }) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <ConfigProvider locale={zhCN} theme={antdTheme}>
              <RouterProvider router={router} />
            </ConfigProvider>
            {import.meta.env.DEV && <ReactQueryDevtools />}
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>
    );
  });
}

// 启动应用
initApp();
