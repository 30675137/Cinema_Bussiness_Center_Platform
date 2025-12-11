/**
 * 库存管理工具函数
 * 提供数据处理、验证、格式化等通用功能
 */

import type {
  InventoryLedger,
  InventoryMovement,
  InventoryAdjustment,
  InventoryLedgerFilters,
  InventoryMovementFilters,
  InventoryAdjustmentFilters,
  SortParams,
  Pagination,
} from '@types/inventory';

// 日期格式化
export const formatDate = (dateString: string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return format
      .replace('YYYY', date.getFullYear().toString())
      .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace('DD', date.getDate().toString().padStart(2, '0'))
      .replace('HH', date.getHours().toString().padStart(2, '0'))
      .replace('mm', date.getMinutes().toString().padStart(2, '0'))
      .replace('ss', date.getSeconds().toString().padStart(2, '0'));
  } catch (error) {
    return dateString;
  }
};

// 日期相对格式化
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}天前`;
    } else if (diffHours > 0) {
      return `${diffHours}小时前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分钟前`;
    } else {
      return '刚刚';
    }
  } catch (error) {
    return dateString;
  }
};

// 数字格式化
export const formatNumber = (num: number, options: {
  decimals?: number;
  separator?: string;
  thousandsSeparator?: string;
} = {}): string => {
  const {
    decimals = 0,
    separator = '.',
    thousandsSeparator = ','
  } = options;

  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
    separator,
    thousandsSeparator,
  });
};

// 货币格式化
export const formatCurrency = (amount: number, currency = '¥'): string => {
  return `${currency}${formatNumber(amount, { decimals: 2 })}`;
};

// 库存状态标签配置
export const getStockStatusConfig = (status: string) => {
  const configs = {
    low: {
      color: 'warning',
      text: '库存不足',
      bgColor: '#fff7e6',
      borderColor: '#ffd591',
    },
    normal: {
      color: 'success',
      text: '正常',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f',
    },
    high: {
      color: 'info',
      text: '库存积压',
      bgColor: '#e6f7ff',
      borderColor: '#91d5ff',
    },
    out_of_stock: {
      color: 'error',
      text: '缺货',
      bgColor: '#fff1f0',
      borderColor: '#ffccc7',
    },
  };

  return configs[status as keyof typeof configs] || configs.normal;
};

// 库存变动类型配置
export const getMovementTypeConfig = (type: string) => {
  const configs = {
    in: {
      color: 'success',
      text: '入库',
      prefix: '+',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f',
    },
    out: {
      color: 'error',
      text: '出库',
      prefix: '-',
      bgColor: '#fff1f0',
      borderColor: '#ffccc7',
    },
    transfer_in: {
      color: 'processing',
      text: '调拨入库',
      prefix: '+',
      bgColor: '#e6f7ff',
      borderColor: '#91d5ff',
    },
    transfer_out: {
      color: 'processing',
      text: '调拨出库',
      prefix: '-',
      bgColor: '#fff7e6',
      borderColor: '#ffd591',
    },
    adjust_positive: {
      color: 'success',
      text: '盘盈',
      prefix: '+',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f',
    },
    adjust_negative: {
      color: 'error',
      text: '盘亏/报损',
      prefix: '-',
      bgColor: '#fff1f0',
      borderColor: '#ffccc7',
    },
  };

  return configs[type as keyof typeof configs] || configs.in;
};

// 调整类型配置
export const getAdjustmentTypeConfig = (type: string) => {
  const configs = {
    stocktaking_profit: {
      text: '盘盈',
      color: 'success',
      icon: 'check-circle',
    },
    stocktaking_loss: {
      text: '盘亏',
      color: 'error',
      icon: 'close-circle',
    },
    damage: {
      text: '报损',
      color: 'error',
      icon: 'warning',
    },
    expired: {
      text: '过期',
      color: 'warning',
      icon: 'clock-circle',
    },
    other: {
      text: '其他',
      color: 'default',
      icon: 'info-circle',
    },
  };

  return configs[type as keyof typeof configs] || configs.other;
};

// 调整状态配置
export const getAdjustmentStatusConfig = (status: string) => {
  const configs = {
    pending: {
      text: '待审批',
      color: 'warning',
      icon: 'clock-circle',
    },
    approved: {
      text: '已批准',
      color: 'processing',
      icon: 'check-circle',
    },
    rejected: {
      text: '已拒绝',
      color: 'error',
      icon: 'close-circle',
    },
    completed: {
      text: '已完成',
      color: 'success',
      icon: 'check-circle',
    },
  };

  return configs[status as keyof typeof configs] || configs.pending;
};

// 库存数据验证
export const validateInventoryData = (item: InventoryLedger): string[] => {
  const errors: string[] = [];

  if (!item.sku || item.sku.trim() === '') {
    errors.push('SKU不能为空');
  }

  if (!item.productName || item.productName.trim() === '') {
    errors.push('商品名称不能为空');
  }

  if (!item.locationId || item.locationId.trim() === '') {
    errors.push('位置ID不能为空');
  }

  if (item.physicalQuantity < 0) {
    errors.push('现存库存不能为负数');
  }

  if (item.reservedQuantity < 0) {
    errors.push('预占库存不能为负数');
  }

  if (item.availableQuantity < 0) {
    errors.push('可用库存不能为负数');
  }

  if (item.inTransitQuantity < 0) {
    errors.push('在途库存不能为负数');
  }

  if (item.safetyStock < 0) {
    errors.push('安全库存不能为负数');
  }

  // 验证库存数量逻辑
  const calculatedAvailable = item.physicalQuantity - item.reservedQuantity;
  if (item.availableQuantity !== calculatedAvailable) {
    errors.push('可用库存计算错误（应为现存 - 预占）');
  }

  return errors;
};

// 库存流水数据验证
export const validateMovementData = (item: InventoryMovement): string[] => {
  const errors: string[] = [];

  if (!item.sku || item.sku.trim() === '') {
    errors.push('SKU不能为空');
  }

  if (!item.movementType) {
    errors.push('变动类型不能为空');
  }

  if (!item.movementSubtype) {
    errors.push('变动子类型不能为空');
  }

  if (!item.operatorName || item.operatorName.trim() === '') {
    errors.push('操作员不能为空');
  }

  if (item.quantity === 0) {
    errors.push('变动数量不能为0');
  }

  return errors;
};

// 库存调整数据验证
export const validateAdjustmentData = (item: InventoryAdjustment): string[] => {
  const errors: string[] = [];

  if (!item.sku || item.sku.trim() === '') {
    errors.push('SKU不能为空');
  }

  if (!item.locationId || item.locationId.trim() === '') {
    errors.push('位置ID不能为空');
  }

  if (!item.adjustmentType) {
    errors.push('调整类型不能为空');
  }

  if (!item.reason || item.reason.trim() === '') {
    errors.push('调整原因不能为空');
  }

  if (item.originalQuantity < 0) {
    errors.push('原始数量不能为负数');
  }

  if (item.adjustedQuantity < 0) {
    errors.push('调整后数量不能为负数');
  }

  return errors;
};

// 筛选条件构建
export const buildFilterParams = (
  filters: InventoryLedgerFilters | InventoryMovementFilters | InventoryAdjustmentFilters
): Record<string, any> => {
  const params: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  return params;
};

// 排序参数构建
export const buildSortParams = (sort: SortParams): Record<string, any> => {
  const params: Record<string, any> = {};

  if (sort.sortBy) {
    params.sortBy = sort.sortBy;
    params.sortOrder = sort.sortOrder || 'desc';
  }

  return params;
};

// 分页参数构建
export const buildPaginationParams = (pagination: Partial<Pagination>): Record<string, any> => {
  const params: Record<string, any> = {};

  if (pagination.current) {
    params.current = pagination.current;
  }

  if (pagination.pageSize) {
    params.pageSize = pagination.pageSize;
  }

  return params;
};

// 计算库存统计
export const calculateInventoryStatistics = (data: InventoryLedger[]) => {
  const totalItems = data.length;
  const lowStockItems = data.filter(item => item.stockStatus === 'low').length;
  const outOfStockItems = data.filter(item => item.stockStatus === 'out_of_stock').length;
  const totalQuantity = data.reduce((sum, item) => sum + item.physicalQuantity, 0);
  const reservedQuantity = data.reduce((sum, item) => sum + item.reservedQuantity, 0);
  const availableQuantity = data.reduce((sum, item) => sum + item.availableQuantity, 0);
  const inTransitQuantity = data.reduce((sum, item) => sum + item.inTransitQuantity, 0);
  const totalValue = data.reduce((sum, item) => sum + (item.physicalQuantity * (item.sellingPrice || 0)), 0);

  return {
    totalItems,
    lowStockItems,
    outOfStockItems,
    totalQuantity,
    reservedQuantity,
    availableQuantity,
    inTransitQuantity,
    totalValue,
  };
};

// 生成库存台账导出数据
export const generateExportData = (
  data: InventoryLedger[],
  columns: string[] = [
    'SKU',
    '商品名称',
    '仓库',
    '现存库存',
    '可用库存',
    '预占库存',
    '在途库存',
    '安全库存',
    '库存状态',
    '最后更新时间',
  ]
): string[][] => {
  const headers = [...columns];
  const rows = data.map(item => [
    item.sku,
    item.productName,
    item.locationName,
    item.physicalQuantity.toString(),
    item.availableQuantity.toString(),
    item.reservedQuantity.toString(),
    item.inTransitQuantity.toString(),
    item.safetyStock.toString(),
    getStockStatusConfig(item.stockStatus).text,
    formatDate(item.lastUpdated),
  ]);

  return [headers, ...rows];
};

// 生成库存流水导出数据
export const generateMovementsExportData = (
  data: InventoryMovement[],
  columns: string[] = [
    'ID',
    'SKU',
    '商品名称',
    '仓库',
    '变动类型',
    '变动子类型',
    '变动数量',
    '变动后余额',
    '单据号',
    '操作员',
    '操作时间',
  ]
): string[][] => {
  const headers = [...columns];
  const rows = data.map(item => {
    const typeConfig = getMovementTypeConfig(item.movementType);
    return [
      item.id,
      item.sku,
      item.productName,
      item.locationName,
      typeConfig.text,
      item.movementSubtype,
      `${typeConfig.prefix}${Math.abs(item.quantity)}`,
      item.balanceAfter.toString(),
      item.referenceNo || '',
      item.operatorName,
      formatDate(item.operationTime),
    ];
  });

  return [headers, ...rows];
};

// 搜索高亮
export const highlightSearchText = (text: string, searchText: string): string => {
  if (!searchText || searchText.trim() === '') {
    return text;
  }

  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  });
};

// 节流函数
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func(...args);
    }
  });
};

// 数组去重
export const uniqueArray = <T>(array: T[], key?: keyof T): T[] => {
  if (!Array.isArray(array)) {
    return [];
  }

  const seen = new Set();
  return array.filter(item => {
    const identifier = key ? item[key] : JSON.stringify(item);
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
};

// 深拷贝对象
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  const cloned = {} as T;
  Object.keys(obj).forEach(key => {
    if (obj.hasOwnProperty(key)) {
      cloned[key as keyof T] = deepClone(obj[key as any]);
    }
  });

  return cloned;
};

// 错误处理
export class InventoryError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'InventoryError';
  }
}

// 网络请求错误处理
export const handleApiError = (error: any): InventoryError => {
  if (error instanceof InventoryError) {
    return error;
  }

  if (error?.response?.data?.message) {
    return new InventoryError(error.response.data.message, error.response.data.code);
  }

  if (error?.message) {
    return new InventoryError(error.message);
  }

  return new InventoryError('未知错误');
};

// 本地存储工具
export const storage = {
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('无法保存到本地存储:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('无法从本地存储删除:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('无法清空本地存储:', error);
    }
  },
};

// 会话存储
export const session = {
  get: (key: string): any => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('无法保存到会话存储:', error);
    }
  },

  remove: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('无法从会话存储删除:', error);
    }
  },

  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('无法清空会话存储:', error);
    }
  },
};

// 文件下载
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 生成UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 数据导出
export const exportToCSV = (data: string[][], filename: string): void => {
  const csvContent = data.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
  downloadFile(blob, filename);
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 生成随机ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${generateUUID().replace(/-/g, '').substring(0, 8)}`;
};

// 比较函数
export const compareStrings = (a: string, b: string): number => {
  return a.localeCompare(b, 'zh-CN');
};

export const compareNumbers = (a: number, b: number): number => {
  return a - b;
};

export const compareDates = (a: string, b: string): number => {
  return new Date(a).getTime() - new Date(b).getTime();
};