import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';
import { cn } from '@/utils';
import { usePerformance } from '@/hooks/usePerformance';

/**
 * 优化的Modal属性接口
 */
export interface OptimizedModalProps extends Omit<AntModalProps, 'destroyOnClose'> {
  /** 是否启用性能监控 */
  performanceMonitoring?: boolean;
  /** 自定义关闭后的清理延迟（毫秒） */
  cleanupDelay?: number;
  /** 是否启用内存优化 */
  memoryOptimization?: boolean;
  /** 子组件变化时是否重置滚动位置 */
  resetScrollOnOpen?: boolean;
  /** Modal内容变化时的回调 */
  onContentChange?: (content: React.ReactNode) => void;
}

/**
 * 优化的Modal组件
 *
 * 特性：
 * - 默认启用destroyOnClose以节省内存
 * - 性能监控和内存管理
 * - 滚动位置重置
 * - 延迟清理机制
 * - 内容变化监控
 *
 * @example
 * ```tsx
 * <OptimizedModal
 *   title="优化的模态框"
 *   open={visible}
 *   onOk={handleOk}
 *   onCancel={handleCancel}
 *   performanceMonitoring={true}
 *   memoryOptimization={true}
 *   width={800}
 * >
 *   <ComplexForm />
 * </OptimizedModal>
 * ```
 */
export const OptimizedModal: React.FC<OptimizedModalProps> = ({
  children,
  open,
  onCancel,
  onOk,
  performanceMonitoring = true,
  cleanupDelay = 100,
  memoryOptimization = true,
  resetScrollOnOpen = true,
  onContentChange,
  className,
  styles,
  ...modalProps
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);
  const cleanupTimerRef = useRef<NodeJS.Timeout>();

  // 性能监控
  const { metrics, startMeasure, endMeasure, recordCustomMetric } = usePerformance({
    enabled: performanceMonitoring,
    componentName: 'OptimizedModal',
    renderThreshold: 16,
    logRerenders: true,
  });

  // 监听children变化
  useEffect(() => {
    if (onContentChange && children !== undefined) {
      onContentChange(children);
    }
  }, [children, onContentChange]);

  // 处理Modal打开/关闭的逻辑
  useEffect(() => {
    if (open) {
      // 清除之前的清理定时器
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = undefined;
      }

      // 开始渲染
      startMeasure('modal-open');
      setShouldRender(true);
      setIsAnimating(true);

      // 重置滚动位置
      if (resetScrollOnOpen && contentRef.current) {
        contentRef.current.scrollTop = 0;
      }

      // 记录打开时间
      const openTime = performance.now();
      recordCustomMetric('lastOpenTime', openTime);
    } else {
      // 开始关闭动画
      startMeasure('modal-close');
      setIsAnimating(false);

      // 延迟清理以允许关闭动画完成
      if (memoryOptimization) {
        cleanupTimerRef.current = setTimeout(() => {
          setShouldRender(false);
          endMeasure('modal-close');

          // 强制垃圾回收提示（如果支持）
          if (window.gc && performanceMonitoring) {
            console.log('[OptimizedModal] 建议触发垃圾回收以清理Modal内存');
          }
        }, cleanupDelay);
      } else {
        setShouldRender(false);
        endMeasure('modal-close');
      }
    }

    return () => {
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
  }, [
    open,
    startMeasure,
    endMeasure,
    recordCustomMetric,
    memoryOptimization,
    cleanupDelay,
    resetScrollOnOpen,
  ]);

  // 优化的取消处理
  const handleCancel = useCallback(
    (e: React.MouseEvent) => {
      startMeasure('modal-cancel');

      if (onCancel) {
        onCancel(e);
      }

      endMeasure('modal-cancel');
    },
    [onCancel, startMeasure, endMeasure]
  );

  // 优化的确认处理
  const handleOk = useCallback(
    (e: React.MouseEvent) => {
      startMeasure('modal-ok');

      if (onOk) {
        onOk(e);
      }

      endMeasure('modal-ok');
    },
    [onOk, startMeasure, endMeasure]
  );

  // 监听滚动性能（仅在开发环境）
  useEffect(() => {
    if (!performanceMonitoring || !shouldRender || !contentRef.current) {
      return;
    }

    const contentElement = contentRef.current;
    let scrollTimer: NodeJS.Timeout;

    const handleScroll = () => {
      scrollTimer = setTimeout(() => {
        recordCustomMetric('scrollPosition', contentElement.scrollTop);
      }, 16); // 节流
    };

    contentElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      contentElement.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, [performanceMonitoring, shouldRender, recordCustomMetric]);

  // 如果完全不需要渲染，返回null
  if (!shouldRender && !open) {
    return null;
  }

  // 合并样式
  const mergedStyles = {
    ...styles,
    body: {
      maxHeight: '70vh',
      overflowY: 'auto' as const,
      ...styles?.body,
    },
  };

  return (
    <AntModal
      ref={modalRef}
      open={shouldRender}
      onCancel={handleCancel}
      onOk={handleOk}
      destroyOnClose={memoryOptimization} // 默认启用destroyOnClose
      className={cn('optimized-modal', className)}
      styles={mergedStyles}
      afterClose={() => {
        // 动画完成后的清理
        endMeasure('modal-open');
        setIsAnimating(false);

        // 清理事件监听器
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }}
      {...modalProps}
    >
      <div
        ref={contentRef}
        className={cn(
          'modal-content-wrapper',
          'scroll-smooth',
          isAnimating && 'modal-content-animating'
        )}
      >
        {children}
      </div>

      {/* 性能监控调试信息（仅在开发环境显示） */}
      {performanceMonitoring && process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: 0,
            fontSize: 10,
            color: '#999',
            background: 'rgba(0,0,0,0.05)',
            padding: '2px 4px',
            borderRadius: 2,
          }}
        >
          渲染: {metrics.renderCount} | 最后: {metrics.lastRenderTime.toFixed(1)}ms
        </div>
      )}
    </AntModal>
  );
};

