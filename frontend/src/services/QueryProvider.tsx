import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 创建QueryClient实例
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5分钟的缓存时间
        staleTime: 5 * 60 * 1000,
        // 10分钟的垃圾回收时间
        gcTime: 10 * 60 * 1000,
        // 3次重试
        retry: 3,
        // 重试延迟
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 窗口聚焦时重新获取
        refetchOnWindowFocus: false,
        // 网络重连时重新获取
        refetchOnReconnect: true,
      },
      mutations: {
        // 3次重试
        retry: 3,
        // 重试延迟
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
};

let queryClientSingleton: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (!queryClientSingleton) {
    queryClientSingleton = createQueryClient();
  }
  return queryClientSingleton;
};

interface QueryProviderProps {
  children: React.ReactNode;
  client?: QueryClient;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  client = getQueryClient(),
}) => {
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
