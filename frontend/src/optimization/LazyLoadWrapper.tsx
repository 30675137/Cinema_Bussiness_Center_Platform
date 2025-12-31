import React, { Suspense, lazy } from 'react';
import { Spin, Skeleton } from 'antd';

interface LazyLoadWrapperProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  delay?: number;
  errorBoundary?: React.ComponentType<{ children: React.ReactNode }>;
}

const DefaultFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '50px',
    }}
  >
    <Spin size="large" />
  </div>
);

const DefaultSkeleton = () => (
  <div style={{ padding: '20px' }}>
    <Skeleton active paragraph={{ rows: 4 }} />
  </div>
);

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  loader,
  fallback = <DefaultFallback />,
  delay = 200,
}) => {
  const LazyComponent = lazy(loader);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
};

// 预加载工具函数
export class Preloader {
  private static preloadedComponents = new Set<string>();

  public static preloadComponent(
    key: string,
    loader: () => Promise<{ default: React.ComponentType<any> }>
  ): void {
    if (this.preloadedComponents.has(key)) {
      return;
    }

    this.preloadedComponents.add(key);

    // 在空闲时预加载组件
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        loader().catch(() => {
          // 预加载失败，从缓存中移除
          this.preloadedComponents.delete(key);
        });
      });
    } else {
      // 降级处理
      setTimeout(() => {
        loader().catch(() => {
          this.preloadedComponents.delete(key);
        });
      }, 1000);
    }
  }

  public static isPreloaded(key: string): boolean {
    return this.preloadedComponents.has(key);
  }

  public static clearPreloaded(): void {
    this.preloadedComponents.clear();
  }
}

// 路由级别的懒加载包装器
export const LazyRoute: React.FC<LazyLoadWrapperProps> = ({
  loader,
  fallback = <DefaultSkeleton />,
}) => {
  return <LazyLoadWrapper loader={loader} fallback={fallback} />;
};

// 高阶组件：为组件添加懒加载功能
export function withLazyLoad<P extends object>(
  componentPath: string,
  loader: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  return (props: P) => <LazyLoadWrapper loader={loader} fallback={fallback} key={componentPath} />;
}

// 延迟加载组件
export const DelayedLoad: React.FC<{
  children: React.ReactNode;
  delay: number;
  fallback?: React.ReactNode;
}> = ({ children, delay, fallback = <DefaultFallback /> }) => {
  const [showComponent, setShowComponent] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowComponent(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!showComponent) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default LazyLoadWrapper;
