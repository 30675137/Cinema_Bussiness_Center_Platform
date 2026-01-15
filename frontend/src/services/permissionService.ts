/**
 * 权限验证服务
 * 提供权限检查和验证的业务逻辑
 */

import { PermissionCheckResult, UserRole, Permission, User, MenuItem } from '@/types';

/**
 * 权限验证服务类
 */
export class PermissionService {
  private static instance: PermissionService;
  private permissionCache = new Map<string, boolean>();
  private rolePermissionCache = new Map<string, string[]>();

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * 检查用户是否拥有指定权限
   */
  hasPermission(user: User | null, permission: string): boolean {
    if (!user || !user.isActive) {
      return false;
    }

    if (!permission || typeof permission !== 'string' || permission.trim() === '') {
      return false;
    }

    // 检查缓存
    const cacheKey = `${user.id}_${permission}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    // 检查用户直接权限
    const hasDirectPermission = user.permissions.includes(permission);
    if (hasDirectPermission) {
      this.permissionCache.set(cacheKey, true);
      return true;
    }

    // 检查角色权限
    for (const role of user.roles) {
      if (role.isActive && this.hasRolePermission(role, permission)) {
        this.permissionCache.set(cacheKey, true);
        return true;
      }
    }

    this.permissionCache.set(cacheKey, false);
    return false;
  }

  /**
   * 检查用户是否拥有所有指定权限
   */
  hasPermissions(user: User | null, permissions: string[]): boolean {
    if (!user || !user.isActive) {
      return false;
    }

    if (!Array.isArray(permissions)) {
      return false;
    }

    if (permissions.length === 0) {
      return true; // 空权限列表默认允许访问
    }

    return permissions.every((permission) => this.hasPermission(user, permission));
  }

  /**
   * 检查用户是否拥有任一指定权限
   */
  hasAnyPermission(user: User | null, permissions: string[]): boolean {
    if (!user || !user.isActive) {
      return false;
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }

    return permissions.some((permission) => this.hasPermission(user, permission));
  }

  /**
   * 检查用户是否拥有指定角色
   */
  hasRole(user: User | null, roleCode: string): boolean {
    if (!user || !user.isActive) {
      return false;
    }

    if (!roleCode || typeof roleCode !== 'string') {
      return false;
    }

    return user.roles.some((role) => role.code === roleCode && role.isActive);
  }

  /**
   * 检查用户是否拥有任一指定角色
   */
  hasAnyRole(user: User | null, roleCodes: string[]): boolean {
    if (!user || !user.isActive) {
      return false;
    }

    if (!Array.isArray(roleCodes) || roleCodes.length === 0) {
      return false;
    }

    return roleCodes.some((code) => this.hasRole(user, code));
  }

  /**
   * 详细的权限验证结果
   */
  checkPermissions(user: User | null, requiredPermissions: string[]): PermissionCheckResult {
    if (!user || !user.isActive) {
      return {
        hasAccess: false,
        requiredPermissions,
        userPermissions: [],
        missingPermissions: requiredPermissions,
      };
    }

    if (!Array.isArray(requiredPermissions)) {
      return {
        hasAccess: false,
        requiredPermissions: [],
        userPermissions: user.permissions,
        missingPermissions: [],
      };
    }

    const userPermissions = this.getAllUserPermissions(user);
    const missingPermissions = requiredPermissions.filter(
      (permission) => !userPermissions.includes(permission)
    );

    return {
      hasAccess: missingPermissions.length === 0,
      requiredPermissions,
      userPermissions,
      missingPermissions,
    };
  }

  /**
   * 检查菜单访问权限
   */
  canAccessMenu(user: User | null, menu: MenuItem): boolean {
    if (!user || !user.isActive || !menu.isActive) {
      return false;
    }

    if (menu.requiredPermissions.length === 0) {
      return true; // 无权限要求的菜单默认可访问
    }

    return this.hasAnyPermission(user, menu.requiredPermissions);
  }

  /**
   * 过滤用户可访问的菜单
   */
  filterAccessibleMenus(user: User | null, menus: MenuItem[]): MenuItem[] {
    if (!user || !user.isActive) {
      return [];
    }

    return menus.reduce<MenuItem[]>((acc, menu) => {
      if (this.canAccessMenu(user, menu)) {
        const filteredMenu = { ...menu };

        // 递归过滤子菜单
        if (menu.children && menu.children.length > 0) {
          const filteredChildren = this.filterAccessibleMenus(user, menu.children);
          filteredMenu.children = filteredChildren;
        }

        // 如果菜单本身有路径或者有可访问的子菜单，则保留
        if (menu.path || (filteredMenu.children && filteredMenu.children.length > 0)) {
          acc.push(filteredMenu);
        }
      }

      return acc;
    }, []);
  }

  /**
   * 获取用户的所有权限（包括直接权限和角色权限）
   */
  getAllUserPermissions(user: User): string[] {
    const permissions = new Set<string>();

    // 添加直接权限
    user.permissions.forEach((permission) => permissions.add(permission));

    // 添加角色权限
    user.roles.forEach((role) => {
      if (role.isActive) {
        role.permissions.forEach((permission) => {
          permissions.add(permission.code);
        });
      }
    });

    return Array.from(permissions);
  }

  /**
   * 检查角色是否拥有指定权限
   */
  private hasRolePermission(role: UserRole, permission: string): boolean {
    const cacheKey = `${role.id}_${permission}`;

    if (this.rolePermissionCache.has(cacheKey)) {
      const cachedPermissions = this.rolePermissionCache.get(cacheKey)!;
      return cachedPermissions.includes(permission);
    }

    const rolePermissions = role.permissions.map((p) => p.code);
    this.rolePermissionCache.set(cacheKey, rolePermissions);

    return rolePermissions.includes(permission);
  }

  /**
   * 检查权限冲突
   */
  checkPermissionConflicts(
    user: User | null,
    permissions: string[]
  ): {
    hasConflicts: boolean;
    conflicts: string[];
    resolution: 'allow' | 'deny' | 'review';
  } {
    if (!user || !user.isActive) {
      return {
        hasConflicts: false,
        conflicts: [],
        resolution: 'deny',
      };
    }

    // 这里可以实现具体的权限冲突检查逻辑
    // 例如：某些权限组合不应该同时存在
    const conflictingPairs = [
      ['product.delete', 'product.readonly'],
      ['user.delete', 'audit.readonly'],
    ];

    const conflicts: string[] = [];
    const userPermissions = this.getAllUserPermissions(user);

    for (const [perm1, perm2] of conflictingPairs) {
      const hasPerm1 = userPermissions.includes(perm1);
      const hasPerm2 = permissions.includes(perm2);

      if (hasPerm1 && hasPerm2) {
        conflicts.push(`${perm1} 与 ${perm2} 冲突`);
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      resolution: conflicts.length > 0 ? 'review' : 'allow',
    };
  }

  /**
   * 权限优先级比较
   */
  comparePermissionPriority(perm1: string, perm2: string): number {
    // 权限优先级规则
    const priorityMap: Record<string, number> = {
      admin: 100,
      delete: 90,
      write: 80,
      approve: 70,
      read: 60,
    };

    const getPriority = (permission: string): number => {
      for (const [key, priority] of Object.entries(priorityMap)) {
        if (permission.includes(key)) {
          return priority;
        }
      }
      return 50; // 默认优先级
    };

    return getPriority(perm2) - getPriority(perm1); // 降序排列
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.permissionCache.clear();
    this.rolePermissionCache.clear();
  }

  /**
   * 清理特定用户的缓存
   */
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${userId}_`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.permissionCache.delete(key));
  }

  /**
   * 获取权限统计信息
   */
  getPermissionStats(user: User | null): {
    totalPermissions: number;
    directPermissions: number;
    rolePermissions: number;
    activeRoles: number;
    permissionBreakdown: Record<string, number>;
  } {
    if (!user || !user.isActive) {
      return {
        totalPermissions: 0,
        directPermissions: 0,
        rolePermissions: 0,
        activeRoles: 0,
        permissionBreakdown: {},
      };
    }

    const directPermissions = user.permissions.length;
    const activeRoles = user.roles.filter((role) => role.isActive).length;

    const rolePermissionSet = new Set<string>();
    user.roles.forEach((role) => {
      if (role.isActive) {
        role.permissions.forEach((permission) => {
          rolePermissionSet.add(permission.code);
        });
      }
    });

    const rolePermissions = rolePermissionSet.size;
    const allPermissions = new Set([...user.permissions, ...rolePermissionSet]);

    // 权限分类统计
    const permissionBreakdown: Record<string, number> = {};
    allPermissions.forEach((permission) => {
      const category = permission.split('.')[0] || 'other';
      permissionBreakdown[category] = (permissionBreakdown[category] || 0) + 1;
    });

    return {
      totalPermissions: allPermissions.size,
      directPermissions,
      rolePermissions,
      activeRoles,
      permissionBreakdown,
    };
  }
}

// 导出单例实例
export const permissionService = PermissionService.getInstance();

// 导出便捷函数
export const hasPermission = (user: User | null, permission: string): boolean =>
  permissionService.hasPermission(user, permission);

export const hasPermissions = (user: User | null, permissions: string[]): boolean =>
  permissionService.hasPermissions(user, permissions);

export const hasAnyPermission = (user: User | null, permissions: string[]): boolean =>
  permissionService.hasAnyPermission(user, permissions);

export const hasRole = (user: User | null, roleCode: string): boolean =>
  permissionService.hasRole(user, roleCode);

export const canAccessMenu = (user: User | null, menu: MenuItem): boolean =>
  permissionService.canAccessMenu(user, menu);

export const checkPermissions = (
  user: User | null,
  requiredPermissions: string[]
): PermissionCheckResult => permissionService.checkPermissions(user, requiredPermissions);

export default permissionService;
