/**
 * 导航系统类型定义
 * 影院商品管理中台导航系统的完整类型定义
 */

/**
 * 功能区域枚举
 */
export enum FunctionalArea {
  BASIC_SETTINGS = 'basic_settings', // 基础设置与主数据
  PRODUCT_MANAGEMENT = 'product_management', // 商品管理
  BOM_MANAGEMENT = 'bom_management', // BOM/配方与成本管理
  SCENARIO_PACKAGE = 'scenario_package', // 场景包/套餐管理
  PRICING_SYSTEM = 'pricing_system', // 价格体系管理
  PROCUREMENT = 'procurement', // 采购与入库管理
  INVENTORY = 'inventory', // 库存与仓店库存管理
  SCHEDULING = 'scheduling', // 档期/排期/资源预约管理
  ORDER_MANAGEMENT = 'order_management', // 订单与履约管理
  OPERATIONS = 'operations', // 运营 & 报表 / 指标看板
  SYSTEM_MANAGEMENT = 'system_management', // 系统管理 / 设置 /权限
  // 子功能区域
  PRODUCT_CATALOG = 'product_catalog', // 商品目录
  PRODUCT_CATEGORY = 'product_category', // 商品分类
  PRODUCT_SPECS = 'product_specs', // 商品规格
  INVENTORY_WAREHOUSE = 'inventory_warehouse', // 仓库库存
  INVENTORY_STORE = 'inventory_store', // 门店库存
  PRICING_STRATEGY = 'pricing_strategy', // 定价策略
  PRICING_PROMOTION = 'pricing_promotion', // 促销价格
  USER_MANAGEMENT = 'user_management', // 用户管理
  ROLE_MANAGEMENT = 'role_management', // 角色管理
  PERMISSION_MANAGEMENT = 'permission_management', // 权限管理
}

/**
 * 菜单层级枚举
 */
export enum MenuLevel {
  MAIN = 1, // 一级菜单
  SUB = 2, // 二级菜单
  DETAIL = 3, // 三级菜单（详情页面）
}

/**
 * 菜单层级类型接口
 */
export interface MenuHierarchy {
  /** 菜单层级深度 */
  depth: number;
  /** 当前层级 */
  currentLevel: MenuLevel;
  /** 父菜单路径 */
  parentPath: string[];
  /** 子菜单数量 */
  childrenCount: number;
  /** 是否有子菜单 */
  hasChildren: boolean;
  /** 层级标题 */
  levelTitles: Record<MenuLevel, string>;
}

/**
 * 菜单分组接口
 */
export interface MenuGroup {
  /** 分组ID */
  id: string;
  /** 分组名称 */
  name: string;
  /** 分组图标 */
  icon?: string;
  /** 分组描述 */
  description?: string;
  /** 分组中的菜单项 */
  menus: MenuItem[];
  /** 分组排序 */
  sortOrder: number;
  /** 是否展开 */
  isExpanded: boolean;
  /** 是否可见 */
  isVisible: boolean;
}

/**
 * 导航动作枚举
 */
export enum NavigationAction {
  MENU_CLICK = 'menu_click', // 菜单点击
  BREADCRUMB_CLICK = 'breadcrumb_click', // 面包屑点击
  SEARCH_SELECT = 'search_select', // 搜索选择
  FAVORITE_CLICK = 'favorite_click', // 收藏点击
  PAGE_VIEW = 'page_view', // 页面浏览
  PAGE_EXIT = 'page_exit', // 页面退出
}

/**
 * 侧边栏状态枚举
 */
export enum SidebarState {
  EXPANDED = 'expanded', // 展开状态
  COLLAPSED = 'collapsed', // 折叠状态
  HIDDEN = 'hidden', // 隐藏状态（移动端）
}

/**
 * 屏幕尺寸枚举
 */
export enum LayoutSize {
  SMALL = 'small', // 移动端 < 768px
  MEDIUM = 'medium', // 平板端 768px - 992px
  LARGE = 'large', // 桌面端 > 992px
}

