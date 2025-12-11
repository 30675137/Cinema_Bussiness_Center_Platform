/**
 * usePermissions Hook 单元测试
 * 测试权限检查逻辑的正确性
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionCheckResult, User } from '@/types';

// Mock user store
vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn(),
}));

describe('usePermissions Hook', () => {
  const mockUserStore = vi.mocked('@/stores/userStore');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('当用户有权限时应返回true', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read', 'product.write', 'inventory.read'],
        hasPermission: vi.fn((permission: string) => {
          return ['product.read', 'product.write', 'inventory.read'].includes(permission);
        })
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('product.read')).toBe(true);
      expect(result.current.hasPermission('product.write')).toBe(true);
      expect(result.current.hasPermission('inventory.read')).toBe(true);
    });

    it('当用户没有权限时应返回false', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read'],
        hasPermission: vi.fn((permission: string) => {
          return ['product.read'].includes(permission);
        })
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('product.write')).toBe(false);
      expect(result.current.hasPermission('admin.access')).toBe(false);
    });

    it('空权限数组应返回false', () => {
      mockUserStore.mockReturnValue({
        permissions: [],
        hasPermission: vi.fn(() => false)
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('any.permission')).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('当用户拥有所有权限时应返回true', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read', 'product.write', 'inventory.read'],
        hasPermissions: vi.fn((permissions: string[]) => {
          return permissions.every(perm => ['product.read', 'product.write', 'inventory.read'].includes(perm));
        })
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermissions(['product.read', 'product.write'])).toBe(true);
      expect(result.current.hasPermissions(['product.read', 'inventory.read', 'product.write'])).toBe(true);
    });

    it('当用户缺少部分权限时应返回false', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read', 'inventory.read'],
        hasPermissions: vi.fn((permissions: string[]) => {
          return permissions.every(perm => ['product.read', 'inventory.read'].includes(perm));
        })
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermissions(['product.read', 'product.write'])).toBe(false);
      expect(result.current.hasPermissions(['product.read', 'inventory.read'])).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('当用户拥有任一权限时应返回true', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read', 'inventory.read'],
        hasAnyPermission: vi.fn((permissions: string[]) => {
          return permissions.some(perm => ['product.read', 'inventory.read'].includes(perm));
        })
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyPermission(['product.read', 'pricing.read'])).toBe(true);
      expect(result.current.hasAnyPermission(['pricing.write', 'admin.access'])).toBe(false);
    });

    it('当用户没有任何权限时应返回false', () => {
      mockUserStore.mockReturnValue({
        permissions: [],
        hasAnyPermission: vi.fn(() => false)
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyPermission(['product.read', 'admin.access'])).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('当用户拥有指定角色时应返回true', () => {
      const mockUser: User = {
        id: 'user_001',
        username: 'test_user',
        email: 'test@example.com',
        displayName: '测试用户',
        roles: [
          {
            id: 'role_admin',
            name: '管理员',
            code: 'admin',
            permissions: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'role_operator',
            name: '操作员',
            code: 'operator',
            permissions: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        permissions: ['admin.access'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserStore.mockReturnValue({
        user: mockUser,
        hasRole: vi.fn((roleCode: string) => {
          return mockUser.roles.some(role => role.code === roleCode && role.isActive);
        })
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('operator')).toBe(true);
      expect(result.current.hasRole('viewer')).toBe(false);
    });

    it('当用户角色不活跃时应返回false', () => {
      const mockUser: User = {
        id: 'user_001',
        username: 'test_user',
        email: 'test@example.com',
        displayName: '测试用户',
        roles: [
          {
            id: 'role_admin',
            name: '管理员',
            code: 'admin',
            permissions: [],
            isActive: false, // 角色不活跃
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        permissions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUserStore.mockReturnValue({
        user: mockUser,
        hasRole: vi.fn((roleCode: string) => {
          return mockUser.roles.some(role => role.code === roleCode && role.isActive);
        })
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasRole('admin')).toBe(false);
    });
  });

  describe('checkPermissions', () => {
    it('当用户拥有所有所需权限时应返回hasAccess为true', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read', 'product.write', 'inventory.read'],
        checkPermissions: vi.fn((requiredPermissions: string[]) => ({
          hasAccess: requiredPermissions.every(perm => ['product.read', 'product.write', 'inventory.read'].includes(perm)),
          requiredPermissions,
          userPermissions: ['product.read', 'product.write', 'inventory.read'],
          missingPermissions: []
        }))
      });

      const { result } = renderHook(() => usePermissions());

      const checkResult = result.current.checkPermissions(['product.read', 'product.write']);

      expect(checkResult.hasAccess).toBe(true);
      expect(checkResult.requiredPermissions).toEqual(['product.read', 'product.write']);
      expect(checkResult.userPermissions).toEqual(['product.read', 'product.write', 'inventory.read']);
      expect(checkResult.missingPermissions).toEqual([]);
    });

    it('当用户缺少权限时应返回hasAccess为false和缺失权限列表', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read', 'inventory.read'],
        checkPermissions: vi.fn((requiredPermissions: string[]) => ({
          hasAccess: requiredPermissions.every(perm => ['product.read', 'inventory.read'].includes(perm)),
          requiredPermissions,
          userPermissions: ['product.read', 'inventory.read'],
          missingPermissions: ['product.write']
        }))
      });

      const { result } = renderHook(() => usePermissions());

      const checkResult = result.current.checkPermissions(['product.read', 'product.write']);

      expect(checkResult.hasAccess).toBe(false);
      expect(checkResult.requiredPermissions).toEqual(['product.read', 'product.write']);
      expect(checkResult.userPermissions).toEqual(['product.read', 'inventory.read']);
      expect(checkResult.missingPermissions).toEqual(['product.write']);
    });

    it('空权限列表应该返回hasAccess为true', () => {
      mockUserStore.mockReturnValue({
        permissions: [],
        checkPermissions: vi.fn(() => ({
          hasAccess: true,
          requiredPermissions: [],
          userPermissions: [],
          missingPermissions: []
        }))
      });

      const { result } = renderHook(() => usePermissions());

      const checkResult = result.current.checkPermissions([]);

      expect(checkResult.hasAccess).toBe(true);
      expect(checkResult.requiredPermissions).toEqual([]);
      expect(checkResult.userPermissions).toEqual([]);
      expect(checkResult.missingPermissions).toEqual([]);
    });
  });

  describe('错误处理', () => {
    it('当userStore抛出错误时应优雅处理', () => {
      mockUserStore.mockImplementation(() => {
        throw new Error('Store error');
      });

      // Hook不应该崩溃，应该返回默认值
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('any.permission')).toBe(false);
      expect(result.current.hasPermissions([])).toBe(true);
      expect(result.current.hasAnyPermission([])).toBe(false);
    });

    it('权限检查异常时应返回安全的默认值', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read'],
        hasPermission: vi.fn(),
        hasPermissions: vi.fn(),
        hasAnyPermission: vi.fn(),
        checkPermissions: vi.fn(() => {
          throw new Error('Permission check error');
        })
      });

      const { result } = renderHook(() => usePermissions());

      const checkResult = result.current.checkPermissions(['test.permission']);

      expect(checkResult.hasAccess).toBe(false);
      expect(checkResult.requiredPermissions).toEqual(['test.permission']);
      expect(checkResult.userPermissions).toEqual(['product.read']);
      expect(checkResult.missingPermissions).toEqual(['test.permission']);
    });
  });

  describe('性能测试', () => {
    it('应该正确缓存权限检查结果', () => {
      let checkPermissionsCallCount = 0;

      mockUserStore.mockReturnValue({
        permissions: ['product.read', 'product.write'],
        checkPermissions: vi.fn(() => {
          checkPermissionsCallCount++;
          return {
            hasAccess: true,
            requiredPermissions: ['product.read', 'product.write'],
            userPermissions: ['product.read', 'product.write'],
            checkPermissionsCallCount,
            missingPermissions: []
          };
        })
      });

      const { result } = renderHook(() => usePermissions());

      // 多次调用相同的权限检查
      for (let i = 0; i < 5; i++) {
        result.current.checkPermissions(['product.read', 'product.write']);
      }

      // 应该只调用一次store方法（由于缓存）
      expect(checkPermissionsCallCount).toBe(1);
    });

    it('大量权限检查时应该保持性能', () => {
      mockUserStore.mockReturnValue({
        permissions: Array.from({ length: 100 }, (_, i) => `permission.${i}`),
        hasPermissions: vi.fn((permissions: string[]) => permissions.every(perm =>
          Array.from({ length: 100 }, (_, i) => `permission.${i}`).includes(perm)
        )),
        hasPermission: vi.fn((permission: string) =>
          Array.from({ length: 100 }, (_, i) => `permission.${i}`).includes(permission)
        )
      });

      const { result } = renderHook(() => usePermissions());

      const startTime = performance.now();

      // 执行大量权限检查
      for (let i = 0; i < 1000; i++) {
        result.current.hasPermission(`permission.${i % 100}`);
      }

      const endTime = performance.now();

      // 权限检查应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(100); // 100ms
    });
  });

  describe('边界情况', () => {
    it('空权限字符串应该被正确处理', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read'],
        hasPermission: vi.fn((permission: string) => permission === 'product.read'),
        hasPermissions: vi.fn((permissions: string[]) =>
          permissions.every(perm => perm === 'product.read')
        ),
        hasAnyPermission: vi.fn((permissions: string[]) =>
          permissions.some(perm => perm === 'product.read')
        )
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('')).toBe(false);
      expect(result.current.hasPermissions([''])).toBe(true);
      expect(result.current.hasAnyPermission([''])).toBe(false);
    });

    it('null和undefined权限应该被正确处理', () => {
      mockUserStore.mockReturnValue({
        permissions: ['product.read'],
        hasPermission: vi.fn((permission: string) =>
          permission !== null && permission !== undefined && permission === 'product.read'
        ),
        hasPermissions: vi.fn((permissions: string[]) =>
          permissions.every(perm => perm !== null && perm !== undefined && perm === 'product.read')
        ),
        hasAnyPermission: vi.fn((permissions: string[]) =>
          permissions.some(perm => perm !== null && perm !== undefined && perm === 'product.read')
        )
      });

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission(null as any)).toBe(false);
      expect(result.current.hasPermission(undefined as any)).toBe(false);
      expect(result.current.hasPermissions([null as any, 'product.read'])).toBe(false);
      expect(result.current.hasAnyPermission([undefined as any, 'product.read'])).toBe(true);
    });
  });
});