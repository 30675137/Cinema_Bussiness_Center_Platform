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

  // API性能
  api: {
    endpoint: string;
    duration: number;
    timestamp: number;
    status: number;
    success: boolean;
  }[];

  // 组件渲染性能
  components: {
    name: string;
    renderTime: number;
    mountTime: number;
    timestamp: number;
  }[];

  // 内存使用情况
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    timestamp: number;
  }[];

  // 网络性能
  network: {
    downlink: number;
    effectiveType: string;
    rtt: number;
    saveData: boolean;
  };
}

export interface PerformanceThresholds {
  pageLoadTime: number; // 页面加载时间 < 3秒
  apiResponseTime: number; // API响应时间 < 500ms
  componentRenderTime: number; // 组件渲染时间 < 100ms
  memoryUsageThreshold: number; // 内存使用阈值 80%
}

export interface PerformanceAlert {
  id: string;
  type: 'page_load' | 'api' | 'component' | 'memory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface WebVitals {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}
