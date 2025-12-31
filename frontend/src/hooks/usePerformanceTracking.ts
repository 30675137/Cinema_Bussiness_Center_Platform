import { useEffect, useRef, useState, useCallback } from 'react';
import { usePerformance } from '../monitoring/PerformanceProvider';

interface PerformanceTrackingOptions {
  trackRenders?: boolean;
  trackReRenders?: boolean;
  trackMountTime?: boolean;
  trackUpdateTime?: boolean;
  enableProfiler?: boolean;
  trackMemory?: boolean;
  samplingRate?: number; // 采样率 (0-1)
}

interface ComponentPerformanceData {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  mountTime: number;
  mountTimestamp: number;
  lastUpdateTimestamp: number;
  isStale?: boolean;
}

export const usePerformanceTracking = (
  componentName: string,
  options: PerformanceTrackingOptions = {}
) => {
  const {
    trackRenders = true,
    trackReRenders = true,
    trackMountTime = true,
    trackUpdateTime = true,
    enableProfiler = true,
    trackMemory = false,
    samplingRate = 1.0,
  } = options;

  const { recordComponentRender, recordMemoryUsage } = usePerformance();

  // 渲染跟踪状态
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);
  const totalRenderTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(false);

  // 性能数据状态
  const [performanceData, setPerformanceData] = useState<ComponentPerformanceData>({
    componentName,
    renderCount: 0,
    totalRenderTime: 0,
    averageRenderTime: 0,
    lastRenderTime: 0,
    mountTime: 0,
    mountTimestamp: 0,
    lastUpdateTimestamp: 0,
    isStale: false,
  });

  // 性能指标Hook
  const onRender = useCallback(
    (id: string, phase: string, actualDuration: number) => {
      if (!enableProfiler || Math.random() > samplingRate) return;

      const now = performance.now();

      if (phase === 'mount') {
        mountTimeRef.current = actualDuration;
        isMountedRef.current = true;

        if (trackMountTime) {
          recordComponentRender(componentName, actualDuration, actualDuration);
        }
      } else if (phase === 'update') {
        renderCountRef.current += 1;
        totalRenderTimeRef.current += actualDuration;
        lastRenderTimeRef.current = actualDuration;

        if (trackReRenders) {
          recordComponentRender(componentName, actualDuration, mountTimeRef.current);
        }
      }

      // 避免在onRender中更新状态以防止无限循环
      // 状态更新可以通过useEffect来处理

      // 警告渲染时间过长
      if (actualDuration > 16) {
        // 超过一帧的时间
        console.warn(
          `⚠️ ${componentName} ${phase} took ${actualDuration.toFixed(2)}ms (超过16ms阈值)`
        );
      }

      // 警告重渲染次数过多
      if (renderCountRef.current > 10) {
        console.warn(`⚠️ ${componentName} has re-rendered ${renderCountRef.current} times`);
      }
    },
    [
      componentName,
      enableProfiler,
      trackMountTime,
      trackReRenders,
      recordComponentRender,
      samplingRate,
    ]
  );

  // 内存使用跟踪
  useEffect(() => {
    if (!trackMemory || !isMountedRef.current) return;

    const interval = setInterval(() => {
      recordMemoryUsage();
    }, 5000); // 每5秒记录一次

    return () => clearInterval(interval);
  }, [trackMemory, recordMemoryUsage]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (isMountedRef.current && trackUpdateTime) {
        // 组件卸载时记录最终性能数据
        console.debug(`📊 ${componentName} 性能统计:`, {
          renderCount: renderCountRef.current,
          averageRenderTime:
            renderCountRef.current > 0 ? totalRenderTimeRef.current / renderCountRef.current : 0,
          mountTime: mountTimeRef.current,
        });
      }
    };
  }, [componentName, trackUpdateTime]);

  return {
    onRender,
    performanceData,
    // 手动触发性能记录
    trackRender: useCallback(() => {
      const start = performance.now();
      return () => {
        const duration = performance.now() - start;
        onRender(componentName, 'update', duration);
      };
    }, [componentName, onRender]),
  };
};

