/**
 * Tailwind CSS merge utilities
 *
 * 提供强大的CSS类名合并功能，用于解决Tailwind CSS与动态类名的冲突问题
 * 基于tailwind-merge库，专门为Tailwind CSS设计
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 类型定义
 */
export type { ClassValue };

/**
 * Tailwind CSS类名合并工具函数
 *
 * 结合clsx的条件类名处理能力和tailwind-merge的冲突解决能力
 * 特别适用于React组件的动态样式处理
 *
 * @param inputs - 类名输入，可以是字符串、对象、数组等
 * @returns 合并后的类名字符串
 *
 * @example
 * ```tsx
 * // 基础用法
 * const className = tailwindMerge('px-4 py-2', 'bg-blue-500 text-white');
 *
 * // 条件类名
 * const className = tailwindMerge(
 *   'base-class',
 *   {
 *     'active': isActive,
 *     'disabled': isDisabled,
 *   },
 *   condition && 'conditional-class'
 * );
 *
 * // 与Ant Design组件结合使用
 * <Button
 *   classNames={{
 *     root: tailwindMerge('base-button', {
 *       'primary': isPrimary,
 *       'loading': isLoading,
 *     })
 *   }}
 * >
 *   Button
 * </Button>
 * ```
 */
export const tailwindMerge = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Tailwind CSS类名合并的快捷函数
 *
 * 与cn函数功能相同，但专门针对Tailwind CSS优化
 *
 * @param inputs - 类名输入
 * @returns 合并后的类名字符串
 */
export const tw = tailwindMerge;

/**
 * 创建自定义的Tailwind CSS合并配置
 *
 * @param config - tailwind-merge配置选项
 * @returns 配置后的合并函数
 */
export const createTailwindMerge = (config?: any) => {
  return (...inputs: ClassValue[]): string => {
    return twMerge(clsx(inputs), config);
  };
};

/**
 * 常用的Tailwind CSS类名预设
 */
