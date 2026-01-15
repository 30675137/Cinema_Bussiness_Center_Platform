import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { List as AntList, ListProps as AntListProps, Spin, Empty, Pagination } from 'antd';
import { cn, tailwindPreset } from '@/utils';
import { usePerformance } from '@/hooks/usePerformance';

/**
 * 虚拟滚动配置接口
 */
export interface VirtualScrollConfig {
  /** 是否启用虚拟滚动 */
  enabled: boolean;
  /** 每项高度 */
  itemHeight?: number;
  /** 缓冲区大小（渲染额外项目数） */
  bufferSize?: number;
  /** 预加载项目数 */
  overscan?: number;
}

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  /** 是否启用分页 */
  enabled: boolean;
  /** 当前页码 */
  current?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 每页条数选项 */
  pageSizeOptions?: number[];
  /** 显示快速跳转 */
  showQuickJumper?: boolean;
  /** 显示总数 */
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  /** 显示尺寸切换器 */
  showSizeChanger?: boolean;
  /** 页码变化回调 */
  onChange?: (page: number, pageSize: number) => void;
}

/**
 * 性能配置接口
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled?: boolean;
  /** 渲染阈值（毫秒） */
  renderThreshold?: number;
  /** 是否记录重渲染 */
  logRerenders?: boolean;
  /** 是否使用React.memo */
  useMemo?: boolean;
  /** 虚拟滚动配置 */
  virtualScroll?: VirtualScrollConfig;
}

/**
 * 优化的List属性接口
 */
export interface OptimizedListProps<T = any> extends Omit<AntListProps<T>, 'pagination'> {
  /** 数据源 */
  dataSource: T[];
  /** 分页配置 */
  pagination?: PaginationConfig;
  /** 性能配置 */
  performance?: PerformanceConfig;
  /** 空状态描述 */
  emptyDescription?: string;
  /** 加载状态描述 */
  loadingDescription?: string;
  /** 渲染项函数 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 项目键值提取函数 */
  itemKey?: (item: T, index: number) => string | number;
  /** 顶部操作区域 */
  header?: React.ReactNode;
  /** 底部操作区域 */
  footer?: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 虚拟滚动项目组件
 */
const VirtualListItem: React.FC<{
  item: any;
  index: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  style: React.CSSProperties;
}> = React.memo(({ item, index, renderItem, style }) => {
  return <div style={style}>{renderItem(item, index)}</div>;
});

VirtualListItem.displayName = 'VirtualListItem';

/**
 * 优化的List组件
 *
 * 特性：
 * - 虚拟滚动支持大数据集
 * - 智能分页和缓存
 * - 性能监控和优化
 * - React.memo优化
 * - 懒加载和预加载
 *
 * @example
 * ```tsx
 * <OptimizedList
 *   dataSource={largeData}
 *   renderItem={(item, index) => (
 *     <List.Item key={item.id}>
 *       {item.name}
 *     </List.Item>
 *   )}
 *   pagination={{
 *     enabled: true,
 *     pageSize: 20,
 *     showQuickJumper: true,
 *   }}
 *   performance={{
 *     virtualScroll: { enabled: true, itemHeight: 60 },
 *     enabled: true,
 *   }}
 * />
 * ```
 */
export const OptimizedList = <T extends any>({
  dataSource = [],
  pagination,
  performance = {},
  emptyDescription = '暂无数据',
  loadingDescription = '加载中...',
  renderItem,
  itemKey,
  header,
  footer,
  className,
  loading = false,
  ...listProps
}: OptimizedListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 20);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 性能监控
  const { metrics, startMeasure, endMeasure, recordCustomMetric } = usePerformance({
    enabled: performance?.enabled,
    componentName: 'OptimizedList',
    renderThreshold: performance?.renderThreshold || 16,
    logRerenders: performance?.logRerenders || false,
  });

  // 配置选项
  const virtualConfig = performance?.virtualScroll;
  const isVirtualEnabled = virtualConfig?.enabled && dataSource.length > 50;
  const isPaginationEnabled = pagination?.enabled;

