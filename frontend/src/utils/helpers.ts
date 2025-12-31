/**
 * 通用辅助函数
 */

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 生成订单编号
 */
export const generateOrderNumber = (prefix: string = 'ORD'): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

/**
 * 深拷贝对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as { [key: string]: any };
    Object.keys(obj).forEach((key) => {
      cloned[key] = deepClone((obj as any)[key]);
    });
    return cloned as T;
  }
  return obj;
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 生成随机数
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机字符串
 */
export const randomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 生成随机颜色
 */
export const randomColor = (): string => {
  const colors = [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
    '#13c2c2',
    '#eb2f96',
    '#fa541c',
    '#a0d911',
    '#2f54eb',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * 判断是否为空值
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * 安全的JSON解析
 */
export const safeJsonParse = <T = any>(str: string, defaultValue: T): T => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * 安全的JSON序列化
 */
export const safeJsonStringify = (obj: any, defaultValue: string = '{}'): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * 获取文件扩展名
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * 获取文件名（不含扩展名）
 */
export const getFileName = (filepath: string): string => {
  return (
    filepath.slice(((filepath.lastIndexOf('/') - 1) >>> 0) + 1, filepath.lastIndexOf('.')) ||
    filepath
  );
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 计算数组平均值
 */
export const arrayAverage = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * 计算数组总和
 */
export const arraySum = (arr: number[]): number => {
  return arr.reduce((sum, val) => sum + val, 0);
};

/**
 * 数组去重
 */
export const arrayUnique = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

/**
 * 数组分组
 */
export const arrayGroupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
  return arr.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>
  );
};

/**
 * 数组排序
 */
export const arraySort = <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * 生成UUID
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 延迟执行
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 重试函数
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxAttempts - 1) {
        await delay(delayMs * Math.pow(2, i));
      }
    }
  }

  throw lastError!;
};

/**
 * 错误处理装饰器
 */
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error) => void
): ((...args: Parameters<T>) => any) => {
  return (...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error('Error in function:', error);
      if (errorHandler) {
        errorHandler(error as Error);
      } else {
        throw error;
      }
    }
  };
};

/**
 * 类型守卫：检查是否为字符串
 */
export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

/**
 * 类型守卫：检查是否为数字
 */
export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * 类型守卫：检查是否为布尔值
 */
export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
};

/**
 * 类型守卫：检查是否为对象
 */
export const isObject = (value: any): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * 类型守卫：检查是否为数组
 */
export const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

/**
 * 类型守卫：检查是否为函数
 */
export const isFunction = (value: any): value is Function => {
  return typeof value === 'function';
};

/**
 * 类型守卫：检查是否为日期
 */
export const isDate = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

/**
 * 类型守卫：检查是否为空对象
 */
export const isObjectEmpty = (obj: Record<string, any>): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * 安全访问对象属性
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
};

/**
 * 安全设置对象属性
 */
export const safeSet = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current = obj;

  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
};

export default {
  generateId,
  generateOrderNumber,
  deepClone,
  debounce,
  throttle,
  randomInt,
  randomString,
  randomColor,
  isEmpty,
  safeJsonParse,
  safeJsonStringify,
  getFileExtension,
  getFileName,
  formatFileSize,
  arrayAverage,
  arraySum,
  arrayUnique,
  arrayGroupBy,
  arraySort,
  generateUUID,
  delay,
  retry,
  withErrorHandling,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isDate,
  isObjectEmpty,
  safeGet,
  safeSet,
};
