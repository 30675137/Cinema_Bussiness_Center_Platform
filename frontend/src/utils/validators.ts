/**
 * 表单验证工具
 */

// 正则表达式集合
export const REGEX_PATTERNS = {
  // 手机号
  MOBILE: /^1[3-9]\d{9}$/,
  // 固定电话
  PHONE: /^0\d{2,3}-?\d{7,8}$/,
  // 邮箱
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // 身份证号
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))\d{3}[0-9Xx]$/,
  // 统一社会信用代码
  CREDIT_CODE: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
  // 银行卡号
  BANK_CARD: /^\d{16,19}$/,
  // 密码（8-20位，包含字母和数字）
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,20}$/,
  // 数字
  NUMBER: /^\d+$/,
  // 正整数
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  // 浮点数
  DECIMAL: /^\d+(\.\d+)?$/,
  // 中文
  CHINESE: /^[\u4e00-\u9fa5]+$/,
  // 英文
  ENGLISH: /^[a-zA-Z]+$/,
  // 中英文
  CHINESE_ENGLISH: /^[\u4e00-\u9fa5a-zA-Z]+$/,
  // URL
  URL: /^https?:\/\/[^\s]+/,
  // IP地址
  IP: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  // SKU编码
  SKU: /^[A-Za-z0-9_-]+$/,
  // 订单编号
  ORDER_NUMBER: /^[A-Za-z0-9-]+$/,
};

// 验证规则接口
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

// 验证函数类型
export type ValidatorFunction = (value: any, rule?: ValidationRule) => string | boolean;

/**
 * 验证器对象
 */
