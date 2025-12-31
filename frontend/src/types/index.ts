// 导出基础类型和枚举（从 base.ts）
export * from './base';

// 导出用户类型（从 user.ts）
export * from './user';

// 通用类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

// UI状态类型
export interface LoadingState {
  loading: boolean;
  error?: string;
}

export interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// 表单相关类型
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// 路由相关类型
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  title?: string;
  icon?: string;
  children?: RouteConfig[];
  requireAuth?: boolean;
  permissions?: string[];
}

// 面包屑类型
export interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: string;
}

// 主题相关类型
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  borderRadius: number;
  fontSize: number;
}

// 应用状态类型
export interface AppState {
  user: {
    currentUser: User | null;
    isAuthenticated: boolean;
    permissions: Permission[];
    loading: boolean;
  };
  ui: {
    sidebarCollapsed: boolean;
    theme: ThemeMode;
    locale: 'zh-CN' | 'en-US';
    breadcrumbs: BreadcrumbItem[];
    loading: boolean;
  };
  config: {
    apiBaseUrl: string;
    uploadUrl: string;
    maxFileSize: number;
    supportedImageFormats: string[];
  };
}

// 导出所有类型
export * from './product';
export * from './reservationOrder';
