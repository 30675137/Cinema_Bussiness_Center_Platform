export interface Permission {
  id: string;
  name: string;
  code: string;
  resource: string;
  action: string;
  conditions?: string[];
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PermissionResource {
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand',
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  AUDIT = 'audit',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  BATCH_CREATE = 'batch_create',
  BATCH_UPDATE = 'batch_update',
  BATCH_DELETE = 'batch_delete',
  EXPORT = 'export',
  IMPORT = 'import',
}

// 商品相关权限定义
export const PRODUCT_PERMISSIONS = {
  // 基础权限
  PRODUCT_LIST: 'product:list',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_READ: 'product:read',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // 状态管理权限
  PRODUCT_SUBMIT_REVIEW: 'product:submit_review',
  PRODUCT_APPROVE: 'product:approve',
  PRODUCT_REJECT: 'product:reject',
  PRODUCT_PUBLISH: 'product:publish',
  PRODUCT_UNPUBLISH: 'product:unpublish',

  // 批量操作权限
  PRODUCT_BATCH_CREATE: 'product:batch_create',
  PRODUCT_BATCH_UPDATE: 'product:batch_update',
  PRODUCT_BATCH_DELETE: 'product:batch_delete',
  PRODUCT_BATCH_APPROVE: 'product:batch_approve',
  PRODUCT_BATCH_REJECT: 'product:batch_reject',

  // 导入导出权限
  PRODUCT_EXPORT: 'product:export',
  PRODUCT_IMPORT: 'product:import',
} as const;

export interface CreatePermissionData {
  name: string;
  code: string;
  resource: string;
  action: string;
  conditions?: string[];
  description?: string;
  isSystem?: boolean;
}

export interface UpdatePermissionData {
  name?: string;
  code?: string;
  resource?: string;
  action?: string;
  conditions?: string[];
  description?: string;
  updatedAt?: Date;
}

// 权限验证条件
export const PERMISSION_CONDITIONS = {
  // 数据级别条件
  OWN_DATA_ONLY: 'own_data_only',      // 只能操作自己的数据
  STORE_DATA_ONLY: 'store_data_only',  // 只能操作本店数据
  ALL_DATA: 'all_data',               // 可以操作所有数据

  // 状态条件
  DRAFT_ONLY: 'draft_only',           // 只能操作草稿状态
  PENDING_ONLY: 'pending_only',       // 只能操作待审核状态
  PUBLISHED_ONLY: 'published_only',   // 只能操作已发布状态

  // 字段级权限
  SENSITIVE_FIELDS: 'sensitive_fields', // 可以访问敏感字段（成本价等）
  FINANCIAL_FIELDS: 'financial_fields', // 可以访问财务字段
} as const;