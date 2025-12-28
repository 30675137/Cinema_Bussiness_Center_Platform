/**
 * 布局组件相关类型定义
 */

import { MenuItem, User } from './navigation';

/**
 * 布局尺寸枚举
 */
export enum LayoutSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

/**
 * 侧边栏状态枚举
 */
export enum SidebarState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
  HIDDEN = 'hidden'
}

/**
 * 面包屑项接口
 */
export interface BreadcrumbItem {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  isActive?: boolean;
}

/**
 * 布局配置接口
 */
export interface LayoutConfig {
  sidebarWidth: {
    expanded: number;
    collapsed: number;
  };
  headerHeight: number;
  footerHeight: number;
  contentPadding: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

/**
 * 响应式断点接口
 */
export interface ResponsiveBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

/**
 * 布局主题接口
 */
export interface LayoutTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  activeColor: string;
}

/**
 * 侧边栏属性接口
 */
export interface SidebarProps {
  menus: MenuItem[];
  collapsed: boolean;
  onMenuClick?: (menu: MenuItem) => void;
  onToggle?: () => void;
  activeMenuId?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 菜单项属性接口
 */
export interface MenuItemProps {
  menu: MenuItem;
  isActive?: boolean;
  level?: number;
  onClick?: (menu: MenuItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 面包屑属性接口
 */
export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  maxItems?: number;
  onItemClick?: (item: BreadcrumbItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 布局头部属性接口
 */
export interface LayoutHeaderProps {
  title?: string;
  user?: User;
  breadcrumb?: BreadcrumbItem[];
  onSidebarToggle?: () => void;
  onUserMenuClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 应用布局属性接口
 */
export interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 导航搜索属性接口
 */
export interface NavigationSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSelect?: (menu: MenuItem) => void;
  maxResults?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 收藏菜单属性接口
 */
export interface FavoriteMenuProps {
  menus: MenuItem[];
  onMenuClick?: (menu: MenuItem) => void;
  onRemove?: (menuId: string) => void;
  maxItems?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 布局状态接口
 */
export interface LayoutState {
  sidebarState: SidebarState;
  screenSize: LayoutSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  headerHeight: number;
  sidebarWidth: number;
}

/**
 * 布局上下文接口
 */
export interface LayoutContextValue {
  state: LayoutState;
  actions: {
    toggleSidebar: () => void;
    setSidebarState: (state: SidebarState) => void;
    updateScreenSize: (size: LayoutSize) => void;
  };
}

/**
 * 移动端导航抽屉属性接口
 */
export interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
  menus: MenuItem[];
  onMenuClick?: (menu: MenuItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 导航工具属性接口
 */
export interface NavigationToolsProps {
  searchEnabled?: boolean;
  favoritesEnabled?: boolean;
  breadcrumbsEnabled?: boolean;
  userMenuEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}