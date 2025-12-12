/**
 * 监控和性能分析工具
 */

// 性能指标接口
export interface PerformanceMetrics {
  // 页面加载性能
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };

  // 资源加载性能
  resources: {
    totalResources: number;
    totalSize: number;
    slowResources: Array<{
      name: string;
      duration: number;
      size: number;
    }>;
  };

  // 用户交互性能
  interactions: {
    totalInteractions: number;
    slowInteractions: number;
    averageResponseTime: number;
  };

  // 内存使用
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };

  // 网络性能
  network: {
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    slowEndpoints: Array<{
      url: string;
      method: string;
      duration: number;
      status: number;
    }>;
  };
}

// 错误监控接口
export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  recentErrors: Array<{
    type: string;
    message: string;
    stack?: string;
    url: string;
    timestamp: number;
    userAgent: string;
  }>;
}

// 用户行为分析接口
export interface UserBehaviorMetrics {
  sessionDuration: number;
  pageViews: number;
  uniquePageViews: number;
  bounceRate: number;
  topPages: Array<{
    url: string;
    views: number;
    avgDuration: number;
  }>;
  userEvents: Array<{
    category: string;
    action: string;
    label?: string;
    value?: number;
    timestamp: number;
  }>;
}

// 监控配置接口
export interface MonitoringConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  sampleRate: number; // 0-1
  maxErrors: number;
  maxMetrics: number;
  flushInterval: number; // 毫秒
  enablePerformanceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserBehaviorTracking: boolean;
  enableNetworkMonitoring: boolean;
}

/**
 * 监控管理类
 */
