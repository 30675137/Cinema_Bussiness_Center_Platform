/**
 * 导航状态管理Store
 * 使用Zustand管理导航相关的全局状态
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  MenuItem,
  SidebarState,
  BreadcrumbItem,
  LayoutSize,
  NavigationAction,
  MenuLevel,
  FunctionalArea,
  User,
} from '@/types/navigation';
import { filterMenusByPermissions } from '@/utils/navigation';
import { useUserStore } from './userStore';

/**
 * 导航状态接口
 */
interface NavigationState {
  /** 菜单列表 */
  menus: MenuItem[];
  /** 当前活动菜单ID */
  activeMenuId: string | null;
  /** 面包屑导航 */
  breadcrumb?: BreadcrumbItem[];
  /** 展开的菜单ID列表 */
  expandedMenuIds: string[];
  /** 侧边栏是否收起 */
  sidebarCollapsed: boolean;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 导航Store状态接口
 */
interface NavigationStore extends NavigationState {
  // Actions
  setMenus: (menus: MenuItem[]) => void;
  setActiveMenu: (menuId: string | null) => void;
  toggleMenuExpansion: (menuId: string) => void;
  expandMenu: (menuId: string) => void;
  collapseMenu: (menuId: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Breadcrumb actions
  setBreadcrumb: (breadcrumb: BreadcrumbItem[]) => void;
  addBreadcrumbItem: (item: BreadcrumbItem) => void;
  removeBreadcrumbItem: (itemId: string) => void;

  // Navigation actions
  navigateToMenu: (menu: MenuItem) => void;
  goBack: () => void;
  goForward: () => void;

  // Search and favorites
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favoriteMenus: string[];
  toggleFavorite: (menuId: string) => void;
  recentMenus: string[];
  addRecentMenu: (menuId: string) => void;

  // Mobile support
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  screenSize: LayoutSize;
  setScreenSize: (size: LayoutSize) => void;

  // Permission-aware actions
  getFilteredMenus: () => MenuItem[];
  canAccessMenu: (menu: MenuItem) => boolean;

  // Reset
  reset: () => void;
}

/**
 * 初始状态
 */
const initialState: NavigationState = {
  menus: [],
  activeMenuId: null,
  expandedMenuIds: [],
  sidebarCollapsed: false,
  loading: false,
  error: null,
};

/**
 * 导航Store
 */
export const useNavigationStore = create<NavigationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialState,

        // Additional state for persistence
        searchQuery: '',
        favoriteMenus: [],
        recentMenus: [],
        sidebarState: SidebarState.EXPANDED,
        screenSize: LayoutSize.LARGE,

        // Computed property (will be calculated on access)
        get activeMenu(): MenuItem | null {
          const state = this as any;
          if (!state.activeMenuId || !state.menus.length) {
            return null;
          }

          // 查找活动菜单
          const findMenu = (menus: MenuItem[], menuId: string): MenuItem | null => {
            for (const menu of menus) {
              if (menu.id === menuId) {
                return menu;
              }
              if (menu.children) {
                const found = findMenu(menu.children, menuId);
                if (found) {
                  return found;
                }
              }
            }
            return null;
          };

          return findMenu(state.menus, state.activeMenuId);
        },

        // Actions
        setMenus: (menus) => set({ menus, loading: false, error: null }, false, 'setMenus'),

        setActiveMenu: (menuId) => set({ activeMenuId: menuId }, false, 'setActiveMenu'),

        toggleMenuExpansion: (menuId) =>
          set(
            (state) => ({
              expandedMenuIds: state.expandedMenuIds.includes(menuId)
                ? state.expandedMenuIds.filter((id) => id !== menuId)
                : [...state.expandedMenuIds, menuId],
            }),
            false,
            'toggleMenuExpansion'
          ),

        expandMenu: (menuId) =>
          set(
            (state) => ({
              expandedMenuIds: state.expandedMenuIds.includes(menuId)
                ? state.expandedMenuIds
                : [...state.expandedMenuIds, menuId],
            }),
            false,
            'expandMenu'
          ),

        collapseMenu: (menuId) =>
          set(
            (state) => ({
              expandedMenuIds: state.expandedMenuIds.filter((id) => id !== menuId),
            }),
            false,
            'collapseMenu'
          ),

        setSidebarCollapsed: (collapsed) =>
          set(
            {
              sidebarCollapsed: collapsed,
              sidebarState: collapsed ? SidebarState.COLLAPSED : SidebarState.EXPANDED,
            },
            false,
            'setSidebarCollapsed'
          ),

        setLoading: (loading) => set({ loading }, false, 'setLoading'),

        setError: (error) => set({ error, loading: false }, false, 'setError'),

        clearError: () => set({ error: null }, false, 'clearError'),

        // Breadcrumb actions
        setBreadcrumb: (breadcrumb) => set({ breadcrumb: undefined }, false, 'setBreadcrumb'),

        addBreadcrumbItem: (item) =>
          set(
            (state) => ({
              breadcrumb: state.breadcrumb ? [...state.breadcrumb, item] : [item],
            }),
            false,
            'addBreadcrumbItem'
          ),

