import { AttributeTemplateItem, AttributeType, AttributeValidation, AttributeOption } from '@/types/spu'

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  error?: string
  field?: string
}

// 验证规则配置
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  minLength?: number
  maxLength?: number
  options?: string[]
  custom?: (value: any) => boolean | string
}

// 属性验证器类
export class AttributeValidator {
  /**
   * 验证单个属性值
   * @param attribute 属性配置
   * @param value 要验证的值
   * @returns 验证结果
   */
  static validateAttribute(attribute: AttributeTemplateItem, value: any): ValidationResult {
    const { type, required, validation, options, name } = attribute

    // 检查必填项
    if (required && this.isEmpty(value)) {
      return {
        isValid: false,
        error: `${name}是必填项`,
        field: attribute.code
      }
    }

    // 如果不是必填且为空，则跳过其他验证
    if (!required && this.isEmpty(value)) {
      return { isValid: true }
    }

    // 根据属性类型进行验证
    switch (type) {
      case 'text':
        return this.validateText(value, validation, name)
      case 'number':
        return this.validateNumber(value, validation, name)
      case 'boolean':
        return this.validateBoolean(value, name)
      case 'select':
        return this.validateSelect(value, options, name)
      case 'multiselect':
        return this.validateMultiSelect(value, options, name)
      case 'date':
        return this.validateDate(value, validation, name)
      case 'url':
        return this.validateURL(value, name)
      case 'image':
        return this.validateImage(value, validation, name)
      case 'file':
        return this.validateFile(value, validation, name)
      default:
        return { isValid: true }
    }
  }

  /**
   * 验证多个属性值
   * @param attributes 属性配置列表
   * @param values 属性值对象
   * @returns 验证结果数组
   */
  static validateAttributes(
    attributes: AttributeTemplateItem[],
    values: Record<string, any>
  ): ValidationResult[] {
    const results: ValidationResult[] = []

    for (const attribute of attributes) {
      if (attribute.status === 'inactive') continue // 跳过停用的属性

      const value = values[attribute.code]
      const result = this.validateAttribute(attribute, value)
      results.push({
        ...result,
        field: attribute.code
      })
    }

    return results
  }

  /**
   * 批量验证并返回第一个错误
   * @param attributes 属性配置列表
   * @param values 属性值对象
   * @returns 第一个验证错误，如果全部通过则返回成功
   */
  static validateFirstError(
    attributes: AttributeTemplateItem[],
    values: Record<string, any>
  ): ValidationResult {
    const results = this.validateAttributes(attributes, values)
    return results.find(result => !result.isValid) || { isValid: true }
  }

