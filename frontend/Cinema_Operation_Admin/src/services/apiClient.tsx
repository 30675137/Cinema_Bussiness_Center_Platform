/**
 * API客户端配置
 * 使用TanStack Query进行服务端状态管理
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      // 变更失败时不重试
      retry: false,
    },
  },
});

/**
 * QueryClient Provider 组件
 */
export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export { queryClient };
export default queryClient;