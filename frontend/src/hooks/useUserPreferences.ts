/**
 * 用户偏好管理Hook
 * 管理用户的导航偏好设置，包括侧边栏状态、收藏菜单、搜索历史等
 */

import { useCallback, useEffect } from 'react';
import { UserPreference, FunctionalArea } from '@/types/navigation';

/**
 * 用户偏好Hook返回值接口
 */
export interface UseUserPreferencesReturn {
  // 用户偏好数据
  preferences: UserPreference | null;
  loading: boolean;
  error: string | null;

  // 偏好设置
  sidebarExpanded: boolean;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  compactMode: boolean;
  fixedSidebar: boolean;
  enableAnimation: boolean;

  // 导航偏好
  showBreadcrumb: boolean;
  enableSearch: boolean;
  recentItemsLimit: number;
  searchHistoryLimit: number;

  // 用户数据
  favoriteMenuIds: string[];
  expandedMenuIds: string[];
  recentMenuIds: string[];
  searchHistory: string[];

  // 操作方法
  updatePreferences: (updates: Partial<UserPreference>) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setPrimaryColor: (color: string) => void;
  toggleCompactMode: () => void;
  toggleFixedSidebar: () => void;
  toggleAnimation: () => void;

  // 收藏管理
  addToFavorites: (menuId: string) => void;
  removeFromFavorites: (menuId: string) => void;
  isFavorite: (menuId: string) => boolean;
  getFavorites: () => string[];

  // 菜单展开管理
  expandMenu: (menuId: string) => void;
  collapseMenu: (menuId: string) => void;
  isExpanded: (menuId: string) => boolean;
  getExpandedMenus: () => string[];

  // 最近访问管理
  addToRecent: (menuId: string) => void;
  removeFromRecent: (menuId: string) => void;
  getRecentMenus: () => string[];

  // 搜索历史管理
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  getSearchHistory: () => string[];
  removeFromSearchHistory: (query: string) => void;

  // 工具方法
  resetToDefaults: () => void;
  exportPreferences: () => string;
  importPreferences: (preferencesData: string) => boolean;
}

/**
 * 默认用户偏好设置
 */
const defaultPreferences: UserPreference = {
  userId: 'user-001',
  sidebarExpanded: true,
  expandedMenuIds: [],
  favoriteMenuIds: [],
  recentMenuIds: [],
  searchHistory: [],
  theme: {
    mode: 'light',
    primaryColor: '#1890ff'
  },
  navigation: {
    showBreadcrumb: true,
    enableSearch: true,
    recentItemsLimit: 10,
    searchHistoryLimit: 20
  },
  ui: {
    compactMode: false,
    fixedSidebar: true,
    enableAnimation: true
  },
  lastUpdated: new Date().toISOString()
};

/**
 * LocalStorage键名
 */
const STORAGE_KEY = 'cinema-navigation-preferences';

/**
 * 用户偏好Hook
 */
