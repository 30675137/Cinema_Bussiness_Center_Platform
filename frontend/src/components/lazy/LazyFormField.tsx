import { createLazyComponent, LazyConfigPresets } from './LazyWrapper';

/**
 * 懒加载版本的FormField组件
 *
 * 使用示例：
 * ```tsx
 * import LazyFormField from '@/components/lazy/LazyFormField';
 *
 * <LazyFormField
 *   config={fieldConfig}
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 */
export default createLazyComponent(
  () => import('../ui/FormField'),
  LazyConfigPresets.form
);

// 重导出类型
export type {
  FormFieldProps,
  FormFieldConfig,
  FormFieldType,
} from '../ui/FormField/types';