/**
 * 品牌管理相关类型定义
 * 基于规格文档中的数据模型设计
 */

// 品牌类型枚举
export enum BrandType {
  OWN = 'own',           // 自有品牌
  AGENCY = 'agency',     // 代理品牌
  JOINT = 'joint',       // 联营品牌
  OTHER = 'other'        // 其他
}

// 品牌状态枚举
export enum BrandStatus {
  DRAFT = 'draft',       // 草稿
  ENABLED = 'enabled',   // 启用
  DISABLED = 'disabled'   // 停用
}

// 品牌实体接口
export interface Brand {
  // 核心标识
  id: string;                    // 系统生成的唯一标识符
  brandCode: string;             // 品牌编码（系统生成或手动输入）

  // 基本信息
  name: string;                  // 品牌名称（中文，必填）
  englishName?: string;          // 品牌英文名（可选）
  brandType: BrandType;          // 品牌类型（必选）

  // 扩展信息
  primaryCategories: string[];   // 主营类目（多选）
  company?: string;              // 所属公司/供应商
  brandLevel?: string;           // 品牌等级（A/B/C等）
  tags: string[];                // 品牌标签（多选）
  description?: string;          // 品牌介绍

  // 展示信息
  logoUrl?: string;              // 品牌LOGO URL

  // 状态管理
  status: BrandStatus;           // 品牌状态

  // 审计字段
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  createdBy: string;             // 创建人
  updatedBy: string;             // 更新人
}

// 品牌使用统计接口
export interface BrandUsageStatistics {
  brandId: string;              // 品牌ID（外键）
  spuCount: number;             // 关联SPU数量
  skuCount: number;             // 关联SKU数量
  lastUsedAt?: string;          // 最后使用时间
  calculatedAt: string;         // 统计计算时间
}

// 品牌状态转换记录接口
export interface BrandStatusTransition {
  id: string;                   // 转换记录ID
  brandId: string;              // 品牌ID（外键）
  oldStatus: BrandStatus;       // 原状态
  newStatus: BrandStatus;       // 新状态
  changedBy: string;            // 操作人
  changedAt: string;            // 变更时间
  reason?: string;              // 变更原因
}

// 查询参数接口
export interface BrandQueryParams {
  page?: number;                // 页码，默认1
  pageSize?: number;            // 每页大小，默认20
  keyword?: string;             // 关键字搜索（品牌名称/英文名/编码）
  brandType?: BrandType;        // 品牌类型筛选
  status?: BrandStatus;         // 状态筛选
  sortBy?: 'createdAt' | 'name' | 'updatedAt';  // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方向
}

// 分页响应接口
export interface BrandPaginationResponse {
  current: number;              // 当前页码
  pageSize: number;            // 每页大小
  total: number;                // 总记录数
  totalPages: number;          // 总页数
  hasNext: boolean;             // 是否有下一页
  hasPrev: boolean;             // 是否有上一页
}

// API响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message: string;
  timestamp: string;
}

// API错误接口
export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

// API错误详情接口
export interface ApiErrorDetail {
  field: string;
  message: string;
}

// 品牌列表响应接口
export interface BrandListResponse extends ApiResponse<Brand[]> {
  pagination: BrandPaginationResponse;
}

// 品牌详情响应接口
export interface BrandDetailResponse extends ApiResponse<Brand & { usageStats: BrandUsageStatistics }> {}

// 创建品牌请求接口
export interface CreateBrandRequest {
  name: string;                  // 品牌名称（必填）
  englishName?: string;          // 品牌英文名（可选）
  brandType: BrandType;          // 品牌类型（必选）
  primaryCategories: string[];   // 主营类目（多选）
  company?: string;              // 所属公司/供应商（可选）
  brandLevel?: string;           // 品牌等级（可选）
  tags?: string[];               // 品牌标签（可选）
  description?: string;          // 品牌介绍（可选）
  status?: BrandStatus;          // 状态（可选，默认为草稿）
}

// 更新品牌请求接口
export interface UpdateBrandRequest {
  name?: string;                 // 品牌名称
  englishName?: string;          // 品牌英文名
  brandType?: BrandType;         // 品牌类型
  primaryCategories?: string[];  // 主营类目
  company?: string;              // 所属公司/供应商
  brandLevel?: string;           // 品牌等级
  tags?: string[];               // 品牌标签
  description?: string;          // 品牌介绍
}

// 更改品牌状态请求接口
export interface UpdateBrandStatusRequest {
  status: BrandStatus;          // 新状态
  reason?: string;              // 变更原因
}