  // 计算当前页数据
  const paginatedData = useMemo(() => {
    if (!isPaginationEnabled) {
      return dataSource;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return dataSource.slice(startIndex, endIndex);
  }, [dataSource, currentPage, pageSize, isPaginationEnabled]);

  // 虚拟滚动计算
  const virtualizedData = useMemo(() => {
    if (!isVirtualEnabled) {
      return paginatedData;
    }

    const itemHeight = virtualConfig?.itemHeight || 60;
    const bufferSize = virtualConfig?.bufferSize || 5;
    const overscan = virtualConfig?.overscan || 3;

    const containerHeight = listRef.current?.clientHeight || 600;
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      paginatedData.length
    );

    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(paginatedData.length, visibleEnd + overscan);

    return paginatedData.slice(startIndex, endIndex).map((item, index) => ({
      item,
      originalIndex: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [isVirtualEnabled, paginatedData, scrollTop, virtualConfig]);

  // 分页变化处理
  const handlePageChange = useCallback(
    (page: number, size: number) => {
      startMeasure('pagination-change');

      setCurrentPage(page);
      setPageSize(size);

      if (pagination?.onChange) {
        pagination.onChange(page, size);
      }

      // 重置滚动位置
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      endMeasure('pagination-change');
      recordCustomMetric('currentPage', page);
      recordCustomMetric('pageSize', size);
    },
    [pagination, startMeasure, endMeasure, recordCustomMetric]
  );

  // 滚动处理（虚拟滚动）
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!isVirtualEnabled) return;

      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      recordCustomMetric('scrollTop', newScrollTop);
    },
    [isVirtualEnabled, recordCustomMetric]
  );

  // 获取项目键值
  const getItemKey = useCallback(
    (item: T, index: number) => {
      if (itemKey) {
        return itemKey(item, index);
      }

      // 默认键值策略
      if (item && typeof item === 'object' && 'id' in item) {
        return item.id;
      }

      return `list-item-${index}`;
    },
    [itemKey]
  );

  // 渲染项目
  const renderItems = useCallback(
    (items: T[], startIndex = 0) => {
      return items.map((item, index) => {
        const actualIndex = startIndex + index;
        const key = getItemKey(item, actualIndex);

        if (performance?.useMemo) {
          return React.createElement(
            React.memo(() => renderItem(item, actualIndex)),
            { key }
          );
        }

        return <React.Fragment key={key}>{renderItem(item, actualIndex)}</React.Fragment>;
      });
    },
    [getItemKey, performance?.useMemo, renderItem]
  );

  // 性能指标收集
  useEffect(() => {
    recordCustomMetric('dataSourceLength', dataSource.length);
    recordCustomMetric(
      'renderedItemsCount',
      isVirtualEnabled ? virtualizedData.length : paginatedData.length
    );
    recordCustomMetric('isVirtualEnabled', isVirtualEnabled);
    recordCustomMetric('isPaginationEnabled', isPaginationEnabled);
  }, [
    dataSource.length,
    virtualizedData.length,
    paginatedData.length,
    isVirtualEnabled,
    isPaginationEnabled,
    recordCustomMetric,
  ]);

  // 总数和分页信息
  const totalItems = dataSource.length;
  const totalPages = isPaginationEnabled ? Math.ceil(totalItems / pageSize) : 1;

  return (
    <div className={cn('optimized-list-container', className)}>
      {/* 顶部区域 */}
      {header && <div className={cn('list-header', tailwindPreset('mb-4'))}>{header}</div>}

      {/* 列表容器 */}
      <div
        ref={containerRef}
        className={cn('list-scroll-container', isVirtualEnabled && 'virtual-scroll-container')}
        style={{
          height: isVirtualEnabled ? '600px' : 'auto',
          overflow: isVirtualEnabled ? 'auto' : 'visible',
        }}
        onScroll={handleScroll}
      >
        {loading ? (
          <div className={cn('flex justify-center items-center', tailwindPreset('py-8'))}>
            <Spin size="large" tip={loadingDescription} />
          </div>
        ) : paginatedData.length === 0 ? (
          <div className={cn('flex justify-center items-center', tailwindPreset('py-8'))}>
            <Empty description={emptyDescription} />
          </div>
        ) : (
          <>
            {isVirtualEnabled ? (
              <div
                ref={listRef}
                style={{
                  height: paginatedData.length * (virtualConfig?.itemHeight || 60),
                  position: 'relative',
                }}
              >
                {virtualizedData.map(({ item, originalIndex, style }) => (
                  <VirtualListItem
                    key={getItemKey(item, originalIndex)}
                    item={item}
                    index={originalIndex}
                    renderItem={renderItem}
                    style={style}
                  />
                ))}
              </div>
            ) : (
              <AntList
                {...listProps}
                dataSource={paginatedData}
                renderItem={(item, index) => <AntList.Item>{renderItem(item, index)}</AntList.Item>}
              />
            )}
          </>
        )}
      </div>

      {/* 底部分页 */}
      {isPaginationEnabled && totalItems > pageSize && (
        <div className={cn('list-footer', tailwindPreset('mt-4 flex justify-end'))}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onChange={handlePageChange}
            showSizeChanger={pagination?.showSizeChanger}
            showQuickJumper={pagination?.showQuickJumper}
            showTotal={
              pagination?.showTotal
                ? (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                : undefined
            }
            pageSizeOptions={pagination?.pageSizeOptions || [10, 20, 50, 100]}
          />
        </div>
      )}

      {/* 底部区域 */}
      {footer && <div className={cn('list-footer-extra', tailwindPreset('mt-4'))}>{footer}</div>}

      {/* 性能调试信息（仅开发环境） */}
      {performance?.enabled && process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: -25,
            right: 0,
            fontSize: 10,
            color: '#999',
            background: 'rgba(0,0,0,0.05)',
            padding: '2px 4px',
            borderRadius: 2,
          }}
        >
          渲染: {metrics.renderCount} | 项目: {virtualizedData.length}/{paginatedData.length} |
          虚拟: {isVirtualEnabled ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};

/**
 * 预设配置的List组件
 */
export const ListPresets = {
  /** 标准列表 - 适用于一般场景 */
  Standard: <T extends any>(props: Omit<OptimizedListProps<T>, 'performance'>) => (
    <OptimizedList
      {...props}
      performance={{
        enabled: true,
        renderThreshold: 16,
        useMemo: true,
      }}
    />
  ),

  /** 大数据列表 - 启用虚拟滚动 */
  Large: <T extends any>(props: Omit<OptimizedListProps<T>, 'performance'>) => (
    <OptimizedList
      {...props}
      performance={{
        enabled: true,
        renderThreshold: 10,
        useMemo: true,
        virtualScroll: {
          enabled: true,
          itemHeight: 60,
          bufferSize: 5,
          overscan: 3,
        },
      }}
      pagination={{
        enabled: true,
        pageSize: 50,
        showSizeChanger: true,
        showQuickJumper: true,
      }}
    />
  ),

  /** 卡片列表 - 适用于卡片布局 */
  Card: <T extends any>(props: Omit<OptimizedListProps<T>, 'performance'>) => (
    <OptimizedList
      {...props}
      performance={{
        enabled: true,
        renderThreshold: 20,
        useMemo: true,
        virtualScroll: {
          enabled: true,
          itemHeight: 200,
          bufferSize: 3,
          overscan: 2,
        },
      }}
      pagination={{
        enabled: true,
        pageSize: 12,
        showSizeChanger: true,
        pageSizeOptions: [6, 12, 24, 48],
      }}
    />
  ),
};

// 导出常用预设
export const StandardList = ListPresets.Standard;
export const LargeList = ListPresets.Large;
export const CardList = ListPresets.Card;

export default OptimizedList;
