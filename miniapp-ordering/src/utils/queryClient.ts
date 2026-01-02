/**
 * @spec O006-miniapp-channel-order
 * TanStack Query Client 配置
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * 创建 Query Client 实例
 *
 * @description
 * - 配置默认查询选项
 * - 缓存时间: staleTime 2分钟, cacheTime 5分钟
 * - 禁用后台自动刷新(小程序环境)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间(2分钟)
      staleTime: 2 * 60 * 1000,

      // 缓存时间(5分钟)
      gcTime: 5 * 60 * 1000,

      // 禁用窗口聚焦自动刷新(小程序不适用)
      refetchOnWindowFocus: false,

      // 禁用重连自动刷新
      refetchOnReconnect: false,

      // 重试次数
      retry: 1,

      // 重试延迟(1秒)
      retryDelay: 1000,
    },
    mutations: {
      // Mutation 重试次数
      retry: 0,
    },
  },
})
