/**
 * 布局状态管理 - Zustand Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayoutState, BreadcrumbItem, Breakpoint, ThemeMode } from '@/types/layout';

interface LayoutStore extends LayoutState {
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedMenuKeys: (keys: string[]) => void;
  setOpenMenuKeys: (keys: string[]) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setTheme: (theme: ThemeMode) => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  resetLayout: () => void;
}

const initialState: LayoutState = {
  sidebarCollapsed: false,
  selectedMenuKeys: [],
  openMenuKeys: [],
  breadcrumbs: [],
  theme: 'light',
  breakpoint: 'lg',
};

/**
 * 布局状态管理Store
 */
export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * 切换侧边栏折叠状态
       */
      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },

      /**
       * 设置侧边栏折叠状态
       */
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      /**
       * 设置选中的菜单项
       */
      setSelectedMenuKeys: (keys: string[]) => {
        set({ selectedMenuKeys: keys });
      },

      /**
       * 设置展开的菜单项
       */
      setOpenMenuKeys: (keys: string[]) => {
        set({ openMenuKeys: keys });
      },

      /**
       * 设置面包屑路径
       */
      setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => {
        set({ breadcrumbs });
      },

      /**
       * 设置主题模式
       */
      setTheme: (theme: ThemeMode) => {
        set({ theme });
      },

      /**
       * 设置屏幕尺寸断点
       */
      setBreakpoint: (breakpoint: Breakpoint) => {
        set({ breakpoint });
      },

      /**
       * 重置布局状态
       */
      resetLayout: () => {
        set(initialState);
      },
    }),
    {
      name: 'layout-storage', // localStorage key
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);