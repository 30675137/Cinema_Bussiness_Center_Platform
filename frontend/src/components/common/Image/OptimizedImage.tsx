import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils';
import { usePerformance } from '@/hooks/usePerformance';

/**
 * 图片加载状态
 */
export type ImageLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * 优化图片组件属性接口
 */
export interface OptimizedImageProps {
  /** 图片源 */
  src: string;
  /** 备用文本 */
  alt: string;
  /** 宽度 */
  width?: number | string;
  /** 高度 */
  height?: number | string;
  /** 是否懒加载 */
  lazy?: boolean;
  /** 图片格式优先级 */
  formatPriority?: ('webp' | 'avif' | 'jpeg' | 'png')[];
  /** 质量设置 (0-1) */
  quality?: number;
  /** 响应式断点 */
  breakpoints?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    xxl?: string;
  };
  /** 加载策略 */
  loadingStrategy?: 'eager' | 'lazy';
  /** 是否启用性能监控 */
  performanceMonitoring?: boolean;
  /** 占位符 */
  placeholder?: string | React.ReactNode;
  /** 加载失败时的回调 */
  onError?: (error: Event) => void;
  /** 加载成功时的回调 */
  onLoad?: (event: Event) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 内联样式 */
  style?: React.CSSProperties;
  /** CDN配置 */
  cdn?: {
    enabled: boolean;
    baseUrl?: string;
    params?: Record<string, string>;
  };
}

/**
 * WebP支持的检测结果缓存
 */
let webpSupportCache: boolean | null = null;

/**
 * 检测浏览器是否支持WebP格式
 */
const checkWebPSupport = (): Promise<boolean> => {
  if (webpSupportCache !== null) {
    return Promise.resolve(webpSupportCache);
  }

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = () => {
      webpSupportCache = true;
      resolve(true);
    };
    webP.onerror = () => {
      webpSupportCache = false;
      resolve(false);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * 生成优化后的图片URL
 */
const generateOptimizedUrl = (
  originalUrl: string,
  options: {
    format?: string;
    quality?: number;
    width?: number;
    height?: number;
    cdn?: OptimizedImageProps['cdn'];
  }
): string => {
  if (!options.cdn?.enabled) {
    return originalUrl;
  }

  const { cdn } = options;
  const baseUrl = cdn.baseUrl || '';
  const url = baseUrl + originalUrl;

  // 构建查询参数
  const params = new URLSearchParams();

  if (options.format) {
    params.set('format', options.format);
  }

  if (options.quality !== undefined) {
    params.set('quality', options.quality.toString());
  }

  if (options.width) {
    params.set('w', options.width.toString());
  }

  if (options.height) {
    params.set('h', options.height.toString());
  }

  // 添加自定义CDN参数
  if (cdn.params) {
    Object.entries(cdn.params).forEach(([key, value]) => {
      params.set(key, value);
    });
  }

  const paramString = params.toString();
  return paramString ? `${url}?${paramString}` : url;
};

/**
 * 优化的图片组件
 *
 * 特性：
 * - 自动格式检测和转换（WebP/AVIF）
 * - CDN集成和图片优化
 * - 懒加载和渐进式加载
 * - 性能监控和错误处理
 * - 响应式图片支持
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/images/product.jpg"
 *   alt="商品图片"
 *   width={300}
 *   height={200}
 *   lazy={true}
 *   formatPriority={['webp', 'jpeg']}
 *   cdn={{
 *     enabled: true,
 *     baseUrl: 'https://cdn.example.com',
 *     params: { auto: 'compress' }
 *   }}
 * />
 * ```
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  lazy = true,
  formatPriority = ['webp', 'jpeg', 'png'],
  quality = 85,
  breakpoints,
  loadingStrategy = 'lazy',
  performanceMonitoring = false,
  placeholder,
  onError,
  onLoad,
  className,
  style,
  cdn = { enabled: false },
  ...props
}) => {
  const [loadingState, setLoadingState] = useState<ImageLoadingState>('idle');
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 性能监控
  const { startMeasure, endMeasure, recordCustomMetric } = usePerformance({
    enabled: performanceMonitoring,
    componentName: 'OptimizedImage',
    renderThreshold: 16,
  });

  // 检测WebP支持
  useEffect(() => {
    checkWebPSupport().then((supported) => {
      setWebpSupported(supported);
    });
  }, []);

  // 生成优化的图片URL
  const optimizedSrc = useCallback(async () => {
    let optimizedUrl = src;

    // 选择最佳格式
    if (webpSupported && formatPriority.includes('webp')) {
      const ext = src.split('.').pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png'].includes(ext)) {
        // 简单的WebP转换逻辑（实际项目中应通过CDN或图片处理服务）
        optimizedUrl = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
    }

    // 应用CDN优化
    return generateOptimizedUrl(optimizedUrl, {
      format: webpSupported && formatPriority.includes('webp') ? 'webp' : undefined,
      quality,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      cdn,
    });
  }, [src, webpSupported, formatPriority, quality, width, height, cdn]);

  // 设置优化的图片源
  useEffect(() => {
    if (webpSupported !== null) {
      optimizedSrc().then(setCurrentSrc);
    }
  }, [webpSupported, optimizedSrc]);

  // 懒加载设置
  useEffect(() => {
    if (!lazy || !imgRef.current) {
      return;
    }

    const options = {
      rootMargin: '50px', // 提前50px开始加载
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setLoadingState('loading');
          startMeasure('image-load');
        }
      });
    }, options);

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, startMeasure]);

  // 处理图片加载成功
  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setLoadingState('loaded');
      endMeasure('image-load');

      if (performanceMonitoring) {
        const img = event.currentTarget;
        recordCustomMetric('imageWidth', img.naturalWidth);
        recordCustomMetric('imageHeight', img.naturalHeight);
        recordCustomMetric('loadTime', performance.now());
      }

      if (onLoad) {
        onLoad(event.nativeEvent);
      }
    },
    [endMeasure, recordCustomMetric, performanceMonitoring, onLoad]
  );

  // 处理图片加载失败
  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setLoadingState('error');
      console.warn('Image failed to load:', currentSrc);

      // 尝试降级到原始格式
      if (currentSrc !== src) {
        setCurrentSrc(src);
        setLoadingState('loading');
        return;
      }

      if (onError) {
        onError(event.nativeEvent);
      }
    },
    [currentSrc, src, onError]
  );

  // 生成响应式图片源
  const generateSrcSet = useCallback(() => {
    if (!breakpoints) {
      return undefined;
    }

    const srcSet = Object.entries(breakpoints)
      .sort(([a], [b]) => {
        const order = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
        return order.indexOf(a) - order.indexOf(b);
      })
      .map(([breakpoint, size]) => {
        const mediaWidth = {
          xs: 480,
          sm: 576,
          md: 768,
          lg: 992,
          xl: 1200,
          xxl: 1600,
        }[breakpoint];

        return `${generateOptimizedUrl(src, {
          format: webpSupported && formatPriority.includes('webp') ? 'webp' : undefined,
          quality,
          width: parseInt(size),
          cdn,
        })} ${mediaWidth}w`;
      })
      .join(', ');

    return srcSet;
  }, [breakpoints, src, webpSupported, formatPriority, quality, cdn]);

  // 渲染加载状态
  const renderLoadingState = () => {
    if (placeholder) {
      return <div className="image-placeholder">{placeholder}</div>;
    }

    return (
      <div
        className={cn(
          'image-skeleton',
          'animate-pulse',
          'bg-gray-200',
          'flex items-center justify-center'
        )}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  };

  // 渲染错误状态
  const renderErrorState = () => (
    <div
      className={cn(
        'image-error',
        'bg-gray-100',
        'border border-gray-300',
        'flex items-center justify-center'
      )}
      style={{ width, height }}
    >
      <div className="text-gray-500 text-sm text-center">
        <div>加载失败</div>
        <div className="text-xs mt-1">{alt}</div>
      </div>
    </div>
  );

  return (
    <div
      className={cn('optimized-image-container', 'relative', className)}
      style={{
        width,
        height,
        ...style,
      }}
    >
      {/* 骨架屏 */}
      {(loadingState === 'idle' || loadingState === 'loading') && renderLoadingState()}

      {/* 错误状态 */}
      {loadingState === 'error' && renderErrorState()}

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={currentSrc}
        srcSet={generateSrcSet()}
        alt={alt}
        width={width}
        height={height}
        loading={loadingStrategy}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'optimized-image',
          'transition-opacity duration-300',
          'w-full h-full object-cover',
          {
            'opacity-0': loadingState === 'idle' || loadingState === 'loading',
            'opacity-100': loadingState === 'loaded',
            hidden: loadingState === 'error',
          }
        )}
        style={{
          display: loadingState === 'error' ? 'none' : 'block',
        }}
        {...props}
      />

      {/* 性能监控信息（仅开发环境） */}
      {performanceMonitoring && process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            fontSize: 8,
            color: '#666',
            background: 'rgba(255,255,255,0.8)',
            padding: '1px 2px',
            borderRadius: 2,
          }}
        >
          {webpSupported ? 'WebP' : 'Fallback'}
        </div>
      )}
    </div>
  );
};

