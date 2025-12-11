/**
 * 权限管理Hook
 * 提供权限检查和角色验证的统一接口
 */

import { useCallback, useMemo } from 'react';
import { useUserStore } from '@/stores/userStore';
import { PermissionCheckResult, User } from '@/types';

/**
 * 权限检查Hook返回值接口
 */
interface UsePermissionsResult {
  // 单个权限检查
  hasPermission: (permission: string) => boolean;

  // 多个权限检查（全部拥有）
  hasPermissions: (permissions: string[]) => boolean;

  // 任一权限检查
  hasAnyPermission: (permissions: string[]) => boolean;

  // 角色检查
  hasRole: (roleCode: string) => boolean;

  // 权限验证结果
  checkPermissions: (requiredPermissions: string[]) => PermissionCheckResult;

  // 当前用户信息
  user: User | null;

  // 当前权限列表
  permissions: string[];

  // 当前角色列表
  roles: any[];

  // 加载状态
  loading: boolean;
}

/**
 * 权限检查缓存
 */
const permissionCache = new Map<string, boolean>();
const permissionCheckCache = new Map<string, PermissionCheckResult>();

/**
 * 清理权限缓存（在权限更新时调用）
 */
const clearPermissionCache = () => {
  permissionCache.clear();
  permissionCheckCache.clear();
};

/**
 * 生成权限检查缓存键
 */
const getPermissionCacheKey = (permission: string): string => {
  return `perm_${permission}`;
};

/**
 * 生成权限验证结果缓存键
 */
const getPermissionCheckCacheKey = (permissions: string[]): string => {
  return `check_${permissions.sort().join(',')}`;
};

/**
 * 权限管理Hook
 */
export const usePermissions = (): UsePermissionsResult => {
  // 从userStore获取状态和方法
  const user = useUserStore((state) => state.user);
  const permissions = useUserStore((state) => state.permissions);
  const roles = useUserStore((state) => state.roles);
  const loading = useUserStore((state) => state.loading);

  // Store方法
  const storeHasPermission = useUserStore((state) => state.hasPermission);
  const storeHasPermissions = useUserStore((state) => state.hasPermissions);
  const storeHasAnyPermission = useUserStore((state) => state.hasAnyPermission);
  const storeHasRole = useUserStore((state) => state.hasRole);
  const storeCheckPermissions = useUserStore((state) => state.checkPermissions);

  /**
   * 检查单个权限
   * 带缓存优化
   */
  const hasPermission = useCallback((permission: string): boolean => {
    // 边界情况处理
    if (!permission || typeof permission !== 'string') {
      return false;
    }

    // 空权限字符串处理
    if (permission.trim() === '') {
      return false;
    }

    // 检查缓存
    const cacheKey = getPermissionCacheKey(permission);
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    try {
      // 调用store方法进行权限检查
      const result = storeHasPermission(permission);

      // 缓存结果
      permissionCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('权限检查错误:', error);
      return false; // 安全默认值
    }
  }, [storeHasPermission]);

  /**
   * 检查是否拥有所有指定权限
   */
  const hasPermissions = useCallback((permissions: string[]): boolean => {
    // 边界情况处理
    if (!Array.isArray(permissions)) {
      return false;
    }

    if (permissions.length === 0) {
      return true; // 空权限列表默认允许访问
    }

    try {
      return storeHasPermissions(permissions);
    } catch (error) {
      console.error('批量权限检查错误:', error);
      return false;
    }
  }, [storeHasPermissions]);

  /**
   * 检查是否拥有任一指定权限
   */
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    // 边界情况处理
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }

    try {
      return storeHasAnyPermission(permissions);
    } catch (error) {
      console.error('任一权限检查错误:', error);
      return false;
    }
  }, [storeHasAnyPermission]);

  /**
   * 检查是否拥有指定角色
   */
  const hasRole = useCallback((roleCode: string): boolean => {
    // 边界情况处理
    if (!roleCode || typeof roleCode !== 'string') {
      return false;
    }

    if (!user || !user.roles) {
      return false;
    }

    try {
      return storeHasRole(roleCode);
    } catch (error) {
      console.error('角色检查错误:', error);
      return false;
    }
  }, [storeHasRole, user]);

  /**
   * 权限验证结果
   * 返回详细的权限检查结果
   */
  const checkPermissions = useCallback((requiredPermissions: string[]): PermissionCheckResult => {
    // 边界情况处理
    if (!Array.isArray(requiredPermissions)) {
      return {
        hasAccess: false,
        requiredPermissions: [],
        userPermissions: permissions,
        missingPermissions: []
      };
    }

    if (requiredPermissions.length === 0) {
      return {
        hasAccess: true,
        requiredPermissions: [],
        userPermissions: permissions,
        missingPermissions: []
      };
    }

    // 检查缓存
    const cacheKey = getPermissionCheckCacheKey(requiredPermissions);
    if (permissionCheckCache.has(cacheKey)) {
      return permissionCheckCache.get(cacheKey)!;
    }

    try {
      const result = storeCheckPermissions(requiredPermissions);

      // 缓存结果
      permissionCheckCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('权限验证错误:', error);

      // 错误时返回安全的默认结果
      const errorResult: PermissionCheckResult = {
        hasAccess: false,
        requiredPermissions,
        userPermissions: permissions,
        missingPermissions: requiredPermissions
      };

      return errorResult;
    }
  }, [storeCheckPermissions, permissions]);

  /**
   * 清理缓存的函数（在权限更新时调用）
   */
  const clearCache = useCallback(() => {
    clearPermissionCache();
  }, []);

  // 使用useMemo优化性能，避免不必要的重渲染
  return useMemo<UsePermissionsResult>(() => ({
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    hasRole,
    checkPermissions,
    user,
    permissions,
    roles,
    loading
  }), [
    hasPermission,
    hasPermissions,
    hasAnyPermission,
    hasRole,
    checkPermissions,
    user,
    permissions,
    roles,
    loading
  ]);
};

