/**
 * 导航工具函数
 * 提供导航相关的通用功能
 */

import {
  MenuItem,
  PermissionCheckResult,
  MenuFilterResult,
  BreadcrumbItem,
  FunctionalArea,
  NavigationAction,
  MenuLevel,
  MenuHierarchy,
  MenuGroup,
  MenuHierarchy as MenuHierarchyType,
  SearchResult
} from '@/types';

/**
 * 检查菜单权限
 */
export const checkMenuPermission = (
  menu: MenuItem,
  userPermissions: string[]
): boolean => {
  if (menu.requiredPermissions.length === 0) {
    return true; // 无权限要求的菜单默认可访问
  }

  return menu.requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
};

/**
 * 过滤用户可访问的菜单
 */
export const filterMenusByPermissions = (
  menus: MenuItem[],
  userPermissions: string[]
): MenuItem[] => {
  return menus.reduce<MenuItem[]>((acc, menu) => {
    // 检查当前菜单权限
    if (checkMenuPermission(menu, userPermissions)) {
      const filteredMenu = { ...menu };

      // 递归过滤子菜单
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = filterMenusByPermissions(menu.children, userPermissions);
        filteredMenu.children = filteredChildren;
      }

      // 如果菜单本身有路径或者有可访问的子菜单，则保留
      if (menu.path || (filteredMenu.children && filteredMenu.children.length > 0)) {
        acc.push(filteredMenu);
      }
    }

    return acc;
  }, []);
};

/**
 * 构建菜单过滤结果
 */
export const buildMenuFilterResult = (
  menus: MenuItem[],
  userPermissions: string[]
): MenuFilterResult => {
  const visibleMenus = filterMenusByPermissions(menus, userPermissions);
  const allRequiredPermissions = menus
    .flatMap(menu => menu.requiredPermissions)
    .filter((perm, index, arr) => arr.indexOf(perm) === index); // 去重

  return {
    visibleMenus,
    hasAccess: visibleMenus.length > 0,
    requiredPermissions: allRequiredPermissions,
    userPermissions
  };
};

/**
 * 根据路径查找菜单项
 */
