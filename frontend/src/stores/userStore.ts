/**
 * 用户状态管理Store
 * 使用Zustand管理Mock用户认证和权限相关的全局状态
 * 根据用户澄清要求：取消登录页面，直接使用Mock用户数据
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  User,
  UserRole,
  Permission,
  UserPermissionState,
  UserPreference,
  PermissionCheckResult,
} from '@/types/navigation';

/**
 * 用户Store状态接口
 */
interface UserStore extends UserPermissionState {
  // Additional state
  userPreferences: UserPreference | null;
  isAuthenticated: boolean;
  loginLoading: boolean;
  loginError: string | null;

  // Mock user actions (取消真实登录)
  initializeMockUser: () => void;
  logout: () => void;
}

/**
 * Mock用户数据 - 根据用户澄清要求
 */
const mockUser: User = {
  id: 'user-001',
  username: 'admin',
  email: 'admin@cinema.com',
  displayName: '系统管理员',
  avatar: undefined,
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-12-11'),
};

const mockUserRoles: UserRole[] = [
  {
    id: 'role_admin',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    permissions: [],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

const mockUserPermissions: string[] = [
  'admin.access',
  'user.read',
  'user.write',
  'user.delete',
  'product.read',
  'product.write',
  'inventory.read',
  'inventory.write',
  'pricing.read',
  'pricing.write',
  'dashboard.view',
  'navigation.access',
];

/**
 * 初始状态
 */
const initialState: UserPermissionState = {
  user: mockUser,
  permissions: mockUserPermissions,
  roles: mockUserRoles,
  loading: false,
  error: null,
};

/**
 * 用户Store
 */
export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,
        userPreferences: {
          id: `pref_${mockUser.id}`,
          userId: mockUser.id,
          sidebarCollapsed: false,
          favoriteMenus: [],
          recentMenus: [],
          searchHistory: [],
          theme: 'light',
          language: 'zh-CN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        isAuthenticated: true,
        loginLoading: false,
        loginError: null,

        // Mock user actions (取消真实登录)
        initializeMockUser: () => {
          set(
            {
              user: mockUser,
              permissions: mockUserPermissions,
              roles: mockUserRoles,
              userPreferences: {
                id: `pref_${mockUser.id}`,
                userId: mockUser.id,
                sidebarCollapsed: false,
                favoriteMenus: [],
                recentMenus: [],
                searchHistory: [],
                theme: 'light',
                language: 'zh-CN',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              isAuthenticated: true,
              loginLoading: false,
              loginError: null,
              loading: false,
              error: null,
            },
            false,
            'initializeMockUser'
          );
        },

        logout: async () => {
          // Clear auth token
          localStorage.removeItem('auth_token');

          set(
            {
              user: null,
              permissions: [],
              roles: [],
              userPreferences: null,
              isAuthenticated: false,
              loginLoading: false,
              loginError: null,
              loading: false,
              error: null,
            },
            false,
            'logout'
          );
        },
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          user: state.user,
          permissions: state.permissions,
          roles: state.roles,
          userPreferences: state.userPreferences,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'user-store',
    }
  )
);

/**
 * 选择器函数 - 只获取需要的特定状态
 */
export const useCurrentUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useUserPermissions = () => useUserStore((state) => state.permissions);
export const useUserRoles = () => useUserStore((state) => state.roles);
export const useUserPreferences = () => useUserStore((state) => state.userPreferences);

/**
 * 用户操作选择器
 */
export const useUserActions = () =>
  useUserStore((state) => ({
    initializeMockUser: state.initializeMockUser,
    logout: state.logout,
  }));

/**
 * 用户偏好操作选择器（临时保留，向后兼容）
 */
export const useUserPreferenceActions = () =>
  useUserStore((state) => ({
    updatePreferences: () => {}, // 空实现，因为已经简化
    toggleSidebarCollapsed: () => {}, // 空实现，因为已经简化
    addFavoriteMenu: () => {}, // 空实现，因为已经简化
    removeFavoriteMenu: () => {}, // 空实现，因为已经简化
    addRecentMenu: () => {}, // 空实现，因为已经简化
    clearRecentMenus: () => {}, // 空实现，因为已经简化
  }));