/**
 * 权限检查高阶组件Hook
 * 用于条件渲染和权限守卫
 */
export const usePermissionGuard = (requiredPermissions: string[]) => {
  const { checkPermissions } = usePermissions();

  return useMemo(() => {
    const result = checkPermissions(requiredPermissions);
    return {
      hasAccess: result.hasAccess,
      canAccess: result.hasAccess, // 别名，更语义化
      cannotAccess: !result.hasAccess,
      missingPermissions: result.missingPermissions,
      reason: result.hasAccess ? undefined : `缺少权限: ${result.missingPermissions.join(', ')}`
    };
  }, [checkPermissions, requiredPermissions]);
};

/**
 * 角色检查Hook
 * 专门用于角色相关的权限检查
 */
export const useRoleCheck = (roleCode: string) => {
  const { hasRole } = usePermissions();

  return useMemo(() => ({
    hasRole: hasRole(roleCode),
    isRole: hasRole(roleCode), // 别名，更语义化
    isNotRole: !hasRole(roleCode)
  }), [hasRole, roleCode]);
};

/**
 * 权限组合Hook
 * 支持复杂的权限逻辑组合（AND、OR、NOT）
 */
export const usePermissionLogic = () => {
  const { hasPermission, hasPermissions, hasAnyPermission } = usePermissions();

  const check = useCallback((logic: PermissionLogic): boolean => {
    if (logic.type === 'single') {
      return hasPermission(logic.permission);
    } else if (logic.type === 'and') {
      return hasPermissions(logic.permissions);
    } else if (logic.type === 'or') {
      return hasAnyPermission(logic.permissions);
    } else if (logic.type === 'not') {
      return !hasPermission(logic.permission);
    } else if (logic.type === 'complex') {
      // 复杂逻辑处理
      return evaluateComplexLogic(logic.conditions, logic.operator);
    }
    return false;
  }, [hasPermission, hasPermissions, hasAnyPermission]);

  const evaluateComplexLogic = useCallback((conditions: PermissionLogic[], operator: 'and' | 'or'): boolean => {
    const results = conditions.map(condition => check(condition));
    return operator === 'and' ? results.every(r => r) : results.some(r => r);
  }, [check]);

  return { check };
};

/**
 * 权限逻辑接口
 */
interface PermissionLogic {
  type: 'single' | 'and' | 'or' | 'not' | 'complex';
  permission?: string;
  permissions?: string[];
  conditions?: PermissionLogic[];
  operator?: 'and' | 'or';
}

// 导出清理缓存的函数，供外部在权限更新时调用
export { clearPermissionCache };

// 默认导出
export default usePermissions;