export const tailwindPresets = {
  // 布局相关
  flex: 'flex items-center justify-center',
  'flex-between': 'flex items-center justify-between',
  'flex-start': 'flex items-center justify-start',
  'flex-end': 'flex items-center justify-end',
  'flex-col': 'flex flex-col items-center justify-center',
  'flex-col-between': 'flex flex-col justify-between',
  'grid': 'grid grid-cols-1 gap-4',
  'grid-cols-2': 'grid grid-cols-1 md:grid-cols-2 gap-4',
  'grid-cols-3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  'grid-cols-4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',

  // 间距相关
  'spacing-xs': 'space-x-1 space-y-1',
  'spacing-sm': 'space-x-2 space-y-2',
  'spacing-md': 'space-x-4 space-y-4',
  'spacing-lg': 'space-x-6 space-y-6',
  'padding-xs': 'p-2',
  'padding-sm': 'p-4',
  'padding-md': 'p-6',
  'padding-lg': 'p-8',
  'margin-xs': 'm-2',
  'margin-sm': 'm-4',
  'margin-md': 'm-6',
  'margin-lg': 'm-8',

  // 尺寸相关
  'size-xs': 'w-4 h-4',
  'size-sm': 'w-6 h-6',
  'size-md': 'w-8 h-8',
  'size-lg': 'w-10 h-10',
  'size-xl': 'w-12 h-12',
  'size-2xl': 'w-16 h-16',
  'size-full': 'w-full h-full',
  'size-screen': 'w-screen h-screen',

  // 按钮相关
  'button-base': 'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  'button-primary': 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  'button-secondary': 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  'button-danger': 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  'button-success': 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  'button-warning': 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
  'button-ghost': 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  'button-sm': 'px-3 py-1.5 text-sm',
  'button-lg': 'px-6 py-3 text-lg',

  // 卡片相关
  'card': 'bg-white rounded-lg shadow-md border border-gray-200',
  'card-hover': 'hover:shadow-lg transition-shadow duration-200',
  'card-compact': 'p-4',
  'card-comfortable': 'p-6',
  'card-spacious': 'p-8',

  // 状态相关
  'interactive': 'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200',
  'disabled': 'opacity-50 cursor-not-allowed pointer-events-none',
  'loading': 'animate-pulse opacity-75',
  'active': 'bg-blue-50 border-blue-200 text-blue-700',
  'success': 'bg-green-50 border-green-200 text-green-700',
  'warning': 'bg-yellow-50 border-yellow-200 text-yellow-700',
  'error': 'bg-red-50 border-red-200 text-red-700',
  'info': 'bg-blue-50 border-blue-200 text-blue-700',

  // 输入框相关
  'input-base': 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
  'input-error': 'border-red-300 focus:ring-red-500',
  'input-success': 'border-green-300 focus:ring-green-500',
  'input-disabled': 'bg-gray-100 cursor-not-allowed',

  // 动画相关
  'transition': 'transition-all duration-200 ease-in-out',
  'transition-fast': 'transition-all duration-150 ease-in-out',
  'transition-slow': 'transition-all duration-300 ease-in-out',
  'scale-hover': 'hover:scale-105 active:scale-95 transition-transform duration-200',
  'fade-in': 'animate-fade-in',
  'slide-up': 'animate-slide-up',
  'slide-down': 'animate-slide-down',
  'bounce': 'animate-bounce',
  'spin': 'animate-spin',

  // 阴影相关
  'shadow-sm': 'shadow-sm',
  'shadow-md': 'shadow-md',
  'shadow-lg': 'shadow-lg',
  'shadow-xl': 'shadow-xl',
  'shadow-2xl': 'shadow-2xl',
  'shadow-inner': 'shadow-inner',
  'shadow-none': 'shadow-none',

  // 边框相关
  'border': 'border border-gray-300',
  'border-sm': 'border border-gray-200',
  'border-lg': 'border-2 border-gray-300',
  'rounded': 'rounded-md',
  'rounded-sm': 'rounded-sm',
  'rounded-lg': 'rounded-lg',
  'rounded-full': 'rounded-full',

  // 文本相关
  'text-title': 'text-2xl font-bold text-gray-900',
  'text-subtitle': 'text-xl font-semibold text-gray-800',
  'text-body': 'text-base text-gray-700',
  'text-caption': 'text-sm text-gray-600',
  'text-muted': 'text-gray-500',
  'text-center': 'text-center',
  'text-left': 'text-left',
  'text-right': 'text-right',

  // 响应式相关
  'container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  'mobile-hide': 'hidden md:block',
  'desktop-hide': 'block md:hidden',
  'mobile-full': 'w-full md:w-auto',

  // 导航相关
  'nav-item': 'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
  'nav-item-active': 'bg-blue-100 text-blue-700',
  'nav-item-hover': 'hover:bg-gray-100 hover:text-gray-900',

  // 表格相关
  'table-cell': 'px-4 py-2 border-b border-gray-200 text-sm',
  'table-header': 'px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  'table-row-hover': 'hover:bg-gray-50 transition-colors duration-150',

  // 模态框相关
  'modal-overlay': 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
  'modal-content': 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
  'modal-header': 'px-6 py-4 border-b border-gray-200',
  'modal-body': 'px-6 py-4',
  'modal-footer': 'px-6 py-4 border-t border-gray-200 bg-gray-50',

  // 加载状态相关
  'skeleton': 'animate-pulse bg-gray-200 rounded',
  'skeleton-text': 'h-4 bg-gray-200 rounded animate-pulse',
  'skeleton-avatar': 'w-10 h-10 bg-gray-200 rounded-full animate-pulse',
  'spinner': 'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
};

/**
 * 使用预设的Tailwind CSS类名
 *
 * @param preset - 预设名称
 * @param additionalClasses - 额外的类名
 * @returns 合并后的类名字符串
 *
 * @example
 * ```tsx
 * // 使用预设
 * const className = tailwindPreset('flex-between', 'p-4');
 * // 结果: 'flex items-center justify-between p-4'
 * ```
 */
export const tailwindPreset = (preset: keyof typeof tailwindPresets, ...additionalClasses: ClassValue[]): string => {
  return tailwindMerge(tailwindPresets[preset], ...additionalClasses);
};

/**
 * 响应式Tailwind CSS类名生成器
 *
 * @param classes - 类名映射 { base: 'px-4', sm: 'px-6', lg: 'px-8' }
 * @returns 响应式类名字符串
 *
 * @example
 * ```tsx
 * const className = tailwindResponsive({
 *   base: 'px-4 py-2',
 *   sm: 'px-6 py-3',
 *   lg: 'px-8 py-4',
 * });
 * ```
 */
export const tailwindResponsive = (classes: Record<string, string | undefined>): string => {
  const responsiveClasses: string[] = [];

  Object.entries(classes).forEach(([breakpoint, className]) => {
    if (className) {
      if (breakpoint === 'base') {
        responsiveClasses.push(className);
      } else {
        responsiveClasses.push(`${breakpoint}:${className}`);
      }
    }
  });

  return responsiveClasses.join(' ');
};

