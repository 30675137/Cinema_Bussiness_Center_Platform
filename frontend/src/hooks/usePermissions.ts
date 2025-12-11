import { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 用户角色枚举
 */
export enum UserRole {
  VIEWER = 'viewer',           // 查看者
  OPERATOR = 'operator',       // 操作员
  ADMIN = 'admin',            // 管理员
}

/**
 * 权限枚举
 */
export enum Permission {
  // 库存台账权限
  VIEW_INVENTORY = 'view_inventory',
  EXPORT_INVENTORY = 'export_inventory',
  
  // 库存流水权限
  VIEW_MOVEMENTS = 'view_movements',
  EXPORT_MOVEMENTS = 'export_movements',
  
  // 库存调整权限
  ADJUST_INVENTORY = 'adjust_inventory',
  APPROVE_ADJUSTMENT = 'approve_adjustment',
  
  // 库存转移权限
  CREATE_TRANSFER = 'create_transfer',
  APPROVE_TRANSFER = 'approve_transfer',
  RECEIVE_TRANSFER = 'receive_transfer',
  
  // 库存管理权限
  MANAGE_ALERTS = 'manage_alerts',
  MANAGE_BATCHES = 'manage_batches',
  MANAGE_SETTINGS = 'manage_settings',
}

/**
 * 角色权限映射
 * 根据规范定义三层权限体系
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [
    Permission.VIEW_INVENTORY,
    Permission.VIEW_MOVEMENTS,
  ],
  [UserRole.OPERATOR]: [
    Permission.VIEW_INVENTORY,
    Permission.VIEW_MOVEMENTS,
    Permission.EXPORT_INVENTORY,
    Permission.EXPORT_MOVEMENTS,
    Permission.ADJUST_INVENTORY,
    Permission.CREATE_TRANSFER,
    Permission.RECEIVE_TRANSFER,
    Permission.MANAGE_BATCHES,
  ],
  [UserRole.ADMIN]: Object.values(Permission), // 管理员拥有所有权限
};

/**
 * 权限存储接口
 */
interface PermissionStore {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  resetRole: () => void;
}

/**
 * 权限存储
 * 使用Zustand管理当前用户角色
 */
export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set) => ({
      currentRole: UserRole.VIEWER, // 默认为查看者角色
      setRole: (role: UserRole) => set({ currentRole: role }),
      resetRole: () => set({ currentRole: UserRole.VIEWER }),
    }),
    {
      name: 'permission-store',
    }
  )
);

/**
 * 权限钩子
 * 提供权限检查和角色管理功能
 */
export const usePermissions = () => {
  const { currentRole, setRole, resetRole } = usePermissionStore();
  
  /**
   * 当前角色的所有权限
   */
  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[currentRole] || [];
  }, [currentRole]);
  
  /**
   * 检查是否拥有指定权限
   */
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };
  
  /**
   * 检查是否拥有任意一个权限
   */
  const hasAnyPermission = (...permissionsToCheck: Permission[]): boolean => {
    return permissionsToCheck.some(p => permissions.includes(p));
  };
  
  /**
   * 检查是否拥有所有权限
   */
  const hasAllPermissions = (...permissionsToCheck: Permission[]): boolean => {
    return permissionsToCheck.every(p => permissions.includes(p));
  };
  
  /**
   * 是否为管理员
   */
  const isAdmin = currentRole === UserRole.ADMIN;
  
  /**
   * 是否为操作员
   */
  const isOperator = currentRole === UserRole.OPERATOR;
  
  /**
   * 是否为查看者
   */
  const isViewer = currentRole === UserRole.VIEWER;
  
  /**
   * 是否可以调整库存
   */
  const canAdjustInventory = hasPermission(Permission.ADJUST_INVENTORY);
  
  /**
   * 是否可以导出数据
   */
  const canExportData = hasPermission(Permission.EXPORT_INVENTORY) || 
                        hasPermission(Permission.EXPORT_MOVEMENTS);
  
  /**
   * 是否可以管理转移
   */
  const canManageTransfers = hasAnyPermission(
    Permission.CREATE_TRANSFER,
    Permission.APPROVE_TRANSFER,
    Permission.RECEIVE_TRANSFER
  );
  
  return {
    // 角色信息
    currentRole,
    setRole,
    resetRole,
    isAdmin,
    isOperator,
    isViewer,
    
    // 权限列表
    permissions,
    
    // 权限检查
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // 常用权限检查
    canAdjustInventory,
    canExportData,
    canManageTransfers,
  };
};

/**
 * 角色选项配置
 */
export const ROLE_OPTIONS = [
  {
    value: UserRole.VIEWER,
    label: '查看者',
    description: '仅可查看库存台账和流水',
    color: 'default',
  },
  {
    value: UserRole.OPERATOR,
    label: '操作员',
    description: '可查看、导出、调整库存和创建转移',
    color: 'blue',
  },
  {
    value: UserRole.ADMIN,
    label: '管理员',
    description: '拥有所有权限',
    color: 'red',
  },
] as const;

/**
 * 获取角色显示名称
 */
export const getRoleLabel = (role: UserRole): string => {
  const option = ROLE_OPTIONS.find(o => o.value === role);
  return option?.label || role;
};

/**
 * 获取权限显示名称
 */
export const getPermissionLabel = (permission: Permission): string => {
  const labels: Record<Permission, string> = {
    [Permission.VIEW_INVENTORY]: '查看库存台账',
    [Permission.EXPORT_INVENTORY]: '导出库存数据',
    [Permission.VIEW_MOVEMENTS]: '查看库存流水',
    [Permission.EXPORT_MOVEMENTS]: '导出流水数据',
    [Permission.ADJUST_INVENTORY]: '调整库存',
    [Permission.APPROVE_ADJUSTMENT]: '审批库存调整',
    [Permission.CREATE_TRANSFER]: '创建库存转移',
    [Permission.APPROVE_TRANSFER]: '审批库存转移',
    [Permission.RECEIVE_TRANSFER]: '接收库存转移',
    [Permission.MANAGE_ALERTS]: '管理库存警报',
    [Permission.MANAGE_BATCHES]: '管理库存批次',
    [Permission.MANAGE_SETTINGS]: '管理系统设置',
  };
  
  return labels[permission] || permission;
};
