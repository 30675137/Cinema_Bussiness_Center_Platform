import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { Table, Button, Space, Pagination, Typography, Card, notification } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps } from 'antd/es/pagination';
import { cn, tailwindPreset, tw } from '../../../utils';
import type { DataTableProps, VirtualScrollConfig, PerformanceConfig } from './types';

const { Text } = Typography;

// 性能监控Hook
const usePerformanceMonitor = (
  config: PerformanceConfig = {},
  componentName: string = 'DataTable'
) => {
  const renderCountRef = useRef(0);
  const renderTimeRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current += 1;
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      renderTimeRef.current = endTime - startTime;

      if (config.enabled && renderTimeRef.current > (config.renderThreshold || 16)) {
        console.warn(
          `[Performance] ${componentName} render took ${renderTimeRef.current.toFixed(2)}ms (render #${renderCountRef.current})`
        );
      }

      if (config.logRerenders) {
        console.log(
          `[Performance] ${componentName} rendered ${renderCountRef.current} times, last render: ${renderTimeRef.current.toFixed(2)}ms`
        );
      }
    };
  });

  return {
    renderCount: renderCountRef.current,
    lastRenderTime: renderTimeRef.current,
  };
};

// 缓存操作按钮渲染器
const ActionButton = React.memo<{
  action: any;
  record: any;
  index: number;
}>(({ action, record, index }) => {
  return (
    <Button
      type={action.type || 'link'}
      size="small"
      icon={action.icon}
      danger={action.danger}
      disabled={action.disabled ? action.disabled(record) : false}
      onClick={() => action.onClick(record, index)}
      className={cn('action-button', action.className)}
    >
      {action.label}
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

// 更多操作按钮组件
const MoreActionsButton = React.memo<{
  actions: any[];
  record: any;
  index: number;
}>(({ actions, record, index }) => {
  const visibleActions = useMemo(() => {
    return actions.filter((action) => !action.disabled || !action.disabled(record));
  }, [actions, record]);

  const handleMoreClick = useCallback(() => {
    visibleActions.slice(2).forEach((action) => {
      action.onClick(record, index);
    });
  }, [visibleActions, record, index]);

  return (
    <Button
      type="link"
      size="small"
      icon={<MoreOutlined />}
      onClick={handleMoreClick}
      className="more-actions-button"
    >
      更多
    </Button>
  );
});

MoreActionsButton.displayName = 'MoreActionsButton';

/**
 * DataTable 组件 - 标准化的数据表格组件
 */
function DataTable<T extends Record<string, any>>({
  columns,
  dataSource,
  title,
  description,
  bordered = true,
  size = 'middle',
  striped = false,
  showHeader = true,
  scroll,
  emptyText,
  rowKey = 'id',
  pagination,
  selection,
  actions,
  loading = false,
  className,
  style,
  onRow,
  headerExtra,
  footerExtra,
  virtualScroll,
  performance,
  strictMode = false,
  ...restProps
}: DataTableProps<T>) {
  // 性能监控
  usePerformanceMonitor(performance, 'DataTable');

  // 虚拟滚动配置
  const virtualConfig = useMemo(
    () => ({
      enabled: virtualScroll?.enabled || false,
      itemHeight: virtualScroll?.itemHeight || 54,
      bufferSize: virtualScroll?.bufferSize || 5,
      overscan: virtualScroll?.overscan || 10,
    }),
    [virtualScroll]
  );

  // 检查是否应该启用虚拟滚动
  const shouldUseVirtualScroll = useMemo(() => {
    return virtualConfig.enabled && dataSource.length > 50;
  }, [virtualConfig.enabled, dataSource.length]);

  // 优化的滚动配置
  const optimizedScroll = useMemo(() => {
    if (shouldUseVirtualScroll) {
      const viewportHeight = virtualConfig.itemHeight * 10; // 显示10行
      return {
        x: scroll?.x,
        y: viewportHeight,
      };
    }
    return scroll;
  }, [shouldUseVirtualScroll, virtualConfig.itemHeight, scroll]);
  // 转换列配置为Ant Design表格列格式
  const tableColumns = useMemo((): ColumnsType<T> => {
    const resultColumns: ColumnsType<T> = [];

    // 添加选择列
    if (selection?.enabled) {
      resultColumns.push({
        title: '',
        key: '__selection',
        width: selection.columnWidth || 50,
        fixed: 'left',
        render: (_, record) => {
          const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey as keyof T];
          return (
            <input
              type={selection.type || 'checkbox'}
              className="ant-checkbox-input"
              defaultChecked={selection.defaultSelectedRowKeys?.includes(key as string)}
              onChange={(e) => {
                if (selection.onChange) {
                  const currentKeys = (selection.defaultSelectedRowKeys || []) as string[];
                  const checkedKeys = e.target.checked
                    ? [...currentKeys, key as string]
                    : currentKeys.filter((k) => k !== key);
                  selection.onChange(checkedKeys, [record]);
                }
              }}
            />
          );
        },
      });
    }

    // 处理业务列
    columns
      .filter((col) => col.visible !== false)
      .forEach((column) => {
        const antColumn: any = {
          title: column.title,
          dataIndex: column.dataIndex,
          key: column.key,
          width: column.width,
          align: column.align || 'left',
          fixed: column.fixed,
          sorter: column.sortable
            ? (a: any, b: any) => {
                const aVal = a[column.dataIndex];
                const bVal = b[column.dataIndex];
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                  return aVal - bVal;
                }
                return String(aVal || '').localeCompare(String(bVal || ''));
              }
            : false,
          render: column.render,
        };

        resultColumns.push(antColumn);
      });

    // 添加操作列
    if (actions?.actions && actions.actions.length > 0) {
      resultColumns.push({
        title: actions.title || '操作',
        key: '__actions',
        width: actions.width || 150,
        fixed: actions.fixed || 'right',
        render: React.memo((_, record: T, index: number) => {
          // 缓存可见操作
          const visibleActions = useMemo(() => {
            return actions.actions.filter((action) =>
              action.visible ? action.visible(record) : true
            );
          }, [actions.actions, record]);

          if (visibleActions.length === 0) return null;

          if (visibleActions.length === 1) {
            const action = visibleActions[0];
            return (
              <ActionButton
                key={`action-${action.label}`}
                action={action}
                record={record}
                index={index}
              />
            );
          }

          return (
            <Space size="small" className="actions-space">
              {visibleActions.slice(0, 2).map((action, actionIndex) => (
                <ActionButton
                  key={`action-${actionIndex}`}
                  action={action}
                  record={record}
                  index={index}
                />
              ))}
              {visibleActions.length > 2 && (
                <MoreActionsButton actions={visibleActions} record={record} index={index} />
              )}
            </Space>
          );
        }),
      });
    }

    return resultColumns;
  }, [columns, selection, actions, rowKey]);

  // 处理分页配置
  const paginationConfig = useMemo(() => {
    if (pagination === false) return false;

    const defaultConfig: Partial<PaginationProps> = {
      current: pagination?.current || 1,
      pageSize: pagination?.pageSize || 20,
      total: pagination?.total || dataSource.length,
      showSizeChanger: true,
      showQuickJumper: pagination?.showQuickJumper !== false,
      showTotal:
        pagination?.showTotal !== false
          ? (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          : undefined,
      pageSizeOptions: pagination?.pageSizeOptions || [10, 20, 50, 100],
      onChange: pagination?.onChange,
      onShowSizeChange: pagination?.onShowSizeChange,
    };

    return defaultConfig;
  }, [pagination, dataSource.length]);

  // 处理行属性
  const rowProps = useCallback(
    (record: T, index?: number) => {
      const baseProps = onRow ? onRow(record, index) : {};

      return {
        ...baseProps,
        className: cn(
          baseProps.className,
          striped && index !== undefined && index % 2 === 1 && 'ant-table-row-striped'
        ),
      };
    },
    [onRow, striped]
  );

  // 表格性能优化配置
  const tablePerformanceConfig = useMemo(() => {
    if (strictMode || shouldUseVirtualScroll) {
      return {
        // 启用行虚拟化
        components: shouldUseVirtualScroll
          ? {
              body: {
                row: ({ children, ...props }: any) => (
                  <div {...props} style={{ height: virtualConfig.itemHeight }}>
                    {children}
                  </div>
                ),
              },
            }
          : undefined,
        // 其他性能优化
        rowClassName: (record: T, index: number) => {
          const baseClass = strictMode ? 'ant-table-row-optimized' : '';
          return cn(
            baseClass,
            striped && index !== undefined && index % 2 === 1 && 'ant-table-row-striped'
          );
        },
      };
    }
    return {};
  }, [strictMode, shouldUseVirtualScroll, striped, virtualConfig.itemHeight]);

  // 表格内容
  const tableContent = React.useMemo(
    () => (
      <Table
        columns={tableColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        bordered={bordered}
        size={size}
        showHeader={showHeader}
        scroll={optimizedScroll}
        loading={loading}
        emptyText={emptyText}
        pagination={false} // 我们使用自定义分页
        className={cn(
          'data-table',
          tw(tailwindPreset('transition-fast')),
          striped && 'data-table-striped',
          shouldUseVirtualScroll && 'data-table-virtual',
          strictMode && 'data-table-strict',
          className
        )}
        style={{
          ...style,
          ...(shouldUseVirtualScroll &&
            ({
              '--virtual-item-height': `${virtualConfig.itemHeight}px`,
            } as React.CSSProperties)),
        }}
        onRow={rowProps}
        {...tablePerformanceConfig}
        {...restProps}
      />
    ),
    [
      tableColumns,
      dataSource,
      rowKey,
      bordered,
      size,
      showHeader,
      optimizedScroll,
      loading,
      emptyText,
      striped,
      shouldUseVirtualScroll,
      strictMode,
      className,
      style,
      rowProps,
      tablePerformanceConfig,
      virtualConfig.itemHeight,
      restProps,
    ]
  );

  // 如果有标题或描述，使用Card包装
  if (title || description || headerExtra || footerExtra) {
    return (
      <Card
        className={cn('data-table-card', className)}
        bordered={bordered}
        title={
          title && (
            <div className="flex items-center justify-between">
              <div>
                <Text strong>{title}</Text>
                {description && (
                  <div className="mt-1">
                    <Text type="secondary" className="text-sm">
                      {description}
                    </Text>
                  </div>
                )}
              </div>
              {headerExtra}
            </div>
          )
        }
        extra={!title && headerExtra}
      >
        {tableContent}
        {paginationConfig && (
          <div className="mt-4 flex justify-end">
            <Pagination {...paginationConfig} />
          </div>
        )}
        {footerExtra && <div className="mt-4">{footerExtra}</div>}
      </Card>
    );
  }

  return (
    <div className={cn('data-table-wrapper', className)}>
      {headerExtra && <div className="mb-4">{headerExtra}</div>}
      {tableContent}
      {paginationConfig && (
        <div className="mt-4 flex justify-end">
          <Pagination {...paginationConfig} />
        </div>
      )}
      {footerExtra && <div className="mt-4">{footerExtra}</div>}
    </div>
  );
}

// 导出类型
export type {
  DataTableProps,
  DataTableColumn,
  DataTablePagination,
  DataTableSelection,
  DataTableActions,
  VirtualScrollConfig,
  PerformanceConfig,
} from './types';

// 使用React.memo优化组件重渲染
const OptimizedDataTable = React.memo(DataTable) as typeof DataTable;

// 设置显示名称，便于调试
OptimizedDataTable.displayName = 'OptimizedDataTable';

export default OptimizedDataTable;
