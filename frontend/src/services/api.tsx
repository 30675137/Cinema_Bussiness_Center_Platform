import {
  QueryClient,
  QueryClientProvider,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { message, notification } from 'antd';
import { ReactNode } from 'react';

/**
 * API 基础配置
 */
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  timeout: 10000,
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

/**
 * API 响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
  timestamp?: number;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API 错误接口
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: number;
}

/**
 * HTTP 客户端类
 */
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: typeof API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    if (error.name === 'AbortError') {
      return {
        code: 'TIMEOUT',
        message: '请求超时，请稍后重试',
        timestamp: Date.now(),
      };
    }

    if (error instanceof SyntaxError) {
      return {
        code: 'PARSE_ERROR',
        message: '响应数据格式错误',
        timestamp: Date.now(),
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: error.message || '网络请求失败',
      timestamp: Date.now(),
    };
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * 创建 HTTP 客户端实例
 */
export const httpClient = new HttpClient(API_CONFIG);

/**
 * 创建 QueryClient 实例
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 查询默认配置
      retry: API_CONFIG.retry,
      retryDelay: API_CONFIG.retryDelay,
      staleTime: 5 * 60 * 1000, // 5 分钟
      cacheTime: 10 * 60 * 1000, // 10 分钟
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
      networkMode: 'online',
    },
    mutations: {
      // 变更默认配置
      retry: 1,
      networkMode: 'online',
    },
  },
});

/**
 * 错误处理函数
 */
export const handleApiError = (error: unknown, context?: string) => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

  let errorMessage = '操作失败，请稍后重试';
  let errorType: 'error' | 'warning' | 'info' = 'error';

  if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = (error as any).message || errorMessage;
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as any).code;

    switch (errorCode) {
      case 'TIMEOUT':
        errorMessage = '请求超时，请检查网络连接';
        errorType = 'warning';
        break;
      case 'NETWORK_ERROR':
        errorMessage = '网络连接失败，请检查网络设置';
        errorType = 'warning';
        break;
      case 'UNAUTHORIZED':
        errorMessage = '登录已过期，请重新登录';
        errorType = 'warning';
        break;
      case 'FORBIDDEN':
        errorMessage = '权限不足，无法执行此操作';
        errorType = 'warning';
        break;
      case 'NOT_FOUND':
        errorMessage = '请求的资源不存在';
        errorType = 'info';
        break;
      default:
        errorMessage = (error as any).message || errorMessage;
    }
  }

  // 显示错误提示
  if (errorType === 'error') {
    notification.error({
      message: '操作失败',
      description: errorMessage,
      duration: 5,
    });
  } else {
    message.warning(errorMessage);
  }

  return { errorMessage, errorType };
};

/**
 * 查询配置工厂
 */
export const createQueryOptions = <T extends unknown>(
  customOptions?: Partial<UseQueryOptions<T, Error>>
): UseQueryOptions<T, Error> => ({
  retry: (failureCount, error) => {
    if (error.message.includes('401') || error.message.includes('403')) {
      return false; // 认证错误不重试
    }
    return failureCount < API_CONFIG.retry;
  },
  onError: (error) => {
    handleApiError(error);
  },
  ...customOptions,
});

/**
 * 变更配置工厂
 */
export const createMutationOptions = <TVariables extends unknown, TData extends unknown>(
  customOptions?: Partial<UseMutationOptions<TData, Error, TVariables>>
): UseMutationOptions<TData, Error, TVariables> => ({
  onError: (error) => {
    handleApiError(error);
  },
  ...customOptions,
});

/**
 * QueryClient Provider 组件
 */
export const ApiProvider = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

/**
 * 开发工具配置
 */
if (process.env.NODE_ENV === 'development') {
  // 在开发环境中启用 React Query DevTools
  // 注意：需要单独安装 @tanstack/react-query-devtools
  console.log('🔍 React Query DevTools available in development');
}

/**
 * 预取数据
 */
export const prefetchData = async <T extends unknown>(
  queryKey: string[],
  queryFn: () => Promise<T>
) => {
  try {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000, // 5 分钟
    });
  } catch (error) {
    console.warn('Prefetch failed:', error);
  }
};

/**
 * 无效化查询缓存
 */
export const invalidateQueries = (queryKey: string[]) => {
  queryClient.invalidateQueries({ queryKey });
};

/**
 * 设置查询数据
 */
export const setQueryData = <T extends unknown>(queryKey: string[], data: T) => {
  queryClient.setQueryData(queryKey, data);
};

/**
 * 获取查询数据
 */
export const getQueryData = <T extends unknown>(queryKey: string[]): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

/**
 * 清除查询缓存
 */
export const clearQueries = (queryKey?: string[]) => {
  if (queryKey) {
    queryClient.clearQueries({ queryKey });
  } else {
    queryClient.clearQueries();
  }
};

export default {
  httpClient,
  queryClient,
  ApiProvider,
  handleApiError,
  createQueryOptions,
  createMutationOptions,
  prefetchData,
  invalidateQueries,
  setQueryData,
  getQueryData,
  clearQueries,
};
