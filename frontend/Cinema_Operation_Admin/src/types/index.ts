/**
 * 类型定义导出文件
 * 统一导出所有模块的类型定义
 */

// 导航相关类型
export * from './navigation';

// 布局相关类型
export * from './layout';

// 重新导出常用类型的别名
export type {
  MenuItem,
  User,
  UserPreference,
  FunctionalArea,
  MenuLevel,
  NavigationAction,
  SidebarState,
  LayoutSize,
  BreadcrumbItem
} from './navigation';