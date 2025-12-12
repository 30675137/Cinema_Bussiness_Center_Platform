/**
 * 通用数据验证工具函数
 */

/**
 * 验证规则类型
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

/**
 * 验证结果类型
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 验证单个值
 * @param value - 要验证的值
 * @param rules - 验证规则
 * @param fieldName - 字段名称
 * @returns 验证结果
 */
export const validateField = (
  value: any,
  rules: ValidationRule[],
  fieldName: string
): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    // 必填验证
    if (rule.required) {
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors.push(rule.message || `${fieldName}不能为空`);
        continue;
      }
    }

    // 如果值为空且不是必填，跳过其他验证
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // 字符串长度验证
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(
          rule.message || `${fieldName}长度不能少于${rule.minLength}个字符`
        );
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(
          rule.message || `${fieldName}长度不能超过${rule.maxLength}个字符`
        );
      }
    }

    // 数字范围验证
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(rule.message || `${fieldName}不能小于${rule.min}`);
      }

      if (rule.max !== undefined && value > rule.max) {
        errors.push(rule.message || `${fieldName}不能大于${rule.max}`);
      }
    }

    // 正则表达式验证
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        errors.push(rule.message || `${fieldName}格式不正确`);
      }
    }

    // 自定义验证
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        errors.push(
          typeof customResult === 'string'
            ? customResult
            : rule.message || `${fieldName}验证失败`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 验证对象
 * @param data - 要验证的对象
 * @param rules - 验证规则映射
 * @returns 验证结果
 */
export const validateObject = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): {
  isValid: boolean;
  errors: Record<string, string[]>;
  fieldErrors: string[];
} => {
  const errors: Record<string, string[]> = {};
  const fieldErrors: string[] = [];

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const result = validateField(data[fieldName], fieldRules, fieldName);

    if (!result.isValid) {
      errors[fieldName] = result.errors;
      fieldErrors.push(...result.errors);
    }
  }

  return {
    isValid: fieldErrors.length === 0,
    errors,
    fieldErrors,
  };
};

/**
 * 常用验证规则
 */
