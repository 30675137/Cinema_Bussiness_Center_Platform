/**
 * @spec O006-miniapp-channel-order
 * 商品规格类型定义
 */

/**
 * 规格类型枚举(扩展自 O003 的 4 种到 7 种)
 */
export enum SpecType {
  SIZE = 'SIZE', // 杯型/尺寸
  TEMPERATURE = 'TEMPERATURE', // 温度
  SWEETNESS = 'SWEETNESS', // 甜度
  TOPPING = 'TOPPING', // 配料
  SPICINESS = 'SPICINESS', // 辣度 (新增)
  SIDE = 'SIDE', // 配菜 (新增)
  COOKING = 'COOKING', // 做法 (新增)
}

/**
 * 规格选项 DTO
 */
export interface SpecOptionDTO {
  /** 选项 ID */
  id: string

  /** 选项名称(如"大杯", "热") */
  optionName: string

  /** 价格调整(单位:分,可为负数) */
  priceAdjustment: number

  /** 是否默认选中 */
  isDefault: boolean

  /** 排序权重 */
  sortOrder: number
}

/**
 * 渠道商品规格 DTO
 *
 * @description 代表商品的可选规格(大小/温度/甜度/配料/辣度/配菜/做法)
 *
 * @validation
 * - isRequired = true 的规格,用户必须至少选择一个选项
 * - allowMultiple = false 的规格,用户只能选择一个选项
 * - priceAdjustment: 可为负数(表示折扣),单位为分
 *
 * @businessRules
 * - 必选规格未选择时,禁用"加入购物车"按钮
 * - 默认规格选项(isDefault = true)在详情页自动选中
 * - 价格计算: 最终价格 = basePrice + Σ(selectedSpecs.priceAdjustment)
 */
export interface ChannelProductSpecDTO {
  /** 规格 ID */
  id: string

  /** 所属渠道商品 ID */
  channelProductId: string

  /** 规格类型 */
  specType: SpecType

  /** 规格名称(如"杯型", "温度") */
  specName: string

  /** 规格选项列表 */
  options: SpecOptionDTO[]

  /** 是否必选 */
  isRequired: boolean

  /** 是否允许多选 */
  allowMultiple: boolean

  /** 排序权重 */
  sortOrder: number
}

/**
 * 用户选择的规格(前端状态)
 *
 * @description 用于购物车和订单中存储用户选择的规格信息
 */
export interface SelectedSpec {
  /** 规格类型 */
  specType: SpecType

  /** 规格名称 */
  specName: string

  /** 选中的选项 ID */
  optionId: string

  /** 选项名称 */
  optionName: string

  /** 价格调整 */
  priceAdjustment: number
}

/**
 * 规格类型显示名称映射
 */
export const SPEC_TYPE_LABELS: Record<SpecType, string> = {
  [SpecType.SIZE]: '杯型',
  [SpecType.TEMPERATURE]: '温度',
  [SpecType.SWEETNESS]: '甜度',
  [SpecType.TOPPING]: '配料',
  [SpecType.SPICINESS]: '辣度',
  [SpecType.SIDE]: '配菜',
  [SpecType.COOKING]: '做法',
}

/**
 * 检查规格是否已完整选择(必选规格已选)
 */
export const isSpecsComplete = (
  specs: ChannelProductSpecDTO[],
  selectedSpecs: Record<SpecType, SelectedSpec>
): boolean => {
  const requiredSpecs = specs.filter((spec) => spec.isRequired)

  return requiredSpecs.every((spec) => {
    const selected = selectedSpecs[spec.specType]
    return selected !== undefined && selected !== null
  })
}

/**
 * 获取规格的默认选项
 */
export const getDefaultOption = (
  spec: ChannelProductSpecDTO
): SpecOptionDTO | undefined => {
  return spec.options.find((option) => option.isDefault)
}

/**
 * 初始化默认选中的规格
 */
export const initializeDefaultSpecs = (
  specs: ChannelProductSpecDTO[]
): Record<SpecType, SelectedSpec> => {
  const selectedSpecs: Record<SpecType, SelectedSpec> = {} as Record<
    SpecType,
    SelectedSpec
  >

  specs.forEach((spec) => {
    const defaultOption = getDefaultOption(spec)
    if (defaultOption) {
      selectedSpecs[spec.specType] = {
        specType: spec.specType,
        specName: spec.specName,
        optionId: defaultOption.id,
        optionName: defaultOption.optionName,
        priceAdjustment: defaultOption.priceAdjustment,
      }
    }
  })

  return selectedSpecs
}

/**
 * 计算规格调整后的总价格
 */
export const calculatePriceWithSpecs = (
  basePrice: number,
  selectedSpecs: Record<SpecType, SelectedSpec>
): number => {
  const specAdjustment = Object.values(selectedSpecs).reduce(
    (sum, spec) => sum + spec.priceAdjustment,
    0
  )

  return basePrice + specAdjustment
}

/**
 * 格式化选中的规格为显示文本(如"大杯/热/少糖/加珍珠")
 */
export const formatSelectedSpecs = (
  selectedSpecs: Record<SpecType, SelectedSpec>
): string => {
  return Object.values(selectedSpecs)
    .map((spec) => spec.optionName)
    .join('/')
}