// 高阶组件：为组件添加性能跟踪
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: PerformanceTrackingOptions
) => {
  const TrackedComponent = (props: P) => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    const { onRender } = usePerformanceTracking(componentName, options);

    return React.createElement(
      React.Profiler,
      { id: componentName, onRender },
      React.createElement(WrappedComponent, props)
    );
  };

  TrackedComponent.displayName = `withPerformanceTracking(${WrappedComponent.displayName || WrappedComponent.name})`;

  return TrackedComponent;
};

// 自定义Hook：跟踪列表渲染性能
export const useListPerformance = (itemName: string, itemCount: number) => {
  const [renderStartTime, setRenderStartTime] = useState<number>(0);
  const { performanceData, onRender } = usePerformanceTracking(`${itemName}List`);

  const startListRender = useCallback(() => {
    setRenderStartTime(performance.now());
  }, []);

  const endListRender = useCallback(() => {
    if (renderStartTime > 0) {
      const duration = performance.now() - renderStartTime;
      onRender(`${itemName}List`, 'update', duration);

      // 计算每项渲染时间
      const timePerItem = duration / itemCount;
      if (timePerItem > 1) {
        // 每项超过1ms
        console.warn(
          `⚠️ ${itemName}List: 每项渲染时间 ${timePerItem.toFixed(2)}ms (总计: ${duration.toFixed(2)}ms)`
        );
      }
    }
  }, [renderStartTime, itemCount, itemName, onRender]);

  return {
    startListRender,
    endListRender,
    performanceData,
  };
};

// 自定义Hook：跟踪动画性能
export const useAnimationPerformance = (animationName: string) => {
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const droppedFramesRef = useRef(0);

  const { performanceData, onRender } = usePerformanceTracking(`${animationName}Animation`);

  const trackFrame = useCallback(() => {
    const now = performance.now();
    const frameDelta = now - lastFrameTimeRef.current;
    frameCountRef.current += 1;

    // 如果两帧间隔超过16.67ms (60fps)，认为是掉帧
    if (frameDelta > 16.67) {
      droppedFramesRef.current += 1;
    }

    lastFrameTimeRef.current = now;

    // 每60帧报告一次
    if (frameCountRef.current % 60 === 0) {
      const dropRate = (droppedFramesRef.current / frameCountRef.current) * 100;

      if (dropRate > 5) {
        // 掉帧率超过5%
        console.warn(`⚠️ ${animationName} Animation: 掉帧率 ${dropRate.toFixed(1)}%`);
      }

      // 重置计数器
      droppedFramesRef.current = 0;
    }
  }, [animationName]);

  const getPerformanceMetrics = useCallback(() => {
    return {
      totalFrames: frameCountRef.current,
      droppedFrames: droppedFramesRef.current,
      dropRate:
        frameCountRef.current > 0 ? (droppedFramesRef.current / frameCountRef.current) * 100 : 0,
    };
  }, []);

  return {
    trackFrame,
    getPerformanceMetrics,
    performanceData,
  };
};

// 自定义Hook：跟踪API调用性能
export const useAPIPerformance = (apiName: string) => {
  const { performanceData } = usePerformanceTracking(`${apiName}API`);

  const trackAPICall = useCallback(
    async <T>(apiCall: () => Promise<T>, operation: string = 'call'): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;

        // 记录成功调用
        console.debug(`✅ ${apiName} ${operation}: ${duration.toFixed(2)}ms`);

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        // 记录失败调用
        console.error(`❌ ${apiName} ${operation}: ${duration.toFixed(2)}ms`, error);

        throw error;
      }
    },
    [apiName]
  );

  return {
    trackAPICall,
    performanceData,
  };
};

export default usePerformanceTracking;