export class MonitoringManager {
  private static instance: MonitoringManager;
  private config: MonitoringConfig;
  private metrics: PerformanceMetrics;
  private errorMetrics: ErrorMetrics;
  private behaviorMetrics: UserBehaviorMetrics;
  private startTime: number;
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxErrors: 100,
      maxMetrics: 1000,
      flushInterval: 30000, // 30秒
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableUserBehaviorTracking: true,
      enableNetworkMonitoring: true
    };

    this.startTime = Date.now();
    this.initializeMetrics();

    if (this.config.enabled) {
      this.setupObservers();
      this.setupErrorHandlers();
      this.setupNetworkInterceptors();
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager();
    }
    return MonitoringManager.instance;
  }

  /**
   * 配置监控
   */
  configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 初始化指标
   */
  private initializeMetrics(): void {
    this.metrics = {
      pageLoad: {
        domContentLoaded: 0,
        loadComplete: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0
      },
      resources: {
        totalResources: 0,
        totalSize: 0,
        slowResources: []
      },
      interactions: {
        totalInteractions: 0,
        slowInteractions: 0,
        averageResponseTime: 0
      },
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      },
      network: {
        totalRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        slowEndpoints: []
      }
    };

    this.errorMetrics = {
      totalErrors: 0,
      errorsByType: {},
      recentErrors: []
    };

    this.behaviorMetrics = {
      sessionDuration: 0,
      pageViews: 0,
      uniquePageViews: 0,
      bounceRate: 0,
      topPages: [],
      userEvents: []
    };
  }

  /**
   * 设置性能观察器
   */
  private setupObservers(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // 页面加载性能观察器
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      this.observers.push(observer);
    }
  }

  /**
   * 处理性能条目
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.metrics.pageLoad.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
        this.metrics.pageLoad.loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;
        break;

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.pageLoad.firstContentfulPaint = entry.startTime;
        }
        break;

      case 'largest-contentful-paint':
        this.metrics.pageLoad.largestContentfulPaint = entry.startTime;
        break;

      case 'first-input':
        this.metrics.pageLoad.firstInputDelay = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        break;

      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.metrics.pageLoad.cumulativeLayoutShift += (entry as any).value;
        }
        break;
    }
  }

  /**
   * 设置错误处理器
   */
  private setupErrorHandlers(): void {
    if (!this.config.enableErrorTracking) return;

    // JavaScript 错误
    window.addEventListener('error', (event) => {
      this.trackError('javascript', event.message, event.error?.stack);
    });

    // Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise', event.reason?.message || 'Unhandled Promise Rejection');
    });

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError('resource', `Failed to load ${event.target}`, '', (event.target as any).src || (event.target as any).href);
      }
    }, true);
  }

  /**
   * 设置网络拦截器
   */
  private setupNetworkInterceptors(): void {
    if (!this.config.enableNetworkMonitoring) return;

    // 拦截 fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [input, init] = args;
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.trackNetworkRequest(url, method, duration, response.status);

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.trackNetworkRequest(url, method, duration, 0);
        throw error;
      }
    };

    // 拦截 XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      this._method = method;
      this._url = url.toString();
      this._startTime = performance.now();
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args: any[]) {
      this.addEventListener('loadend', () => {
        const duration = performance.now() - this._startTime;
        this.trackNetworkRequest(this._url, this._method, duration, this.status);
      }.bind(this));

      return originalXHRSend.apply(this, args);
    };
  }

  /**
   * 跟踪错误
   */
  trackError(type: string, message: string, stack?: string, url?: string): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) return;

    this.errorMetrics.totalErrors++;
    this.errorMetrics.errorsByType[type] = (this.errorMetrics.errorsByType[type] || 0) + 1;

    const error = {
      type,
      message,
      stack,
      url: url || window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    this.errorMetrics.recentErrors.unshift(error);

    // 限制错误数量
    if (this.errorMetrics.recentErrors.length > this.config.maxErrors) {
      this.errorMetrics.recentErrors = this.errorMetrics.recentErrors.slice(0, this.config.maxErrors);
    }

    this.flushData();
  }

  /**
   * 跟踪网络请求
   */
  trackNetworkRequest(url: string, method: string, duration: number, status: number): void {
    if (!this.config.enabled || !this.config.enableNetworkMonitoring) return;

    this.metrics.network.totalRequests++;

    if (status >= 400) {
      this.metrics.network.failedRequests++;
    }

    // 更新平均响应时间
    const totalDuration = this.metrics.network.averageResponseTime * (this.metrics.network.totalRequests - 1);
    this.metrics.network.averageResponseTime = (totalDuration + duration) / this.metrics.network.totalRequests;

    // 记录慢请求（超过2秒）
    if (duration > 2000) {
      this.metrics.network.slowEndpoints.push({
        url: this.sanitizeUrl(url),
        method,
        duration,
        status
      });

      // 限制慢端点数量
      if (this.metrics.network.slowEndpoints.length > 50) {
        this.metrics.network.slowEndpoints = this.metrics.network.slowEndpoints.slice(-50);
      }
    }
  }

  /**
   * 跟踪用户行为
   */
  trackUserAction(category: string, action: string, label?: string, value?: number): void {
    if (!this.config.enabled || !this.config.enableUserBehaviorTracking) return;

    const event = {
      category,
      action,
      label,
      value,
      timestamp: Date.now()
    };

    this.behaviorMetrics.userEvents.push(event);

    // 限制事件数量
    if (this.behaviorMetrics.userEvents.length > this.config.maxMetrics) {
      this.behaviorMetrics.userEvents = this.behaviorMetrics.userEvents.slice(-this.config.maxMetrics);
    }
  }

  /**
   * 跟踪页面视图
   */
  trackPageView(url: string, title?: string): void {
    if (!this.config.enabled || !this.config.enableUserBehaviorTracking) return;

    this.behaviorMetrics.pageViews++;

    // 检查是否为唯一页面视图
    const isNewPage = !this.behaviorMetrics.topPages.find(page => page.url === url);
    if (isNewPage) {
      this.behaviorMetrics.uniquePageViews++;
    }

    // 更新页面统计
    const pageIndex = this.behaviorMetrics.topPages.findIndex(page => page.url === url);
    if (pageIndex >= 0) {
      this.behaviorMetrics.topPages[pageIndex].views++;
    } else {
      this.behaviorMetrics.topPages.push({
        url,
        views: 1,
        avgDuration: 0
      });
    }

    // 限制页面数量
    if (this.behaviorMetrics.topPages.length > 100) {
      this.behaviorMetrics.topPages = this.behaviorMetrics.topPages.slice(-100);
    }
  }

  /**
   * 更新内存指标
   */
  updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    this.updateMemoryMetrics();
    return { ...this.metrics };
  }

  /**
   * 获取错误指标
   */
  getErrorMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  /**
   * 获取用户行为指标
   */
  getUserBehaviorMetrics(): UserBehaviorMetrics {
    const sessionDuration = Date.now() - this.startTime;
    return {
      ...this.behaviorMetrics,
      sessionDuration
    };
  }

  /**
   * 清理URL（移除敏感信息）
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // 移除查询参数中的敏感信息
      urlObj.search = '';
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * 发送数据到监控服务器
   */
  private async flushData(): Promise<void> {
    if (!this.config.endpoint) return;

    try {
      const data = {
        performance: this.getPerformanceMetrics(),
        errors: this.getErrorMetrics(),
        behavior: this.getUserBehaviorMetrics(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey || ''
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.warn('Failed to send monitoring data:', error);
    }
  }

  /**
   * 清理观察器
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// 创建全局监控管理器实例
export const monitoring = MonitoringManager.getInstance();

// 便捷函数
export const trackError = (error: Error | string, context?: string) => {
  if (typeof error === 'string') {
    monitoring.trackError('manual', error, '', context);
  } else {
    monitoring.trackError('manual', error.message, error.stack, context);
  }
};

export const trackUserAction = (category: string, action: string, label?: string, value?: number) => {
  monitoring.trackUserAction(category, action, label, value);
};

export const trackPageView = (url?: string) => {
  monitoring.trackPageView(url || window.location.href, document.title);
};

export const getMetrics = () => {
  return {
    performance: monitoring.getPerformanceMetrics(),
    errors: monitoring.getErrorMetrics(),
    behavior: monitoring.getUserBehaviorMetrics()
  };
};