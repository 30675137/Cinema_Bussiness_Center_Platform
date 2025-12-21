import { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './app.less'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 分钟缓存
      cacheTime: 10 * 60 * 1000,   // 10 分钟内存保留
      retry: 2,                     // 失败重试 2 次
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