export const useUserPreferences = (): UseUserPreferencesReturn => {
  // 从LocalStorage读取用户偏好
  const loadPreferences = useCallback((): UserPreference | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored);

      // 验证数据结构
      if (!data.userId || !data.theme || !data.navigation || !data.ui) {
        console.warn('Invalid user preferences data, using defaults');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return null;
    }
  }, []);

  // 保存用户偏好到LocalStorage
  const savePreferences = useCallback((preferences: UserPreference): void => {
    try {
      const data = {
        ...preferences,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }, []);

  // 获取当前用户偏好
  const getCurrentPreferences = useCallback((): UserPreference => {
    const stored = loadPreferences();
    if (stored) {
      return { ...defaultPreferences, ...stored };
    }
    return defaultPreferences;
  }, [loadPreferences]);

  const preferences = getCurrentPreferences();

  /**
   * 更新用户偏好
   */
  const updatePreferences = useCallback((updates: Partial<UserPreference>): void => {
    const current = getCurrentPreferences();
    const updated = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    savePreferences(updated);
  }, [getCurrentPreferences, savePreferences]);

  /**
   * 切换侧边栏展开状态
   */
  const toggleSidebar = useCallback((): void => {
    updatePreferences({
      sidebarExpanded: !preferences.sidebarExpanded
    });
  }, [preferences.sidebarExpanded, updatePreferences]);

  /**
   * 设置主题
   */
  const setTheme = useCallback((theme: 'light' | 'dark' | 'auto'): void => {
    updatePreferences({
      theme: {
        ...preferences.theme,
        mode: theme
      }
    });
  }, [preferences.theme, updatePreferences]);

  /**
   * 设置主色调
   */
  const setPrimaryColor = useCallback((color: string): void => {
    updatePreferences({
      theme: {
        ...preferences.theme,
        primaryColor: color
      }
    });
  }, [preferences.theme, updatePreferences]);

  /**
   * 切换紧凑模式
   */
  const toggleCompactMode = useCallback((): void => {
    updatePreferences({
      ui: {
        ...preferences.ui,
        compactMode: !preferences.ui.compactMode
      }
    });
  }, [preferences.ui, updatePreferences]);

  /**
   * 切换固定侧边栏
   */
  const toggleFixedSidebar = useCallback((): void => {
    updatePreferences({
      ui: {
        ...preferences.ui,
        fixedSidebar: !preferences.ui.fixedSidebar
      }
    });
  }, [preferences.ui, updatePreferences]);

  /**
   * 切换动画效果
   */
  const toggleAnimation = useCallback((): void => {
    updatePreferences({
      ui: {
        ...preferences.ui,
        enableAnimation: !preferences.ui.enableAnimation
      }
    });
  }, [preferences.ui, updatePreferences]);

  /**
   * 添加到收藏
   */
  const addToFavorites = useCallback((menuId: string): void => {
    const favorites = preferences.favoriteMenuIds || [];
    if (!favorites.includes(menuId)) {
      updatePreferences({
        favoriteMenuIds: [...favorites, menuId]
      });
    }
  }, [preferences.favoriteMenuIds, updatePreferences]);

  /**
   * 从收藏中移除
   */
  const removeFromFavorites = useCallback((menuId: string): void => {
    const favorites = preferences.favoriteMenuIds || [];
    updatePreferences({
      favoriteMenuIds: favorites.filter(id => id !== menuId)
    });
  }, [preferences.favoriteMenuIds, updatePreferences]);

  /**
   * 检查是否已收藏
   */
  const isFavorite = useCallback((menuId: string): boolean => {
    return (preferences.favoriteMenuIds || []).includes(menuId);
  }, [preferences.favoriteMenuIds]);

  /**
   * 获取收藏列表
   */
  const getFavorites = useCallback((): string[] => {
    return [...(preferences.favoriteMenuIds || [])];
  }, [preferences.favoriteMenuIds]);

  /**
   * 展开菜单
   */
  const expandMenu = useCallback((menuId: string): void => {
    const expanded = preferences.expandedMenuIds || [];
    if (!expanded.includes(menuId)) {
      updatePreferences({
        expandedMenuIds: [...expanded, menuId]
      });
    }
  }, [preferences.expandedMenuIds, updatePreferences]);

  /**
   * 收起菜单
   */
  const collapseMenu = useCallback((menuId: string): void => {
    const expanded = preferences.expandedMenuIds || [];
    updatePreferences({
      expandedMenuIds: expanded.filter(id => id !== menuId)
    });
  }, [preferences.expandedMenuIds, updatePreferences]);

  /**
   * 检查菜单是否展开
   */
  const isExpanded = useCallback((menuId: string): boolean => {
    return (preferences.expandedMenuIds || []).includes(menuId);
  }, [preferences.expandedMenuIds]);

  /**
   * 获取展开的菜单列表
   */
  const getExpandedMenus = useCallback((): string[] => {
    return [...(preferences.expandedMenuIds || [])];
  }, [preferences.expandedMenuIds]);

  /**
   * 添加到最近访问
   */
  const addToRecent = useCallback((menuId: string): void => {
    const recent = (preferences.recentMenuIds || []).filter(id => id !== menuId);
    recent.unshift(menuId);

    // 限制数量
    const limit = preferences.navigation?.recentItemsLimit || 10;
    const limited = recent.slice(0, limit);

    updatePreferences({
      recentMenuIds: limited
    });
  }, [preferences.recentMenuIds, preferences.navigation?.recentItemsLimit, updatePreferences]);

  /**
   * 从最近访问中移除
   */
  const removeFromRecent = useCallback((menuId: string): void => {
    const recent = preferences.recentMenuIds || [];
    updatePreferences({
      recentMenuIds: recent.filter(id => id !== menuId)
    });
  }, [preferences.recentMenuIds, updatePreferences]);

  /**
   * 获取最近访问列表
   */
  const getRecentMenus = useCallback((): string[] => {
    return [...preferences.recentMenuIds];
  }, [preferences.recentMenuIds]);

  /**
   * 添加到搜索历史
   */
  const addToSearchHistory = useCallback((query: string): void => {
    if (!query.trim()) return;

    const history = preferences.searchHistory.filter(item => item !== query);
    history.unshift(query.trim());

    // 限制数量
    const limited = history.slice(0, preferences.navigation.searchHistoryLimit);

    updatePreferences({
      searchHistory: limited
    });
  }, [preferences.searchHistory, preferences.navigation.searchHistoryLimit, updatePreferences]);

  /**
   * 清空搜索历史
   */
  const clearSearchHistory = useCallback((): void => {
    updatePreferences({
      searchHistory: []
    });
  }, [updatePreferences]);

  /**
   * 获取搜索历史
   */
  const getSearchHistory = useCallback((): string[] => {
    return [...(preferences.searchHistory || [])];
  }, [preferences.searchHistory]);

  /**
   * 从搜索历史中移除
   */
  const removeFromSearchHistory = useCallback((query: string): void => {
    updatePreferences({
      searchHistory: preferences.searchHistory.filter(item => item !== query)
    });
  }, [preferences.searchHistory, updatePreferences]);

  /**
   * 重置为默认设置
   */
  const resetToDefaults = useCallback((): void => {
    savePreferences({
      ...defaultPreferences,
      userId: preferences.userId // 保留用户ID
    });
  }, [preferences.userId, savePreferences]);

  /**
   * 导出用户偏好设置
   */
  const exportPreferences = useCallback((): string => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  /**
   * 导入用户偏好设置
   */
  const importPreferences = useCallback((preferencesData: string): boolean => {
    try {
      const data = JSON.parse(preferencesData);

      // 验证数据结构
      if (!data.userId || !data.theme || !data.navigation || !data.ui) {
        return false;
      }

      updatePreferences({
        ...data,
        userId: preferences.userId // 保持当前用户ID
      });

      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }, [preferences.userId, updatePreferences]);

  // 监听主题变化并应用到document
  useEffect(() => {
    const { mode } = preferences.theme;

    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (mode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      // auto模式：根据系统偏好设置
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (darkModeQuery.matches) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [preferences.theme.mode]);

  // 监听主色调变化
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', preferences.theme.primaryColor);
  }, [preferences.theme.primaryColor]);

  return {
    preferences,
    loading: false,
    error: null,

    sidebarExpanded: preferences.sidebarExpanded,
    theme: preferences.theme.mode,
    primaryColor: preferences.theme.primaryColor,
    compactMode: preferences.ui.compactMode,
    fixedSidebar: preferences.ui.fixedSidebar,
    enableAnimation: preferences.ui.enableAnimation,

    showBreadcrumb: preferences.navigation.showBreadcrumb,
    enableSearch: preferences.navigation.enableSearch,
    recentItemsLimit: preferences.navigation.recentItemsLimit,
    searchHistoryLimit: preferences.navigation.searchHistoryLimit,

    favoriteMenuIds: preferences.favoriteMenuIds,
    expandedMenuIds: preferences.expandedMenuIds,
    recentMenuIds: preferences.recentMenuIds,
    searchHistory: preferences.searchHistory,

    updatePreferences,
    toggleSidebar,
    setTheme,
    setPrimaryColor,
    toggleCompactMode,
    toggleFixedSidebar,
    toggleAnimation,

    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavorites,

    expandMenu,
    collapseMenu,
    isExpanded,
    getExpandedMenus,

    addToRecent,
    removeFromRecent,
    getRecentMenus,

    addToSearchHistory,
    clearSearchHistory,
    getSearchHistory,
    removeFromSearchHistory,

    resetToDefaults,
    exportPreferences,
    importPreferences
  };
};