  /**
   * 验证文本类型
   */
  private static validateText(
    value: any,
    validation: AttributeValidation | undefined,
    fieldName: string
  ): ValidationResult {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `${fieldName}必须是文本`,
        field: fieldName
      }
    }

    // 长度验证
    if (validation?.minLength && value.length < validation.minLength) {
      return {
        isValid: false,
        error: `${fieldName}长度不能少于${validation.minLength}个字符`,
        field: fieldName
      }
    }

    if (validation?.maxLength && value.length > validation.maxLength) {
      return {
        isValid: false,
        error: `${fieldName}长度不能超过${validation.maxLength}个字符`,
        field: fieldName
      }
    }

    // 正则表达式验证
    if (validation?.pattern) {
      const regex = new RegExp(validation.pattern)
      if (!regex.test(value)) {
        return {
          isValid: false,
          error: `${fieldName}格式不正确`,
          field: fieldName
        }
      }
    }

    return { isValid: true }
  }

  /**
   * 验证数字类型
   */
  private static validateNumber(
    value: any,
    validation: AttributeValidation | undefined,
    fieldName: string
  ): ValidationResult {
    const numValue = Number(value)

    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${fieldName}必须是有效的数字`,
        field: fieldName
      }
    }

    // 范围验证
    if (validation?.min !== undefined && numValue < validation.min) {
      return {
        isValid: false,
        error: `${fieldName}不能小于${validation.min}`,
        field: fieldName
      }
    }

    if (validation?.max !== undefined && numValue > validation.max) {
      return {
        isValid: false,
        error: `${fieldName}不能大于${validation.max}`,
        field: fieldName
      }
    }

    return { isValid: true }
  }

  /**
   * 验证布尔类型
   */
  private static validateBoolean(value: any, fieldName: string): ValidationResult {
    if (typeof value !== 'boolean') {
      return {
        isValid: false,
        error: `${fieldName}必须是是/否选择`,
        field: fieldName
      }
    }

    return { isValid: true }
  }

  /**
   * 验证单选类型
   */
  private static validateSelect(
    value: any,
    options: AttributeOption[] | undefined,
    fieldName: string
  ): ValidationResult {
    if (!options || options.length === 0) {
      return { isValid: true } // 如果没有选项配置，则跳过验证
    }

    const activeOptions = options.filter(opt => opt.status === 'active')
    const validValues = activeOptions.map(opt => opt.value)

    if (!validValues.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName}选择了无效的选项`,
        field: fieldName
      }
    }

    return { isValid: true }
  }

  /**
   * 验证多选类型
   */
  private static validateMultiSelect(
    value: any,
    options: AttributeOption[] | undefined,
    fieldName: string
  ): ValidationResult {
    if (!Array.isArray(value)) {
      return {
        isValid: false,
        error: `${fieldName}必须是数组`,
        field: fieldName
      }
    }

    if (!options || options.length === 0) {
      return { isValid: true } // 如果没有选项配置，则跳过验证
    }

    const activeOptions = options.filter(opt => opt.status === 'active')
    const validValues = activeOptions.map(opt => opt.value)

    for (const val of value) {
      if (!validValues.includes(val)) {
        return {
          isValid: false,
          error: `${fieldName}包含了无效的选项`,
          field: fieldName
        }
      }
    }

    return { isValid: true }
  }

  /**
   * 验证日期类型
   */
  private static validateDate(
    value: any,
    validation: AttributeValidation | undefined,
    fieldName: string
  ): ValidationResult {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `${fieldName}必须是日期字符串`,
        field: fieldName
      }
    }

    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: `${fieldName}不是有效的日期`,
        field: fieldName
      }
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(value)) {
      return {
        isValid: false,
        error: `${fieldName}日期格式不正确，请使用YYYY-MM-DD格式`,
        field: fieldName
      }
    }

    // 验证日期范围
    const now = new Date()
    if (validation?.min) {
      const minDate = new Date(validation.min)
      if (date < minDate) {
        return {
          isValid: false,
          error: `${fieldName}不能早于${minDate.toLocaleDateString()}`,
          field: fieldName
        }
      }
    }

    if (validation?.max) {
      const maxDate = new Date(validation.max)
      if (date > maxDate) {
        return {
          isValid: false,
          error: `${fieldName}不能晚于${maxDate.toLocaleDateString()}`,
          field: fieldName
        }
      }
    }

    return { isValid: true }
  }

  /**
   * 验证URL类型
   */
  private static validateURL(value: any, fieldName: string): ValidationResult {
    if (typeof value !== 'string') {
      return {
        isValid: false,
        error: `${fieldName}必须是URL地址`,
        field: fieldName
      }
    }

    try {
      // 验证URL格式
      new URL(value)
      return { isValid: true }
    } catch {
      return {
        isValid: false,
        error: `${fieldName}不是有效的URL地址`,
        field: fieldName
      }
    }
  }

  /**
   * 验证图片类型
   */
  private static validateImage(
    value: any,
    validation: AttributeValidation | undefined,
    fieldName: string
  ): ValidationResult {
    // 如果是字符串URL，验证URL格式
    if (typeof value === 'string') {
      try {
        new URL(value)
        return { isValid: true }
      } catch {
        return {
          isValid: false,
          error: `${fieldName}不是有效的图片URL`,
          field: fieldName
        }
      }
    }

    // 如果是File对象，验证文件类型
    if (value instanceof File) {
      const allowedTypes = validation?.options || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = validation?.max || 5 * 1024 * 1024 // 默认5MB

      if (!allowedTypes.includes(value.type)) {
        return {
          isValid: false,
          error: `${fieldName}文件类型不支持，支持的类型：${allowedTypes.join(', ')}`,
          field: fieldName
        }
      }

      if (value.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024)
        return {
          isValid: false,
          error: `${fieldName}文件大小不能超过${maxSizeMB}MB`,
          field: fieldName
        }
      }

      return { isValid: true }
    }

    return {
      isValid: false,
      error: `${fieldName}必须是图片文件或URL`,
      field: fieldName
    }
  }

  /**
   * 验证文件类型
   */
  private static validateFile(
    value: any,
    validation: AttributeValidation | undefined,
    fieldName: string
  ): ValidationResult {
    // 如果是File对象
    if (value instanceof File) {
      const allowedTypes = validation?.options || []
      const maxSize = validation?.max || 10 * 1024 * 1024 // 默认10MB

      if (allowedTypes.length > 0 && !allowedTypes.includes(value.type)) {
        return {
          isValid: false,
          error: `${fieldName}文件类型不支持，支持的类型：${allowedTypes.join(', ')}`,
          field: fieldName
        }
      }

      if (value.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024)
        return {
          isValid: false,
          error: `${fieldName}文件大小不能超过${maxSizeMB}MB`,
          field: fieldName
        }
      }

      return { isValid: true }
    }

    return {
      isValid: false,
      error: `${fieldName}必须是文件`,
      field: fieldName
    }
  }

  /**
   * 检查值是否为空
   */
  private static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    return false
  }
}

