/**
 * 懒加载组件库
 *
 * 提供重型组件的懒加载版本，优化初始渲染性能
 */

// 懒加载工具和包装器
export {
  LazyWrapper,
  createLazyComponent,
  LazyConfigPresets,
  type LazyWrapperConfig,
} from './LazyWrapper';

// 懒加载组件
export { default as LazyDataTable } from './LazyDataTable';
export { default as LazyFormField } from './LazyFormField';
export { default as LazySidebar } from './LazySidebar';

// 重导出类型
export type {
  DataTableProps,
  DataTableColumn,
  DataTablePagination,
  DataTableSelection,
  DataTableActions,
  VirtualScrollConfig,
  PerformanceConfig,
} from './LazyDataTable';

export type { FormFieldProps, FormFieldConfig, FormFieldType } from './LazyFormField';

export type { SidebarProps, MenuItemType, SidebarTheme } from './LazySidebar';

/**
 * 使用指南：
 *
 * 1. 表格组件懒加载：
 * ```tsx
 * import { LazyDataTable } from '@/components/lazy';
 *
 * <LazyDataTable
 *   columns={columns}
 *   dataSource={dataSource}
 *   virtualScroll={{ enabled: true }}
 *   performance={{ enabled: true, renderThreshold: 16 }}
 * />
 * ```
 *
 * 2. 表单组件懒加载：
 * ```tsx
 * import { LazyFormField } from '@/components/lazy';
 *
 * <LazyFormField
 *   config={fieldConfig}
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 *
 * 3. 导航组件懒加载：
 * ```tsx
 * import { LazySidebar } from '@/components/lazy';
 *
 * <LazySidebar
 *   menus={menus}
 *   collapsed={collapsed}
 *   onCollapse={handleCollapse}
 * />
 * ```
 *
 * 4. 自定义懒加载组件：
 * ```tsx
 * import { createLazyComponent, LazyConfigPresets } from '@/components/lazy';
 *
 * const LazyMyComponent = createLazyComponent(
 *   () => import('./MyComponent'),
 *   LazyConfigPresets.chart
 * );
 * ```
 *
 * 性能优化建议：
 * - 对于首次加载不重要的组件使用懒加载
 * - 大型表格和复杂表单优先考虑懒加载
 * - 图表和可视化组件适合使用懒加载
 * - 避免对核心布局组件使用懒加载
 *
 * 预设配置说明：
 * - table: 适合表格组件，显示列表骨架屏
 * - form: 适合表单组件，显示输入框骨架屏
 * - chart: 适合图表组件，显示图片骨架屏
 * - modal: 适合模态框组件，最小化加载状态
 * - navigation: 适合导航组件，显示按钮骨架屏
 */
