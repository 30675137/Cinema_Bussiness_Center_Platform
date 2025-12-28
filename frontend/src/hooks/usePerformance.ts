import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * 性能监控接口
 */
export interface PerformanceMetrics {
  /** 渲染次数 */
  renderCount: number;
  /** 最后一次渲染时间 */
  lastRenderTime: number;
  /** 总渲染时间 */
  totalRenderTime: number;
  /** 平均渲染时间 */
  averageRenderTime: number;
  /** 最长渲染时间 */
  maxRenderTime: number;
  /** 内存使用情况 */
  memoryUsage?: {
    used: number;
    total: number;
  };
}

/**
 * 性能监控配置接口
 */
export interface PerformanceMonitorConfig {
  /** 是否启用性能监控 */
  enabled?: boolean;
  /** 渲染时间阈值（毫秒） */
  renderThreshold?: number;
  /** 是否记录每次渲染 */
  logRerenders?: boolean;
  /** 是否监控内存使用 */
  trackMemory?: boolean;
  /** 组件名称，用于调试 */
  componentName?: string;
  /** 性能警告回调 */
  onPerformanceWarning?: (metrics: PerformanceMetrics) => void;
}

/**
 * 性能监控Hook
 *
 * 使用示例：
 * ```tsx
 * const { metrics, startMeasure, endMeasure, recordCustomMetric } = usePerformance({
 *   enabled: true,
 *   renderThreshold: 16,
 *   componentName: 'MyComponent'
 * });
 * ```
 */
export const usePerformance = (config: PerformanceMonitorConfig = {}) => {
  const {
    enabled = true,
    renderThreshold = 16,
    logRerenders = false,
    trackMemory = false,
    componentName = 'Component',
    onPerformanceWarning
  } = config;

  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const totalRenderTimeRef = useRef(0);
  const maxRenderTimeRef = useRef(0);
  const customMetricsRef = useRef<Record<string, number>>({});
  const activeMeasuresRef = useRef<Record<string, number>>({});

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    totalRenderTime: 0,
    averageRenderTime: 0,
    maxRenderTime: 0,
  });

  // 内存监控
  const getMemoryUsage = useCallback(() => {
    if (!trackMemory || typeof performance === 'undefined' || !performance.memory) {
      return undefined;
    }

    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
    };
  }, [trackMemory]);

  // 更新指标
  const updateMetrics = useCallback(() => {
    const renderTimes = renderTimesRef.current;
    const renderCount = renderCountRef.current;

    const averageRenderTime = renderCount > 0
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderCount
      : 0;

    const newMetrics: PerformanceMetrics = {
      renderCount,
      lastRenderTime: renderTimes[renderTimes.length - 1] || 0,
      totalRenderTime: totalRenderTimeRef.current,
      averageRenderTime,
      maxRenderTime: maxRenderTimeRef.current,
      memoryUsage: getMemoryUsage(),
    };

    setMetrics(newMetrics);

    // 性能警告
    if (onPerformanceWarning && newMetrics.lastRenderTime > renderThreshold) {
      onPerformanceWarning(newMetrics);
    }

    // 控制台日志
    if (logRerenders) {
      console.log(
        `[Performance] ${componentName} render #${renderCount} - ` +
        `${newMetrics.lastRenderTime.toFixed(2)}ms (avg: ${averageRenderTime.toFixed(2)}ms)`,
        { metrics: newMetrics }
      );
    }
  }, [componentName, renderThreshold, logRerenders, onPerformanceWarning, getMemoryUsage]);

  // 开始性能测量
  const startMeasure = useCallback((measureName?: string) => {
    const name = measureName || 'render';
    if (enabled) {
      activeMeasuresRef.current[name] = performance.now();
    }
  }, [enabled]);

  // 结束性能测量
  const endMeasure = useCallback((measureName?: string) => {
    const name = measureName || 'render';
    const startTime = activeMeasuresRef.current[name];

    if (enabled && startTime) {
      const duration = performance.now() - startTime;
      delete activeMeasuresRef.current[name];

      if (name === 'render') {
        renderCountRef.current += 1;
        renderTimesRef.current.push(duration);
        totalRenderTimeRef.current += duration;
        maxRenderTimeRef.current = Math.max(maxRenderTimeRef.current, duration);
        updateMetrics();
      }

      return duration;
    }
    return 0;
  }, [enabled, updateMetrics]);

  // 记录自定义指标
  const recordCustomMetric = useCallback((name: string, value: number) => {
    if (enabled) {
      customMetricsRef.current[name] = value;

      if (logRerenders) {
        console.log(`[Performance] ${componentName} ${name}: ${value}`);
      }
    }
  }, [enabled, componentName, logRerenders]);

  // 获取自定义指标
  const getCustomMetric = useCallback((name: string) => {
    return customMetricsRef.current[name];
  }, []);

  // 清除所有指标
  const clearMetrics = useCallback(() => {
    renderCountRef.current = 0;
    renderTimesRef.current = [];
    totalRenderTimeRef.current = 0;
    maxRenderTimeRef.current = 0;
    customMetricsRef.current = {};
    activeMeasuresRef.current = {};
    updateMetrics();
  }, [updateMetrics]);

  // 渲染性能监控
  useEffect(() => {
    if (!enabled) return;

    startMeasure('render');

    return () => {
      endMeasure('render');
    };
  }, [enabled, startMeasure, endMeasure]);

  // 内存监控
  useEffect(() => {
    if (!enabled || !trackMemory) return;

    const interval = setInterval(() => {
      const memoryUsage = getMemoryUsage();
      if (memoryUsage && onPerformanceWarning && memoryUsage.used > memoryUsage.total * 0.9) {
        onPerformanceWarning({
          ...metrics,
          memoryUsage,
          lastRenderTime: 0, // 标记为内存警告而非渲染警告
        } as PerformanceMetrics);
      }
    }, 5000); // 每5秒检查一次内存

    return () => clearInterval(interval);
  }, [enabled, trackMemory, getMemoryUsage, onPerformanceWarning, metrics]);

  return {
    metrics,
    startMeasure,
    endMeasure,
    recordCustomMetric,
    getCustomMetric,
    clearMetrics,
  };
};