// 品牌筛选条件接口
export interface BrandFilters {
  keyword?: string;             // 关键字
  brandType?: BrandType;        // 品牌类型
  status?: BrandStatus;         // 状态
  category?: string;            // 类目
}

// Zustand Store状态接口
export interface BrandStore {
  // 状态
  brands: Brand[];               // 品牌列表
  currentBrand: Brand | null;    // 当前选中的品牌
  loading: boolean;             // 加载状态
  error?: string;                // 错误信息

  // 查询状态
  filters: BrandFilters;         // 筛选条件
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };

  // 操作方法
  setBrands: (brands: Brand[]) => void;
  setCurrentBrand: (brand: Brand | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  setFilters: (filters: Partial<BrandFilters>) => void;
  setPagination: (pagination: Partial<BrandStore['pagination']>) => void;
  reset: () => void;
}

// 组件Props接口
export interface BrandStatusTagProps {
  status: BrandStatus;
}

export interface BrandTypeTagProps {
  type: BrandType;
}

export interface BrandLogoProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export interface BrandSearchFormProps {
  onSearch: (filters: BrandFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

export interface BrandTableProps {
  brands: Brand[];
  loading?: boolean;
  onView: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
  onStatusChange: (brand: Brand, status: BrandStatus) => void;
}

export interface BrandFormProps {
  brand?: Brand;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: CreateBrandRequest | UpdateBrandRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface BrandDrawerProps {
  visible: boolean;
  brand?: Brand;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSuccess?: () => void;
}

// 表单验证接口
export interface BrandFormData {
  name: string;
  englishName: string;
  brandType: BrandType;
  primaryCategories: string[];
  company: string;
  brandLevel: string;
  tags: string[];
  description: string;
  status: BrandStatus;
}

// 表单验证错误接口
export interface BrandFormErrors {
  name?: string;
  brandType?: string;
  primaryCategories?: string;
}

// Hook返回类型接口
export interface UseBrandListReturn {
  brands: Brand[];
  loading: boolean;
  error?: string;
  pagination: BrandPaginationResponse;
  filters: BrandFilters;
  refetch: () => void;
  setFilters: (filters: Partial<BrandFilters>) => void;
  setPagination: (pagination: Partial<BrandPaginationResponse>) => void;
}

export interface UseBrandActionsReturn {
  createBrand: (data: CreateBrandRequest) => Promise<Brand>;
  updateBrand: (id: string, data: UpdateBrandRequest) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  updateBrandStatus: (id: string, data: UpdateBrandStatusRequest) => Promise<void>;
  uploadLogo: (id: string, file: File) => Promise<{ logoUrl: string }>;
  loading: boolean;
  error?: string;
}

// 常量定义
export const BRAND_CONSTANTS = {
  // 状态颜色映射
  STATUS_COLORS: {
    [BrandStatus.DRAFT]: { color: '#faad14', text: '草稿' },
    [BrandStatus.ENABLED]: { color: '#52c41a', text: '启用' },
    [BrandStatus.DISABLED]: { color: '#ff4d4f', text: '停用' },
  },

  // 类型标签
  TYPE_LABELS: {
    [BrandType.OWN]: '自有品牌',
    [BrandType.AGENCY]: '代理品牌',
    [BrandType.JOINT]: '联营品牌',
    [BrandType.OTHER]: '其他',
  },

  // 分页默认值
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,

  // 排序选项
  SORT_OPTIONS: [
    { value: 'createdAt', label: '创建时间' },
    { value: 'name', label: '品牌名称' },
    { value: 'updatedAt', label: '更新时间' },
  ],

  // 文件上传限制
  LOGO_UPLOAD_LIMITS: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
  },
} as const;

// Logo验证规则
export const VALIDATION_RULES = {
  LOGO_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_LOGO_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_LOGO_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

// TanStack Query Keys
export const brandQueryKeys = {
  all: ['brands'],
  lists: ['brands', 'list'],
  details: ['brands', 'detail'],
  usageStats: (id: string) => ['brands', 'detail', id, 'usage-stats'],
} as const;

// 类型守卫函数
export const isBrand = (obj: any): obj is Brand => {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj && 'brandType' in obj;
};

export const isValidBrandType = (value: string): value is BrandType => {
  return Object.values(BrandType).includes(value as BrandType);
};

export const isValidBrandStatus = (value: string): value is BrandStatus => {
  return Object.values(BrandStatus).includes(value as BrandStatus);
};