/**
 * Ant Design组件专用的Tailwind CSS合并函数
 *
 * 专门用于Ant Design组件的样式增强，避免样式冲突
 *
 * @param antdClass - Ant Design的默认类名
 * @param tailwindClasses - Tailwind CSS类名
 * @returns 合并后的类名字符串
 *
 * @example
 * ```tsx
 * <Button
 *   className={antdMerge(
 *     'ant-btn-primary',
 *     'hover:opacity-90 active:scale-95'
 *   )}
 * >
 *   Button
 * </Button>
 * ```
 */
export const antdMerge = (antdClass: string, ...tailwindClasses: ClassValue[]): string => {
  return `${antdClass} ${tailwindMerge(...tailwindClasses)}`;
};

/**
 * 获取预设类名的所有可用选项
 */
export const getAvailablePresets = (): string[] => {
  return Object.keys(tailwindPresets);
};

/**
 * 检查预设是否存在
 */
export const hasPreset = (preset: string): boolean => {
  return preset in tailwindPresets;
};

/**
 * 安全地使用预设（如果不存在则返回空字符串）
 */
export const safeTailwindPreset = (preset: string, ...additionalClasses: ClassValue[]): string => {
  if (!hasPreset(preset)) {
    console.warn(`Preset "${preset}" not found. Available presets:`, getAvailablePresets());
    return tailwindMerge(...additionalClasses);
  }
  return tailwindPreset(preset as keyof typeof tailwindPresets, ...additionalClasses);
};

/**
 * 创建主题相关的类名组合
 */
export const createThemeClasses = (theme: 'light' | 'dark', baseClasses: string) => {
  const themePrefix = theme === 'dark' ? 'dark:' : '';
  return tailwindMerge(baseClasses, themePrefix + baseClasses.split(' ').map(cls => {
    // 为深色主题转换颜色类名
    if (cls.includes('text-gray-')) return cls.replace('text-gray-', 'text-gray-700');
    if (cls.includes('bg-gray-')) return cls.replace('bg-gray-', 'bg-gray-800');
    if (cls.includes('border-gray-')) return cls.replace('border-gray-', 'border-gray-600');
    return cls;
  }).join(' '));
};

/**
 * 条件类名应用器
 */
export const conditionalClasses = (condition: boolean, trueClasses: ClassValue, falseClasses: ClassValue = ''): string => {
  return tailwindMerge(
    condition ? trueClasses : falseClasses
  );
};

/**
 * 状态变体生成器（hover, focus, active等）
 */
export const createStateVariants = (baseClass: string, variants: {
  hover?: ClassValue;
  focus?: ClassValue;
  active?: ClassValue;
  disabled?: ClassValue;
}): string => {
  const classes: string[] = [baseClass];

  if (variants.hover) {
    classes.push(`hover:${tailwindMerge(variants.hover)}`);
  }
  if (variants.focus) {
    classes.push(`focus:${tailwindMerge(variants.focus)}`);
  }
  if (variants.active) {
    classes.push(`active:${tailwindMerge(variants.active)}`);
  }
  if (variants.disabled) {
    classes.push(`disabled:${tailwindMerge(variants.disabled)}`);
  }

  return tailwindMerge(classes);
};

/**
 * 响应式尺寸生成器
 */
export const createResponsiveSize = (
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string,
  xxl?: string
): string => {
  const classes: string[] = [base];

  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  if (xxl) classes.push(`2xl:${xxl}`);

  return tailwindMerge(classes);
};

/**
 * 网格布局生成器
 */
export const createGridLayout = (
  cols: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number },
  gap: string = '4'
): string => {
  const gapClass = `gap-${gap}`;

  if (typeof cols === 'number') {
    return tailwindMerge(`grid-cols-${cols}`, gapClass);
  }

  const classes: string[] = [gapClass];

  if (cols.base) classes.push(`grid-cols-${cols.base}`);
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);

  // 默认使用1列
  if (!cols.base && !cols.sm && !cols.md && !cols.lg && !cols.xl) {
    classes.push('grid-cols-1');
  }

  return tailwindMerge('grid', classes);
};

/**
 * Ant Design组件专用样式生成器
 */
export const createAntdStyles = (component: 'button' | 'input' | 'select' | 'modal' | 'table', variant: 'default' | 'primary' | 'danger' | 'success' | 'warning' = 'default'): string => {
  const baseStyles = {
    button: 'ant-btn',
    input: 'ant-input',
    select: 'ant-select',
    modal: 'ant-modal',
    table: 'ant-table',
  };

  const variantStyles = {
    default: '',
    primary: 'ant-btn-primary',
    danger: 'ant-btn-dangerous',
    success: 'ant-btn-success',
    warning: 'ant-btn-warning',
  };

  return antdMerge(
    baseStyles[component],
    variantStyles[variant],
    'transition-all duration-200'
  );
};

/**
 * 导出默认函数
 */
export default tailwindMerge;