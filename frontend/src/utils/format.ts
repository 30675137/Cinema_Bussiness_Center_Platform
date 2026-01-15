/**
 * 格式化工具函数
 */

/**
 * 格式化货币
 * @param amount - 金额
 * @param currency - 货币符号，默认为人民币
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number | string, currency: string = '¥'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency}0.00`;
  return `${currency}${num.toFixed(2)}`;
}

/**
 * 格式化百分比
 * @param value - 数值
 * @param decimals - 小数位数，默认为2
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * 格式化日期
 * @param date - 日期对象或日期字符串
 * @param format - 格式模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化时间戳
 * @param timestamp - 时间戳
 * @param format - 格式模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(
  timestamp: number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  return formatDate(new Date(ts), format);
}

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化手机号码
 * @param phone - 手机号码字符串
 * @returns 格式化后的手机号码
 */
export function formatPhoneNumber(phone: string): string {
  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '');

  // 验证手机号码格式
  if (cleaned.length !== 11) return phone;

  // 添加分隔符
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
}

/**
 * 格式化身份证号（隐藏敏感信息）
 * @param idCard - 身份证号
 * @returns 格式化后的身份证号
 */
export function formatIdCard(idCard: string): string {
  if (idCard.length !== 18) return idCard;

  return `${idCard.slice(0, 6)}****${idCard.slice(14)}`;
}

/**
 * 首字母大写
 * @param str - 字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 驺值处理
 * @param value - 任意值
 * @param defaultValue - 默认值
 * @returns 处理后的值
 */
export function handleEmpty<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || value === undefined ? defaultValue : value;
}

/**
 * 安全的JSON解析
 * @param jsonString - JSON字符串
 * @param defaultValue - 默认值
 * @returns 解析结果或默认值
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}