/**
 * 组合性能监控Hook，用于同时监控多个组件
 */
export const useCombinedPerformance = (configs: Array<{ config: PerformanceMonitorConfig; key: string }>) => {
  const results = configs.map(({ config, key }) => ({
    key,
    ...usePerformance({ ...config, componentName: config.componentName || key }),
  }));

  const combinedMetrics = Object.fromEntries(
    results.map(({ key, metrics }) => [key, metrics])
  );

  const getAllMetrics = useCallback(() => combinedMetrics, [combinedMetrics]);

  const startMeasure = useCallback((key: string, measureName?: string) => {
    const hook = results.find(r => r.key === key);
    return hook?.startMeasure(measureName);
  }, [results]);

  const endMeasure = useCallback((key: string, measureName?: string) => {
    const hook = results.find(r => r.key === key);
    return hook?.endMeasure(measureName);
  }, [results]);

  return {
    metrics: combinedMetrics,
    getAllMetrics,
    startMeasure,
    endMeasure,
  };
};

/**
 * 性能分析Hook，提供详细的性能分析数据
 */
export const usePerformanceAnalysis = (config: PerformanceMonitorConfig = {}) => {
  const performance = usePerformance(config);
  const [analysis, setAnalysis] = useState<{
    renderTrend: number[]; // 最近10次渲染时间趋势
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    recommendations: string[];
  }>({
    renderTrend: [],
    performanceGrade: 'A',
    recommendations: [],
  });

  // 更新性能分析
  useEffect(() => {
    if (!performance.metrics.renderCount) return;

    const { lastRenderTime, averageRenderTime, maxRenderTime } = performance.metrics;

    // 更新趋势数据
    setAnalysis(prev => {
      const newTrend = [...prev.renderTrend, lastRenderTime].slice(-10);

      // 性能等级评估
      let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
      const recommendations: string[] = [];

      if (averageRenderTime > 50) {
        grade = 'F';
        recommendations.push('平均渲染时间过长，建议使用React.memo或useMemo优化');
      } else if (averageRenderTime > 30) {
        grade = 'D';
        recommendations.push('渲染时间较长，考虑组件拆分或懒加载');
      } else if (averageRenderTime > 16) {
        grade = 'C';
        recommendations.push('渲染时间可进一步优化');
      } else if (averageRenderTime > 10) {
        grade = 'B';
        recommendations.push('性能表现良好，可考虑进一步优化');
      }

      if (maxRenderTime > averageRenderTime * 3) {
        recommendations.push('存在渲染峰值，检查是否有不必要的重渲染');
      }

      return {
        renderTrend: newTrend,
        performanceGrade: grade,
        recommendations,
      };
    });
  }, [performance.metrics]);

  return {
    ...performance,
    analysis,
  };
};

export default usePerformance;