// 常用验证规则预设
export const ValidationPresets = {
  // 手机号验证
  phoneNumber: {
    pattern: '^1[3-9]\\d{9}$',
    message: '请输入有效的手机号码'
  },

  // 邮箱验证
  email: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    message: '请输入有效的邮箱地址'
  },

  // 身份证验证
  idCard: {
    pattern: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    message: '请输入有效的身份证号码'
  },

  // 密码验证（8-20位，包含字母和数字）
  password: {
    pattern: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,20}$',
    message: '密码必须8-20位，包含字母和数字'
  },

  // 中文姓名验证
  chineseName: {
    pattern: '^[\\u4e00-\\u9fa5]{2,8}$',
    message: '请输入2-8位中文姓名'
  },

  // 正整数验证
  positiveInteger: {
    pattern: '^[1-9]\\d*$',
    message: '请输入正整数'
  },

  // 价格验证（最多两位小数）
  price: {
    pattern: '^(0|[1-9]\\d*)(\\.\\d{1,2})?$',
    message: '请输入有效的价格，最多两位小数'
  }
}

// 获取验证规则预设
export function getValidationPreset(presetName: keyof typeof ValidationPresets): {
  pattern: string
  message: string
} | null {
  return ValidationPresets[presetName] || null
}

// 格式化验证错误信息
export function formatValidationErrors(results: ValidationResult[]): string[] {
  return results
    .filter(result => !result.isValid && result.error)
    .map(result => result.error!)
}

// 检查属性模板配置是否有效
export function validateAttributeTemplate(template: {
  name: string
  code: string
  attributes: AttributeTemplateItem[]
}): ValidationResult {
  const { name, code, attributes } = template

  // 检查基础信息
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: '模板名称不能为空'
    }
  }

  if (!code || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(code)) {
    return {
      isValid: false,
      error: '模板编码格式不正确，只能包含字母、数字和下划线，且以字母开头'
    }
  }

  // 检查属性配置
  if (!attributes || attributes.length === 0) {
    return {
      isValid: false,
      error: '模板必须包含至少一个属性'
    }
  }

  // 检查属性编码唯一性
  const codes = attributes.map(attr => attr.code)
  const uniqueCodes = new Set(codes)
  if (codes.length !== uniqueCodes.size) {
    return {
      isValid: false,
      error: '属性编码必须唯一'
    }
  }

  // 检查每个属性的配置
  for (const attribute of attributes) {
    if (!attribute.name || !attribute.code) {
      return {
        isValid: false,
        error: `属性名称和编码不能为空`
      }
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(attribute.code)) {
      return {
        isValid: false,
        error: `属性编码 "${attribute.code}" 格式不正确`
      }
    }

    // 检查选择类型的属性是否有选项配置
    if (['select', 'multiselect'].includes(attribute.type)) {
      if (!attribute.options || attribute.options.length === 0) {
        return {
          isValid: false,
          error: `选择类型属性 "${attribute.name}" 必须配置选项`
        }
      }
    }
  }

  return { isValid: true }
}