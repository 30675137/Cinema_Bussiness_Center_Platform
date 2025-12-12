/**
 * API服务基类
 */
import { ApiResponse, PaginationResponse, QueryParams } from '../types/common';

// API配置
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};

// HTTP方法枚举
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// 请求配置接口
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

// API错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API服务基类
 */
export abstract class BaseApiService {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 获取认证token
   */
  protected getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * 获取完整的请求头
   */
  protected getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    // 添加认证token
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 添加自定义头部
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * 处理响应
   */
  protected async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data.code,
        data
      );
    }

    return data as ApiResponse<T>;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 带重试的请求
   */
  private async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    retries: number = API_CONFIG.RETRY_COUNT
  ): Promise<Response> {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(url, options);

        // 如果是成功响应或者客户端错误（4xx），不重试
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        // 服务器错误（5xx）才重试
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // 最后一次重试，直接抛出错误
        if (i === retries) {
          break;
        }

        // 等待后重试
        await this.delay(API_CONFIG.RETRY_DELAY * Math.pow(2, i));
      }
    }

    throw lastError!;
  }

  /**
   * 基础请求方法
   */
  protected async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = HttpMethod.GET,
      headers,
      body,
      timeout = API_CONFIG.TIMEOUT,
      retries,
      signal
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = this.getHeaders(headers);

    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // 如果传入了signal，需要组合两个signal
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await this.requestWithRetry<T>(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      }, retries);

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('请求超时', 408, 'TIMEOUT');
        }
        throw new ApiError(error.message, 500, 'NETWORK_ERROR');
      }

      throw error;
    }
  }

  /**
   * GET请求
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { ...config, method: HttpMethod.GET });
  }

  /**
   * POST请求
   */
  protected async post<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HttpMethod.POST, body: data });
  }

  /**
   * PUT请求
   */
  protected async put<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HttpMethod.PUT, body: data });
  }

  /**
   * DELETE请求
   */
  protected async delete<T>(
    endpoint: string,
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HttpMethod.DELETE });
  }

  /**
   * PATCH请求
   */
  protected async patch<T>(
    endpoint: string,
    data?: any,
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HttpMethod.PATCH, body: data });
  }

  /**
   * 分页查询
   */
  protected async getPaginated<T>(
    endpoint: string,
    params?: QueryParams,
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<PaginationResponse<T>> {
    const response = await this.get<PaginationResponse<T>>(endpoint, params, config);
    return response.data || { items: [], pagination: { current: 1, pageSize: 20, total: 0, totalPages: 0 } };
  }

  /**
   * 批量操作
   */
  protected async batchOperation<T>(
    endpoint: string,
    operation: 'create' | 'update' | 'delete',
    items: any[],
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<ApiResponse<T[]>> {
    return this.post<T[]>(`${endpoint}/batch`, {
      operation,
      items,
    }, config);
  }

  /**
   * 导出数据
   */
  protected async export(
    endpoint: string,
    params?: QueryParams,
    format: 'excel' | 'csv' | 'pdf' = 'excel'
  ): Promise<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders({ Accept: this.getExportContentType(format) });

    const response = await fetch(url, {
      method: HttpMethod.GET,
      headers,
      body: params ? new URLSearchParams(params as any).toString() : undefined,
    });

    if (!response.ok) {
      throw new ApiError(`导出失败: ${response.statusText}`, response.status);
    }

    return response.blob();
  }

  /**
   * 获取导出文件的内容类型
   */
  private getExportContentType(format: string): string {
    const contentTypes = {
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      pdf: 'application/pdf',
    };
    return contentTypes[format as keyof typeof contentTypes] || 'application/octet-stream';
  }

  /**
   * 上传文件
   */
  protected async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: Omit<RequestConfig, 'body' | 'method'>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = this.getHeaders();
    // 删除Content-Type，让浏览器自动设置multipart/form-data的boundary
    delete headers['Content-Type'];

    return this.request<T>(endpoint, {
      ...config,
      method: HttpMethod.POST,
      body: formData,
      headers,
    });
  }

  /**
   * 下载文件
   */
  protected async downloadFile(
    endpoint: string,
    filename?: string,
    params?: Record<string, any>
  ): Promise<void> {
    try {
      const blob = await this.export(endpoint, params, 'excel');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `export_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new ApiError('文件下载失败', 500, 'DOWNLOAD_ERROR');
    }
  }
}

export default BaseApiService;