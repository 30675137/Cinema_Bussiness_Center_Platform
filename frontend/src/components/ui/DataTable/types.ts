import { ReactNode } from 'react';
import { TableProps } from 'antd';

/**
 * 表格列配置接口
 */
export interface DataTableColumn<T = any> {
  /** 列标题 */
  title: string;
  /** 数据字段名 */
  dataIndex: keyof T;
  /** 列键值 */
  key: string;
  /** 渲染函数 */
  render?: (value: any, record: T, index: number) => ReactNode;
  /** 列宽度 */
  width?: number | string;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可筛选 */
  filterable?: boolean;
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right';
  /** 固定列 */
  fixed?: 'left' | 'right';
  /** 是否显示 */
  visible?: boolean;
}

/**
 * 分页配置接口
 */
export interface DataTablePagination {
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  pageSize: number;
  /** 总条数 */
  total: number;
  /** 页码切换回调 */
  onChange?: (page: number, pageSize: number) => void;
  /** 每页条数变化回调 */
  onShowSizeChange?: (current: number, size: number) => void;
  /** 可选的每页条数 */
  pageSizeOptions?: number[];
  /** 是否显示快速跳转 */
  showQuickJumper?: boolean;
  /** 是否显示总条数 */
  showTotal?: boolean;
}

/**
 * 选择配置接口
 */
export interface DataTableSelection {
  /** 是否启用选择 */
  enabled: boolean;
  /** 选择类型 */
  type?: 'checkbox' | 'radio';
  /** 默认选中行 */
  defaultSelectedRowKeys?: string[] | number[];
  /** 选中变化回调 */
  onChange?: (selectedRowKeys: string[] | number[], selectedRows: any[]) => void;
  /** 选择列配置 */
  columnWidth?: number;
}

/**
 * 表格操作配置接口
 */
export interface DataTableActions {
  /** 操作按钮 */
  actions: Array<{
    /** 按钮标签 */
    label: string;
    /** 按钮类型 */
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    /** 按钮图标 */
    icon?: ReactNode;
    /** 点击回调 */
    onClick: (record: any, index: number) => void;
    /** 是否显示 */
    visible?: (record: any) => boolean;
    /** 是否禁用 */
    disabled?: (record: any) => boolean;
    /** 危险操作 */
    danger?: boolean;
  }>;
  /** 操作列宽度 */
  width?: number | string;
  /** 操作列标题 */
  title?: string;
  /** 操作列固定 */
  fixed?: 'left' | 'right';
}

/**
 * 虚拟滚动配置接口
 */
export interface VirtualScrollConfig {
  /** 是否启用虚拟滚动 */
  enabled?: boolean;
  /** 每行高度 */
  itemHeight?: number;
  /** 缓冲区行数 */
  bufferSize?: number;
  /** 预渲染行数 */
  overscan?: number;
}

/**
 * 性能监控配置接口
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled?: boolean;
  /** 渲染时间阈值（毫秒） */
  renderThreshold?: number;
  /** 是否记录重渲染 */
  logRerenders?: boolean;
}

/**
 * DataTable组件Props接口
 */
export interface DataTableProps<T = any> extends Omit<
  TableProps<T>,
  'columns' | 'dataSource' | 'pagination' | 'title'
> {
  /** 表格列配置 */
  columns: DataTableColumn<T>[];
  /** 数据源 */
  dataSource: T[];
  /** 表格标题 */
  title?: string;
  /** 表格描述 */
  description?: string;
  /** 是否显示表格边框 */
  bordered?: boolean;
  /** 表格大小 */
  size?: 'small' | 'middle' | 'large';
  /** 是否显示斑马纹 */
  striped?: boolean;
  /** 是否显示表头 */
  showHeader?: boolean;
  /** 表格滚动配置 */
  scroll?: { x?: number | true; y?: number };
  /** 空数据文本 */
  emptyText?: ReactNode;
  /** 行键 */
  rowKey?: keyof T | ((record: T) => string);
  /** 分页配置 */
  pagination?: DataTablePagination | false;
  /** 选择配置 */
  selection?: DataTableSelection;
  /** 操作配置 */
  actions?: DataTableActions;
  /** 行选择配置 */
  rowSelection?: TableProps<T>['rowSelection'];
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 表格样式类名 */
  className?: string;
  /** 表格样式 */
  style?: React.CSSProperties;
  /** 行点击事件 */
  onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLElement>;
  /** 头部插件 */
  headerExtra?: ReactNode;
  /** 底部插件 */
  footerExtra?: ReactNode;
  /** 虚拟滚动配置 */
  virtualScroll?: VirtualScrollConfig;
  /** 性能监控配置 */
  performance?: PerformanceConfig;
  /** 是否启用严格模式（更严格的优化） */
  strictMode?: boolean;
}
