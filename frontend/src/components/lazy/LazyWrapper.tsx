import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { Spin, Skeleton, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { cn, tailwindPreset } from '../../utils';

/**
 * 懒加载配置接口
 */
export interface LazyWrapperConfig {
  /** 自定义加载组件 */
  fallback?: ReactNode;
  /** 自定义错误组件 */
  errorFallback?: ReactNode;
  /** 是否显示骨架屏 */
  showSkeleton?: boolean;
  /** 骨架屏类型 */
  skeletonType?: 'text' | 'input' | 'button' | 'avatar' | 'image' | 'list';
  /** 骨架屏行数 */
  skeletonRows?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retryCount?: number;
  /** 预加载 */
  preload?: boolean;
  /** 错误重试延迟（毫秒） */
  retryDelay?: number;
}

/**
 * 错误边界组件
 */
class LazyErrorBoundary extends React.Component<
  { fallback: ReactNode; retryCount: number; onRetry?: () => void },
  { hasError: boolean; retryAttempts: number }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, retryAttempts: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyWrapper Error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryAttempts < this.props.retryCount) {
      this.setState((prevState) => ({
        hasError: false,
        retryAttempts: prevState.retryAttempts + 1,
      }));

      setTimeout(() => {
        this.props.onRetry?.();
      }, 1000);
    }
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryAttempts < this.props.retryCount;

      return (
        this.props.fallback || (
          <Result
            status="error"
            title="组件加载失败"
            subTitle={`重试次数: ${this.state.retryAttempts}/${this.props.retryCount}`}
            extra={
              canRetry && (
                <button
                  onClick={this.handleRetry}
                  className={cn(
                    'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200'
                  )}
                >
                  重试加载
                </button>
              )
            }
          />
        )
      );
    }

    return this.props.children;
  }
}

/**
 * 默认加载组件
 */
const DefaultFallback = () => (
  <div className={cn('flex items-center justify-center p-8', tailwindPreset('min-h-screen'))}>
    <Spin
      size="large"
      indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
      tip="正在加载组件..."
    />
  </div>
);

/**
 * 骨架屏组件
 */
const SkeletonLoader = ({
  type = 'text',
  rows = 3,
}: {
  type?: 'text' | 'input' | 'button' | 'avatar' | 'image' | 'list';
  rows?: number;
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'input':
        return <Skeleton.Input style={{ width: '100%' }} active />;
      case 'button':
        return <Skeleton.Button active />;
      case 'avatar':
        return <Skeleton.Avatar active />;
      case 'image':
        return <Skeleton.Image active />;
      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: rows }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton.Avatar active />
                <div className="flex-1 space-y-2">
                  <Skeleton.Input style={{ width: '60%' }} active />
                  <Skeleton.Input style={{ width: '80%' }} active />
                </div>
              </div>
            ))}
          </div>
        );
      case 'text':
      default:
        return (
          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, index) => (
              <Skeleton.Input key={index} style={{ width: '100%' }} active />
            ))}
          </div>
        );
    }
  };

  return <div className={cn('p-4', tailwindPreset('loading'))}>{renderSkeleton()}</div>;
};

/**
 * 懒加载包装器组件
 */
export const LazyWrapper: React.FC<{
  children: ReactNode;
  config?: LazyWrapperConfig;
}> = ({ children, config = {} }) => {
  const {
    fallback,
    errorFallback,
    showSkeleton = false,
    skeletonType = 'text',
    skeletonRows = 3,
    retryCount = 3,
    timeout = 10000,
  } = config;

  // 超时处理
  const timeoutHandler = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (timeout > 0) {
      timeoutHandler.current = setTimeout(() => {
        console.warn('LazyWrapper: Loading timeout reached');
      }, timeout);
    }

    return () => {
      if (timeoutHandler.current) {
        clearTimeout(timeoutHandler.current);
      }
    };
  }, [timeout]);

  const loadingFallback = React.useMemo(() => {
    if (fallback) return fallback;
    if (showSkeleton) return <SkeletonLoader type={skeletonType} rows={skeletonRows} />;
    return <DefaultFallback />;
  }, [fallback, showSkeleton, skeletonType, skeletonRows]);

  return (
    <LazyErrorBoundary
      fallback={errorFallback}
      retryCount={retryCount}
      onRetry={() => {
        // 可以在这里添加重试逻辑
        console.log('Retrying to load lazy component...');
      }}
    >
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </LazyErrorBoundary>
  );
};

/**
 * 创建懒加载组件的高阶函数
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  config?: LazyWrapperConfig
) => {
  const LazyComponent = lazy(importFunc);

  // 预加载
  if (config?.preload) {
    importFunc();
  }

  return React.memo((props: React.ComponentProps<T>) => (
    <LazyWrapper config={config}>
      <LazyComponent {...props} />
    </LazyWrapper>
  ));
};

/**
 * 常用的懒加载配置预设
 */
export const LazyConfigPresets = {
  /** 表格组件懒加载配置 */
  table: {
    showSkeleton: true,
    skeletonType: 'list' as const,
    skeletonRows: 5,
    timeout: 5000,
    retryCount: 2,
  },

  /** 表单组件懒加载配置 */
  form: {
    showSkeleton: true,
    skeletonType: 'input' as const,
    skeletonRows: 8,
    timeout: 3000,
    retryCount: 2,
  },

  /** 图表组件懒加载配置 */
  chart: {
    showSkeleton: true,
    skeletonType: 'image' as const,
    skeletonRows: 1,
    timeout: 8000,
    retryCount: 3,
  },

  /** 模态框组件懒加载配置 */
  modal: {
    timeout: 2000,
    retryCount: 1,
  },

  /** 导航组件懒加载配置 */
  navigation: {
    showSkeleton: true,
    skeletonType: 'button' as const,
    skeletonRows: 3,
    timeout: 3000,
    retryCount: 2,
  },
} as const;

export default LazyWrapper;
