# 前端性能监控系统

这是一个基于React + TypeScript的全面性能监控系统，提供实时性能监控、优化建议和详细的性能分析报告。

## 功能特性

### 🔍 性能监控

- **页面加载性能**: 监控DOM加载时间、首次内容绘制时间等
- **API响应性能**: 跟踪API请求时间、重试机制和错误率
- **组件渲染性能**: 监控组件渲染时间、重渲染频率
- **内存使用情况**: 实时监控JavaScript堆内存使用情况
- **Web Vitals**: 集成Google Web Vitals核心指标

### ⚡ 性能优化

- **代码分割优化**: 智能懒加载和预加载策略
- **图片懒加载**: 支持占位符、渐进式加载和现代图片格式
- **虚拟滚动**: 高性能长列表渲染，支持动态高度
- **缓存策略**: 多级缓存支持，LRU/LFU/FIFO淘汰策略

### 📊 性能分析

- **实时性能面板**: 可视化性能指标和警告信息
- **Bundle分析**: 分析打包大小、重复模块和优化建议
- **性能报告**: 自动生成详细的性能分析报告
- **性能告警**: 智能阈值检测和告警系统

## 快速开始

### 1. 安装依赖

```bash
npm install web-vitals
```

### 2. 配置性能监控

在应用的根组件中包装`PerformanceProvider`：

```tsx
import React from 'react';
import { PerformanceProvider } from './monitoring/PerformanceProvider';

function App() {
  return <PerformanceProvider>{/* 你的应用组件 */}</PerformanceProvider>;
}
```

### 3. 启用性能监控

在`monitoring/config.ts`中配置监控选项：

```typescript
export const PERFORMANCE_CONFIG = {
  monitoring: {
    enabled: true,
    samplingRate: 1.0,
    reportToConsole: true,
  },
  thresholds: {
    pageLoadTime: 3000,
    apiResponseTime: 500,
    componentRenderTime: 100,
  },
  // ... 其他配置
};
```

## 使用指南

### 基础使用

#### 1. 访问性能面板

在浏览器中访问 `/performance` 路由，查看实时性能数据。

#### 2. 监控API性能

自动监控所有axios请求：

```typescript
import axios from 'axios';

// 请求会被自动监控
const response = await axios.get('/api/users');
```

#### 3. 组件性能跟踪

使用提供的Hook跟踪组件性能：

```tsx
import { usePerformanceTracking } from './hooks/usePerformanceTracking';

function MyComponent() {
  const { onRender } = usePerformanceTracking('MyComponent');

  return (
    <React.Profiler id="MyComponent" onRender={onRender}>
      {/* 组件内容 */}
    </React.Profiler>
  );
}
```

### 高级使用

#### 1. 懒加载组件

```tsx
import { LazyLoadWrapper } from './optimization/LazyLoadWrapper';

const LazyComponent = () => (
  <LazyLoadWrapper
    loader={() => import('./components/HeavyComponent')}
    fallback={<div>Loading...</div>}
  />
);
```

#### 2. 图片懒加载

```tsx
import { LazyImage } from './optimization/LazyImage';

<LazyImage
  src="/path/to/image.jpg"
  alt="描述"
  placeholder="/path/to/placeholder.jpg"
  threshold={0.1}
/>;
```

#### 3. 虚拟滚动

```tsx
import VirtualScroll from './optimization/VirtualScroll';

<VirtualScroll
  data={largeDataSet}
  itemHeight={50}
  containerHeight={400}
  renderItem={(item, index) => <div>{item.name}</div>}
/>;
```

#### 4. 缓存管理

```tsx
import { apiCache } from './optimization/CacheManager';

// 缓存API请求
const data = await apiCache.request(
  'users',
  () => fetch('/api/users').then((r) => r.json()),
  5 * 60 * 1000 // 5分钟TTL
);
```

## 性能指标说明

### Web Vitals指标

