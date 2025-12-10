/**
 * 布局相关类型定义
 */

/** 菜单项接口 */
export interface MenuItem {
  /** 菜单项唯一标识 */
  id: string;
  /** 菜单显示标题 */
  title: string;
  /** 菜单图标（Ant Design图标名称） */
  icon: string;
  /** 路由路径 */
  path: string;
  /** 子菜单项 */
  children?: MenuItem[];
  /** 权限标识（为未来扩展保留的数据结构） */
  permissions?: string[];
  /** 是否在菜单中显示 */
  visible: boolean;
  /** 菜单排序 */
  order: number;
  /** 菜单分组 */
  group?: string;
}

/** 面包屑节点接口 */
export interface BreadcrumbItem {
  /** 面包屑节点标题 */
  title: string;
  /** 导航路径 */
  path: string;
  /** 是否为当前页面 */
  current: boolean;
}

/** 路由配置接口 */
export interface RouteConfig {
  /** 路由唯一标识 */
  id: string;
  /** 路由路径 */
  path: string;
  /** 页面组件标识 */
  component: string;
  /** 页面标题 */
  title: string;
  /** 父级路由ID */
  parentId?: string;
  /** 路由元数据 */
  meta: {
    /** 是否在菜单中隐藏 */
    hideInMenu?: boolean;
    /** 页面图标 */
    icon?: string;
    /** 权限要求 */
    permissions?: string[];
    /** 面包屑标题 */
    breadcrumbTitle?: string;
  };
}

/** 布局状态接口 */
export interface LayoutState {
  /** 侧边栏折叠状态 */
  sidebarCollapsed: boolean;
  /** 当前选中的菜单项 */
  selectedMenuKeys: string[];
  /** 当前展开的菜单项 */
  openMenuKeys: string[];
  /** 当前面包屑路径 */
  breadcrumbs: BreadcrumbItem[];
  /** 主题模式 */
  theme: 'light' | 'dark';
  /** 屏幕尺寸断点 */
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

/** 侧边栏状态 */
export interface SidebarState {
  collapsed: boolean;
  selectedKeys: string[];
  openKeys: string[];
}

/** 响应式断点 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/** 主题模式 */
export type ThemeMode = 'light' | 'dark';