/**
 * 预设配置的Modal组件
 */
export const ModalPresets = {
  /** 表单Modal - 适合复杂表单 */
  Form: (props: Omit<OptimizedModalProps, 'width' | 'destroyOnClose'>) => (
    <OptimizedModal
      {...props}
      width={720}
      memoryOptimization={true}
      resetScrollOnOpen={true}
      performanceMonitoring={true}
    />
  ),

  /** 确认Modal - 适合简单确认操作 */
  Confirm: (props: Omit<OptimizedModalProps, 'width' | 'destroyOnClose'>) => (
    <OptimizedModal
      {...props}
      width={400}
      memoryOptimization={true}
      performanceMonitoring={false} // 简单Modal不需要性能监控
    />
  ),

  /** 大型内容Modal - 适合显示大量信息 */
  Large: (props: Omit<OptimizedModalProps, 'width' | 'destroyOnClose' | 'styles'>) => (
    <OptimizedModal
      {...props}
      width={1000}
      styles={{
        body: {
          maxHeight: '80vh',
          overflowY: 'auto',
        },
      }}
      memoryOptimization={true}
      resetScrollOnOpen={true}
      performanceMonitoring={true}
    />
  ),

  /** 全屏Modal - 适合全屏操作 */
  FullScreen: (props: Omit<OptimizedModalProps, 'width' | 'destroyOnClose' | 'styles'>) => (
    <OptimizedModal
      {...props}
      width="100%"
      styles={{
        body: {
          height: '90vh',
          maxHeight: '90vh',
          overflowY: 'auto',
        },
      }}
      memoryOptimization={true}
      resetScrollOnOpen={true}
      performanceMonitoring={true}
    />
  ),
};

// 导出常用预设
export const FormModal = ModalPresets.Form;
export const ConfirmModal = ModalPresets.Confirm;
export const LargeModal = ModalPresets.Large;
export const FullScreenModal = ModalPresets.FullScreen;

export default OptimizedModal;
