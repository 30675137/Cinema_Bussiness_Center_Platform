/**
 * @spec O006-miniapp-channel-order
 * 商品规格验证工具函数
 */

import type {
  ChannelProductSpecDTO,
  SelectedSpec,
  SpecType,
} from '@/types/productSpec'

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean

  /** 错误消息列表 */
  errors: string[]
}

/**
 * 检查必选规格是否已完整选择
 *
 * @param specs 商品规格列表
 * @param selectedSpecs 用户选择的规格
 * @returns 验证结果
 *
 * @example
 * ```typescript
 * const result = validateRequiredSpecs(specs, selectedSpecs)
 * if (!result.isValid) {
 *   console.error(result.errors.join(', '))
 * }
 * ```
 */
export const validateRequiredSpecs = (
  specs: ChannelProductSpecDTO[],
  selectedSpecs: Record<SpecType, SelectedSpec>
): ValidationResult => {
  const errors: string[] = []

  // 检查每个必选规格
  const requiredSpecs = specs.filter((spec) => spec.isRequired)

  requiredSpecs.forEach((spec) => {
    const selected = selectedSpecs[spec.specType]

    if (!selected) {
      errors.push(`请选择${spec.specName}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 检查单选规格是否只选择了一个选项
 *
 * @param specs 商品规格列表
 * @param selectedSpecs 用户选择的规格
 * @returns 验证结果
 */
export const validateSingleSelectSpecs = (
  specs: ChannelProductSpecDTO[],
  selectedSpecs: Record<SpecType, SelectedSpec>
): ValidationResult => {
  const errors: string[] = []

  // 检查每个单选规格
  const singleSelectSpecs = specs.filter((spec) => !spec.allowMultiple)

  singleSelectSpecs.forEach((spec) => {
    const selected = selectedSpecs[spec.specType]

    if (selected && typeof selected === 'object') {
      // 如果选中的是数组(多选),则报错
      if (Array.isArray(selected)) {
        errors.push(`${spec.specName}只能选择一个选项`)
      }
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 检查选中的规格选项是否存在于规格列表中
 *
 * @param specs 商品规格列表
 * @param selectedSpecs 用户选择的规格
 * @returns 验证结果
 */
export const validateSpecOptions = (
  specs: ChannelProductSpecDTO[],
  selectedSpecs: Record<SpecType, SelectedSpec>
): ValidationResult => {
  const errors: string[] = []

  Object.entries(selectedSpecs).forEach(([specType, selectedSpec]) => {
    const spec = specs.find((s) => s.specType === specType)

    if (!spec) {
      errors.push(`规格类型${specType}不存在`)
      return
    }

    const optionExists = spec.options.some(
      (option) => option.id === selectedSpec.optionId
    )

    if (!optionExists) {
      errors.push(`${spec.specName}的选项"${selectedSpec.optionName}"不存在`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 综合验证商品规格选择
 *
 * @param specs 商品规格列表
 * @param selectedSpecs 用户选择的规格
 * @returns 验证结果
 *
 * @example
 * ```typescript
 * const result = validateSpecs(productSpecs, selectedSpecs)
 * if (!result.isValid) {
 *   Taro.showToast({
 *     title: result.errors[0],
 *     icon: 'none'
 *   })
 *   return
 * }
 * ```
 */
export const validateSpecs = (
  specs: ChannelProductSpecDTO[],
  selectedSpecs: Record<SpecType, SelectedSpec>
): ValidationResult => {
  const allErrors: string[] = []

  // 1. 检查必选规格
  const requiredResult = validateRequiredSpecs(specs, selectedSpecs)
  allErrors.push(...requiredResult.errors)

  // 2. 检查单选规格
  const singleSelectResult = validateSingleSelectSpecs(specs, selectedSpecs)
  allErrors.push(...singleSelectResult.errors)

  // 3. 检查选项有效性
  const optionResult = validateSpecOptions(specs, selectedSpecs)
  allErrors.push(...optionResult.errors)

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  }
}

/**
 * 检查购物车数量是否有效
 *
 * @param quantity 数量
 * @param min 最小值(默认 1)
 * @param max 最大值(默认 99)
 * @returns 验证结果
 */
export const validateQuantity = (
  quantity: number,
  min = 1,
  max = 99
): ValidationResult => {
  const errors: string[] = []

  if (!Number.isInteger(quantity)) {
    errors.push('数量必须是整数')
  } else if (quantity < min) {
    errors.push(`数量不能少于${min}`)
  } else if (quantity > max) {
    errors.push(`数量不能超过${max}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 检查商品是否可以加入购物车
 *
 * @param isAvailable 商品是否可用(status=ACTIVE && stockStatus!=OUT_OF_STOCK)
 * @param specs 商品规格列表
 * @param selectedSpecs 用户选择的规格
 * @param quantity 数量
 * @returns 验证结果
 */
export const canAddToCart = (
  isAvailable: boolean,
  specs: ChannelProductSpecDTO[],
  selectedSpecs: Record<SpecType, SelectedSpec>,
  quantity: number
): ValidationResult => {
  const errors: string[] = []

  // 1. 检查商品是否可用
  if (!isAvailable) {
    errors.push('该商品暂不可购买')
  }

  // 2. 检查规格选择
  const specResult = validateSpecs(specs, selectedSpecs)
  errors.push(...specResult.errors)

  // 3. 检查数量
  const quantityResult = validateQuantity(quantity)
  errors.push(...quantityResult.errors)

  return {
    isValid: errors.length === 0,
    errors,
  }
}
