/**
 * 权限管理Hook
 * 提供权限检查和用户角色管理功能
 */

import { useState, useCallback, useMemo } from 'react';
import type { User, UserRole, Permission, INVENTORY_PERMISSIONS, INVENTORY_ROLES } from '@types/inventory';

// Mock用户数据
const mockUsers: User[] = [
  {
    id: 'user_001',
    name: '张三',
    email: 'zhangsan@cinema.com',
    avatar: '',
    role: INVENTORY_ROLES.VIEWER,
    permissions: [INVENTORY_PERMISSIONS.READ],
  },
  {
    id: 'user_002',
    name: '李四',
    email: 'lisi@cinema.com',
    avatar: '',
    role: INVENTORY_ROLES.OPERATOR,
    permissions: [
      INVENTORY_PERMISSIONS.READ,
      INVENTORY_PERMISSIONS.WRITE,
      INVENTORY_PERMISSIONS.ADJUST,
    ],
  },
  {
    id: 'user_003',
    name: '王五',
    email: 'wangwu@cinema.com',
    avatar: '',
    role: INVENTORY_ROLES.ADMIN,
    permissions: [
      INVENTORY_PERMISSIONS.READ,
      INVENTORY_PERMISSIONS.WRITE,
      INVENTORY_PERMISSIONS.DELETE,
      INVENTORY_PERMISSIONS.ADJUST,
      INVENTORY_PERMISSIONS.TRANSFER,
      INVENTORY_PERMISSIONS.ADMIN,
      INVENTORY_PERMISSIONS.EXPORT,
    ],
  },
];

// 权限管理Hook
export const usePermissions = () => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // 权限检查函数
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated || !currentUser) {
      return false;
    }
    return currentUser.permissions.includes(permission);
  }, [currentUser, isAuthenticated]);

  // 多权限检查
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!isAuthenticated || !currentUser) {
      return false;
    }
    return permissions.every(permission => currentUser.permissions.includes(permission));
  }, [currentUser, isAuthenticated]);

  // 检查是否有任意权限
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!isAuthenticated || !currentUser) {
      return false;
    }
    return permissions.some(permission => currentUser.permissions.includes(permission));
  }, [currentUser, isAuthenticated]);

  // 检查角色
  const hasRole = useCallback((role: string): boolean => {
    if (!isAuthenticated || !currentUser) {
      return false;
    }
    return currentUser.role === role;
  }, [currentUser, isAuthenticated]);

  // 检查是否为管理员
  const isAdmin = useMemo(() => {
    return hasPermission(INVENTORY_PERMISSIONS.ADMIN) || hasRole(INVENTORY_ROLES.ADMIN);
  }, [hasPermission, hasRole]);

  // 检查是否可读权限
  const canRead = useMemo(() => {
    return hasPermission(INVENTORY_PERMISSIONS.READ);
  }, [hasPermission]);

  // 检查是否可写权限
  const canWrite = useMemo(() => {
    return hasPermission(INVENTORY_PERMISSIONS.WRITE);
  }, [hasPermission]);

  // 检查是否可调整权限
  const canAdjust = useMemo(() => {
    return hasPermission(INVENTORY_PERMISSIONS.ADJUST);
  }, [hasPermission]);

  // 检查是否可调拨权限
  const canTransfer = useMemo(() => {
    return hasPermission(INVENTORY_PERMISSIONS.TRANSFER);
  }, [hasPermission]);

  // 检查是否可删除权限
  const canDelete = useMemo(() => {
    return hasPermission(INVENTORY_PERMISSIONS.DELETE);
  }, [hasPermission]);

  // 检查是否可导出权限
  const canExport = useMemo(() => {
    return hasPermission(INVENTORY_PERMISSIONS.EXPORT);
  }, [hasPermission]);

  // 检查是否可管理权限（等同于isAdmin，为了组件兼容性）
  const canAdmin = useMemo(() => {
    return isAdmin;
  }, [isAdmin]);

  // 切换用户
  const switchUser = useCallback((userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  // 登录
  const login = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);

  // 登出
  const logout = useCallback(() => {
    setCurrentUser(mockUsers[0]);
    setIsAuthenticated(true); // 在mock环境中保持登录状态
  }, []);

  // 获取权限层级信息
  const permissionLevel = useMemo(() => {
    if (isAdmin) return 'admin';
    if (hasAllPermissions([INVENTORY_PERMISSIONS.WRITE, INVENTORY_PERMISSIONS.ADJUST])) return 'operator';
    return 'viewer';
  }, [isAdmin, hasAllPermissions]);

  return {
    // 当前用户状态
    currentUser,
    isAuthenticated,
    permissionLevel,

    // 权限检查方法
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    isAdmin,

    // 具体权限检查
    canRead,
    canWrite,
    canAdjust,
    canTransfer,
    canDelete,
    canExport,
    canAdmin,

    // 用户操作
    switchUser,
    login,
    logout,

    // 可用用户列表
    availableUsers: mockUsers,
  };
};

// 权限守卫组件Hook
export const usePermissionGuard = (requiredPermissions: string[]) => {
  const { hasAllPermissions } = usePermissions();

  return {
    hasAccess: requiredPermissions.length === 0 || hasAllPermissions(requiredPermissions),
  };
};

// 角色权限Hook
export const useRoleGuard = (allowedRoles: string[]) => {
  const { currentUser } = usePermissions();

  return {
    hasAccess: currentUser && allowedRoles.includes(currentUser.role),
  };
};

// 权限守卫组件属性
export interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  fallback?: React.ReactNode;
}

// 默认权限守卫Hook
export const useDefaultPermissions = () => {
  const { hasPermission, hasRole, canRead, canWrite, canAdjust, canTransfer, canDelete, canExport, isAdmin } = usePermissions();

  return {
    hasPermission,
    hasRole,
    canRead,
    canWrite,
    canAdjust,
    canTransfer,
    canDelete,
    canExport,
    isAdmin,
    // 常用权限组合
    canView: canRead,
    canEdit: canWrite,
    canManage: isAdmin,
    canOperate: canWrite && canAdjust,
  };
};