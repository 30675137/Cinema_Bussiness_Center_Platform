import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppState, User, Permission, BreadcrumbItem, ThemeMode } from '@/types';

// 应用状态接口
interface AppStore extends AppState {
  // User actions
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setPermissions: (permissions: Permission[]) => void;
  setUserLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;

  // UI actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: 'zh-CN' | 'en-US') => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setGlobalLoading: (loading: boolean) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  removeLastBreadcrumb: () => void;

  // Config actions
  setConfig: (config: Partial<AppState['config']>) => void;
  updateApiBaseUrl: (url: string) => void;

  // Reset actions
  resetUser: () => void;
  resetUI: () => void;
  resetAll: () => void;
}

// 创建应用状态store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set) => ({
        // 初始状态
        user: {
          currentUser: null,
          isAuthenticated: false,
          permissions: [],
          loading: false,
        },
        ui: {
          sidebarCollapsed: false,
          theme: 'light',
          locale: 'zh-CN',
          breadcrumbs: [],
          loading: false,
        },
        config: {
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
          uploadUrl: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:8080/api/v1/upload',
          maxFileSize: import.meta.env.VITE_MAX_FILE_SIZE ? parseInt(import.meta.env.VITE_MAX_FILE_SIZE) : 10 * 1024 * 1024, // 10MB
          supportedImageFormats: import.meta.env.VITE_SUPPORTED_IMAGE_FORMATS?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        },

        // User actions
        setCurrentUser: (user) =>
          set((state) => {
            state.user.currentUser = user;
            state.user.isAuthenticated = !!user;
          }),
        setAuthenticated: (authenticated) =>
          set((state) => {
            state.user.isAuthenticated = authenticated;
          }),
        setPermissions: (permissions) =>
          set((state) => {
            state.user.permissions = permissions;
          }),
        setUserLoading: (loading) =>
          set((state) => {
            state.user.loading = loading;
          }),
        updateUser: (updates) =>
          set((state) => {
            if (state.user.currentUser) {
              Object.assign(state.user.currentUser, updates);
            }
          }),

        // UI actions
        toggleSidebar: () =>
          set((state) => {
            state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
          }),
        setSidebarCollapsed: (collapsed) =>
          set((state) => {
            state.ui.sidebarCollapsed = collapsed;
          }),
        setTheme: (theme) =>
          set((state) => {
            state.ui.theme = theme;
            // 也可以同时更新document.documentElement的类名
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }),
        setLocale: (locale) =>
          set((state) => {
            state.ui.locale = locale;
          }),
        setBreadcrumbs: (breadcrumbs) =>
          set((state) => {
            state.ui.breadcrumbs = breadcrumbs;
          }),
        setGlobalLoading: (loading) =>
          set((state) => {
            state.ui.loading = loading;
          }),
        addBreadcrumb: (breadcrumb) =>
          set((state) => {
            state.ui.breadcrumbs.push(breadcrumb);
          }),
        removeLastBreadcrumb: () =>
          set((state) => {
            state.ui.breadcrumbs.pop();
          }),

        // Config actions
        setConfig: (config) =>
          set((state) => {
            Object.assign(state.config, config);
          }),
        updateApiBaseUrl: (url) =>
          set((state) => {
            state.config.apiBaseUrl = url;
          }),

        // Reset actions
        resetUser: () =>
          set((state) => {
            state.user.currentUser = null;
            state.user.isAuthenticated = false;
            state.user.permissions = [];
            state.user.loading = false;
          }),
        resetUI: () =>
          set((state) => {
            state.ui.sidebarCollapsed = false;
            state.ui.theme = 'light';
            state.ui.locale = 'zh-CN';
            state.ui.breadcrumbs = [];
            state.ui.loading = false;
          }),
        resetAll: () =>
          set((state) => {
            // 重置到初始状态
            state.user.currentUser = null;
            state.user.isAuthenticated = false;
            state.user.permissions = [];
            state.user.loading = false;
            state.ui.sidebarCollapsed = false;
            state.ui.theme = 'light';
            state.ui.locale = 'zh-CN';
            state.ui.breadcrumbs = [];
            state.ui.loading = false;
          }),
      })),
      {
        name: 'app-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
            theme: state.ui.theme,
            locale: state.ui.locale,
          },
          config: state.config,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// 选择器函数
export const useCurrentUser = () => useAppStore((state) => state.user.currentUser);
export const useIsAuthenticated = () => useAppStore((state) => state.user.isAuthenticated);
export const useUserPermissions = () => useAppStore((state) => state.user.permissions);
export const useUserLoading = () => useAppStore((state) => state.user.loading);

export const useSidebarCollapsed = () => useAppStore((state) => state.ui.sidebarCollapsed);
export const useTheme = () => useAppStore((state) => state.ui.theme);
export const useLocale = () => useAppStore((state) => state.ui.locale);
export const useBreadcrumbs = () => {
  const breadcrumbs = useAppStore((state) => state.ui.breadcrumbs);
  // 确保始终返回数组，避免 undefined 错误
  return Array.isArray(breadcrumbs) ? breadcrumbs : [];
};
export const useGlobalLoading = () => useAppStore((state) => state.ui.loading);

export const useApiConfig = () => useAppStore((state) => state.config);

// 权限检查函数
export const useHasPermission = (permissionCode: string) => {
  const permissions = useUserPermissions();
  return permissions.some(permission => permission.code === permissionCode);
};

export const useHasAnyPermission = (permissionCodes: string[]) => {
  const permissions = useUserPermissions();
  return permissionCodes.some(code =>
    permissions.some(permission => permission.code === code)
  );
};

export const useHasAllPermissions = (permissionCodes: string[]) => {
  const permissions = useUserPermissions();
  return permissionCodes.every(code =>
    permissions.some(permission => permission.code === code)
  );
};

// 便捷操作函数
export const useAppActions = () => {
  const store = useAppStore();

  return {
    setCurrentUser: store.setCurrentUser,
    setAuthenticated: store.setAuthenticated,
    setPermissions: store.setPermissions,
    setUserLoading: store.setUserLoading,
    updateUser: store.updateUser,
    toggleSidebar: store.toggleSidebar,
    setSidebarCollapsed: store.setSidebarCollapsed,
    setTheme: store.setTheme,
    setLocale: store.setLocale,
    setBreadcrumbs: store.setBreadcrumbs,
    setGlobalLoading: store.setGlobalLoading,
    addBreadcrumb: store.addBreadcrumb,
    removeLastBreadcrumb: store.removeLastBreadcrumb,
    setConfig: store.setConfig,
    updateApiBaseUrl: store.updateApiBaseUrl,
    resetUser: store.resetUser,
    resetUI: store.resetUI,
    resetAll: store.resetAll,
  };
};