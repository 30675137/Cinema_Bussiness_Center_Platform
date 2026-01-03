/**
 * @spec O007-miniapp-menu-api
 * Taro 应用入口
 */

import { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './app.less'

// 创建 QueryClient 实例（调试模式：禁用缓存）
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                    // 禁用缓存，每次都请求新数据
      gcTime: 0,                        // 立即清理缓存
      retry: 1,                         // 失败重试1次
      refetchOnWindowFocus: true,       // 窗口聚焦时自动刷新
      refetchOnMount: true,             // 组件挂载时刷新
      refetchOnReconnect: true,         // 重连时刷新
    },
  },
})

function App({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default App
