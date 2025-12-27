/**
 * 导航功能Hook
 * 提供菜单操作、导航管理、搜索和收藏等核心功能
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  MenuItem,
  NavigationAction,
  FunctionalArea,
  MenuLevel,
  MenuHierarchy,
  MenuGroup
} from '@/types/navigation';
import { useNavigationStore } from '@/stores/navigationStore';
import { useUserStore } from '@/stores/userStore';
import {
  findMenuById,
  buildMenuPath,
  searchMenus,
  flattenMenuItems
} from '@/utils/navigation';
import { menuService } from '@/services/menuService';
import { logNavigationAction } from '@/services/navigationLogService';

/**
 * 导航Hook返回值接口
 */
export interface UseNavigationReturn {
  // 菜单数据
  menus: MenuItem[];
  flatMenus: MenuItem[];
  loading: boolean;
  error: string | null;

  // 当前状态
  activeMenu: MenuItem | null;
  expandedMenuIds: string[];
  sidebarCollapsed: boolean;
  searchQuery: string;
  favoriteMenus: string[];
  recentMenus: string[];

  // 菜单层级信息
  menuHierarchy: Record<string, MenuHierarchy>;
  menuGroups: MenuGroup[];

  // 菜单操作
  navigateToMenu: (menuId: string) => Promise<void>;
  toggleMenuExpansion: (menuId: string) => void;
  expandMenu: (menuId: string) => void;
  collapseMenu: (menuId: string) => void;
  setActiveMenu: (menuId: string | null) => void;

  // 菜单层级操作
  getMenuHierarchy: (menuId: string) => MenuHierarchy;
  getParentMenu: (menuId: string) => MenuItem | null;
  getChildMenus: (menuId: string) => MenuItem[];
  getSiblingMenus: (menuId: string) => MenuItem[];

  // 菜单分组操作
  getMenusByFunctionalArea: (area: FunctionalArea) => MenuItem[];
  groupMenusByArea: () => Record<FunctionalArea, MenuGroup>;

  // 侧边栏操作
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // 搜索功能
  setSearchQuery: (query: string) => void;
  searchResults: MenuItem[];

  // 收藏功能
  toggleFavorite: (menuId: string) => void;
  isFavorite: (menuId: string) => boolean;

  // 最近访问
  addToRecent: (menuId: string) => void;

  // 工具函数
  getMenuPath: (menuId: string) => MenuItem[];
  getMainMenu: (menu: MenuItem) => MenuItem | null;
  getSubMenus: (mainMenuId: string) => MenuItem[];
  filterByFunctionalArea: (area: FunctionalArea) => MenuItem[];

  // 数据操作
  refreshMenus: () => Promise<void>;
  clearError: () => void;
}

/**
 * 导航功能Hook
 */
