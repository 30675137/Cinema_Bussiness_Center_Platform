import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { usePerformance } from './PerformanceProvider';

interface RequestMetrics {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: number;
  success: boolean;
  size?: number;
  retryCount?: number;
}

export class PerformanceInterceptor {
  private static instance: PerformanceInterceptor;
  private requests = new Map<string, RequestMetrics>();
  private retryAttempts = new Map<string, number>();

  private constructor() {
    this.setupAxiosInterceptor();
  }

  public static getInstance(): PerformanceInterceptor {
    if (!PerformanceInterceptor.instance) {
      PerformanceInterceptor.instance = new PerformanceInterceptor();
    }
    return PerformanceInterceptor.instance;
  }

  private setupAxiosInterceptor(): void {
    // 请求拦截器
    axios.interceptors.request.use(
      (config) => {
        const requestId = this.generateRequestId(config);
        const startTime = performance.now();

        this.requests.set(requestId, {
          url: config.url || '',
          method: config.method?.toUpperCase() || 'GET',
          startTime,
          endTime: 0,
          duration: 0,
          status: 0,
          success: false,
        });

        // 添加请求开始时间到请求头
        config.headers['X-Request-Start-Time'] = startTime.toString();
        config.headers['X-Request-ID'] = requestId;

        return config;
      },
      (error) => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    axios.interceptors.response.use(
      (response) => {
        const requestId = response.config.headers['X-Request-ID'] as string;
        const startTime = parseFloat(response.config.headers['X-Request-Start-Time'] as string);
        const endTime = performance.now();
        const duration = endTime - startTime;

        const metrics: RequestMetrics = {
          url: response.config.url || '',
          method: response.config.method?.toUpperCase() || 'GET',
          startTime,
          endTime,
          duration,
          status: response.status,
          success: response.status >= 200 && response.status < 400,
          size: this.calculateResponseSize(response),
          retryCount: this.retryAttempts.get(requestId) || 0,
        };

        // 记录性能数据
        this.recordMetrics(metrics);

        // 清理请求记录
        this.requests.delete(requestId);
        this.retryAttempts.delete(requestId);

        return response;
      },
      (error) => {
        const requestId = error.config?.headers['X-Request-ID'] as string;
        const startTime = error.config?.headers
          ? parseFloat(error.config.headers['X-Request-Start-Time'] as string)
          : performance.now();
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (requestId) {
          const metrics: RequestMetrics = {
            url: error.config?.url || '',
            method: error.config?.method?.toUpperCase() || 'GET',
            startTime,
            endTime,
            duration,
            status: error.response?.status || 0,
            success: false,
            retryCount: this.retryAttempts.get(requestId) || 0,
          };

          this.recordMetrics(metrics);

          // 清理请求记录
          this.requests.delete(requestId);
          this.retryAttempts.delete(requestId);
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(config: AxiosRequestConfig): string {
    return `${config.method}-${config.url}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateResponseSize(response: AxiosResponse): number {
    try {
      if (response.data) {
        if (typeof response.data === 'string') {
          return new Blob([response.data]).size;
        } else {
          return new Blob([JSON.stringify(response.data)]).size;
        }
      }
    } catch (error) {
      console.warn('计算响应大小时出错:', error);
    }
    return 0;
  }

  private recordMetrics(metrics: RequestMetrics): void {
    try {
      // 使用性能监控记录API调用
      const performanceMonitor = (window as any).__performanceMonitor;
      if (performanceMonitor && performanceMonitor.recordAPICall) {
        performanceMonitor.recordAPICall(
          `${metrics.method} ${metrics.url}`,
          metrics.duration,
          metrics.status
        );
      }

      // 在开发环境中输出详细的请求信息
      if (process.env.NODE_ENV === 'development') {
        const logLevel =
          metrics.duration > 1000 ? 'warn' : metrics.duration > 500 ? 'info' : 'debug';

        console[logLevel](`[API Request] ${metrics.method} ${metrics.url}`, {
          duration: `${metrics.duration.toFixed(2)}ms`,
          status: metrics.status,
          success: metrics.success,
          size: `${(metrics.size || 0 / 1024).toFixed(2)}KB`,
          retryCount: metrics.retryCount || 0,
        });
      }
    } catch (error) {
      console.warn('记录性能指标时出错:', error);
    }
  }

  // 获取所有请求指标
  public getAllMetrics(): RequestMetrics[] {
    return Array.from(this.requests.values());
  }

  // 获取慢请求
  public getSlowRequests(threshold = 1000): RequestMetrics[] {
    return this.getAllMetrics().filter((req) => req.duration > threshold);
  }

  // 获取失败的请求
  public getFailedRequests(): RequestMetrics[] {
    return this.getAllMetrics().filter((req) => !req.success);
  }

  // 重试失败的请求
  public async retryRequest(requestId: string): Promise<AxiosResponse> {
    const originalRequest = this.requests.get(requestId);
    if (!originalRequest) {
      throw new Error('Original request not found');
    }

    // 增加重试计数
    const currentRetryCount = this.retryAttempts.get(requestId) || 0;
    this.retryAttempts.set(requestId, currentRetryCount + 1);

    try {
      const response = await axios({
        url: originalRequest.url,
        method: originalRequest.method as any,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // 设置全局性能阈值
  public setPerformanceThresholds(thresholds: { warning: number; error: number }): void {
    // 这里可以实现更复杂的阈值逻辑
  }

  // 清理过期的请求记录
  public cleanup(): void {
    const now = performance.now();
    const timeout = 5 * 60 * 1000; // 5分钟

    for (const [requestId, request] of this.requests.entries()) {
      if (now - request.startTime > timeout) {
        this.requests.delete(requestId);
        this.retryAttempts.delete(requestId);
      }
    }
  }
}

// 导出单例实例
export const performanceInterceptor = PerformanceInterceptor.getInstance();

// React Hook for API性能监控
export const useAPIPerformance = () => {
  const [slowRequests, setSlowRequests] = useState<RequestMetrics[]>([]);
  const [failedRequests, setFailedRequests] = useState<RequestMetrics[]>([]);
  const [averageResponseTime, setAverageResponseTime] = useState(0);

  useEffect(() => {
    const updateMetrics = () => {
      const allMetrics = performanceInterceptor.getAllMetrics();

      // 更新慢请求
      setSlowRequests(performanceInterceptor.getSlowRequests(1000));

      // 更新失败请求
      setFailedRequests(performanceInterceptor.getFailedRequests());

      // 计算平均响应时间
      if (allMetrics.length > 0) {
        const totalTime = allMetrics.reduce((sum, req) => sum + req.duration, 0);
        setAverageResponseTime(totalTime / allMetrics.length);
      }
    };

    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // 立即更新一次

    return () => clearInterval(interval);
  }, []);

  return {
    slowRequests,
    failedRequests,
    averageResponseTime,
    retryRequest: performanceInterceptor.retryRequest.bind(performanceInterceptor),
    cleanup: performanceInterceptor.cleanup.bind(performanceInterceptor),
  };
};
