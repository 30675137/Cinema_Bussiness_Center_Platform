import { useMemo, useCallback } from 'react';
import { Table, Button, Space, Pagination, Typography, Card } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps } from 'antd/es/pagination';
import { cn } from '../../../utils/cn';
import type { DataTableProps } from './types';

const { Text } = Typography;

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
  ...restProps
}: DataTableProps<T>) {
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
                    : currentKeys.filter(k => k !== key);
                  selection.onChange(checkedKeys, [record]);
                }
              }}
            />
          );
        },
      });
    }

    // 处理业务列
    columns.filter(col => col.visible !== false).forEach((column) => {
      const antColumn: any = {
        title: column.title,
        dataIndex: column.dataIndex,
        key: column.key,
        width: column.width,
        align: column.align || 'left',
        fixed: column.fixed,
        sorter: column.sortable ? (a: any, b: any) => {
          const aVal = a[column.dataIndex];
          const bVal = b[column.dataIndex];
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return aVal - bVal;
          }
          return String(aVal || '').localeCompare(String(bVal || ''));
        } : false,
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
        render: (_, record, index) => {
          const visibleActions = actions.actions.filter(action =>
            action.visible ? action.visible(record) : true
          );

          if (visibleActions.length === 0) return null;

          if (visibleActions.length === 1) {
            const action = visibleActions[0];
            return (
              <Button
                type={action.type || 'link'}
                size="small"
                icon={action.icon}
                danger={action.danger}
                disabled={action.disabled ? action.disabled(record) : false}
                onClick={() => action.onClick(record, index)}
              >
                {action.label}
              </Button>
            );
          }

          return (
            <Space size="small">
              {visibleActions.slice(0, 2).map((action, actionIndex) => (
                <Button
                  key={actionIndex}
                  type={action.type || 'link'}
                  size="small"
                  icon={action.icon}
                  danger={action.danger}
                  disabled={action.disabled ? action.disabled(record) : false}
                  onClick={() => action.onClick(record, index)}
                >
                  {action.label}
                </Button>
              ))}
              {visibleActions.length > 2 && (
                <Button
                  type="link"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={() => {
                    // 这里可以扩展为下拉菜单
                    visibleActions.slice(2).forEach(action => {
                      if (!action.disabled || !action.disabled(record)) {
                        action.onClick(record, index);
                      }
                    });
                  }}
                >
                  更多
                </Button>
              )}
            </Space>
          );
        },
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
      showTotal: pagination?.showTotal !== false ? (total, range) =>
        `第 ${range[0]}-${range[1]} 条，共 ${total} 条` : undefined,
      pageSizeOptions: pagination?.pageSizeOptions || [10, 20, 50, 100],
      onChange: pagination?.onChange,
      onShowSizeChange: pagination?.onShowSizeChange,
    };

    return defaultConfig;
  }, [pagination, dataSource.length]);

  // 处理行属性
  const rowProps = useCallback((record: T, index?: number) => {
    const baseProps = onRow ? onRow(record, index) : {};

    return {
      ...baseProps,
      className: cn(
        baseProps.className,
        striped && index !== undefined && index % 2 === 1 && 'ant-table-row-striped'
      ),
    };
  }, [onRow, striped]);

  // 表格内容
  const tableContent = (
    <Table
      columns={tableColumns}
      dataSource={dataSource}
      rowKey={rowKey}
      bordered={bordered}
      size={size}
      showHeader={showHeader}
      scroll={scroll}
      loading={loading}
      emptyText={emptyText}
      pagination={false} // 我们使用自定义分页
      className={cn(
        'data-table',
        striped && 'data-table-striped',
        className
      )}
      style={style}
      onRow={rowProps}
      {...restProps}
    />
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
                    <Text type="secondary" className="text-sm">{description}</Text>
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
        {footerExtra && (
          <div className="mt-4">
            {footerExtra}
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className={cn('data-table-wrapper', className)}>
      {headerExtra && (
        <div className="mb-4">
          {headerExtra}
        </div>
      )}
      {tableContent}
      {paginationConfig && (
        <div className="mt-4 flex justify-end">
          <Pagination {...paginationConfig} />
        </div>
      )}
      {footerExtra && (
        <div className="mt-4">
          {footerExtra}
        </div>
      )}
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
} from './types';

export default DataTable;