export const validators: Record<string, ValidatorFunction> = {
  // 必填验证
  required: (value, rule) => {
    const isRequired = rule?.required !== false;
    if (!isRequired) {
      return true;
    }

    if (value === null || value === undefined || value === '' || value === 0) {
      return rule?.message || '此字段为必填项';
    }

    if (Array.isArray(value)) {
      return value.length > 0 || rule?.message || '请至少选择一项';
    }

    return true;
  },

  // 最小长度验证
  minLength: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const length = String(value).length;
    if (rule?.minLength && length < rule.minLength) {
      return rule?.message || `最少需要${rule.minLength}个字符`;
    }

    return true;
  },

  // 最大长度验证
  maxLength: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const length = String(value).length;
    if (rule?.maxLength && length > rule.maxLength) {
      return rule?.message || `最多允许${rule.maxLength}个字符`;
    }

    return true;
  },

  // 正则表达式验证
  pattern: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const pattern = rule?.pattern;
    if (pattern && !pattern.test(String(value))) {
      return rule?.message || '格式不正确';
    }

    return true;
  },

  // 手机号验证
  mobile: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const phone = String(value).replace(/\s/g, ''); // 移除空格
    if (!REGEX_PATTERNS.MOBILE.test(phone)) {
      return rule?.message || '请输入正确的手机号码';
    }

    return true;
  },

  // 固定电话验证
  phone: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (!REGEX_PATTERNS.PHONE.test(String(value))) {
      return rule?.message || '请输入正确的电话号码';
    }

    return true;
  },

  // 邮箱验证
  email: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (!REGEX_PATTERNS.EMAIL.test(String(value))) {
      return rule?.message || '请输入正确的邮箱地址';
    }

    return true;
  },

  // 身份证号验证
  idCard: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (!REGEX_PATTERNS.ID_CARD.test(String(value))) {
      return rule?.message || '请输入正确的身份证号码';
    }

    return true;
  },

  // 统一社会信用代码验证
  creditCode: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (!REGEX_PATTERNS.CREDIT_CODE.test(String(value))) {
      return rule?.message || '请输入正确的统一社会信用代码';
    }

    return true;
  },

  // 银行卡号验证
  bankCard: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (!REGEX_PATTERNS.BANK_CARD.test(String(value))) {
      return rule?.message || '请输入正确的银行卡号';
    }

    return true;
  },

  // 数字验证
  number: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (isNaN(Number(value))) {
      return rule?.message || '请输入有效的数字';
    }

    return true;
  },

  // 整数验证
  integer: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num)) {
      return rule?.message || '请输入整数';
    }

    return true;
  },

  // 正整数验证
  positiveInteger: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      return rule?.message || '请输入正整数';
    }

    return true;
  },

  // 金额验证
  amount: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return rule?.message || '请输入有效的金额';
    }

    // 检查小数位数
    const decimalPart = String(value).split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      return rule?.message || '金额最多保留2位小数';
    }

    return true;
  },

  // 百分比验证
  percentage: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) {
      return rule?.message || '请输入0-100之间的数值';
    }

    return true;
  },

  // 密码验证
  password: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return rule?.message || '密码不能为空';
    }

    const password = String(value);
    if (password.length < 8 || password.length > 20) {
      return rule?.message || '密码长度必须在8-20位之间';
    }

    if (!REGEX_PATTERNS.PASSWORD.test(password)) {
      return rule?.message || '密码必须包含字母和数字';
    }

    return true;
  },

  // 确认密码验证
  confirmPassword: (value, rule) => {
    const { originalPassword } = rule as any;
    if (value !== originalPassword) {
      return rule?.message || '两次输入的密码不一致';
    }

    return true;
  },

  // SKU验证
  sku: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (!REGEX_PATTERNS.SKU.test(String(value))) {
      return rule?.message || 'SKU格式不正确';
    }

    return true;
  },

  // 日期验证
  date: (value, rule) => {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return rule?.message || '请输入有效的日期';
    }

    return true;
  },

  // 范围验证
  range: (value, rule) => {
    const { min, max } = rule as any;
    const num = Number(value);

    if (isNaN(num)) {
      return rule?.message || '请输入有效的数字';
    }

    if (min !== undefined && num < min) {
      return rule?.message || `数值不能小于${min}`;
    }

    if (max !== undefined && num > max) {
      return rule?.message || `数值不能大于${max}`;
    }

    return true;
  },

  // 数组长度验证
  arrayLength: (value, rule) => {
    if (!Array.isArray(value)) {
      return true;
    }

    const { min, max } = rule as any;

    if (min !== undefined && value.length < min) {
      return rule?.message || `至少需要${min}项`;
    }

    if (max !== undefined && value.length > max) {
      return rule?.message || `最多允许${max}项`;
    }

    return true;
  },

  // 文件大小验证
  fileSize: (value, rule) => {
    const { maxSize, unit = 'B' } = rule as any;

    // 转换为字节
    const sizeInBytes =
      maxSize *
      {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
      }[unit];

    if (value && value.size > sizeInBytes) {
      return rule?.message || `文件大小不能超过${maxSize}${unit}`;
    }

    return true;
  },

  // 自定义验证
  custom: (value, rule) => {
    const customValidator = rule?.custom;
    if (typeof customValidator === 'function') {
      const result = customValidator(value);
      if (result === false || typeof result === 'string') {
        return result || rule?.message || '验证失败';
      }
    }

    return true;
  },
};

/**
 * 批量验证
 * @param values 要验证的值对象
 * @param rules 验证规则配置
 * @returns 验证结果，包含错误信息和是否有效
 */
export const validate = (
  values: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): { valid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  let valid = true;

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const fieldErrors: string[] = [];
    const value = values[field];

    fieldRules.forEach((rule) => {
      // 遍历所有验证器
      Object.entries(validators).forEach(([validatorName, validatorFn]) => {
        if (rule[validatorName] || validatorName === 'custom') {
          const result = validatorFn(value, rule);
          if (result !== true) {
            fieldErrors.push(result as string);
            valid = false;
          }
        }
      });

      // 额外的pattern验证
      if (rule.pattern && !rule.pattern.test(String(value || ''))) {
        fieldErrors.push(rule.message || '格式不正确');
        valid = false;
      }

      // 额外的自定义验证
      if (rule.custom && typeof rule.custom === 'function') {
        const result = rule.custom(value);
        if (result !== true) {
          fieldErrors.push(result as string);
          valid = false;
        }
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return { valid, errors };
};

/**
 * 单个字段验证
 */
export const validateField = (
  value: any,
  rules: ValidationRule[]
): { valid: boolean; error: string } => {
  const validation = validate({ value }, { value: rules });

  return {
    valid: validation.valid,
    error: validation.errors.value?.[0] || '',
  };
};

export default {
  validators,
  validate,
  validateField,
  REGEX_PATTERNS,
};
