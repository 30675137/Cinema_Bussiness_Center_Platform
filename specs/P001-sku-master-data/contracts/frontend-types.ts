/**
 * 前端 TypeScript 类型定义
 * 与后端 API 契约保持一致
 *
 * 功能: P001-sku-master-data
 * 生成日期: 2025-12-24
 */

// ==================== 枚举类型 ====================

/**
 * SKU类型枚举
 */
export enum SkuType {
  /** 原料 */
  RAW_MATERIAL = 'raw_material',
  /** 包材 */
  PACKAGING = 'packaging',
  /** 成品 */
  FINISHED_PRODUCT = 'finished_product',
  /** 套餐 */
  COMBO = 'combo'
}

/**
 * SKU状态枚举
 */
export enum SkuStatus {
  /** 草稿 */
  DRAFT = 'draft',
  /** 启用 */
  ENABLED = 'enabled',
  /** 停用 */
  DISABLED = 'disabled'
}

/**
 * 单位类别枚举
 */
export enum UnitCategory {
  /** 体积 */
  VOLUME = 'volume',
  /** 重量 */
  WEIGHT = 'weight',
  /** 数量 */
  QUANTITY = 'quantity'
}

// ==================== 核心实体类型 ====================

/**
 * SKU 主数据实体
 */
export interface SKU {
  /** 主键 */
  id: string
  /** 条码(全局唯一) */
  code: string
  /** SKU名称 */
  name: string
  /** SPU ID */
  spuId: string
  /** SKU类型 */
  skuType: SkuType
  /** 主单位 */
  mainUnit: string
  /** 门店范围(空数组=全门店,非空=特定门店ID列表) */
  storeScope: string[]
  /** 标准成本(元),原料/包材手动输入,成品/套餐自动计算 */
  standardCost: number | null
  /** 损耗率(%),仅成品类型有效 */
  wasteRate: number
  /** 状态 */
  status: SkuStatus
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * SKU 详情(包含 BOM 和套餐子项)
 */
export interface SKUDetail extends SKU {
  /** BOM组件(仅成品类型) */
  bom?: BomComponent[]
  /** 套餐子项(仅套餐类型) */
  comboItems?: ComboItem[]
}

/**
 * BOM 组件实体
 */
export interface BomComponent {
  /** 主键 */
  id: string
  /** 成品SKU ID */
  finishedProductId: string
  /** 组件SKU ID */
  componentId: string
  /** 组件名称 */
  componentName: string
  /** 组件类型 */
  componentType: SkuType.RAW_MATERIAL | SkuType.PACKAGING
  /** 数量 */
  quantity: number
  /** 单位 */
  unit: string
  /** 单位成本(快照) */
  unitCost: number | null
  /** 小计成本 */
  totalCost: number
  /** 是否可选 */
  isOptional: boolean
  /** 排序序号 */
  sortOrder: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 套餐子项实体
 */
export interface ComboItem {
  /** 主键 */
  id: string
  /** 套餐SKU ID */
  comboId: string
  /** 子项SKU ID */
  subItemId: string
  /** 子项名称 */
  subItemName: string
  /** 子项类型 */
  subItemType: SkuType.RAW_MATERIAL | SkuType.PACKAGING | SkuType.FINISHED_PRODUCT
  /** 数量 */
  quantity: number
  /** 单位 */
  unit: string
  /** 单位成本(快照) */
  unitCost: number | null
  /** 小计成本 */
  totalCost: number
  /** 排序序号 */
  sortOrder: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 单位换算关系
 */
export interface UnitConversion {
  /** 主键 */
  id: string
  /** 源单位 */
  fromUnit: string
  /** 目标单位 */
  toUnit: string
  /** 换算率(1 fromUnit = conversionRate toUnit) */
  conversionRate: number
  /** 单位类别 */
  category: UnitCategory
}

// ==================== 请求/响应类型 ====================

/**
 * 创建 SKU 请求
 */
export interface SKUCreateRequest {
  /** 条码(全局唯一) */
  code: string
  /** SKU名称 */
  name: string
  /** SPU ID */
  spuId: string
  /** SKU类型 */
  skuType: SkuType
  /** 主单位 */
  mainUnit: string
  /** 门店范围(默认空数组=全门店) */
  storeScope?: string[]
  /** 标准成本(原料/包材必填,成品/套餐自动计算) */
  standardCost?: number | null
  /** 损耗率(仅成品类型,默认0) */
  wasteRate?: number
  /** BOM配置(仅成品类型需要) */
  bom?: {
    components: BomComponentInput[]
  }
  /** 套餐子项(仅套餐类型需要) */
  comboItems?: ComboItemInput[]
}

/**
 * 更新 SKU 请求
 */
export interface SKUUpdateRequest {
  /** SKU名称 */
  name?: string
  /** 主单位 */
  mainUnit?: string
  /** 门店范围 */
  storeScope?: string[]
  /** 标准成本 */
  standardCost?: number | null
  /** 损耗率 */
  wasteRate?: number
  /** 状态 */
  status?: SkuStatus
}

/**
 * BOM 组件输入
 */
export interface BomComponentInput {
  /** 组件SKU ID(必须是原料或包材) */
  componentId: string
  /** 数量 */
  quantity: number
  /** 单位 */
  unit: string
  /** 是否可选(默认false) */
  isOptional?: boolean
  /** 排序序号(默认0) */
  sortOrder?: number
}

/**
 * 套餐子项输入
 */
export interface ComboItemInput {
  /** 子项SKU ID(不能是套餐类型) */
  subItemId: string
  /** 数量 */
  quantity: number
  /** 单位 */
  unit: string
  /** 排序序号(默认0) */
  sortOrder?: number
}

/**
 * 更新 BOM 配置请求
 */
export interface UpdateBomRequest {
  /** BOM组件列表 */
  components: BomComponentInput[]
  /** 损耗率(%) */
  wasteRate: number
}

/**
 * 更新套餐子项请求
 */
export interface UpdateComboItemsRequest {
  /** 套餐子项列表 */
  items: ComboItemInput[]
}

/**
 * 门店范围验证请求
 */
export interface ValidateStoreScopeRequest {
  /** 目标门店范围(空数组=全门店) */
  storeScope: string[]
}

/**
 * 门店范围验证响应
 */
export interface ValidateStoreScopeResponse {
  /** 是否有效 */
  valid: boolean
  /** 错误信息列表 */
  errors: string[]
  /** 警告信息列表 */
  warnings: string[]
}

/**
 * 重新计算成本响应
 */
export interface RecalculateCostResponse {
  /** 旧成本 */
  oldCost: number
  /** 新成本 */
  newCost: number
  /** 变更时间 */
  changedAt: string
}

// ==================== API 响应包装类型 ====================

/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T> {
  /** 成功标志 */
  success: boolean
  /** 响应数据 */
  data?: T
  /** 消息 */
  message?: string
  /** 时间戳 */
  timestamp?: string
}

/**
 * 错误响应
 */
export interface ApiErrorResponse {
  /** 成功标志(false) */
  success: false
  /** 错误代码 */
  error: string
  /** 错误消息 */
  message: string
  /** 详细信息 */
  details?: Record<string, unknown>
  /** 时间戳 */
  timestamp?: string
}

/**
 * 列表查询响应
 */
export interface ListResponse<T> {
  /** 成功标志 */
  success: boolean
  /** 数据列表 */
  data: T[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 消息 */
  message?: string
}

/**
 * 列表查询参数
 */
export interface ListQueryParams {
  /** SKU类型筛选 */
  skuType?: SkuType
  /** 状态筛选 */
  status?: SkuStatus
  /** 门店ID筛选(返回该门店可用的SKU) */
  storeId?: string
  /** 关键词搜索(名称/条码) */
  keyword?: string
  /** 页码(从1开始) */
  page?: number
  /** 每页大小 */
  pageSize?: number
}

// ==================== 表单数据类型 ====================

/**
 * SKU 表单数据(用于 React Hook Form)
 */
export interface SkuFormData {
  /** 条码 */
  code: string
  /** 名称 */
  name: string
  /** SPU ID */
  spuId: string
  /** SKU类型 */
  skuType: SkuType
  /** 主单位 */
  mainUnit: string
  /** 门店范围 */
  storeScope: string[]
  /** 标准成本 */
  standardCost: number | null
  /** 损耗率 */
  wasteRate: number
  /** 状态 */
  status: SkuStatus
  /** BOM配置 */
  bom?: {
    components: BomComponentInput[]
  }
  /** 套餐子项 */
  comboItems?: ComboItemInput[]
}

// ==================== 工具类型 ====================

/**
 * SKU 类型显示配置
 */
export interface SkuTypeConfig {
  /** 颜色 */
  color: string
  /** 显示文本 */
  text: string
}

/**
 * SKU 类型配置映射
 */
export const SKU_TYPE_CONFIG: Record<SkuType, SkuTypeConfig> = {
  [SkuType.RAW_MATERIAL]: { color: 'blue', text: '原料' },
  [SkuType.PACKAGING]: { color: 'green', text: '包材' },
  [SkuType.FINISHED_PRODUCT]: { color: 'orange', text: '成品' },
  [SkuType.COMBO]: { color: 'purple', text: '套餐' }
}

/**
 * SKU 状态显示配置
 */
export interface SkuStatusConfig {
  /** 颜色 */
  color: string
  /** 显示文本 */
  text: string
}

/**
 * SKU 状态配置映射
 */
export const SKU_STATUS_CONFIG: Record<SkuStatus, SkuStatusConfig> = {
  [SkuStatus.DRAFT]: { color: 'default', text: '草稿' },
  [SkuStatus.ENABLED]: { color: 'success', text: '启用' },
  [SkuStatus.DISABLED]: { color: 'error', text: '停用' }
}
