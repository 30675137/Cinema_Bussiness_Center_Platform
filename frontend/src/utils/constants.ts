/**
 * 应用常量定义
 */

/**
 * 状态常量
 */
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;

/**
 * 状态显示文本
 */
export const STATUS_TEXT = {
  [STATUS.ACTIVE]: '已发布',
  [STATUS.INACTIVE]: '已下架',
  [STATUS.PENDING]: '待审核',
} as const;

/**
 * 状态颜色样式
 */
export const STATUS_COLOR = {
  [STATUS.ACTIVE]: 'status-active',
  [STATUS.INACTIVE]: 'status-inactive',
  [STATUS.PENDING]: 'status-pending',
} as const;

/**
 * Ant Design主题颜色
 */
export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#ff4d4f',
  INFO: '#1890ff',
} as const;

/**
 * 分页默认配置
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE_SIZES: [10, 20, 50, 100],
} as const;

/**
 * 表格配置
 */
export const TABLE_CONFIG = {
  SCROLL_X: 600,
  SCROLL_Y: 400,
} as const;

/**
 * 路由常量
 */
export const ROUTES = {
  DASHBOARD: '/',
  PRODUCTS: '/products',
  PRODUCT_LIST: '/products/list',
  PRODUCT_CATEGORIES: '/products/categories',
  USERS: '/users',
  USER_LIST: '/users/list',
  USER_ROLES: '/users/roles',
} as const;

/**
 * API接口常量
 */
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  USERS: '/users',
  ROLES: '/roles',
  DASHBOARD: '/dashboard/stats',
} as const;

/**
 * HTTP状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 表单验证规则
 */
export const FORM_RULES = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  EMAIL: {
    pattern: /^[^\s@]+$/,
    message: '请输入有效的邮箱地址',
  },
  PHONE: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码',
  },
  PASSWORD: {
    minLength: 6,
    message: '密码长度至少6位',
  },
} as const;

/**
 * 响应式断点
 */
export const BREAKPOINTS = {
  XS: '480px',
  SM: '576px',
  MD: '768px',
  LG: '992px',
  XL: '1200px',
  XXL: '1600px',
} as const;

/**
 * 延迟常量（毫秒）
 */
export const DELAYS = {
  SHORT: 300,
  MEDIUM: 500,
  LONG: 1000,
  DEBOUNCE: 200,
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TOKEN: 'cinema_admin_token',
  USER_INFO: 'cinema_admin_user_info',
  SIDEBAR_COLLAPSED: 'cinema_admin_sidebar_collapsed',
  THEME: 'cinema_admin_theme',
} as const;

/**
 * 文件上传配置
 */
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ACCEPT: 'image/*',
} as const;

/**
 * Mock数据配置
 */
export const MOCK_CONFIG = {
  DELAY: 500, // 模拟API延迟时间（毫秒）
  USE_MOCK: true, // 是否使用Mock数据
} as const;

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNAUTHORIZED: '未授权，请先登录',
  FORBIDDEN: '没有权限访问此资源',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '数据验证失败',
  UNKNOWN_ERROR: '未知错误，请稍后重试',
} as const;

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  CREATE_SUCCESS: '创建成功',
  UPDATE_SUCCESS: '更新成功',
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出登录成功',
} as const;