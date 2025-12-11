import { createLazyComponent, LazyConfigPresets } from './LazyWrapper';

/**
 * 懒加载版本的DataTable组件
 *
 * 使用示例：
 * ```tsx
 * import LazyDataTable from '@/components/lazy/LazyDataTable';
 *
 * <LazyDataTable
 *   columns={columns}
 *   dataSource={dataSource}
 *   title="懒加载表格"
 *   virtualScroll={{ enabled: true }}
 * />
 * ```
 */
export default createLazyComponent(
  () => import('../ui/DataTable'),
  LazyConfigPresets.table
);

// 重导出类型
export type {
  DataTableProps,
  DataTableColumn,
  DataTablePagination,
  DataTableSelection,
  DataTableActions,
  VirtualScrollConfig,
  PerformanceConfig,
} from '../ui/DataTable/types';