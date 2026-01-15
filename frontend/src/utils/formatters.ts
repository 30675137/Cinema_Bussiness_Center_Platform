import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale('zh-cn');

/**
 * 格式化金额
 */
export const formatCurrency = (amount: number, currency = 'CNY', showSymbol = true): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `¥0.00` : '0.00';
  }

  const formatted = amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `¥${formatted}` : formatted;
};

/**
 * 格式化数字（千分位分隔）
 */
export const formatNumber = (num: number | string, precision = 0): string => {
  if (num === null || num === undefined || num === '') {
    return '0';
  }

  const number = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(number)) {
    return '0';
  }

  return number.toLocaleString('zh-CN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};

/**
 * 格式化百分比
 */
export const formatPercentage = (value: number, precision = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${(value * 100).toFixed(precision)}%`;
};

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  if (!date) {
    return '';
  }

  return dayjs(date).format(format);
};

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) {
    return '';
  }

  return dayjs(date).fromNow();
};

/**
 * 格式化手机号
 */
export const formatPhone = (phone: string): string => {
  if (!phone) {
    return '';
  }

  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '');

  // 中国手机号格式：138 0013 8000
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }

  // 固定电话格式：010-8000-8000
  if (cleaned.length >= 10) {
    if (cleaned.startsWith('0') && cleaned.length >= 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }

  return phone;
};

/**
 * 格式化手机号（别名）
 */
export const formatPhoneNumber = formatPhone;

/**
 * 格式化身份证号
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 8) {
    return idCard;
  }

  const length = idCard.length;
  const start = idCard.slice(0, 6);
  const end = idCard.slice(-4);
  const middle = '*'.repeat(length - 10);

  return `${start}${middle}${end}`;
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
 * 格式化数量（添加单位）
 */
export const formatQuantity = (quantity: number, unit = '', showZero = false): string => {
  if (quantity === null || quantity === undefined) {
    return showZero ? `0${unit}` : '';
  }

  if (quantity === 0 && !showZero) {
    return '';
  }

  const formatted = formatNumber(quantity, 0);
  return unit ? `${formatted}${unit}` : formatted;
};

/**
 * 格式化折扣
 */
export const formatDiscount = (discount: number): string => {
  if (discount === null || discount === undefined || isNaN(discount)) {
    return '-';
  }

  if (discount === 0) {
    return '无折扣';
  }

  return `${(discount * 10).toFixed(1)}折`;
};

/**
 * 格式化状态
 */
export const formatStatus = (
  status: string | number,
  statusMap: Record<string | number, string>
): string => {
  return statusMap[status] || String(status);
};

/**
 * 格式化地址
 */
export const formatAddress = (address: {
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
}): string => {
  const parts = [];

  if (address.province) {
    parts.push(address.province);
  }

  if (address.city && address.city !== address.province) {
    parts.push(address.city);
  }

  if (address.district) {
    parts.push(address.district);
  }

  if (address.detail) {
    parts.push(address.detail);
  }

  return parts.join('');
};

/**
 * 格式化用户名
 */
export const formatUserName = (user: { name?: string; username?: string }): string => {
  return user.name || user.username || '未知用户';
};

/**
 * 格式化订单号
 */
export const formatOrderNumber = (orderNumber: string): string => {
  if (!orderNumber) {
    return '';
  }

  // 确保大写
  return orderNumber.toUpperCase();
};

/**
 * 格式化SKU
 */
export const formatSKU = (sku: string): string => {
  if (!sku) {
    return '';
  }

  return sku.toUpperCase();
};

/**
 * 格式化进度条文本
 */
export const formatProgressText = (completed: number, total: number): string => {
  if (total === 0) {
    return '0%';
  }

  const percentage = Math.round((completed / total) * 100);
  return `${percentage}% (${completed}/${total})`;
};

/**
 * 格式化时长
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) {
    return '0秒';
  }

  const duration = dayjs.duration(seconds, 'seconds');
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const secs = duration.seconds();

  const parts = [];

  if (days > 0) {
    parts.push(`${days}天`);
  }

  if (hours > 0) {
    parts.push(`${hours}小时`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}分钟`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}秒`);
  }

  return parts.join('');
};

/**
 * 格式化比率
 */
export const formatRatio = (numerator: number, denominator: number, precision = 2): string => {
  if (denominator === 0) {
    return '0:0';
  }

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator);

  const simplifiedNumerator = Math.floor(numerator / divisor);
  const simplifiedDenominator = Math.floor(denominator / divisor);

  if (simplifiedDenominator === 1) {
    return simplifiedNumerator.toString();
  }

  return `${simplifiedNumerator}:${simplifiedDenominator}`;
};

/**
 * 格式化金额大写
 */
export const formatCurrencyChinese = (amount: number): string => {
  if (amount === 0) {
    return '零元整';
  }

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
  const decimals = ['角', '分'];

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return '零元整';
  }

  let result = '';

  // 处理整数部分
  let remaining = integerPart;
  let unitIndex = 0;

  while (remaining > 0 && unitIndex < units.length) {
    const digit = remaining % 10;
    if (digit > 0) {
      result = digits[digit] + units[unitIndex] + result;
    } else if (result.length > 0 && unitIndex < 4 && unitIndex % 4 === 0) {
      result = digits[0] + result;
    }
    remaining = Math.floor(remaining / 10);
    unitIndex++;
  }

  // 添加单位
  if (result.length > 0) {
    result += '元';
  }

  // 处理小数部分
  if (decimalPart > 0) {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;

    if (jiao > 0) {
      result += digits[jiao] + '角';
    }

    if (fen > 0) {
      result += digits[fen] + '分';
    }
  } else {
    result += '整';
  }

  // 处理负数
  if (amount < 0) {
    result = '负' + result;
  }

  return result;
};
