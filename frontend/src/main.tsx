import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import router from './components/layout/Router'
import ErrorBoundary from './components/ErrorBoundary'
import './locales' // 初始化国际化
import './index.css'

// 导入性能监控系统
import './monitoring/PerformanceInterceptor'
import './monitoring/WebVitalsMonitor'

// 设置dayjs中文语言
dayjs.locale('zh-cn')

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
})

// 导入自定义主题配置
import { antdTheme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          locale={zhCN}
          theme={antdTheme}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
        {import.meta.env.DEV && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