export const useNavigation = (): UseNavigationReturn => {
  const navigate = useNavigate();

  // Store状态
  const {
    menus,
    activeMenu,
    expandedMenuIds,
    sidebarCollapsed,
    loading,
    error,
    searchQuery,
    favoriteMenus,
    recentMenus,

    // Store actions
    setMenus,
    setActiveMenu: setActiveMenuInStore,
    toggleMenuExpansion: toggleExpansionInStore,
    expandMenu: expandInStore,
    collapseMenu: collapseInStore,
    setSidebarCollapsed: setSidebarInStore,
    setSearchQuery: setSearchQueryInStore,
    toggleFavorite: toggleFavoriteInStore,
    addRecentMenu: addRecentInStore,
    setLoading,
    setError,
    clearError
  } = useNavigationStore();

  const { user } = useUserStore();

  // 扁平化菜单列表（用于搜索）
  const flatMenus = useMemo(() => {
    return flattenMenuItems(menus);
  }, [menus]);

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return searchMenus(flatMenus, searchQuery);
  }, [flatMenus, searchQuery]);

  // 刷新菜单数据
  const refreshMenus = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      const menuData = await menuService.getCompleteMenus();
      setMenus(menuData);

      // 记录页面浏览日志
      if (user) {
        await logNavigationAction({
          userId: user.id,
          action: NavigationAction.PAGE_VIEW,
          menuId: null,
          metadata: { action: 'refresh_menus' }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取菜单数据失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setMenus, setError, clearError, user]);

  // 导航到指定菜单
  const navigateToMenu = useCallback(async (menuId: string) => {
    try {
      const menu = findMenuById(menus, menuId);
      if (!menu) {
        message.warning('未找到指定菜单');
        return;
      }

      if (!menu.isActive || !menu.isVisible) {
        message.warning('该菜单不可用');
        return;
      }

      // 构建导航路径
      const path = menu.path || buildMenuPath(menus, menu);

      // 更新状态
      setActiveMenuInStore(menuId);

      // 展开父菜单
      const menuPath = getMenuPath(menuId);
      menuPath.slice(0, -1).forEach(parentId => {
        expandInStore(parentId);
      });

      // 添加到最近访问
      addRecentInStore(menuId);

      // 执行路由跳转
      if (path && path !== window.location.pathname) {
        navigate(path);
      }

      // 记录导航日志
      if (user) {
        await logNavigationAction({
          userId: user.id,
          action: NavigationAction.MENU_CLICK,
          menuId,
          metadata: { path, menuName: menu.name }
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '导航失败';
      message.error(errorMessage);

      // 记录错误日志
      if (user) {
        await logNavigationAction({
          userId: user.id,
          action: NavigationAction.MENU_CLICK,
          menuId,
          metadata: { error: errorMessage }
        });
      }
    }
  }, [menus, setActiveMenuInStore, expandInStore, addRecentInStore, navigate, user]);

  // 切换菜单展开状态
  const toggleMenuExpansion = useCallback((menuId: string) => {
    toggleExpansionInStore(menuId);
  }, [toggleExpansionInStore]);

  // 展开菜单
  const expandMenu = useCallback((menuId: string) => {
    expandInStore(menuId);
  }, [expandInStore]);

  // 收起菜单
  const collapseMenu = useCallback((menuId: string) => {
    collapseInStore(menuId);
  }, [collapseInStore]);

  // 设置当前活动菜单
  const setActiveMenu = useCallback((menuId: string | null) => {
    setActiveMenuInStore(menuId);
  }, [setActiveMenuInStore]);

  // 切换侧边栏状态
  const toggleSidebar = useCallback(() => {
    setSidebarInStore(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarInStore]);

  // 设置侧边栏状态
  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarInStore(collapsed);
  }, [setSidebarInStore]);

  // 设置搜索查询
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryInStore(query);
  }, [setSearchQueryInStore]);

  // 检查是否为收藏菜单
  const isFavorite = useCallback((menuId: string) => {
    return favoriteMenus.includes(menuId);
  }, [favoriteMenus]);

  // 切换收藏状态
  const toggleFavorite = useCallback(async (menuId: string) => {
    try {
      toggleFavoriteInStore(menuId);

      // 记录收藏操作日志
      if (user) {
        await logNavigationAction({
          userId: user.id,
          action: NavigationAction.FAVORITE_CLICK,
          menuId,
          metadata: { isFavorite: !isFavorite(menuId) }
        });
      }
    } catch (err) {
      message.error('操作收藏失败');
    }
  }, [toggleFavoriteInStore, user, isFavorite]);

  // 添加到最近访问
  const addToRecent = useCallback((menuId: string) => {
    addRecentInStore(menuId);
  }, [addRecentInStore]);

  // 获取菜单路径
  const getMenuPath = useCallback((menuId: string): MenuItem[] => {
    const path: MenuItem[] = [];
    let currentMenu = findMenuById(menus, menuId);

    while (currentMenu) {
      path.unshift(currentMenu);
      if (currentMenu.parentId) {
        currentMenu = findMenuById(menus, currentMenu.parentId);
      } else {
        break;
      }
    }

    return path;
  }, [menus]);

  // 获取菜单层级信息
  const getMenuHierarchy = useCallback((menuId: string): MenuHierarchy => {
    const menu = findMenuById(menus, menuId);
    if (!menu) {
      return {
        depth: 0,
        currentLevel: MenuLevel.MAIN,
        parentPath: [],
        childrenCount: 0,
        hasChildren: false,
        levelTitles: {
          [MenuLevel.MAIN]: '主菜单',
          [MenuLevel.SUB]: '子菜单',
          [MenuLevel.DETAIL]: '详情页面'
        }
      };
    }

    const path = getMenuPath(menuId);
    const children = menu.children || [];

    return {
      depth: path.length,
      currentLevel: menu.level,
      parentPath: path.slice(0, -1).map(m => m.id),
      childrenCount: children.length,
      hasChildren: children.length > 0,
      levelTitles: {
        [MenuLevel.MAIN]: '主菜单',
        [MenuLevel.SUB]: '子菜单',
        [MenuLevel.DETAIL]: '详情页面'
      }
    };
  }, [menus, getMenuPath]);

  // 获取父菜单
  const getParentMenu = useCallback((menuId: string): MenuItem | null => {
    const menu = findMenuById(menus, menuId);
    if (!menu || !menu.parentId) {
      return null;
    }
    return findMenuById(menus, menu.parentId) || null;
  }, [menus]);

  // 获取子菜单
  const getChildMenus = useCallback((menuId: string): MenuItem[] => {
    const menu = findMenuById(menus, menuId);
    return menu?.children?.filter(child => child.isActive && child.isVisible) || [];
  }, [menus]);

  // 获取同级菜单
  const getSiblingMenus = useCallback((menuId: string): MenuItem[] => {
    const menu = findMenuById(menus, menuId);
    if (!menu || !menu.parentId) {
      return [];
    }

    const parent = findMenuById(menus, menu.parentId);
    return parent?.children?.filter(child =>
      child.id !== menuId && child.isActive && child.isVisible
    ) || [];
  }, [menus]);

  // 获取主菜单
  const getMainMenu = useCallback((menu: MenuItem): MenuItem | null => {
    if (menu.level === MenuLevel.MAIN) {
      return menu;
    }

    if (menu.parentId) {
      const parent = findMenuById(menus, menu.parentId);
      return parent?.level === MenuLevel.MAIN ? parent : getMainMenu(parent!);
    }

    return null;
  }, [menus]);

  // 获取子菜单
  const getSubMenus = useCallback((mainMenuId: string): MenuItem[] => {
    const mainMenu = findMenuById(menus, mainMenuId);
    return mainMenu?.children?.filter(
      child => child.level === MenuLevel.SUB && child.isActive && child.isVisible
    ) || [];
  }, [menus]);

  // 按功能区域过滤菜单
  const filterByFunctionalArea = useCallback((area: FunctionalArea): MenuItem[] => {
    return flatMenus.filter(
      menu => menu.functionalArea === area && menu.isActive && menu.isVisible
    );
  }, [flatMenus]);

  // 获取指定功能区域的菜单
  const getMenusByFunctionalArea = useCallback((area: FunctionalArea): MenuItem[] => {
    return flatMenus.filter(
      menu => menu.functionalArea === area && menu.isActive && menu.isVisible
    );
  }, [flatMenus]);

  // 按功能区域分组菜单
  const groupMenusByArea = useCallback((): Record<FunctionalArea, MenuGroup> => {
    const groups: Record<string, MenuGroup> = {};

    // 获取所有主功能区域
    const mainAreas = [
      FunctionalArea.BASIC_SETTINGS,
      FunctionalArea.PRODUCT_MANAGEMENT,
      FunctionalArea.BOM_MANAGEMENT,
      FunctionalArea.SCENARIO_PACKAGE,
      FunctionalArea.PRICING_SYSTEM,
      FunctionalArea.PROCUREMENT,
      FunctionalArea.INVENTORY,
      FunctionalArea.SCHEDULING,
      FunctionalArea.ORDER_MANAGEMENT,
      FunctionalArea.OPERATIONS,
      FunctionalArea.SYSTEM_MANAGEMENT
    ];

    mainAreas.forEach(area => {
      const areaMenus = getMenusByFunctionalArea(area);
      groups[area] = {
        id: area,
        name: getFunctionalAreaName(area),
        description: getFunctionalAreaDescription(area),
        menus: areaMenus,
        sortOrder: getFunctionalAreaSortOrder(area),
        isExpanded: true,
        isVisible: areaMenus.length > 0
      };
    });

    return groups as Record<FunctionalArea, MenuGroup>;
  }, [getMenusByFunctionalArea]);

  // 获取功能区域名称的辅助函数
  const getFunctionalAreaName = (area: FunctionalArea): string => {
    const nameMap: Record<FunctionalArea, string> = {
      [FunctionalArea.BASIC_SETTINGS]: '基础设置',
      [FunctionalArea.PRODUCT_MANAGEMENT]: '商品管理',
      [FunctionalArea.BOM_MANAGEMENT]: 'BOM管理',
      [FunctionalArea.SCENARIO_PACKAGE]: '场景包管理',
      [FunctionalArea.PRICING_SYSTEM]: '价格体系',
      [FunctionalArea.PROCUREMENT]: '采购管理',
      [FunctionalArea.INVENTORY]: '库存管理',
      [FunctionalArea.SCHEDULING]: '排期管理',
      [FunctionalArea.ORDER_MANAGEMENT]: '订单管理',
      [FunctionalArea.OPERATIONS]: '运营报表',
      [FunctionalArea.SYSTEM_MANAGEMENT]: '系统管理',
      // 子功能区域
      [FunctionalArea.PRODUCT_CATALOG]: '商品目录',
      [FunctionalArea.PRODUCT_CATEGORY]: '商品分类',
      [FunctionalArea.PRODUCT_SPECS]: '商品规格',
      [FunctionalArea.INVENTORY_WAREHOUSE]: '仓库库存',
      [FunctionalArea.INVENTORY_STORE]: '门店库存',
      [FunctionalArea.PRICING_STRATEGY]: '定价策略',
      [FunctionalArea.PRICING_PROMOTION]: '促销价格',
      [FunctionalArea.USER_MANAGEMENT]: '用户管理',
      [FunctionalArea.ROLE_MANAGEMENT]: '角色管理',
      [FunctionalArea.PERMISSION_MANAGEMENT]: '权限管理'
    };
    return nameMap[area] || area;
  };

  // 获取功能区域描述的辅助函数
  const getFunctionalAreaDescription = (area: FunctionalArea): string => {
    const descMap: Record<FunctionalArea, string> = {
      [FunctionalArea.BASIC_SETTINGS]: '基础数据设置与管理',
      [FunctionalArea.PRODUCT_MANAGEMENT]: '商品信息管理与维护',
      [FunctionalArea.BOM_MANAGEMENT]: '产品配方与成本管理',
      [FunctionalArea.SCENARIO_PACKAGE]: '套餐组合与场景管理',
      [FunctionalArea.PRICING_SYSTEM]: '价格策略与体系管理',
      [FunctionalArea.PROCUREMENT]: '采购订单与供应商管理',
      [FunctionalArea.INVENTORY]: '库存监控与仓储管理',
      [FunctionalArea.SCHEDULING]: '资源排期与调度管理',
      [FunctionalArea.ORDER_MANAGEMENT]: '订单处理与履约管理',
      [FunctionalArea.OPERATIONS]: '运营数据分析与报表',
      [FunctionalArea.SYSTEM_MANAGEMENT]: '系统配置与权限管理',
      // 子功能区域
      [FunctionalArea.PRODUCT_CATALOG]: '商品基础信息目录',
      [FunctionalArea.PRODUCT_CATEGORY]: '商品分类体系管理',
      [FunctionalArea.PRODUCT_SPECS]: '商品规格与属性管理',
      [FunctionalArea.INVENTORY_WAREHOUSE]: '仓库库存管理',
      [FunctionalArea.INVENTORY_STORE]: '门店库存管理',
      [FunctionalArea.PRICING_STRATEGY]: '定价策略管理',
      [FunctionalArea.PRICING_PROMOTION]: '促销活动价格管理',
      [FunctionalArea.USER_MANAGEMENT]: '用户账号管理',
      [FunctionalArea.ROLE_MANAGEMENT]: '角色权限管理',
      [FunctionalArea.PERMISSION_MANAGEMENT]: '功能权限管理'
    };
    return descMap[area] || '';
  };

  // 获取功能区域排序的辅助函数
  const getFunctionalAreaSortOrder = (area: FunctionalArea): number => {
    const orderMap: Record<FunctionalArea, number> = {
      [FunctionalArea.BASIC_SETTINGS]: 1,
      [FunctionalArea.PRODUCT_MANAGEMENT]: 2,
      [FunctionalArea.BOM_MANAGEMENT]: 3,
      [FunctionalArea.SCENARIO_PACKAGE]: 4,
      [FunctionalArea.PRICING_SYSTEM]: 5,
      [FunctionalArea.PROCUREMENT]: 6,
      [FunctionalArea.INVENTORY]: 7,
      [FunctionalArea.SCHEDULING]: 8,
      [FunctionalArea.ORDER_MANAGEMENT]: 9,
      [FunctionalArea.OPERATIONS]: 10,
      [FunctionalArea.SYSTEM_MANAGEMENT]: 11,
      // 子功能区域
      [FunctionalArea.PRODUCT_CATALOG]: 21,
      [FunctionalArea.PRODUCT_CATEGORY]: 22,
      [FunctionalArea.PRODUCT_SPECS]: 23,
      [FunctionalArea.INVENTORY_WAREHOUSE]: 71,
      [FunctionalArea.INVENTORY_STORE]: 72,
      [FunctionalArea.PRICING_STRATEGY]: 51,
      [FunctionalArea.PRICING_PROMOTION]: 52,
      [FunctionalArea.USER_MANAGEMENT]: 101,
      [FunctionalArea.ROLE_MANAGEMENT]: 102,
      [FunctionalArea.PERMISSION_MANAGEMENT]: 103
    };
    return orderMap[area] || 999;
  };

  // 生成菜单层级信息
  const menuHierarchy = useMemo(() => {
    const hierarchy: Record<string, MenuHierarchy> = {};

    const buildHierarchy = (menus: MenuItem[]) => {
      menus.forEach(menu => {
        hierarchy[menu.id] = getMenuHierarchy(menu.id);
        if (menu.children) {
          buildHierarchy(menu.children);
        }
      });
    };

    buildHierarchy(menus);
    return hierarchy;
  }, [menus, getMenuHierarchy]);

  // 生成菜单分组
  const menuGroups = useMemo(() => {
    return Object.values(groupMenusByArea());
  }, [groupMenusByArea]);

  // 返回Hook API
  return {
    // 菜单数据
    menus,
    flatMenus,
    loading,
    error,

    // 当前状态
    activeMenu,
    expandedMenuIds,
    sidebarCollapsed,
    searchQuery,
    favoriteMenus,
    recentMenus,

    // 菜单层级信息
    menuHierarchy,
    menuGroups,

    // 菜单操作
    navigateToMenu,
    toggleMenuExpansion,
    expandMenu,
    collapseMenu,
    setActiveMenu,

    // 菜单层级操作
    getMenuHierarchy,
    getParentMenu,
    getChildMenus,
    getSiblingMenus,

    // 菜单分组操作
    getMenusByFunctionalArea,
    groupMenusByArea,

    // 侧边栏操作
    toggleSidebar,
    setSidebarCollapsed,

    // 搜索功能
    setSearchQuery,
    searchResults,

    // 收藏功能
    toggleFavorite,
    isFavorite,

    // 最近访问
    addToRecent,

    // 工具函数
    getMenuPath,
    getMainMenu,
    getSubMenus,
    filterByFunctionalArea,

    // 数据操作
    refreshMenus,
    clearError
  };
};