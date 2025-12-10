import { RolePermission } from './RolePermission';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  level: number;
  isSystem: boolean;
  status: RoleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PredefinedRole {
  ADMIN = 'admin',
  OPERATION_MANAGER = 'operation_manager',
  STORE_MANAGER = 'store_manager',
  AUDITOR = 'auditor',
}

export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

export interface CreateRoleData {
  name: string;
  displayName: string;
  description?: string;
  level?: number;
  isSystem?: boolean;
  status?: RoleStatus;
}

export interface UpdateRoleData {
  displayName?: string;
  description?: string;
  status?: RoleStatus;
  updatedAt?: Date;
}

// 角色层级定义
export const ROLE_LEVELS = {
  [PredefinedRole.ADMIN]: 100,
  [PredefinedRole.OPERATION_MANAGER]: 80,
  [PredefinedRole.STORE_MANAGER]: 60,
  [PredefinedRole.AUDITOR]: 70,
} as const;

// 角色名称映射
export const ROLE_NAMES = {
  [PredefinedRole.ADMIN]: '管理员',
  [PredefinedRole.OPERATION_MANAGER]: '运营经理',
  [PredefinedRole.STORE_MANAGER]: '店长',
  [PredefinedRole.AUDITOR]: '审核员',
} as const;