export const findMenuItemByPath = (
  menus: MenuItem[],
  path: string
): MenuItem | null => {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }

    if (menu.children && menu.children.length > 0) {
      const found = findMenuItemByPath(menu.children, path);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

/**
 * 根据ID查找菜单项
 */
export const findMenuItemById = (
  menus: MenuItem[],
  id: string
): MenuItem | null => {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }

    if (menu.children && menu.children.length > 0) {
      const found = findMenuItemById(menu.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

/**
 * 获取菜单的面包屑路径
 */
export const getMenuBreadcrumb = (
  menus: MenuItem[],
  targetMenu: MenuItem
): BreadcrumbItem[] => {
  const breadcrumb: BreadcrumbItem[] = [];

  // 查找菜单的完整路径
  const findPath = (items: MenuItem[], target: MenuItem, path: MenuItem[] = []): MenuItem[] | null => {
    for (const item of items) {
      const currentPath = [...path, item];

      if (item.id === target.id) {
        return currentPath;
      }

      if (item.children && item.children.length > 0) {
        const found = findPath(item.children, target, currentPath);
        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  const menuPath = findPath(menus, targetMenu);

  if (menuPath) {
    menuPath.forEach((menu, index) => {
      breadcrumb.push({
        id: menu.id,
        title: menu.name,
        path: menu.path,
        icon: menu.icon,
        isCurrent: index === menuPath.length - 1,
        isClickable: index < menuPath.length - 1
      });
    });
  }

  return breadcrumb;
};

/**
 * 扁平化菜单树（用于搜索）
 */
export const flattenMenus = (menus: MenuItem[]): MenuItem[] => {
  const result: MenuItem[] = [];

  const flatten = (items: MenuItem[]) => {
    items.forEach(item => {
      // 添加扁平化的菜单项（不包含子菜单）
      result.push({
        ...item,
        children: [] // 扁平化时清空子菜单
      });

      // 递归处理子菜单
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    });
  };

  flatten(menus);
  return result;
};

/**
 * 搜索菜单
 */
export const searchMenus = (
  menus: MenuItem[],
  query: string,
  userPermissions?: string[]
): MenuItem[] => {
  if (!query.trim()) {
    return [];
  }

  const searchableMenus = userPermissions
    ? filterMenusByPermissions(menus, userPermissions)
    : menus;

  const flattenedMenus = flattenMenus(searchableMenus);
  const lowerQuery = query.toLowerCase();

  return flattenedMenus.filter(menu =>
    menu.name.toLowerCase().includes(lowerQuery) ||
    menu.code.toLowerCase().includes(lowerQuery)
  );
};

/**
 * 高亮搜索关键词
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) {
    return text;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * 生成菜单键值（用于状态管理）
 */
export const generateMenuKey = (menu: MenuItem): string => {
  return `${menu.code}_${menu.level}`;
};

/**
 * 按功能区域分组菜单
 */
export const groupMenusByFunctionalArea = (
  menus: MenuItem[]
): Record<FunctionalArea, MenuItem[]> => {
  const groups: Record<string, MenuItem[]> = {};

  menus.forEach(menu => {
    const area = menu.functionalArea;
    if (!groups[area]) {
      groups[area] = [];
    }
    groups[area].push(menu);
  });

  return groups as Record<FunctionalArea, MenuItem[]>;
};

/**
 * 获取功能区域的中文名称
 */
export const getFunctionalAreaName = (area: FunctionalArea): string => {
  const areaNames: Record<FunctionalArea, string> = {
    [FunctionalArea.BASIC_SETTINGS]: '基础设置与主数据',
    [FunctionalArea.PRODUCT_MANAGEMENT]: '商品管理',
    [FunctionalArea.BOM_MANAGEMENT]: 'BOM/配方与成本管理',
    [FunctionalArea.SCENARIO_PACKAGE]: '场景包/套餐管理',
    [FunctionalArea.PRICING_SYSTEM]: '价格体系管理',
    [FunctionalArea.PROCUREMENT]: '采购与入库管理',
    [FunctionalArea.INVENTORY]: '库存与仓店库存管理',
    [FunctionalArea.SCHEDULING]: '档期/排期/资源预约管理',
    [FunctionalArea.ORDER_MANAGEMENT]: '订单与履约管理',
    [FunctionalArea.OPERATIONS]: '运营 & 报表 / 指标看板',
    [FunctionalArea.SYSTEM_MANAGEMENT]: '系统管理 / 设置 /权限'
  };

  return areaNames[area] || area;
};

/**
 * 检查菜单是否为叶子节点（无子菜单）
 */
export const isLeafMenu = (menu: MenuItem): boolean => {
  return !menu.children || menu.children.length === 0;
};

/**
 * 根据ID查找菜单项（导出别名，与useNavigation hook一致）
 */
export const findMenuById = findMenuItemById;

/**
 * 构建菜单路径（用于路由跳转）
 */
export const buildMenuPath = (menus: MenuItem[], menu: MenuItem): string => {
  // 如果菜单有直接路径，优先使用
  if (menu.path) {
    return menu.path;
  }

  // 否则根据菜单层级构建路径
  const pathParts: string[] = [];

  // 查找从根菜单到当前菜单的路径
  const buildPathHierarchy = (targetMenu: MenuItem): void => {
    if (targetMenu.parentId) {
      const parent = findMenuItemById(menus, targetMenu.parentId);
      if (parent) {
        buildPathHierarchy(parent);
      }
    }
    pathParts.push(targetMenu.code);
  };

  buildPathHierarchy(menu);
  return '/' + pathParts.join('/');
};

/**
 * 扁平化菜单项（用于搜索和索引）
 */
export const flattenMenuItems = flattenMenus;

/**
 * 生成菜单的唯一路径
 */
export const getMenuPath = (menu: MenuItem, menus: MenuItem[]): string => {
  if (menu.parentId) {
    const parent = findMenuItemById(menus, menu.parentId);
    const parentPath = parent ? getMenuPath(parent, menus) : '';
    return parentPath ? `${parentPath}/${menu.code}` : menu.code;
  }

  return menu.code;
};

/**
 * 格式化导航动作名称
 */
export const getNavigationActionName = (action: NavigationAction): string => {
  const actionNames: Record<NavigationAction, string> = {
    [NavigationAction.MENU_CLICK]: '点击菜单',
    [NavigationAction.BREADCRUMB_CLICK]: '点击面包屑',
    [NavigationAction.SEARCH_SELECT]: '搜索选择',
    [NavigationAction.FAVORITE_CLICK]: '点击收藏',
    [NavigationAction.PAGE_VIEW]: '页面浏览',
    [NavigationAction.PAGE_EXIT]: '页面退出'
  };

  return actionNames[action] || action;
};

/**
 * 计算菜单访问频率统计
 */
export const calculateMenuStats = (
  recentMenus: string[],
  menus: MenuItem[]
): { mostAccessed: MenuItem[], accessCount: Record<string, number> } => {
  const accessCount: Record<string, number> = {};

  // 统计访问次数
  recentMenus.forEach(menuId => {
    accessCount[menuId] = (accessCount[menuId] || 0) + 1;
  });

  // 找出访问次数最多的菜单
  const sortedEntries = Object.entries(accessCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // 取前5个

  const mostAccessed = sortedEntries
    .map(([menuId]) => findMenuItemById(menus, menuId))
    .filter(Boolean) as MenuItem[];

  return {
    mostAccessed,
    accessCount
  };
};

/**
 * 检查菜单是否应该显示（考虑权限和活跃状态）
 */
export const shouldShowMenu = (
  menu: MenuItem,
  userPermissions: string[]
): boolean => {
  return menu.isActive && checkMenuPermission(menu, userPermissions);
};

/**
 * 获取菜单的CSS类名
 */
export const getMenuClassName = (
  menu: MenuItem,
  isActive: boolean,
  isExpanded: boolean,
  level: number
): string => {
  const classes = [
    'menu-item',
    `menu-level-${level}`,
    isActive ? 'menu-active' : '',
    isExpanded ? 'menu-expanded' : '',
    !shouldShowMenu(menu, []) ? 'menu-hidden' : ''
  ];

  return classes.filter(Boolean).join(' ');
};

/**
 * 防抖函数（用于搜索）
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数（用于频繁操作）
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 获取菜单的层级信息
 */
export const getMenuHierarchyInfo = (
  menu: MenuItem,
  menus: MenuItem[]
): MenuHierarchyType => {
  const path = getMenuPathList(menu, menus);
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
};

/**
 * 获取从根菜单到指定菜单的完整路径列表
 */
export const getMenuPathList = (
  targetMenu: MenuItem,
  menus: MenuItem[]
): MenuItem[] => {
  const path: MenuItem[] = [];

  const buildPath = (menu: MenuItem): boolean => {
    // 检查是否为目标菜单
    if (menu.id === targetMenu.id) {
      path.unshift(menu);
      return true;
    }

    // 检查子菜单
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (buildPath(child)) {
          path.unshift(menu);
          return true;
        }
      }
    }

    return false;
  };

  // 从根菜单开始构建路径
  for (const menu of menus) {
    if (buildPath(menu)) {
      break;
    }
  }

  return path;
};

/**
 * 获取菜单的父菜单
 */
export const getParentMenu = (
  menu: MenuItem,
  menus: MenuItem[]
): MenuItem | null => {
  if (!menu.parentId) {
    return null;
  }

  return findMenuItemById(menus, menu.parentId);
};

/**
 * 获取菜单的直接子菜单
 */
export const getChildMenus = (
  menu: MenuItem,
  filters?: {
    level?: MenuLevel;
    isActive?: boolean;
    isVisible?: boolean;
  }
): MenuItem[] => {
  if (!menu.children || menu.children.length === 0) {
    return [];
  }

  return menu.children.filter(child => {
    if (filters?.level !== undefined && child.level !== filters.level) {
      return false;
    }
    if (filters?.isActive !== undefined && child.isActive !== filters.isActive) {
      return false;
    }
    if (filters?.isVisible !== undefined && child.isVisible !== filters.isVisible) {
      return false;
    }
    return true;
  });
};

/**
 * 获取菜单的同级菜单
 */
export const getSiblingMenus = (
  menu: MenuItem,
  menus: MenuItem[]
): MenuItem[] => {
  if (!menu.parentId) {
    // 没有父菜单，返回同级的主菜单
    return menus.filter(m =>
      m.id !== menu.id && m.level === menu.level
    );
  }

  const parent = findMenuItemById(menus, menu.parentId);
  if (!parent || !parent.children) {
    return [];
  }

  return parent.children.filter(child =>
    child.id !== menu.id && child.level === menu.level
  );
};

/**
 * 按功能区域创建菜单分组
 */
export const createMenuGroups = (
  menus: MenuItem[],
  options?: {
    includeEmptyGroups?: boolean;
    sortBy?: 'name' | 'sortOrder';
  }
): MenuGroup[] => {
  const { includeEmptyGroups = false, sortBy = 'sortOrder' } = options || {};

  // 主功能区域列表
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

  const groups: MenuGroup[] = [];

  mainAreas.forEach(area => {
    const areaMenus = menus.filter(menu => menu.functionalArea === area);

    // 如果不包含空分组且该区域没有菜单，则跳过
    if (!includeEmptyGroups && areaMenus.length === 0) {
      return;
    }

    groups.push({
      id: area,
      name: getFunctionalAreaDisplayName(area),
      description: getFunctionalAreaDescription(area),
      menus: areaMenus,
      sortOrder: getFunctionalAreaOrder(area),
      isExpanded: true,
      isVisible: areaMenus.length > 0
    });
  });

  // 排序
  if (sortBy === 'name') {
    groups.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    groups.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return groups;
};

/**
 * 获取功能区域的显示名称
 */
export const getFunctionalAreaDisplayName = (area: FunctionalArea): string => {
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

/**
 * 获取功能区域的描述
 */
export const getFunctionalAreaDescription = (area: FunctionalArea): string => {
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

/**
 * 获取功能区域的排序权重
 */
export const getFunctionalAreaOrder = (area: FunctionalArea): number => {
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

/**
 * 构建菜单树结构
 */
export const buildMenuTree = (
  flatMenus: MenuItem[],
  options?: {
    rootId?: string;
    maxDepth?: number;
  }
): MenuItem[] => {
  const { rootId, maxDepth = 3 } = options || {};
  const menuMap = new Map<string, MenuItem>();
  const rootMenus: MenuItem[] = [];

  // 创建菜单映射
  flatMenus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });

  // 构建树结构
  flatMenus.forEach(menu => {
    const menuNode = menuMap.get(menu.id)!;

    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(menuNode);
    } else if (!rootId || menu.id === rootId) {
      rootMenus.push(menuNode);
    }
  });

  // 限制深度
  const limitDepth = (menus: MenuItem[], currentDepth: number = 1): MenuItem[] => {
    if (currentDepth >= maxDepth) {
      return menus.map(menu => ({ ...menu, children: [] }));
    }

    return menus.map(menu => ({
      ...menu,
      children: menu.children ? limitDepth(menu.children, currentDepth + 1) : []
    }));
  };

  return limitDepth(rootMenus);
};

/**
 * 验证菜单树结构的完整性
 */
export const validateMenuTree = (
  menus: MenuItem[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const menuIds = new Set<string>();
  const parentIds = new Set<string>();

  // 检查菜单ID唯一性
  const checkUniqueness = (menuList: MenuItem[]) => {
    menuList.forEach(menu => {
      if (menuIds.has(menu.id)) {
        errors.push(`重复的菜单ID: ${menu.id}`);
      } else {
        menuIds.add(menu.id);
      }

      if (menu.parentId) {
        parentIds.add(menu.parentId);
      }

      if (menu.children && menu.children.length > 0) {
        checkUniqueness(menu.children);
      }
    });
  };

  // 检查父菜单存在性
  const checkParentExistence = (menuList: MenuItem[]) => {
    menuList.forEach(menu => {
      if (menu.parentId && !menuIds.has(menu.parentId)) {
        errors.push(`菜单 ${menu.id} 的父菜单 ${menu.parentId} 不存在`);
      }

      if (menu.children && menu.children.length > 0) {
        checkParentExistence(menu.children);
      }
    });
  };

  // 检查循环引用
  const checkCircularReference = (menu: MenuItem, visited: Set<string>): boolean => {
    if (visited.has(menu.id)) {
      errors.push(`检测到循环引用: ${Array.from(visited).join(' -> ')} -> ${menu.id}`);
      return false;
    }

    visited.add(menu.id);

    if (menu.children) {
      for (const child of menu.children) {
        if (!checkCircularReference(child, new Set(visited))) {
          return false;
        }
      }
    }

    return true;
  };

  checkUniqueness(menus);
  checkParentExistence(menus);

  // 检查循环引用（从每个根菜单开始）
  menus.forEach(menu => {
    if (!menu.parentId) {
      checkCircularReference(menu, new Set());
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 高级搜索菜单项
 */
export const searchMenuItems = (
  menus: MenuItem[],
  query: string,
  limit: number = 20,
  options?: {
    userPermissions?: string[];
    includeInactive?: boolean;
    searchFields?: ('name' | 'code' | 'description')[];
    fuzzyMatch?: boolean;
  }
): SearchResult[] => {
  const startTime = performance.now();

  if (!query.trim()) {
    return [];
  }

  const {
    userPermissions,
    includeInactive = false,
    searchFields = ['name', 'code', 'description'],
    fuzzyMatch = true
  } = options || {};

  // 获取可搜索的菜单
  let searchableMenus = userPermissions
    ? filterMenusByPermissions(menus, userPermissions)
    : menus;

  if (!includeInactive) {
    searchableMenus = filterActiveMenus(searchableMenus);
  }

  const flattenedMenus = flattenMenus(searchableMenus);
  const lowerQuery = query.toLowerCase().trim();

  // 计算匹配分数并生成搜索结果
  const results: SearchResult[] = flattenedMenus
    .map(menu => {
      let score = 0;
      let matchedFields: string[] = [];

      // 检查各个字段的匹配情况
      searchFields.forEach(field => {
        const fieldValue = (menu as any)[field];
        if (fieldValue && typeof fieldValue === 'string') {
          const lowerFieldValue = fieldValue.toLowerCase();

          if (fuzzyMatch) {
            // 模糊匹配
            if (lowerFieldValue.includes(lowerQuery)) {
              score += calculateMatchScore(lowerQuery, lowerFieldValue);
              matchedFields.push(field);
            }
          } else {
            // 精确匹配
            if (lowerFieldValue === lowerQuery) {
              score += 100;
              matchedFields.push(field);
            } else if (lowerFieldValue.includes(lowerQuery)) {
              score += 50;
              matchedFields.push(field);
            }
          }
        }
      });

      if (score === 0) {
        return null;
      }

      // 根据菜单层级调整分数
      const levelBonus = (4 - menu.level) * 10;
      score += levelBonus;

      return {
        id: menu.id,
        title: menu.name,
        description: menu.description || `${getFunctionalAreaName(menu.functionalArea)} - ${menu.code}`,
        path: menu.path,
        type: menu.level === 1 ? 'menu' : menu.level === 2 ? 'submenu' : 'page',
        menuItem: menu,
        score,
        highlightedTitle: highlightSearchTerm(menu.name, query),
        highlightedDescription: menu.description ? highlightSearchTerm(menu.description, query) : undefined
      };
    })
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);

  const searchDuration = performance.now() - startTime;

  return results;
};

/**
 * 计算匹配分数
 */
export const calculateMatchScore = (query: string, text: string): number => {
  const queryLength = query.length;
  const textLength = text.length;

  // 完全匹配
  if (text === query) {
    return 100;
  }

  // 开头匹配
  if (text.startsWith(query)) {
    return 80;
  }

  // 包含匹配
  if (text.includes(query)) {
    return 60;
  }

  // 计算编辑距离相似度
  const similarity = 1 - (levenshteinDistance(query, text) / Math.max(queryLength, textLength));
  return Math.round(similarity * 40);
};

/**
 * 计算编辑距离（Levenshtein距离）
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * 过滤活跃菜单
 */
export const filterActiveMenus = (menus: MenuItem[]): MenuItem[] => {
  return menus.reduce<MenuItem[]>((acc, menu) => {
    if (menu.isActive) {
      const filteredMenu = { ...menu };

      // 递归过滤子菜单
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = filterActiveMenus(menu.children);
        filteredMenu.children = filteredChildren;
      }

      // 如果菜单本身有路径或者有活跃的子菜单，则保留
      if (menu.path || (filteredMenu.children && filteredMenu.children.length > 0)) {
        acc.push(filteredMenu);
      }
    }

    return acc;
  }, []);
};

/**
 * 搜索建议生成
 */
export const generateSearchSuggestions = (
  menus: MenuItem[],
  query: string,
  limit: number = 5
): string[] => {
  if (!query.trim()) {
    return [];
  }

  const flattenedMenus = flattenMenus(menus);
  const lowerQuery = query.toLowerCase();
  const suggestions = new Set<string>();

  flattenedMenus.forEach(menu => {
    // 检查菜单名称是否包含查询字符串
    const name = menu.name.toLowerCase();
    if (name.includes(lowerQuery)) {
      // 提取包含查询词的完整词语
      const words = menu.name.split(/\s+/);
      words.forEach(word => {
        if (word.toLowerCase().includes(lowerQuery)) {
          suggestions.add(word);
        }
      });
    }

    // 检查描述
    if (menu.description) {
      const descWords = menu.description.split(/\s+/);
      descWords.forEach(word => {
        if (word.toLowerCase().includes(lowerQuery)) {
          suggestions.add(word);
        }
      });
    }
  });

  return Array.from(suggestions)
    .sort((a, b) => {
      // 优先显示以查询词开头的建议
      const aStarts = a.toLowerCase().startsWith(lowerQuery);
      const bStarts = b.toLowerCase().startsWith(lowerQuery);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return a.localeCompare(b);
    })
    .slice(0, limit);
};