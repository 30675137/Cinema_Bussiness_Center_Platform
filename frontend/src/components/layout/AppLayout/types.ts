import { ReactNode } from 'react';

/**
 * 侧边栏菜单项接口
 */
export interface MenuItem {
  /** 菜单键值 */
  key: string;
  /** 菜单标签 */
  label: string;
  /** 菜单图标 */
  icon?: ReactNode;
  /** 菜单路径 */
  path?: string;
  /** 子菜单项 */
  children?: MenuItem[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 菜单徽标 */
  badge?: string | number;
  /** 菜单目标 */
  target?: '_blank' | '_self' | '_parent' | '_top';
}

/**
 * 面包屑项接口
 */
export interface BreadcrumbItem {
  /** 面包屑标题 */
  title: string;
  /** 面包屑路径 */
  path?: string;
  /** 是否可点击 */
  clickable?: boolean;
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户ID */
  id: string | number;
  /** 用户名 */
  username: string;
  /** 用户头像 */
  avatar?: string;
  /** 用户角色 */
  role?: string;
  /** 用户邮箱 */
  email?: string;
}

/**
 * 布局主题配置
 */
export interface LayoutTheme {
  /** 主题模式 */
  mode: 'light' | 'dark';
  /** 主色调 */
  primaryColor: string;
  /** 侧边栏背景色 */
  sidebarBgColor: string;
  /** 头部背景色 */
  headerBgColor: string;
}

/**
 * AppLayout组件Props接口
 */
export interface AppLayoutProps {
  /** 应用标题 */
  title?: string;
  /** 应用Logo */
  logo?: ReactNode;
  /** 用户信息 */
  user?: UserInfo;
  /** 菜单数据 */
  menuItems?: MenuItem[];
  /** 面包屑数据 */
  breadcrumbs?: BreadcrumbItem[];
  /** 侧边栏是否收起 */
  sidebarCollapsed?: boolean;
  /** 侧边栏收起变化回调 */
  onSidebarCollapse?: (collapsed: boolean) => void;
  /** 主题配置 */
  theme?: LayoutTheme;
  /** 是否固定头部 */
  fixedHeader?: boolean;
  /** 是否固定侧边栏 */
  fixedSidebar?: boolean;
  /** 内容区域自定义类名 */
  contentClassName?: string;
  /** 头部额外内容 */
  headerExtra?: ReactNode;
  /** 侧边栏底部内容 */
  sidebarFooter?: ReactNode;
  /** 底部内容 */
  footer?: ReactNode;
  /** 侧边栏宽度 */
  sidebarWidth?: number;
  /** 头部高度 */
  headerHeight?: number;
  /** 响应式断点 */
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean;
  /** 是否显示标签页 */
  showTabs?: boolean;
  /** 移动端侧边栏是否打开 */
  mobileSidebarOpen?: boolean;
  /** 移动端侧边栏开关回调 */
  onMobileSidebarChange?: (open: boolean) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 退出登录回调 */
  onLogout?: () => void;
  /** 用户菜单项 */
  userMenuItems?: Array<{
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }>;
}
