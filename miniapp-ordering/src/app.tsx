/**
 * @spec O006-miniapp-channel-order
 * Taro 应用入口文件
 */

import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './app.scss'

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 分钟缓存
      gcTime: 10 * 60 * 1000,      // 10 分钟垃圾回收(TanStack Query v5)
      retry: 2,                     // 失败重试 2 次
      refetchOnWindowFocus: false,  // 禁用窗口聚焦时自动重新获取
    },
  },
})

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.')
  })

  // 使用 QueryClientProvider 包裹应用
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default App
