import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import type { ApiResponse, ErrorResponse } from '@/types';

// API基础配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  withCredentials: true,
};

// 创建axios实例
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = generateRequestId();

    // 添加时间戳
    config.headers['X-Timestamp'] = Date.now().toString();

    // 开发环境下打印请求信息
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 开发环境下打印响应信息
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', error);

    // 处理不同类型的错误
    if (error.response) {
      // 服务器响应错误
      handleServerError(error.response);
    } else if (error.request) {
      // 网络错误
      handleNetworkError(error);
    } else {
      // 其他错误
      handleOtherError(error);
    }

    return Promise.reject(error);
  }
);

// 错误处理函数
const handleServerError = (response: AxiosResponse) => {
  const { status, data } = response;
  const errorData = data as ErrorResponse;

  switch (status) {
    case 401:
      // 未授权，清除token并跳转登录
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      break;
    case 403:
      // 权限不足
      console.error('权限不足:', errorData.message);
      break;
    case 404:
      // 资源不存在
      console.error('资源不存在:', errorData.message);
      break;
    case 422:
      // 验证错误
      console.error('数据验证失败:', errorData.details);
      break;
    case 500:
      // 服务器内部错误
      console.error('服务器内部错误:', errorData.message);
      break;
    default:
      console.error(`未知错误 (${status}):`, errorData.message);
  }
};

const handleNetworkError = (error: AxiosError) => {
  console.error('网络连接失败，请检查网络设置');

  // 网络错误处理逻辑（可选：添加重试）
};

const handleOtherError = (error: AxiosError) => {
  console.error('请求配置错误:', error.message);
};

// 工具函数
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// API方法封装
class ApiService {
  // GET请求
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // POST请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PUT请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PATCH请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // DELETE请求
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // 文件上传
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await apiClient.post<ApiResponse<T>>(url, formData, uploadConfig);
    return response.data;
  }

  // 批量上传
  async uploadMultiple<T = any>(
    url: string,
    files: File[],
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await apiClient.post<ApiResponse<T>>(url, formData, uploadConfig);
    return response.data;
  }

  // 取消请求
  cancelRequest(message?: string) {
    const controller = new AbortController();
    controller.abort(message);
    return controller;
  }
}

// 创建API服务实例
export const apiService = new ApiService();

// 导出axios实例供高级用法
export { apiClient };

// 导出类型
export type { AxiosRequestConfig, AxiosResponse, AxiosError };