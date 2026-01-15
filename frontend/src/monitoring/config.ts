// 性能监控配置
export const PERFORMANCE_CONFIG = {
  // 监控开关
  monitoring: {
    enabled:
      process.env.NODE_ENV === 'development' || process.env.REACT_APP_PERF_MONITORING === 'true',
    samplingRate: 1.0, // 采样率：1.0表示100%采样
    reportToConsole: true,
    reportToAnalytics: false,
  },

  // 页面加载性能阈值
  thresholds: {
    pageLoadTime: 3000, // 页面加载时间 < 3秒
    firstContentfulPaint: 1800, // 首次内容绘制 < 1.8秒
    largestContentfulPaint: 2500, // 最大内容绘制 < 2.5秒
    firstInputDelay: 100, // 首次输入延迟 < 100ms
    cumulativeLayoutShift: 0.1, // 累积布局偏移 < 0.1
    timeToFirstByte: 800, // 首字节时间 < 800ms
  },

  // API性能阈值
  api: {
    responseTime: 500, // API响应时间 < 500ms
    timeout: 10000, // API超时时间 10秒
    retryAttempts: 3, // 最大重试次数
    batchSize: 100, // 批量请求大小
  },

  // 组件性能阈值
  components: {
    renderTime: 100, // 组件渲染时间 < 100ms
    mountTime: 500, // 组件挂载时间 < 500ms
    reRenderLimit: 10, // 最大重渲染次数
    staleThreshold: 30000, // 组件stale阈值 30秒
  },

  // 内存使用阈值
  memory: {
    usageThreshold: 0.8, // 内存使用阈值 80%
    monitorInterval: 10000, // 监控间隔 10秒
    gcTriggerThreshold: 0.9, // GC触发阈值 90%
  },

  // 缓存配置
  cache: {
    defaultTTL: 5 * 60 * 1000, // 默认TTL 5分钟
    maxSize: 200, // 最大缓存条目数
    strategy: 'lru' as const, // 淘汰策略
    compressionEnabled: true, // 启用压缩
  },

  // 代码分割配置
  codeSplitting: {
    enabled: true,
    chunkSizeLimit: 150000, // chunk大小限制 150KB
    preloadCriticalChunks: true,
    prefetchOnIdle: true,
    prefetchOnHover: true,
  },

  // 图片优化配置
  images: {
    lazyLoading: true,
    placeholderEnabled: true,
    progressiveLoading: true,
    formats: ['webp', 'avif', 'jpeg'],
    quality: 80,
    sizes: {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 800, height: 600 },
      large: { width: 1920, height: 1080 },
    },
  },

  // 虚拟滚动配置
  virtualScroll: {
    enabled: true,
    overscan: 5, // 预渲染项目数
    threshold: 50, // 触发加载更多阈值
    itemHeightEstimate: 50, // 估计项目高度
  },

  // Bundle分析配置
  bundleAnalysis: {
    enabled: process.env.NODE_ENV === 'development',
    reportDuplicates: true,
    reportLargeModules: true,
    moduleSizeThreshold: 50000, // 模块大小阈值 50KB
  },

  // 性能报告配置
  reporting: {
    interval: 30000, // 报告间隔 30秒
    maxReports: 100, // 最大报告数量
    aggregateStats: true, // 聚合统计
    exportEnabled: true, // 导出功能
    exportFormat: 'json', // 导出格式
  },
};

// Web Vitals评分等级
export const WEB_VITALS_RATINGS = {
  fcp: {
    good: 1000,
    needsImprovement: 3000,
  },
  lcp: {
    good: 2500,
    needsImprovement: 4000,
  },
  fid: {
    good: 100,
    needsImprovement: 300,
  },
  ttfb: {
    good: 800,
    needsImprovement: 1800,
  },
  cls: {
    good: 0.1,
    needsImprovement: 0.25,
  },
};

