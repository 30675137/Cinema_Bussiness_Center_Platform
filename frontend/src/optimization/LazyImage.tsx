import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from 'antd';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLImageElement>) => void;
  threshold?: number; // 触发加载的阈值 (0-1)
  rootMargin?: string; // 根边距
  loading?: 'lazy' | 'eager';
  fadeInDuration?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  style,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  loading = 'lazy',
  fadeInDuration = 300
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const container = containerRef.current;

    if (!img || !container) return;

    // 如果浏览器原生支持懒加载，优先使用
    if (loading === 'lazy' && 'loading' in HTMLImageElement.prototype) {
      setIsInView(true);
      return;
    }

    // 使用 Intersection Observer 进行懒加载
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [loading, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoaded(true);
    onError?.(error);
  };

  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
  };

  const skeletonStyle: React.CSSProperties = {
    ...style,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {/* 骨架屏 */}
      {!isLoaded && (
        <div style={skeletonStyle}>
          <Skeleton.Image
            style={{
              width: '100%',
              height: '100%',
            }}
            active
          />
        </div>
      )}

      {/* 实际图片 */}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError && placeholder ? placeholder : src}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          decoding="async"
        />
      )}
    </div>
  );
};

// 批量懒加载图片组件
export const LazyImageBatch: React.FC<{
  images: Array<{
    src: string;
    alt: string;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
  }>;
  threshold?: number;
  rootMargin?: string;
  fadeInDuration?: number;
}> = ({ images, threshold, rootMargin, fadeInDuration }) => {
  return (
    <div>
      {images.map((image, index) => (
        <LazyImage
          key={`${image.src}-${index}`}
          {...image}
          threshold={threshold}
          rootMargin={rootMargin}
          fadeInDuration={fadeInDuration}
        />
      ))}
    </div>
  );
};

// 渐进式图片加载组件
export const ProgressiveImage: React.FC<{
  src: string;
  placeholder: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, placeholder, alt, className, style }) => {
  const [loadedSrc, setLoadedSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoadedSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <img
      src={loadedSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        filter: isLoaded ? 'none' : 'blur(5px)',
        transition: 'filter 0.3s ease-in-out',
      }}
    />
  );
};

export default LazyImage;