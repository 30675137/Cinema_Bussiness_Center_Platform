import { createLazyComponent, LazyConfigPresets } from './LazyWrapper';

/**
 * 懒加载版本的Sidebar组件
 *
 * 使用示例：
 * ```tsx
 * import LazySidebar from '@/components/lazy/LazySidebar';
 *
 * <LazySidebar
 *   menus={menus}
 *   collapsed={collapsed}
 *   onCollapse={handleCollapse}
 * />
 * ```
 */
export default createLazyComponent(() => import('../layout/Sidebar'), LazyConfigPresets.navigation);

// 重导出类型
export type { SidebarProps, MenuItemType, SidebarTheme } from '../layout/Sidebar/types';