export const commonRules = {
  // 必填
  required: (message?: string): ValidationRule => ({
    required: true,
    message,
  }),

  // 字符串长度
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `最少需要${min}个字符`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `最多允许${max}个字符`,
  }),

  length: (min: number, max: number, message?: string): ValidationRule[] => [
    { minLength: min, message: message || `长度应在${min}-${max}个字符之间` },
    { maxLength: max, message: message || `长度应在${min}-${max}个字符之间` },
  ],

  // 数字范围
  min: (min: number, message?: string): ValidationRule => ({
    min,
    message: message || `不能小于${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    max,
    message: message || `不能大于${max}`,
  }),

  range: (min: number, max: number, message?: string): ValidationRule[] => [
    { min, message: message || `应在${min}-${max}之间` },
    { max, message: message || `应在${min}-${max}之间` },
  ],

  // 常用格式
  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || '请输入有效的邮箱地址',
  }),

  phone: (message?: string): ValidationRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message: message || '请输入有效的手机号码',
  }),

  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
    message: message || '请输入有效的URL地址',
  }),

  idCard: (message?: string): ValidationRule => ({
    pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    message: message || '请输入有效的身份证号码',
  }),

  // 中文姓名
  chineseName: (message?: string): ValidationRule => ({
    pattern: /^[\u4e00-\u9fa5]{2,10}$/,
    message: message || '请输入有效的中文姓名',
  }),

  // 英文姓名
  englishName: (message?: string): ValidationRule => ({
    pattern: /^[a-zA-Z\s]{2,50}$/,
    message: message || '请输入有效的英文姓名',
  }),

  // 密码
  password: (message?: string): ValidationRule => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: message || '密码需包含大小写字母和数字，至少8位',
  }),

  // 强密码
  strongPassword: (message?: string): ValidationRule => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/,
    message: message || '密码需包含大小写字母、数字和特殊字符，至少8位',
  }),

  // 数字
  number: (message?: string): ValidationRule => ({
    pattern: /^-?\d*\.?\d+$/,
    message: message || '请输入有效的数字',
  }),

  // 正整数
  positiveInteger: (message?: string): ValidationRule => ({
    pattern: /^[1-9]\d*$/,
    message: message || '请输入有效的正整数',
  }),

  // 颜色值
  color: (message?: string): ValidationRule => ({
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    message: message || '请输入有效的颜色值',
  }),

  // IP地址
  ip: (message?: string): ValidationRule => ({
    pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    message: message || '请输入有效的IP地址',
  }),

  // 自定义
  custom: (validator: (value: any) => boolean | string, message?: string): ValidationRule => ({
    custom: validator,
    message,
  }),
};

/**
 * 异步验证器
 */
export const asyncValidators = {
  // 检查用户名是否存在
  checkUsernameExists: async (username: string): Promise<boolean> => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingUsernames = ['admin', 'user', 'test'];
    return !existingUsernames.includes(username.toLowerCase());
  },

  // 检查邮箱是否已注册
  checkEmailExists: async (email: string): Promise<boolean> => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    const existingEmails = ['admin@example.com', 'user@example.com'];
    return !existingEmails.includes(email.toLowerCase());
  },

  // 检查SPU编码是否重复
  checkSPUCodeExists: async (code: string, excludeId?: string): Promise<boolean> => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    // 这里应该调用真实的API
    return true;
  },
};

/**
 * 异步验证字段
 * @param value - 要验证的值
 * @param validator - 异步验证器
 * @param message - 错误消息
 * @returns Promise<ValidationResult>
 */
export const validateFieldAsync = async (
  value: any,
  validator: (value: any) => Promise<boolean>,
  message?: string
): Promise<ValidationResult> => {
  try {
    const isValid = await validator(value);
    return {
      isValid,
      errors: isValid ? [] : [message || '验证失败'],
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [message || '验证过程中发生错误'],
    };
  }
};

/**
 * 防抖验证函数
 * @param validator - 验证函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖验证函数
 */
export const debounceValidation = <T extends (...args: any[]) => any>(
  validator: T,
  delay: number = 300
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await validator(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

/**
 * 表单验证器类
 */
export class FormValidator {
  private rules: Record<string, ValidationRule[]> = {};
  private asyncValidators: Record<string, (value: any) => Promise<boolean>> = {};

  /**
   * 添加验证规则
   * @param fieldName - 字段名
   * @param rules - 验证规则
   * @param asyncValidator - 异步验证器
   */
  addRule(
    fieldName: string,
    rules: ValidationRule[],
    asyncValidator?: (value: any) => Promise<boolean>
  ): void {
    this.rules[fieldName] = rules;
    if (asyncValidator) {
      this.asyncValidators[fieldName] = asyncValidator;
    }
  }

  /**
   * 验证整个表单
   * @param data - 表单数据
   * @returns Promise<验证结果>
   */
  async validate(data: Record<string, any>): Promise<{
    isValid: boolean;
    errors: Record<string, string[]>;
    fieldErrors: string[];
  }> {
    // 同步验证
    const syncResult = validateObject(data, this.rules);

    // 异步验证
    for (const [fieldName, validator] of Object.entries(this.asyncValidators)) {
      if (data[fieldName] !== undefined && data[fieldName] !== null && data[fieldName] !== '') {
        try {
          const isValid = await validator(data[fieldName]);
          if (!isValid) {
            syncResult.isValid = false;
            syncResult.errors[fieldName] = [
              ...(syncResult.errors[fieldName] || []),
              `${fieldName}验证失败`,
            ];
            syncResult.fieldErrors.push(`${fieldName}验证失败`);
          }
        } catch (error) {
          syncResult.isValid = false;
          syncResult.errors[fieldName] = [
            ...(syncResult.errors[fieldName] || []),
            `${fieldName}验证过程中发生错误`,
          ];
          syncResult.fieldErrors.push(`${fieldName}验证过程中发生错误`);
        }
      }
    }

    return syncResult;
  }

  /**
   * 验证单个字段
   * @param fieldName - 字段名
   * @param value - 字段值
   * @returns Promise<ValidationResult>
   */
  async validateField(fieldName: string, value: any): Promise<ValidationResult> {
    const rules = this.rules[fieldName] || [];
    const syncResult = validateField(value, rules, fieldName);

    if (!syncResult.isValid) {
      return syncResult;
    }

    const asyncValidator = this.asyncValidators[fieldName];
    if (asyncValidator && value !== undefined && value !== null && value !== '') {
      try {
        const isValid = await asyncValidator(value);
        return {
          isValid,
          errors: isValid ? [] : [`${fieldName}验证失败`],
        };
      } catch (error) {
        return {
          isValid: false,
          errors: [`${fieldName}验证过程中发生错误`],
        };
      }
    }

    return syncResult;
  }

  /**
   * 清除所有规则
   */
  clearRules(): void {
    this.rules = {};
    this.asyncValidators = {};
  }

  /**
   * 移除指定字段的规则
   * @param fieldName - 字段名
   */
  removeRule(fieldName: string): void {
    delete this.rules[fieldName];
    delete this.asyncValidators[fieldName];
  }
}

/**
 * 创建表单验证器实例
 * @param rules - 验证规则
 * @returns FormValidator实例
 */
export const createFormValidator = (
  rules: Record<string, ValidationRule[]>
): FormValidator => {
  const validator = new FormValidator();
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    validator.addRule(fieldName, fieldRules);
  }
  return validator;
};

/**
 * SPU表单专用验证规则
 */
export const spuFormRules = {
  name: [
    commonRules.required('SPU名称不能为空'),
    commonRules.minLength(2, 'SPU名称至少需要2个字符'),
    commonRules.maxLength(100, 'SPU名称不能超过100个字符'),
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）]+$/,
      message: 'SPU名称只能包含中文、英文、数字、空格、横线、下划线和括号',
    },
  ],

  shortName: [
    commonRules.maxLength(50, '标准简称不能超过50个字符'),
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）]*$/,
      message: '标准简称只能包含中文、英文、数字、空格、横线、下划线和括号',
    },
  ],

  description: [
    commonRules.required('商品描述不能为空'),
    commonRules.minLength(10, '商品描述至少需要10个字符'),
    commonRules.maxLength(2000, '商品描述不能超过2000个字符'),
  ],

  unit: [
    commonRules.maxLength(10, '标准单位不能超过10个字符'),
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]*$/,
      message: '标准单位只能包含中文、英文和数字',
    },
  ],

  brandId: [
    commonRules.required('请选择品牌'),
  ],

  categoryId: [
    commonRules.required('请选择分类'),
  ],

  status: [
    commonRules.required('请选择状态'),
    {
      custom: (value: string) => {
        const validStatuses = ['draft', 'active', 'inactive'];
        return validStatuses.includes(value);
      },
      message: '状态值无效',
    },
  ],

  tags: {
    // 标签数组验证
    validate: (tags: string[]) => {
      if (!tags || !Array.isArray(tags)) {
        return { isValid: true, errors: [] }; // 标签是可选的
      }

      const errors: string[] = [];

      if (tags.length > 10) {
        errors.push('标签数量不能超过10个');
      }

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (tag.length > 20) {
          errors.push(`标签"${tag}"长度不能超过20个字符`);
        }
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9\-_]+$/.test(tag)) {
          errors.push(`标签"${tag}"只能包含中文、英文、数字、横线和下划线`);
        }
      }

      const duplicateTags = tags.filter((tag, index) => tags.indexOf(tag) !== index);
      if (duplicateTags.length > 0) {
        errors.push(`存在重复标签: ${duplicateTags.join(', ')}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },

  images: {
    // 图片验证
    validate: (images: any[]) => {
      if (!images || !Array.isArray(images)) {
        return { isValid: false, errors: ['请至少上传一张商品图片'] };
      }

      const errors: string[] = [];

      if (images.length === 0) {
        errors.push('请至少上传一张商品图片');
      }

      if (images.length > 10) {
        errors.push('商品图片不能超过10张');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },

  specifications: {
    // 规格参数验证
    validate: (specifications: Array<{ name: string; value: string }>) => {
      if (!specifications || !Array.isArray(specifications)) {
        return { isValid: false, errors: ['规格参数格式错误'] };
      }

      const errors: string[] = [];

      // 检查必填项
      const hasEmptyName = specifications.some(spec => !spec.name || spec.name.trim() === '');
      if (hasEmptyName) {
        errors.push('规格参数名称不能为空');
      }

      const hasEmptyValue = specifications.some(spec => !spec.value || spec.value.trim() === '');
      if (hasEmptyValue) {
        errors.push('规格参数值不能为空');
      }

      // 检查名称重复
      const names = specifications.map(spec => spec.name.trim()).filter(name => name);
      const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        errors.push(`规格参数名称重复: ${duplicateNames.join(', ')}`);
      }

      // 检查名称长度
      const longNames = specifications.filter(spec => spec.name && spec.name.length > 50);
      if (longNames.length > 0) {
        errors.push('规格参数名称不能超过50个字符');
      }

      // 检查值长度
      const longValues = specifications.filter(spec => spec.value && spec.value.length > 100);
      if (longValues.length > 0) {
        errors.push('规格参数值不能超过100个字符');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },

  attributes: {
    // 动态属性验证
    validate: (attributes: Array<{ name: string; value: string }>) => {
      if (!attributes || !Array.isArray(attributes)) {
        return { isValid: true, errors: [] }; // 属性是可选的
      }

      const errors: string[] = [];

      // 检查必填项
      const hasEmptyName = attributes.some(attr => !attr.name || attr.name.trim() === '');
      if (hasEmptyName) {
        errors.push('动态属性名称不能为空');
      }

      const hasEmptyValue = attributes.some(attr => !attr.value || attr.value.trim() === '');
      if (hasEmptyValue) {
        errors.push('动态属性值不能为空');
      }

      // 检查名称重复
      const names = attributes.map(attr => attr.name.trim()).filter(name => name);
      const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        errors.push(`动态属性名称重复: ${duplicateNames.join(', ')}`);
      }

      // 检查长度限制
      const longNames = attributes.filter(attr => attr.name && attr.name.length > 50);
      if (longNames.length > 0) {
        errors.push('动态属性名称不能超过50个字符');
      }

      const longValues = attributes.filter(attr => attr.value && attr.value.length > 200);
      if (longValues.length > 0) {
        errors.push('动态属性值不能超过200个字符');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
  },
};

/**
 * 验证完整的SPU表单数据
 * @param data - 表单数据
 * @returns 验证结果
 */
export const validateSPUForm = (
  data: Record<string, any>
): {
  isValid: boolean;
  errors: Record<string, string[]>;
  fieldErrors: string[];
} => {
  const errors: Record<string, string[]> = {};
  const fieldErrors: string[] = [];

  // 验证基础字段
  const basicFields = ['name', 'shortName', 'description', 'unit', 'brandId', 'categoryId', 'status'];
  for (const field of basicFields) {
    const rules = spuFormRules[field as keyof typeof spuFormRules] as ValidationRule[];
    if (rules) {
      const result = validateField(data[field], rules, getFieldLabel(field));
      if (!result.isValid) {
        errors[field] = result.errors;
        fieldErrors.push(...result.errors);
      }
    }
  }

  // 验证标签
  if (data.tags) {
    const tagsResult = spuFormRules.tags.validate(data.tags);
    if (!tagsResult.isValid) {
      errors.tags = tagsResult.errors;
      fieldErrors.push(...tagsResult.errors);
    }
  }

  // 验证图片
  if (data.images) {
    const imagesResult = spuFormRules.images.validate(data.images);
    if (!imagesResult.isValid) {
      errors.images = imagesResult.errors;
      fieldErrors.push(...imagesResult.errors);
    }
  }

  // 验证规格参数
  if (data.specifications) {
    const specsResult = spuFormRules.specifications.validate(data.specifications);
    if (!specsResult.isValid) {
      errors.specifications = specsResult.errors;
      fieldErrors.push(...specsResult.errors);
    }
  }

  // 验证动态属性
  if (data.attributes) {
    const attrsResult = spuFormRules.attributes.validate(data.attributes);
    if (!attrsResult.isValid) {
      errors.attributes = attrsResult.errors;
      fieldErrors.push(...attrsResult.errors);
    }
  }

  return {
    isValid: fieldErrors.length === 0,
    errors,
    fieldErrors,
  };
};

/**
 * 获取字段标签
 * @param field - 字段名
 * @returns 字段标签
 */
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: 'SPU名称',
    shortName: '标准简称',
    description: '商品描述',
    unit: '标准单位',
    brandId: '品牌',
    categoryId: '分类',
    status: '状态',
    tags: '标签',
    images: '商品图片',
    specifications: '规格参数',
    attributes: '动态属性',
  };

  return labels[field] || field;
}