/**
 * 预设配置的图片组件
 */
export const ImagePresets = {
  /** 产品图片 - 适用于商品展示 */
  Product: (props: Omit<OptimizedImageProps, 'lazy' | 'formatPriority'>) => (
    <OptimizedImage
      {...props}
      lazy={true}
      formatPriority={['webp', 'jpeg']}
      quality={90}
      cdn={{
        enabled: true,
        params: { auto: 'compress,format' },
      }}
    />
  ),

  /** 缩略图 - 适用于列表和卡片 */
  Thumbnail: (props: Omit<OptimizedImageProps, 'lazy' | 'quality'>) => (
    <OptimizedImage
      {...props}
      lazy={true}
      quality={75}
      formatPriority={['webp', 'jpeg']}
      loadingStrategy="lazy"
    />
  ),

  /** 头像图片 - 适用于用户头像 */
  Avatar: (props: Omit<OptimizedImageProps, 'lazy' | 'formatPriority'>) => (
    <OptimizedImage
      {...props}
      lazy={false}
      formatPriority={['webp', 'png']}
      quality={85}
      placeholder={
        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
          👤
        </div>
      }
    />
  ),

  /** 横幅图片 - 适用于大图展示 */
  Banner: (props: Omit<OptimizedImageProps, 'lazy' | 'quality'>) => (
    <OptimizedImage
      {...props}
      lazy={true}
      quality={80}
      formatPriority={['webp', 'jpeg']}
      breakpoints={{
        sm: '768w',
        md: '992w',
        lg: '1200w',
        xl: '1600w',
      }}
    />
  ),
};

// 导出常用预设
export const ProductImage = ImagePresets.Product;
export const ThumbnailImage = ImagePresets.Thumbnail;
export const AvatarImage = ImagePresets.Avatar;
export const BannerImage = ImagePresets.Banner;

export default OptimizedImage;
