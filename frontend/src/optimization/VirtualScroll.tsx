import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Spin } from 'antd';

interface VirtualScrollProps<T> {
  // 数据相关
  data: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;

  // 滚动配置
  overscan?: number; // 预渲染的项目数量
  threshold?: number; // 触发加载更多的阈值

  // 无限滚动
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  loadingComponent?: React.ReactNode;

  // 样式
  className?: string;
  style?: React.CSSProperties;

  // 回调
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;

  // 动态高度支持
  getItemHeight?: (index: number) => number;
  estimatedItemHeight?: number;
}

const VirtualScroll = <T,>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  threshold = 50,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  loadingComponent = <Spin tip="加载更多..." />,
  className,
  style,
  onScroll,
  onEndReached,
  getItemHeight,
  estimatedItemHeight = itemHeight,
}: VirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());

  // 动态高度计算
  const getItemHeightCalculated = useCallback(
    (index: number): number => {
      if (getItemHeight) {
        return itemHeights.get(index) || getItemHeight(index) || estimatedItemHeight;
      }
      return itemHeight;
    },
    [getItemHeight, itemHeight, estimatedItemHeight, itemHeights]
  );

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (getItemHeight) {
      // 动态高度模式
      let accumulatedHeight = 0;
      let startIndex = 0;
      let endIndex = 0;

      // 找到开始索引
      for (let i = 0; i < data.length; i++) {
        const height = getItemHeightCalculated(i);
        if (accumulatedHeight + height > scrollTop) {
          startIndex = Math.max(0, i - overscan);
          break;
        }
        accumulatedHeight += height;
      }

      // 找到结束索引
      accumulatedHeight = 0;
      for (let i = 0; i < data.length; i++) {
        const height = getItemHeightCalculated(i);
        accumulatedHeight += height;
        if (accumulatedHeight > scrollTop + containerHeight) {
          endIndex = Math.min(data.length - 1, i + overscan);
          break;
        }
      }

      return { startIndex, endIndex };
    } else {
      // 固定高度模式
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        data.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );

      return { startIndex, endIndex };
    }
  }, [
    scrollTop,
    itemHeight,
    containerHeight,
    data.length,
    overscan,
    getItemHeight,
    getItemHeightCalculated,
  ]);

  // 计算总高度
  const totalHeight = useMemo(() => {
    if (getItemHeight) {
      let height = 0;
      for (let i = 0; i < data.length; i++) {
        height += getItemHeightCalculated(i);
      }
      return height;
    }
    return data.length * itemHeight;
  }, [data.length, itemHeight, getItemHeight, getItemHeightCalculated]);

  // 计算项目位置
  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => {
      if (getItemHeight) {
        // 动态高度模式
        let top = 0;
        for (let i = 0; i < index; i++) {
          top += getItemHeightCalculated(i);
        }
        return {
          position: 'absolute',
          top,
          left: 0,
          right: 0,
          height: getItemHeightCalculated(index),
        };
      } else {
        // 固定高度模式
        return {
          position: 'absolute',
          top: index * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        };
      }
    },
    [itemHeight, getItemHeight, getItemHeightCalculated]
  );

  // 处理滚动事件
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      setIsScrolling(true);

      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 设置新的定时器，滚动结束后重置状态
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      onScroll?.(newScrollTop);

      // 检查是否到达底部
      const { scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - newScrollTop - clientHeight < threshold) {
        onEndReached?.();

        if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
          fetchNextPage();
        }
      }
    },
    [onScroll, onEndReached, hasNextPage, isFetchingNextPage, fetchNextPage, threshold]
  );

  // 观察元素高度变化（动态高度模式）
  useEffect(() => {
    if (!getItemHeight) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const index = parseInt(entry.target.getAttribute('data-index') || '0');
        if (!isNaN(index)) {
          const newHeight = entry.contentRect.height;
          setItemHeights((prev) => {
            if (prev.get(index) !== newHeight) {
              const newMap = new Map(prev);
              newMap.set(index, newHeight);
              return newMap;
            }
            return prev;
          });
        }
      }
    });

    // 观察所有可见的元素
    itemsRef.current.forEach((element, index) => {
      resizeObserver.observe(element);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [getItemHeight, visibleRange]);

  // 渲染可见项目
  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (i >= 0 && i < data.length) {
        items.push(
          <div
            key={i}
            ref={(el) => {
              if (el && getItemHeight) {
                itemsRef.current.set(i, el);
                el.setAttribute('data-index', i.toString());
              }
            }}
            style={getItemStyle(i)}
          >
            {renderItem(data[i], i, getItemStyle(i))}
          </div>
        );
      }
    }
    return items;
  }, [data, visibleRange, renderItem, getItemStyle, getItemHeight]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>{visibleItems}</div>

      {isFetchingNextPage && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            textAlign: 'center',
          }}
        >
          {loadingComponent}
        </div>
      )}
    </div>
  );
};

// 网格虚拟滚动组件
export const VirtualGrid = <T,>({
  data,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  columns,
  renderItem,
  gap = 10,
  ...props
}: VirtualScrollProps<T> & {
  itemWidth: number;
  containerWidth: number;
  columns?: number;
  gap?: number;
}) => {
  const actualColumns = columns || Math.floor(containerWidth / (itemWidth + gap));
  const rows = Math.ceil(data.length / actualColumns);

  // 将一维数据转换为二维网格数据
  const gridData = useMemo(() => {
    const result = [];
    for (let row = 0; row < rows; row++) {
      const rowData = [];
      for (let col = 0; col < actualColumns; col++) {
        const index = row * actualColumns + col;
        if (index < data.length) {
          rowData.push(data[index]);
        } else {
          rowData.push(null);
        }
      }
      result.push(rowData);
    }
    return result;
  }, [data.length, rows, actualColumns]);

  const renderItemGrid = (rowData: (T | null)[], rowIndex: number, style: React.CSSProperties) => {
    return (
      <div
        style={{
          display: 'flex',
          gap,
          height: itemHeight,
          ...style,
        }}
      >
        {rowData.map((item, colIndex) => {
          if (item === null) {
            return <div key={colIndex} style={{ width: itemWidth }} />;
          }
          return (
            <div key={colIndex} style={{ width: itemWidth }}>
              {renderItem(item, rowIndex * actualColumns + colIndex, {
                width: itemWidth,
                height: itemHeight,
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <VirtualScroll
      data={gridData}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderItemGrid}
      {...props}
    />
  );
};

export default VirtualScroll;