        removeBreadcrumbItem: (itemId) =>
          set(
            (state) => ({
              breadcrumb: state.breadcrumb?.filter((item) => item.id !== itemId) || [],
            }),
            false,
            'removeBreadcrumbItem'
          ),

        // Navigation actions
        navigateToMenu: (menu) => {
          const state = get();
          set(
            {
              activeMenuId: menu.id,
              // Add to recent menus (keep only last 10)
              recentMenus: [menu.id, ...state.recentMenus.filter((id) => id !== menu.id)].slice(
                0,
                10
              ),
            },
            false,
            'navigateToMenu'
          );
        },

        goBack: () => {
          // Implement browser back functionality
          window.history.back();
        },

        goForward: () => {
          // Implement browser forward functionality
          window.history.forward();
        },

        // Search and favorites
        setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

        toggleFavorite: (menuId) =>
          set(
            (state) => ({
              favoriteMenus: state.favoriteMenus.includes(menuId)
                ? state.favoriteMenus.filter((id) => id !== menuId)
                : [...state.favoriteMenus, menuId],
            }),
            false,
            'toggleFavorite'
          ),

        addRecentMenu: (menuId) =>
          set(
            (state) => ({
              recentMenus: [menuId, ...state.recentMenus.filter((id) => id !== menuId)].slice(
                0,
                10
              ),
            }),
            false,
            'addRecentMenu'
          ),

        // Mobile support
        setSidebarState: (sidebarState) =>
          set(
            {
              sidebarState,
              sidebarCollapsed: sidebarState === SidebarState.COLLAPSED,
            },
            false,
            'setSidebarState'
          ),

        setScreenSize: (screenSize) =>
          set(
            {
              screenSize,
              // Auto-collapse sidebar on mobile
              sidebarCollapsed: screenSize === LayoutSize.SMALL,
              sidebarState:
                screenSize === LayoutSize.SMALL ? SidebarState.HIDDEN : SidebarState.EXPANDED,
            },
            false,
            'setScreenSize'
          ),

        // Permission-aware actions
        getFilteredMenus: () => {
          const state = get();
          const userPermissions = useUserStore.getState().permissions;
          return filterMenusByPermissions(state.menus, userPermissions);
        },

        canAccessMenu: (menu) => {
          const userPermissions = useUserStore.getState().permissions;
          return (
            menu.requiredPermissions.length === 0 ||
            menu.requiredPermissions.some((permission) => userPermissions.includes(permission))
          );
        },

        // Reset
        reset: () =>
          set(
            {
              ...initialState,
              searchQuery: '',
              favoriteMenus: [],
              recentMenus: [],
              sidebarState: SidebarState.EXPANDED,
              screenSize: LayoutSize.LARGE,
            },
            false,
            'reset'
          ),
      }),
      {
        name: 'navigation-storage',
        partialize: (state) => ({
          favoriteMenus: state.favoriteMenus,
          recentMenus: state.recentMenus,
          sidebarCollapsed: state.sidebarCollapsed,
          sidebarState: state.sidebarState,
          screenSize: state.screenSize,
        }),
      }
    ),
    {
      name: 'navigation-store',
    }
  )
);

/**
 * 选择器函数 - 只获取需要的特定状态
 */
export const useNavigationMenus = () => useNavigationStore((state) => state.menus);
export const useActiveMenu = () => useNavigationStore((state) => state.activeMenuId);
export const useNavigationLoading = () => useNavigationStore((state) => state.loading);
export const useNavigationError = () => useNavigationStore((state) => state.error);
export const useExpandedMenus = () => useNavigationStore((state) => state.expandedMenuIds);
export const useSidebarCollapsed = () => useNavigationStore((state) => state.sidebarCollapsed);
export const useFavoriteMenus = () => useNavigationStore((state) => state.favoriteMenus);
export const useRecentMenus = () => useNavigationStore((state) => state.recentMenus);
export const useSearchQuery = () => useNavigationStore((state) => state.searchQuery);
export const useSidebarState = () => useNavigationStore((state) => state.sidebarState);
export const useScreenSize = () => useNavigationStore((state) => state.screenSize);

/**
 * Actions选择器 - 只获取action函数
 */
export const useNavigationActions = () =>
  useNavigationStore((state) => ({
    setMenus: state.setMenus,
    setActiveMenu: state.setActiveMenu,
    toggleMenuExpansion: state.toggleMenuExpansion,
    expandMenu: state.expandMenu,
    collapseMenu: state.collapseMenu,
    setSidebarCollapsed: state.setSidebarCollapsed,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    navigateToMenu: state.navigateToMenu,
    goBack: state.goBack,
    goForward: state.goForward,
    setSearchQuery: state.setSearchQuery,
    toggleFavorite: state.toggleFavorite,
    addRecentMenu: state.addRecentMenu,
    setSidebarState: state.setSidebarState,
    setScreenSize: state.setScreenSize,
    reset: state.reset,
  }));
