/**
 * SKU管理相关类型定义
 */

/**
 * SKU状态枚举
 */
export enum SkuStatus {
  DRAFT = 'draft',       // 草稿
  ENABLED = 'enabled',   // 启用
  DISABLED = 'disabled'  // 停用
}

/**
 * 销售单位接口
 */
export interface SalesUnit {
  /** 唯一标识符 */
  id: string;
  /** 销售单位名称，如："箱"、"打" */
  unit: string;
  /** 单位ID */
  unitId: string;
  /** 换算关系：1 销售单位 = X 主库存单位，如：12（1箱=12瓶） */
  conversionRate: number;
  /** 是否启用 */
  enabled: boolean;
  /** 排序顺序 */
  sortOrder?: number;
}

/**
 * 条码接口
 */
export interface Barcode {
  /** 唯一标识符 */
  id: string;
  /** 条码值，如："6901234567891" */
  code: string;
  /** 条码类型，如："EAN13"、"UPC" */
  type?: string;
  /** 备注说明 */
  remark?: string;
}

/**
 * SPU接口（关联实体）
 */
export interface SPU {
  /** SPU ID */
  id: string;
  /** SPU编码 */
  code: string;
  /** SPU名称 */
  name: string;
  /** 品牌 */
  brand: string;
  /** 类目 */
  category: string;
  /** 类目ID */
  categoryId: string;
}

/**
 * 单位接口（关联实体）
 */
export interface Unit {
  /** 单位ID */
  id: string;
  /** 单位编码 */
  code: string;
  /** 单位名称，如："瓶"、"箱"、"打" */
  name: string;
  /** 单位类型：库存单位/销售单位 */
  type: 'inventory' | 'sales';
}

/**
 * SKU接口
 */
export interface SKU {
  // 基础标识
  /** 唯一标识符，格式: "sku_{timestamp}_{sequence}" */
  id: string;
  /** SKU编码，系统自动生成，格式: "SKU000001" */
  code: string;
  /** SKU名称，如："可口可乐330ml瓶装" */
  name: string;

  // 关联信息
  /** 所属SPU ID */
  spuId: string;
  /** 所属SPU名称，如："可口可乐" */
  spuName: string;
  /** 品牌（继承自SPU），如："可口可乐" */
  brand: string;
  /** 类目（继承自SPU），如："饮料 > 碳酸饮料" */
  category: string;
  /** 类目ID */
  categoryId: string;

  // 规格属性
  /** 规格/型号，如："330ml" */
  spec: string;
  /** 口味，如："原味"、"柠檬味" */
  flavor?: string;
  /** 包装形式，如："瓶装"、"听装"、"袋装" */
  packaging?: string;
  /** 自定义属性（预留） */
  customAttributes?: Record<string, string>;

  // 单位配置
  /** 主库存单位，如："瓶" */
  mainUnit: string;
  /** 主库存单位ID */
  mainUnitId: string;
  /** 销售单位配置列表 */
  salesUnits: SalesUnit[];

  // 条码信息
  /** 主条码，如："6901234567890" */
  mainBarcode: string;
  /** 其他条码列表 */
  otherBarcodes: Barcode[];

  // 库存配置
  /** 是否管理库存，默认true */
  manageInventory: boolean;
  /** 是否允许负库存，默认false */
  allowNegativeStock: boolean;
  /** 最小起订量 */
  minOrderQty?: number;
  /** 最小销售量 */
  minSaleQty?: number;

  // 状态信息
  /** 状态：草稿/启用/停用 */
  status: SkuStatus;

  // 元数据
  /** 创建时间，ISO格式 */
  createdAt: string;
  /** 更新时间，ISO格式 */
  updatedAt: string;
  /** 创建人ID */
  createdBy: string;
  /** 创建人姓名 */
  createdByName: string;
  /** 最近编辑人ID */
  updatedBy: string;
  /** 最近编辑人姓名 */
  updatedByName: string;

  // 关联统计（详情页显示）
  /** 关联BOM数量 */
  bomCount?: number;
  /** 关联价格规则数量 */
  priceRuleCount?: number;
  /** 当前库存总量 */
  stockTotal?: number;
  /** 关联场景包数量 */
  scenePackageCount?: number;
}

/**
 * SKU查询参数接口
 */
export interface SkuQueryParams {
  // 关键字搜索
  /** 关键字，匹配编码/名称/条码 */
  keyword?: string;

  // 筛选条件
  /** 所属SPU ID */
  spuId?: string;
  /** 品牌 */
  brand?: string;
  /** 类目ID */
  categoryId?: string;
  /** 状态筛选 */
  status?: SkuStatus | 'all';
  /** 是否管理库存 */
  manageInventory?: boolean;

  // 分页参数
  /** 当前页码，从1开始 */
  page: number;
  /** 每页数量，默认20 */
  pageSize: number;

  // 排序参数
  /** 排序字段，如："createdAt"、"status" */
  sortField?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * SKU列表响应接口
 */
export interface SkuListResponse {
  /** SKU列表 */
  items: SKU[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 销售单位表单数据接口
 */
export interface SalesUnitFormData {
  /** 单位ID */
  unitId: string;
  /** 换算关系（必填，>0） */
  conversionRate: number;
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 条码表单数据接口
 */
export interface BarcodeFormData {
  /** 条码值（必填） */
  code: string;
  /** 备注 */
  remark?: string;
}

/**
 * SKU创建/编辑表单数据接口
 */
export interface SkuFormData {
  // 基础信息
  /** 所属SPU（必填） */
  spuId: string;
  /** SKU名称（必填） */
  name: string;
  /** SKU编码（只读，新建时为空） */
  code?: string;

  // 规格属性
  /** 规格/型号 */
  spec?: string;
  /** 口味 */
  flavor?: string;
  /** 包装形式 */
  packaging?: string;

  // 单位配置
  /** 主库存单位ID（必填） */
  mainUnitId: string;
  /** 销售单位配置 */
  salesUnits: SalesUnitFormData[];

  // 条码信息
  /** 主条码 */
  mainBarcode?: string;
  /** 其他条码列表 */
  otherBarcodes: BarcodeFormData[];

  // 其他配置
  /** 是否管理库存 */
  manageInventory: boolean;
  /** 是否允许负库存 */
  allowNegativeStock: boolean;
  /** 最小起订量 */
  minOrderQty?: number;
  /** 最小销售量 */
  minSaleQty?: number;
  /** 状态 */
  status: SkuStatus;
}

/**
 * SKU列表状态接口（用于Zustand Store）
 */
export interface SkuListState {
  /** 筛选条件 */
  filters: Partial<SkuQueryParams>;
  /** 分页信息 */
  pagination: {
    page: number;
    pageSize: number;
  };
  /** 排序信息 */
  sorting: {
    field?: string;
    order?: 'asc' | 'desc';
  };
  /** 选中的SKU ID列表 */
  selectedSkuIds: string[];
}

