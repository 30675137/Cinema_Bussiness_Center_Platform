import type {
  PerformanceMetrics,
  PerformanceThresholds,
  PerformanceAlert,
  WebVitals,
} from './types';

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private observers: PerformanceObserver[] = [];
  private alerts: PerformanceAlert[] = [];
  private static instance: PerformanceMonitor;

  private constructor() {
    this.metrics = {
      pageLoad: {
        domContentLoaded: 0,
        loadComplete: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
      },
      api: [],
      components: [],
      memory: [],
      network: {
        downlink: 0,
        effectiveType: '',
        rtt: 0,
        saveData: false,
      },
    };

    this.thresholds = {
      pageLoadTime: 3000,
      apiResponseTime: 500,
      componentRenderTime: 100,
      memoryUsageThreshold: 0.8,
    };

    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observePageLoad();
      this.observeWebVitals();
      this.observeNetwork();
    }
  }

  private observePageLoad(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          this.metrics.pageLoad.domContentLoaded =
            navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
          this.metrics.pageLoad.loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;

          this.checkPageLoadThresholds();
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  private observeWebVitals(): void {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.pageLoad.firstContentfulPaint = entry.startTime;
        }
      }
    });

    fcpObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(fcpObserver);

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.metrics.pageLoad.largestContentfulPaint = lastEntry.startTime;
      }
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.pageLoad.firstInputDelay = (entry as any).processingStart - entry.startTime;
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.pageLoad.cumulativeLayoutShift = clsValue;
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);
  }

  private observeNetwork(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.network = {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
  }

  public recordAPICall(endpoint: string, duration: number, status: number): void {
    const apiMetric = {
      endpoint,
      duration,
      timestamp: Date.now(),
      status,
      success: status >= 200 && status < 400,
    };

    this.metrics.api.push(apiMetric);

    // 只保留最近100个API调用记录
    if (this.metrics.api.length > 100) {
      this.metrics.api.shift();
    }

    this.checkAPIThresholds(apiMetric);
  }

  public recordComponentRender(componentName: string, renderTime: number, mountTime: number): void {
    const componentMetric = {
      name: componentName,
      renderTime,
      mountTime,
      timestamp: Date.now(),
    };

    this.metrics.components.push(componentMetric);

    // 只保留最近50个组件渲染记录
    if (this.metrics.components.length > 50) {
      this.metrics.components.shift();
    }

    this.checkComponentThresholds(componentMetric);
  }

  public recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryMetric = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      };

      this.metrics.memory.push(memoryMetric);

      // 只保留最近20个内存使用记录
      if (this.metrics.memory.length > 20) {
        this.metrics.memory.shift();
      }

      this.checkMemoryThresholds(memoryMetric);
    }
  }

  private checkPageLoadThresholds(): void {
    if (this.metrics.pageLoad.loadComplete > this.thresholds.pageLoadTime) {
      this.createAlert(
        'page_load',
        'high',
        `页面加载时间过长: ${this.metrics.pageLoad.loadComplete}ms`,
        this.metrics.pageLoad.loadComplete,
        this.thresholds.pageLoadTime
      );
    }
  }

  private checkAPIThresholds(apiMetric: any): void {
    if (apiMetric.duration > this.thresholds.apiResponseTime) {
      this.createAlert(
        'api',
        'medium',
        `API响应时间过长: ${apiMetric.endpoint} - ${apiMetric.duration}ms`,
        apiMetric.duration,
        this.thresholds.apiResponseTime
      );
    }
  }

  private checkComponentThresholds(componentMetric: any): void {
    if (componentMetric.renderTime > this.thresholds.componentRenderTime) {
      this.createAlert(
        'component',
        'medium',
        `组件渲染时间过长: ${componentMetric.name} - ${componentMetric.renderTime}ms`,
        componentMetric.renderTime,
        this.thresholds.componentRenderTime
      );
    }
  }

  private checkMemoryThresholds(memoryMetric: any): void {
    const memoryUsageRatio = memoryMetric.usedJSHeapSize / memoryMetric.jsHeapSizeLimit;
    if (memoryUsageRatio > this.thresholds.memoryUsageThreshold) {
      this.createAlert(
        'memory',
        'high',
        `内存使用率过高: ${(memoryUsageRatio * 100).toFixed(2)}%`,
        memoryUsageRatio * 100,
        this.thresholds.memoryUsageThreshold * 100
      );
    }
  }

  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    value: number,
    threshold: number
  ): void {
    const alert: PerformanceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      severity,
      message,
      value,
      threshold,
      timestamp: Date.now(),
    };

    this.alerts.push(alert);

    // 只保留最近50个警告
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    // 在开发环境中输出警告
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance Alert] ${message}`);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  public getWebVitals(): WebVitals {
    return {
      fcp: this.metrics.pageLoad.firstContentfulPaint,
      lcp: this.metrics.pageLoad.largestContentfulPaint,
      fid: this.metrics.pageLoad.firstInputDelay,
      cls: this.metrics.pageLoad.cumulativeLayoutShift,
      ttfb: this.metrics.pageLoad.loadComplete,
    };
  }

  public clearMetrics(): void {
    this.metrics = {
      pageLoad: {
        domContentLoaded: 0,
        loadComplete: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
      },
      api: [],
      components: [],
      memory: [],
      network: {
        downlink: 0,
        effectiveType: '',
        rtt: 0,
        saveData: false,
      },
    };
    this.alerts = [];
  }

  public destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

export default PerformanceMonitor;
