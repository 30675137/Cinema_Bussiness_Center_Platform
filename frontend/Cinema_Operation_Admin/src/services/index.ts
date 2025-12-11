/**
 * 服务层统一导出
 *
 * 统一导出所有API服务、查询键、配置和工具函数
 */

// API 客户端和配置
export {
  httpClient,
  queryClient,
  ApiProvider,
  API_CONFIG,
  handleApiError,
  createQueryOptions,
  createMutationOptions,
  prefetchData,
  invalidateQueries,
  setQueryData,
  getQueryData,
  clearQueries,
} from './api';

export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from './api';

// 查询键
export {
  productKeys,
  userKeys,
  orderKeys,
  inventoryKeys,
  systemKeys,
  notificationKeys,
  uploadKeys,
  reportKeys,
  queryKeysManager,
  queryKeysUtils,
  QueryKeyFactory,
} from './queryKeys';

/**
 * 服务层配置
 */
export const servicesConfig = {
  // API 配置
  api: {
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
    timeout: 10000,
    retry: 3,
  },

  // 查询配置
  query: {
    staleTime: 5 * 60 * 1000, // 5 分钟
    cacheTime: 10 * 60 * 1000, // 10 分钟
    refetchOnWindowFocus: false,
    retry: 3,
  },

  // 分页配置
  pagination: {
    defaultPageSize: 20,
    pageSizes: [10, 20, 50, 100],
    maxPageSize: 100,
  },

  // 上传配置
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFiles: 5,
  },
};

/**
 * 服务层状态管理
 */
export const servicesState = {
  // 是否已初始化
  initialized: false,

  // 请求计数器
  requestCount: 0,

  // 错误计数器
  errorCount: 0,

  // 最后更新时间
  lastUpdated: null as Date | null,

  // 初始化服务层
  init() {
    if (this.initialized) return;

    this.initialized = true;
    this.lastUpdated = new Date();

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Services layer initialized');
    }
  },

  // 增加请求计数
  incrementRequestCount() {
    this.requestCount++;
  },

  // 增加错误计数
  incrementErrorCount() {
    this.errorCount++;
  },

  // 获取服务统计
  getStats() {
    return {
      initialized: this.initialized,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
      lastUpdated: this.lastUpdated,
    };
  },
};

/**
 * 服务层工具函数
 */
export const servicesUtils = {
  /**
   * 格式化 API 错误
   */
  formatApiError(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return '未知错误';
  },

  /**
   * 检查是否为网络错误
   */
  isNetworkError(error: any): boolean {
    return (
      error?.code === 'NETWORK_ERROR' ||
      error?.code === 'TIMEOUT' ||
      error?.message?.includes('fetch')
    );
  },

  /**
   * 检查是否为认证错误
   */
  isAuthError(error: any): boolean {
    const status = error?.response?.status;
    return status === 401 || status === 403;
  },

  /**
   * 重试请求
   */
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        servicesState.incrementRequestCount();
        return await requestFn();
      } catch (error) {
        lastError = error;
        servicesState.incrementErrorCount();

        if (i === maxRetries) {
          throw lastError;
        }

        // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }

    throw lastError;
  },

  /**
   * 创建带有重试的请求
   */
  createRetryableRequest<T>(requestFn: () => Promise<T>, options?: { maxRetries?: number; delay?: number }) {
    return () => this.retryRequest(requestFn, options?.maxRetries, options?.delay);
  },

  /**
   * 缓存响应数据
   */
  cacheResponse(key: string[], data: any, ttl: number = 5 * 60 * 1000) {
    const cacheKey = JSON.stringify(key);
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheData));
  },

  /**
   * 获取缓存数据
   */
  getCachedResponse<T>(key: string[]): T | null {
    try {
      const cacheKey = JSON.stringify(key);
      const cached = localStorage.getItem(`cache_${cacheKey}`);

      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheData.timestamp > cacheData.ttl) {
        localStorage.removeItem(`cache_${cacheKey}`);
        return null;
      }

      return cacheData.data;
    } catch {
      return null;
    }
  },

  /**
   * 清除过期缓存
   */
  clearExpiredCache() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));

    keys.forEach(key => {
      try {
        const cached = JSON.parse(localStorage.getItem(key) || '{}');
        if (Date.now() - cached.timestamp > cached.ttl) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 生成唯一 ID
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
};

// 在应用启动时初始化服务层
servicesState.init();

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    servicesUtils.clearExpiredCache();
  }, 10 * 60 * 1000); // 每 10 分钟清理一次
}

export default {
  // API
  httpClient,
  queryClient,
  ApiProvider,

  // 查询键
  productKeys,
  userKeys,
  orderKeys,
  inventoryKeys,
  systemKeys,
  notificationKeys,
  uploadKeys,
  reportKeys,

  // 配置和工具
  servicesConfig,
  servicesState,
  servicesUtils,
  queryKeysManager,
  queryKeysUtils,

  // 类型
  ApiResponse,
  PaginatedResponse,
  ApiError,
};