// 性能优化建议
export const PERFORMANCE_TIPS = {
  pageLoad: [
    '启用gzip/brotli压缩',
    '使用CDN加速静态资源',
    '优化关键渲染路径',
    '减少HTTP请求数量',
    '启用浏览器缓存',
    '使用HTTP/2',
    '预加载关键资源',
    '内联关键CSS',
  ],

  api: [
    '使用缓存策略',
    '实现请求合并',
    '启用API压缩',
    '使用GraphQL减少数据传输',
    '实现请求去重',
    '优化数据库查询',
    '使用连接池',
  ],

  components: [
    '使用React.memo优化重渲染',
    '使用useMemo和useCallback',
    '避免在render中创建对象',
    '合理使用状态管理',
    '拆分大型组件',
    '使用虚拟化长列表',
    '懒加载非关键组件',
  ],

  images: [
    '使用现代图片格式',
    '实现响应式图片',
    '使用CSS sprites',
    '启用图片懒加载',
    '压缩图片文件',
    '使用图片CDN',
    '实现渐进式加载',
  ],

  bundle: [
    '启用tree shaking',
    '使用代码分割',
    '移除未使用的依赖',
    '优化webpack配置',
    '使用模块联邦',
    '压缩生产代码',
    '分析bundle大小',
  ],
};

// 性能监控事件
export const PERFORMANCE_EVENTS = {
  // 页面性能事件
  PAGE_LOAD_START: 'page-load-start',
  PAGE_LOAD_END: 'page-load-end',
  FIRST_CONTENTFUL_PAINT: 'first-contentful-paint',
  LARGEST_CONTENTFUL_PAINT: 'largest-contentful-paint',
  FIRST_INPUT_DELAY: 'first-input-delay',
  CUMULATIVE_LAYOUT_SHIFT: 'cumulative-layout-shift',

  // API性能事件
  API_REQUEST_START: 'api-request-start',
  API_REQUEST_END: 'api-request-end',
  API_REQUEST_ERROR: 'api-request-error',
  API_RETRY: 'api-retry',

  // 组件性能事件
  COMPONENT_MOUNT: 'component-mount',
  COMPONENT_UPDATE: 'component-update',
  COMPONENT_UNMOUNT: 'component-unmount',
  COMPONENT_SLOW_RENDER: 'component-slow-render',

  // 内存性能事件
  MEMORY_WARNING: 'memory-warning',
  MEMORY_CRITICAL: 'memory-critical',
  GARBAGE_COLLECTION: 'garbage-collection',

  // 用户体验事件
  USER_INTERACTION: 'user-interaction',
  PERFORMANCE_DEGRADED: 'performance-degraded',
  PERFORMANCE_RESTORED: 'performance-restored',
};

// 错误类型定义
export const PERFORMANCE_ERROR_TYPES = {
  SLOW_PAGE_LOAD: 'slow-page-load',
  SLOW_API_RESPONSE: 'slow-api-response',
  SLOW_COMPONENT_RENDER: 'slow-component-render',
  HIGH_MEMORY_USAGE: 'high-memory-usage',
  BUNDLE_TOO_LARGE: 'bundle-too-large',
  NETWORK_ERROR: 'network-error',
  RESOURCE_ERROR: 'resource-error',
} as const;

// 监控目标
export const MONITORING_TARGETS = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  DEVELOPMENT: 'development',
} as const;

// 性能等级定义
export const PERFORMANCE_GRADES = {
  EXCELLENT: 'A',
  GOOD: 'B',
  NEEDS_IMPROVEMENT: 'C',
  POOR: 'D',
  CRITICAL: 'F',
} as const;

// 性能报告模板
export const REPORT_TEMPLATES = {
  summary: {
    title: '性能监控报告',
    sections: ['overview', 'webVitals', 'api', 'components', 'recommendations'],
  },

  detailed: {
    title: '详细性能分析报告',
    sections: [
      'executiveSummary',
      'webVitals',
      'pageLoad',
      'apiPerformance',
      'componentPerformance',
      'memoryUsage',
      'bundleAnalysis',
      'recommendations',
      'actionItems',
    ],
  },

  realTime: {
    title: '实时性能监控',
    sections: ['currentMetrics', 'alerts', 'trends', 'systemHealth'],
  },
};

export default PERFORMANCE_CONFIG;
