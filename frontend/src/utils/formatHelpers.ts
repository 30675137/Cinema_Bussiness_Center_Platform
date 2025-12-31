import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/**
 * 通用数据格式化工具函数
 */

/**
 * 格式化数字，添加千分位分隔符
 * @param num - 数字
 * @param options - 格式化选项
 * @returns 格式化后的字符串
 */
export const formatNumber = (
  num: number | string,
  options: {
    decimals?: number;
    thousandsSeparator?: string;
    decimalSeparator?: string;
    prefix?: string;
    suffix?: string;
  } = {}
): string => {
  const {
    decimals = 2,
    thousandsSeparator = ',',
    decimalSeparator = '.',
    prefix = '',
    suffix = '',
  } = options;

  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) {
    return `${prefix}0${decimalSeparator}${'0'.repeat(decimals)}${suffix}`;
  }

  // 处理小数部分
  const parts = number.toString().split('.');
  let integerPart = parts[0] || '0';
  let decimalPart = parts[1] || '';

  // 添加千分位分隔符
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  // 处理小数位数
  if (decimals > 0) {
    decimalPart = decimalPart.padEnd(decimals, '0').slice(0, decimals);
  }

  const formattedNumber =
    decimals > 0 ? `${integerPart}${decimalSeparator}${decimalPart}` : integerPart;

  return `${prefix}${formattedNumber}${suffix}`;
};

/**
 * 格式化货币
 * @param amount - 金额
 * @param options - 格式化选项
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (
  amount: number | string,
  options: {
    currency?: string;
    decimals?: number;
    showSymbol?: boolean;
    locale?: string;
  } = {}
): string => {
  const { currency = 'CNY', decimals = 2, showSymbol = true, locale = 'zh-CN' } = options;

  const number = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(number)) {
    return showSymbol ? '¥0.00' : '0.00';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: showSymbol ? currency : undefined,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
  } catch (error) {
    // 降级处理
    const symbol = currency === 'CNY' ? '¥' : currency;
    return formatNumber(number, {
      decimals,
      prefix: showSymbol ? symbol : '',
    });
  }
};

/**
 * 格式化百分比
 * @param value - 数值（0-1之间的小数）
 * @param decimals - 小数位数
 * @returns 格式化后的百分比字符串
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  if (isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 格式化文件大小
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * 格式化手机号码
 * @param phone - 手机号码
 * @param mask - 是否隐藏中间四位
 * @returns 格式化后的手机号码
 */
