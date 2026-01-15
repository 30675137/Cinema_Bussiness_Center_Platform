import dayjs from 'dayjs';
import type { CurrentInventory, InventoryTransaction } from '@/types/inventory';
import { TransactionType, SourceType, InventoryStatus } from '@/types/inventory';

/**
 * 格式化库存数量
 * @param quantity - 数量
 * @param unit - 单位
 * @returns 格式化后的字符串
 */
export const formatQuantity = (quantity: number, unit?: string): string => {
  if (quantity === 0) return '0';

  const formattedNumber = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(quantity);

  return unit ? `${formattedNumber} ${unit}` : formattedNumber;
};

/**
 * 格式化金额
 * @param amount - 金额
 * @param currency - 货币符号
 * @returns 格式化后的字符串
 */
export const formatCurrency = (amount: number, currency = '¥'): string => {
  const formattedAmount = new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency}${formattedAmount}`;
};

/**
 * 格式化日期时间
 * @param date - 日期字符串或Date对象
 * @param format - 格式字符串
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  date: string | Date | undefined,
  format = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 计算库存状态
 * @param inventory - 库存信息
 * @returns 库存状态及其标签
 */
export const calculateInventoryStatus = (
  inventory: Pick<CurrentInventory, 'availableQty' | 'safetyStock' | 'minStock' | 'maxStock'>
): {
  status: 'out_of_stock' | 'low_stock' | 'normal' | 'overstock';
  label: string;
  color: string;
} => {
  const { availableQty, safetyStock, minStock, maxStock } = inventory;

  if (availableQty === 0) {
    return {
      status: 'out_of_stock',
      label: '缺货',
      color: 'red',
    };
  }

  if (availableQty < safetyStock || availableQty < minStock) {
    return {
      status: 'low_stock',
      label: '低于安全库存',
      color: 'orange',
    };
  }

  if (availableQty > maxStock) {
    return {
      status: 'overstock',
      label: '超库存',
      color: 'purple',
    };
  }

  return {
    status: 'normal',
    label: '正常',
    color: 'green',
  };
};

/**
 * 获取交易类型标签
 * @param type - 交易类型
 * @returns 标签和颜色
 */
export const getTransactionTypeLabel = (
  type: TransactionType
): { label: string; color: string } => {
  const labels: Record<TransactionType, { label: string; color: string }> = {
    [TransactionType.PURCHASE_IN]: { label: '采购入库', color: 'green' },
    [TransactionType.SALE_OUT]: { label: '销售出库', color: 'red' },
    [TransactionType.TRANSFER_IN]: { label: '调拨入库', color: 'blue' },
    [TransactionType.TRANSFER_OUT]: { label: '调拨出库', color: 'orange' },
    [TransactionType.ADJUSTMENT_IN]: { label: '盘盈入库', color: 'cyan' },
    [TransactionType.ADJUSTMENT_OUT]: { label: '盘亏出库', color: 'purple' },
    [TransactionType.RETURN_IN]: { label: '退货入库', color: 'lime' },
    [TransactionType.RETURN_OUT]: { label: '退货出库', color: 'magenta' },
    [TransactionType.DAMAGE_OUT]: { label: '损耗出库', color: 'volcano' },
    [TransactionType.PRODUCTION_IN]: { label: '生产入库', color: 'geekblue' },
    [TransactionType.EXPIRED_OUT]: { label: '过期出库', color: 'default' },
  };

  return labels[type] || { label: type, color: 'default' };
};

/**
 * 获取来源类型标签
 * @param type - 来源类型
 * @returns 标签和颜色
 */
export const getSourceTypeLabel = (type: SourceType): { label: string; color: string } => {
  const labels: Record<SourceType, { label: string; color: string }> = {
    [SourceType.PURCHASE_ORDER]: { label: '采购订单', color: 'blue' },
    [SourceType.SALES_ORDER]: { label: '销售订单', color: 'green' },
    [SourceType.TRANSFER_ORDER]: { label: '调拨订单', color: 'purple' },
    [SourceType.ADJUSTMENT_ORDER]: { label: '盘点单', color: 'orange' },
    [SourceType.RETURN_ORDER]: { label: '退货单', color: 'cyan' },
    [SourceType.MANUAL]: { label: '手工录入', color: 'gray' },
    [SourceType.PRODUCTION_ORDER]: { label: '生产单', color: 'geekblue' },
    [SourceType.SYSTEM_ADJUST]: { label: '系统调整', color: 'default' },
  };

  return labels[type] || { label: type, color: 'default' };
};

/**
 * 判断是否为入库交易
 * @param type - 交易类型
 * @returns 是否为入库
 */
export const isInboundTransaction = (type: TransactionType): boolean => {
  return [
    TransactionType.PURCHASE_IN,
    TransactionType.TRANSFER_IN,
    TransactionType.ADJUSTMENT_IN,
    TransactionType.RETURN_IN,
    TransactionType.PRODUCTION_IN,
  ].includes(type);
};

/**
 * 格式化交易数量（带正负号）
 * @param quantity - 数量
 * @param type - 交易类型
 * @param unit - 单位
 * @returns 格式化后的字符串
 */
export const formatTransactionQuantity = (
  quantity: number,
  type: TransactionType,
  unit?: string
): string => {
  const isInbound = isInboundTransaction(type);
  const sign = isInbound ? '+' : '-';
  const absQuantity = Math.abs(quantity);

  return `${sign}${formatQuantity(absQuantity, unit)}`;
};

/**
 * 计算库存周转率
 * @param outboundQty - 出库数量
 * @param avgInventory - 平均库存
 * @param days - 天数
 * @returns 周转率
 */
export const calculateTurnoverRate = (
  outboundQty: number,
  avgInventory: number,
  days = 30
): number => {
  if (avgInventory === 0) return 0;
  return (outboundQty / avgInventory) * (365 / days);
};

/**
 * 计算库存天数
 * @param currentQty - 当前库存
 * @param avgDailySales - 日均销量
 * @returns 库存天数
 */
export const calculateDaysOfInventory = (currentQty: number, avgDailySales: number): number => {
  if (avgDailySales === 0) return Infinity;
  return currentQty / avgDailySales;
};

/**
 * 生成SKU搜索关键词
 * @param sku - SKU信息
 * @returns 搜索关键词数组
 */
export const generateSKUSearchKeywords = (sku: {
  skuCode: string;
  name: string;
  category?: string;
}): string[] => {
  const keywords: string[] = [sku.skuCode.toLowerCase(), sku.name.toLowerCase()];

  if (sku.category) {
    keywords.push(sku.category.toLowerCase());
  }

  // 分词处理
  keywords.push(...sku.name.split(/\s+/).map((w) => w.toLowerCase()));

  return [...new Set(keywords)]; // 去重
};

/**
 * 过滤库存数据
 * @param inventories - 库存列表
 * @param keyword - 搜索关键词
 * @returns 过滤后的库存列表
 */
export const filterInventoriesByKeyword = (
  inventories: CurrentInventory[],
  keyword: string
): CurrentInventory[] => {
  if (!keyword || keyword.trim() === '') return inventories;

  const lowerKeyword = keyword.toLowerCase().trim();

  return inventories.filter((inventory) => {
    const skuCode = inventory.sku?.skuCode?.toLowerCase() || '';
    const skuName = inventory.sku?.name?.toLowerCase() || '';
    const storeCode = inventory.store?.code?.toLowerCase() || '';
    const storeName = inventory.store?.name?.toLowerCase() || '';

    return (
      skuCode.includes(lowerKeyword) ||
      skuName.includes(lowerKeyword) ||
      storeCode.includes(lowerKeyword) ||
      storeName.includes(lowerKeyword)
    );
  });
};

/**
 * 排序库存数据
 * @param inventories - 库存列表
 * @param sortBy - 排序字段
 * @param sortOrder - 排序顺序
 * @returns 排序后的库存列表
 */
export const sortInventories = (
  inventories: CurrentInventory[],
  sortBy: keyof CurrentInventory | 'status',
  sortOrder: 'asc' | 'desc' = 'asc'
): CurrentInventory[] => {
  return [...inventories].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortBy === 'status') {
      const aStatus = calculateInventoryStatus(a);
      const bStatus = calculateInventoryStatus(b);
      aValue = aStatus.status;
      bValue = bStatus.status;
    } else {
      aValue = a[sortBy];
      bValue = b[sortBy];
    }

    if (aValue === bValue) return 0;

    const comparison = aValue > bValue ? 1 : -1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

/**
 * 导出为CSV
 * @param data - 数据数组
 * @param filename - 文件名
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) return;

  // 获取表头
  const headers = Object.keys(data[0]);

  // 生成CSV内容
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // 处理包含逗号的值
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        })
        .join(',')
    ),
  ].join('\n');

  // 创建Blob并下载
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 批量选择辅助函数
 * @param selectedKeys - 已选中的key
 * @param key - 当前key
 * @param checked - 是否选中
 * @returns 新的选中key数组
 */
export const toggleSelection = (
  selectedKeys: string[],
  key: string,
  checked: boolean
): string[] => {
  if (checked) {
    return [...new Set([...selectedKeys, key])];
  } else {
    return selectedKeys.filter((k) => k !== key);
  }
};

/**
 * 批量选择全部
 * @param allKeys - 所有key
 * @param checked - 是否全选
 * @returns 新的选中key数组
 */
export const toggleSelectAll = (allKeys: string[], checked: boolean): string[] => {
  return checked ? [...allKeys] : [];
};