- **FCP (First Contentful Paint)**: 首次内容绘制时间，目标 < 1.8秒
- **LCP (Largest Contentful Paint)**: 最大内容绘制时间，目标 < 2.5秒
- **FID (First Input Delay)**: 首次输入延迟，目标 < 100ms
- **CLS (Cumulative Layout Shift)**: 累积布局偏移，目标 < 0.1
- **TTFB (Time to First Byte)**: 首字节时间，目标 < 800ms

### 组件性能指标

- **渲染时间**: 组件单次渲染耗时，目标 < 100ms
- **挂载时间**: 组件首次挂载耗时，目标 < 500ms
- **重渲染次数**: 避免不必要的重渲染，目标 < 10次

### API性能指标

- **响应时间**: API请求总耗时，目标 < 500ms
- **成功率**: API请求成功率，目标 > 99%
- **重试率**: 失败重试比例，目标 < 5%

## 性能优化建议

### 页面加载优化

1. **启用资源压缩**: 使用gzip/brotli压缩
2. **优化关键渲染路径**: 减少关键资源数量
3. **使用CDN**: 加速静态资源加载
4. **预加载关键资源**: 使用`<link rel="preload">`

### API性能优化

1. **实现缓存策略**: 减少重复请求
2. **请求合并**: 减少HTTP请求数量
3. **使用GraphQL**: 按需获取数据
4. **连接复用**: 使用HTTP/2

### 组件性能优化

1. **使用React.memo**: 避免不必要的重渲染
2. **合理使用useMemo/useCallback**: 优化计算和函数引用
3. **拆分大组件**: 提高渲染效率
4. **虚拟化长列表**: 使用虚拟滚动

### Bundle优化

1. **代码分割**: 按路由和功能分割代码
2. **Tree Shaking**: 移除未使用代码
3. **依赖优化**: 使用更轻量的替代库
4. **压缩优化**: 启用更高效的压缩算法

## 配置选项

### 监控配置

```typescript
export const PERFORMANCE_CONFIG = {
  monitoring: {
    enabled: boolean, // 是否启用监控
    samplingRate: number, // 采样率 (0-1)
    reportToConsole: boolean, // 是否输出到控制台
    reportToAnalytics: boolean, // 是否上报到分析平台
  },
  thresholds: {
    pageLoadTime: number, // 页面加载时间阈值
    apiResponseTime: number, // API响应时间阈值
    componentRenderTime: number, // 组件渲染时间阈值
    memoryUsageThreshold: number, // 内存使用阈值
  },
  // ... 更多配置选项
};
```

### 缓存配置

```typescript
const cacheOptions = {
  maxSize: 200, // 最大缓存条目数
  ttl: 5 * 60 * 1000, // 默认TTL (5分钟)
  strategy: 'lru', // 淘汰策略: 'lru' | 'lfu' | 'fifo'
  compressionEnabled: true, // 是否启用压缩
};
```

## 故障排除

### 常见问题

1. **性能监控未启用**
   - 检查`PERFORMANCE_CONFIG.monitoring.enabled`是否为true
   - 确认环境变量`REACT_APP_PERF_MONITORING=true`

2. **Web Vitals数据不准确**
   - 确保在页面加载完成后初始化监控
   - 检查浏览器兼容性

3. **Bundle分析失败**
   - 确认webpack stats文件存在
   - 检查构建工具配置

### 调试模式

在开发环境中，性能监控会输出详细的调试信息：

```bash
# 启用详细日志
REACT_APP_PERF_MONITORING=true npm start
```

## 扩展开发

### 添加自定义指标

```typescript
import PerformanceMonitor from './monitoring/PerformanceMonitor';

// 添加自定义性能指标
PerformanceMonitor.getInstance().recordCustomMetric('custom_metric', value);
```

### 集成第三方监控服务

```typescript
// 集成Sentry、DataDog等监控服务
import * as Sentry from '@sentry/react';

const webVitalsMonitor = WebVitalsMonitor.getInstance({
  onReport: (metric) => {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: metric.name,
      data: metric,
    });
  },
});
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0

- 初始版本发布
- 基础性能监控功能
- Web Vitals集成
- Bundle分析工具
- 性能优化组件