export const formatPhone = (phone: string, mask = false): string => {
  if (!phone) return '';

  // 移除所有非数字字符
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length !== 11) {
    return phone; // 如果不是标准手机号，返回原值
  }

  if (mask) {
    return `${cleanPhone.slice(0, 3)}****${cleanPhone.slice(7)}`;
  }

  return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 7)} ${cleanPhone.slice(7)}`;
};

/**
 * 格式化身份证号码
 * @param idCard - 身份证号码
 * @param mask - 是否隐藏部分数字
 * @returns 格式化后的身份证号码
 */
export const formatIdCard = (idCard: string, mask = false): string => {
  if (!idCard) return '';

  const cleanIdCard = idCard.replace(/\s/g, '');

  if (cleanIdCard.length !== 18) {
    return idCard;
  }

  if (mask) {
    return `${cleanIdCard.slice(0, 6)}********${cleanIdCard.slice(14)}`;
  }

  return `${cleanIdCard.slice(0, 6)} ${cleanIdCard.slice(6, 14)} ${cleanIdCard.slice(14)}`;
};

/**
 * 格式化银行卡号
 * @param cardNumber - 银行卡号
 * @param mask - 是否隐藏部分数字
 * @returns 格式化后的银行卡号
 */
export const formatBankCard = (cardNumber: string, mask = false): string => {
  if (!cardNumber) return '';

  const cleanCardNumber = cardNumber.replace(/\D/g, '');

  if (mask) {
    return `**** **** **** ${cleanCardNumber.slice(-4)}`;
  }

  // 每四位分组
  const groups = cleanCardNumber.match(/\d{1,4}/g) || [];
  return groups.join(' ');
};

/**
 * 格式化日期
 * @param date - 日期
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: string | Date | undefined, format = 'YYYY-MM-DD'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * 格式化时间
 * @param date - 日期时间
 * @param format - 格式字符串
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: string | Date | undefined, format = 'HH:mm:ss'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * 格式化日期时间
 * @param date - 日期时间
 * @param format - 格式字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (
  date: string | Date | undefined,
  format = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * 格式化相对时间
 * @param date - 日期
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (date: string | Date | undefined): string => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

/**
 * 格式化时长
 * @param seconds - 秒数
 * @param options - 格式化选项
 * @returns 格式化后的时长字符串
 */
export const formatDuration = (
  seconds: number,
  options: {
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
    separator?: string;
  } = {}
): string => {
  const { showHours = true, showMinutes = true, showSeconds = true, separator = ':' } = options;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];

  if (showHours) {
    parts.push(hours.toString().padStart(2, '0'));
  }

  if (showMinutes) {
    parts.push(minutes.toString().padStart(2, '0'));
  }

  if (showSeconds) {
    parts.push(secs.toString().padStart(2, '0'));
  }

  return parts.join(separator);
};

/**
 * 格式化数组为字符串
 * @param array - 数组
 * @param separator - 分隔符
 * @param maxItems - 最大显示数量
 * @returns 格式化后的字符串
 */
export const formatArray = <T>(array: T[], separator = ', ', maxItems?: number): string => {
  if (!array || array.length === 0) return '';

  const items = maxItems ? array.slice(0, maxItems) : array;
  const formatted = items.map((item) => String(item)).join(separator);

  if (maxItems && array.length > maxItems) {
    return `${formatted} 等${array.length}项`;
  }

  return formatted;
};

/**
 * 格式化对象为字符串
 * @param obj - 对象
 * @param options - 格式化选项
 * @returns 格式化后的字符串
 */
export const formatObject = (
  obj: Record<string, any>,
  options: {
    separator?: string;
    keyValueSeparator?: string;
    indent?: string;
    maxDepth?: number;
  } = {}
): string => {
  const { separator = '\n', keyValueSeparator = ': ', indent = '', maxDepth = 3 } = options;

  if (maxDepth <= 0) {
    return '{...}';
  }

  const pairs = Object.entries(obj).map(([key, value]) => {
    const formattedValue =
      typeof value === 'object' && value !== null
        ? formatObject(value, { ...options, indent: indent + '  ', maxDepth: maxDepth - 1 })
        : String(value);

    return `${indent}${key}${keyValueSeparator}${formattedValue}`;
  });

  return `{${separator}${pairs.join(separator)}${separator}${indent.slice(0, -2)}}`;
};

/**
 * 格式化文本，截断过长的文本
 * @param text - 文本
 * @param maxLength - 最大长度
 * @param suffix - 后缀
 * @returns 格式化后的文本
 */
export const formatText = (text: string, maxLength: number, suffix = '...'): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * 格式化URL
 * @param url - URL地址
 * @param options - 格式化选项
 * @returns 格式化后的URL
 */
export const formatURL = (
  url: string,
  options: {
    showProtocol?: boolean;
    showWWW?: boolean;
    maxLength?: number;
  } = {}
): string => {
  if (!url) return '';

  const { showProtocol = true, showWWW = true, maxLength } = options;

  let formattedUrl = url;

  // 确保有协议
  if (!formattedUrl.match(/^https?:\/\//)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  // 移除www前缀
  if (!showWWW && formattedUrl.includes('://www.')) {
    formattedUrl = formattedUrl.replace('://www.', '://');
  }

  // 移除协议
  if (!showProtocol) {
    formattedUrl = formattedUrl.replace(/^https?:\/\//, '');
  }

  // 截断过长的URL
  if (maxLength && formattedUrl.length > maxLength) {
    formattedUrl = formattedUrl.slice(0, maxLength - 3) + '...';
  }

  return formattedUrl;
};

/**
 * 格式化关键字高亮
 * @param text - 文本
 * @param keywords - 关键字数组
 * @param highlightTag - 高亮标签
 * @returns 高亮后的HTML字符串
 */
export const formatHighlight = (
  text: string,
  keywords: string[],
  highlightTag = 'mark'
): string => {
  if (!text || keywords.length === 0) return text;

  let highlightedText = text;

  keywords.forEach((keyword) => {
    if (!keyword) return;

    const regex = new RegExp(`(${keyword})`, 'gi');
    highlightedText = highlightedText.replace(regex, `<${highlightTag}>$1</${highlightTag}>`);
  });

  return highlightedText;
};

/**
 * 格式化状态标签
 * @param status - 状态
 * @param statusMap - 状态映射
 * @param defaultLabel - 默认标签
 * @returns 状态信息对象
 */
export const formatStatus = <T extends string>(
  status: T,
  statusMap: Record<T, { label: string; color: string; type?: string }>,
  defaultLabel = '未知'
): { label: string; color: string; type?: string } => {
  return statusMap[status] || { label: defaultLabel, color: '#d9d9d9' };
};

/**
 * 格式化范围值
 * @param min - 最小值
 * @param max - 最大值
 * @param separator - 分隔符
 * @param unit - 单位
 * @returns 格式化后的范围字符串
 */
export const formatRange = (
  min: number | string,
  max: number | string,
  separator = '~',
  unit = ''
): string => {
  const minNum = typeof min === 'string' ? parseFloat(min) : min;
  const maxNum = typeof max === 'string' ? parseFloat(max) : max;

  if (isNaN(minNum) && isNaN(maxNum)) return '-';
  if (isNaN(minNum)) return `<= ${max}${unit}`;
  if (isNaN(maxNum)) return `>= ${min}${unit}`;
  if (minNum === maxNum) return `${min}${unit}`;

  return `${min}${separator}${max}${unit}`;
};

/**
 * 格式化枚举值
 * @param value - 枚举值
 * @param enumMap - 枚举映射
 * @param defaultValue - 默认值
 * @returns 格式化后的字符串
 */
export const formatEnum = <T extends string>(
  value: T | undefined,
  enumMap: Record<T, string>,
  defaultValue = '-'
): string => {
  if (value === undefined || value === null) return defaultValue;
  return enumMap[value] || defaultValue;
};

/**
 * 格式化布尔值
 * @param value - 布尔值
 * @param trueText - 真值文本
 * @param falseText - 假值文本
 * @returns 格式化后的文本
 */
export const formatBoolean = (
  value: boolean | undefined,
  trueText = '是',
  falseText = '否'
): string => {
  if (value === undefined || value === null) return '-';
  return value ? trueText : falseText;
};

/**
 * 格式化空值
 * @param value - 值
 * @param placeholder - 占位符
 * @returns 格式化后的值
 */
export const formatEmpty = <T>(value: T | undefined | null, placeholder = '-'): T | string => {
  return value === undefined || value === null || value === '' ? placeholder : value;
};
