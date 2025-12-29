/**
 * @spec P005-bom-inventory-deduction
 * 用户相关类型定义
 */

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
