import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

/**
 * 应用全局状态接口
 */
export interface AppState {
  // 用户信息
  user: {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    role?: string;
    permissions?: string[];
  } | null;

  // 应用配置
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
    sidebarBgColor: string;
    headerBgColor: string;
  };

  // 布局状态
  layout: {
    sidebarCollapsed: boolean;
    mobileSidebarOpen: boolean;
    breadcrumb: Array<{
      key: string;
      title: string;
      path?: string;
      clickable?: boolean;
    }>;
  };

  // 加载状态
  loading: {
    global: boolean;
    [key: string]: boolean;
  };

  // 错误状态
  errors: Array<{
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    timestamp: number;
  }>;
}

/**
 * 应用全局状态操作接口
 */
export interface AppActions {
  // 用户操作
  setUser: (user: AppState['user']) => void;
  clearUser: () => void;

  // 主题操作
  setTheme: (theme: Partial<AppState['theme']>) => void;
  toggleThemeMode: () => void;

  // 布局操作
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setBreadcrumb: (breadcrumb: AppState['layout']['breadcrumb']) => void;

  // 加载状态操作
  setGlobalLoading: (loading: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: (key?: string) => void;

  // 错误操作
  addError: (error: Omit<AppState['errors'][0], 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;

  // 重置状态
  resetState: () => void;
}

/**
 * 应用全局状态初始值
 */
const initialState: AppState = {
  user: null,
  theme: {
    mode: 'light',
    primaryColor: '#1890ff',
    sidebarBgColor: '#001529',
    headerBgColor: '#ffffff',
  },
  layout: {
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    breadcrumb: [],
  },
  loading: {
    global: false,
  },
  errors: [],
};

/**
 * 应用全局状态Store
 */
export type AppStore = AppState & AppActions;

/**
 * 创建应用全局状态Store
 */
export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          ...initialState,

          // 用户操作
          setUser: (user) => set({ user }, false, 'setUser'),
          clearUser: () => set({ user: null }, false, 'clearUser'),

          // 主题操作
          setTheme: (theme) =>
            set(
              (state) => ({ theme: { ...state.theme, ...theme } }),
              false,
              'setTheme'
            ),
          toggleThemeMode: () =>
            set(
              (state) => ({
                theme: {
                  ...state.theme,
                  mode: state.theme.mode === 'light' ? 'dark' : 'light',
                },
              }),
              false,
              'toggleThemeMode'
            ),

          // 布局操作
          setSidebarCollapsed: (sidebarCollapsed) =>
            set({ sidebarCollapsed }, false, 'setSidebarCollapsed'),
          setMobileSidebarOpen: (mobileSidebarOpen) =>
            set({ mobileSidebarOpen }, false, 'setMobileSidebarOpen'),
          setBreadcrumb: (breadcrumb) =>
            set({ breadcrumb }, false, 'setBreadcrumb'),

          // 加载状态操作
          setGlobalLoading: (global) =>
            set(
              (state) => ({ loading: { ...state.loading, global } }),
              false,
              'setGlobalLoading'
            ),
          setLoading: (key, loading) =>
            set(
              (state) => ({ loading: { ...state.loading, [key]: loading } }),
              false,
              'setLoading'
            ),
          clearLoading: (key) =>
            set(
              (state) => {
                if (key) {
                  const { [key]: _, ...rest } = state.loading;
                  return { loading: rest };
                }
                return { loading: { global: false } };
              },
              false,
              'clearLoading'
            ),

          // 错误操作
          addError: (error) =>
            set(
              (state) => ({
                errors: [
                  ...state.errors,
                  {
                    ...error,
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                  },
                ],
              }),
              false,
              'addError'
            ),
          removeError: (id) =>
            set(
              (state) => ({
                errors: state.errors.filter((error) => error.id !== id),
              }),
              false,
              'removeError'
            ),
          clearErrors: () => set({ errors: [] }, false, 'clearErrors'),

          // 重置状态
          resetState: () => set(initialState, false, 'resetState'),
        }),
        {
          name: 'app-store',
          partialize: (state) => ({
            user: state.user,
            theme: state.theme,
            layout: state.layout,
          }),
        }
      )
    ),
    {
      name: 'app-store',
    }
  )
);

/**
 * 选择器 hooks
 */
export const useAppUser = () => useAppStore((state) => state.user);
export const useAppTheme = () => useAppStore((state) => state.theme);
export const useAppLayout = () => useAppStore((state) => state.layout);
export const useAppLoading = () => useAppStore((state) => state.loading);
export const useAppErrors = () => useAppStore((state) => state.errors);

/**
 * 操作 hooks
 */
export const useAppActions = () => useAppStore((state) => ({
  setUser: state.setUser,
  clearUser: state.clearUser,
  setTheme: state.setTheme,
  toggleThemeMode: state.toggleThemeMode,
  setSidebarCollapsed: state.setSidebarCollapsed,
  setMobileSidebarOpen: state.setMobileSidebarOpen,
  setBreadcrumb: state.setBreadcrumb,
  setGlobalLoading: state.setGlobalLoading,
  setLoading: state.setLoading,
  clearLoading: state.clearLoading,
  addError: state.addError,
  removeError: state.removeError,
  clearErrors: state.clearErrors,
  resetState: state.resetState,
}));