/**
 * 菜单项接口
 */
export interface MenuItem {
  /** 菜单唯一标识 */
  id: string;
  /** 父菜单ID */
  parentId?: string;
  /** 菜单显示名称（中文） */
  name: string;
  /** 菜单代码（英文，用于路由） */
  code: string;
  /** 菜单图标名称 */
  icon?: string;
  /** 菜单路由路径 */
  path?: string;
  /** 菜单层级 */
  level: MenuLevel;
  /** 排序序号 */
  sortOrder: number;
  /** 是否启用 */
  isActive: boolean;
  /** 是否可见 */
  isVisible: boolean;
  /** 所属功能区域 */
  functionalArea: FunctionalArea;
  /** 菜单描述 */
  description?: string;
  /** 子菜单列表 */
  children?: MenuItem[];
}

/**
 * 用户信息接口
 */
export interface User {
  /** 用户唯一标识 */
  id: string;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 显示名称（中文） */
  displayName: string;
  /** 头像URL */
  avatar?: string;
  /** 是否启用 */
  isActive: boolean;
  /** 最后登录时间 */
  lastLoginAt?: Date;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 用户偏好设置接口
 */
export interface UserPreference {
  /** 偏好设置唯一标识 */
  id: string;
  /** 用户ID */
  userId: string;
  /** 侧边栏是否收起 */
  sidebarCollapsed: boolean;
  /** 收藏的菜单ID列表 */
  favoriteMenus: string[];
  /** 最近访问的菜单ID列表（按时间排序，最多10个） */
  recentMenus: string[];
  /** 搜索历史记录（最多20条） */
  searchHistory: string[];
  /** 主题设置 */
  theme?: 'light' | 'dark';
  /** 语言设置 */
  language: 'zh-CN';
  /** 展开的菜单ID列表 */
  expandedMenuIds: string[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 导航日志接口
 */
export interface NavigationLog {
  /** 日志唯一标识 */
  id: string;
  /** 用户ID */
  userId: string;
  /** 访问的菜单ID */
  menuId?: string;
  /** 菜单路径 */
  menuPath: string;
  /** 导航动作 */
  action: NavigationAction;
  /** 页面停留时间（毫秒） */
  duration?: number;
  /** 用户代理 */
  userAgent?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 访问时间 */
  timestamp: Date;
}

/**
 * 面包屑项接口
 */
export interface BreadcrumbItem {
  /** 唯一标识符 */
  id: string;
  /** 显示标题 */
  title: string;
  /** 跳转路径 */
  path?: string;
  /** 图标组件 */
  icon?: React.ReactNode;
  /** 是否为当前页面 */
  isCurrent: boolean;
  /** 是否可点击 */
  isClickable: boolean;
}

/**
 * 导航状态接口
 */
export interface NavigationState {
  /** 菜单数据 */
  menus: MenuItem[];
  /** 当前激活菜单ID */
  activeMenuId: string | null;
  /** 展开的菜单ID列表 */
  expandedMenuIds: string[];
  /** 侧边栏折叠状态 */
  sidebarCollapsed: boolean;
  /** 侧边栏状态 */
  sidebarState: SidebarState;
  /** 屏幕尺寸 */
  screenSize: LayoutSize;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 面包屑数据 */
  breadcrumb: BreadcrumbItem[];
  /** 搜索查询 */
  searchQuery: string;
  /** 收藏菜单 */
  favoriteMenus: string[];
  /** 最近菜单 */
  recentMenus: string[];
}

/**
 * 搜索结果项接口
 */
export interface SearchResult {
  /** 结果ID */
  id: string;
  /** 结果标题 */
  title: string;
  /** 结果描述 */
  description?: string;
  /** 结果路径 */
  path?: string;
  /** 结果类型 */
  type: 'menu' | 'submenu' | 'page';
  /** 匹配的菜单项 */
  menuItem?: MenuItem;
  /** 匹配分数 */
  score?: number;
  /** 高亮标题 */
  highlightedTitle?: string;
  /** 高亮描述 */
  highlightedDescription?: string;
}

/**
 * 菜单搜索结果接口
 */
export interface MenuSearchResult {
  /** 匹配的菜单项 */
  menus: MenuItem[];
  /** 匹配总数 */
  total: number;
  /** 搜索耗时（毫秒） */
  searchDuration: number;
}

/**
 * 搜索历史项接口
 */
export interface SearchHistoryItem {
  /** 历史记录ID */
  id: string;
  /** 搜索关键词 */
  query: string;
  /** 搜索结果 */
  results: MenuItem[];
  /** 结果数量 */
  resultCount: number;
  /** 用户点击的菜单ID */
  clickedMenuId?: string;
  /** 搜索耗时（毫秒） */
  searchDuration: number;
  /** 搜索时间 */
  timestamp: Date;
}

/**
 * 最近菜单访问记录接口
 */
export interface RecentMenuAccess {
  /** 菜单ID */
  menuId: string;
  /** 菜单名称 */
  menuName: string;
  /** 访问路径 */
  accessPath: string;
  /** 访问次数 */
  accessCount: number;
  /** 首次访问时间 */
  firstAccessAt: Date;
  /** 最后访问时间 */
  lastAccessAt: Date;
  /** 停留时长（秒） */
  accessDuration: number;
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  /** 用户代理字符串 */
  userAgent: string;
  /** 操作系统平台 */
  platform: string;
  /** 是否为移动设备 */
  isMobile: boolean;
  /** 是否为平板设备 */
  isTablet: boolean;
  /** 是否为桌面设备 */
  isDesktop: boolean;
  /** 屏幕宽度 */
  screenWidth: number;
  /** 屏幕高度 */
  screenHeight: number;
  /** 设备像素比 */
  pixelRatio: number;
}

/**
 * 浏览器信息接口
 */
export interface BrowserInfo {
  /** 浏览器名称 */
  name: string;
  /** 浏览器版本 */
  version: string;
  /** 浏览器语言 */
  language: string;
  /** Cookie是否启用 */
  cookiesEnabled: boolean;
  /** 在线状态 */
  onlineStatus: boolean;
}

/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  /** 操作是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 响应消息 */
  message: string;
  /** 错误代码 */
  error?: string;
}

/**
 * 分页接口
 */
export interface Pagination {
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** 分页信息 */
  pagination: Pagination;
}

/**
 * 用户权限状态接口
 */
export interface UserPermissionState {
  /** 当前用户信息 */
  user: User | null;
  /** 用户权限列表 */
  permissions: string[];
  /** 用户角色列表 */
  roles: UserRole[];
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

/**
 * 用户角色接口
 */
export interface UserRole {
  /** 角色唯一标识 */
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色代码 */
  code: string;
  /** 角色描述 */
  description?: string;
  /** 角色权限列表 */
  permissions?: Permission[];
  /** 是否启用 */
  isActive: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 权限接口
 */
export interface Permission {
  /** 权限唯一标识 */
  id: string;
  /** 权限名称 */
  name: string;
  /** 权限代码 */
  code: string;
  /** 资源 */
  resource: string;
  /** 操作 */
  action: string;
  /** 权限描述 */
  description?: string;
  /** 权限分类 */
  category?: PermissionCategory;
  /** 是否启用 */
  isActive?: boolean;
}

/**
 * 权限分类枚举
 */
export enum PermissionCategory {
  ADMIN = 'admin', // 管理权限
  READ = 'read', // 读权限
  WRITE = 'write', // 写权限
  DELETE = 'delete', // 删除权限
  EXECUTE = 'execute', // 执行权限
}

/**
 * 权限检查结果接口
 */
export interface PermissionCheckResult {
  /** 是否有访问权限 */
  hasAccess: boolean;
  /** 所需权限列表 */
  requiredPermissions: string[];
  /** 用户当前权限列表 */
  userPermissions: string[];
  /** 缺少的权限列表 */
  missingPermissions: string[];
}
