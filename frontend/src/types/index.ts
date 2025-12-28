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

// 状态枚举
export enum MaterialType {
  RAW_MATERIAL = 'raw_material',      // 原材料
  SEMI_FINISHED = 'semi_finished',  // 半成品
  FINISHED_GOOD = 'finished_good'   // 成品
}

export enum ProductStatus {
  DRAFT = 'draft',                   // 草稿
  PENDING_REVIEW = 'pending_review', // 待审核
  APPROVED = 'approved',             // 已审核
  PUBLISHED = 'published',           // 已发布
  DISABLED = 'disabled',              // 已禁用
  ARCHIVED = 'archived'             // 已归档
}

export enum StoreType {
  CINEMA = 'cinema',        // 影院
  THEATER = 'theater',      // 剧院
  CONCERT_HALL = 'concert_hall', // 音乐厅
  MIXED = 'mixed'           // 综合体
}

export enum ChannelType {
  MINI_PROGRAM = 'mini_program', // 小程序
  APP = 'app',                   // APP
  WEBSITE = 'website',           // 官网
  OFFLINE = 'offline'            // 线下
}

// 基础实体类型
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive' | 'locked';
  permissions: Permission[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  module: string;
  type: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'import';
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