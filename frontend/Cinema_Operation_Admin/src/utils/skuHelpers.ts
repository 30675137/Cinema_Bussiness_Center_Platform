/**
 * SKU工具函数
 */
import { SKU, SkuStatus } from '@/types/sku';

/**
 * 获取SKU状态文本
 */
export const getSkuStatusText = (status: SkuStatus): string => {
  const statusMap: Record<SkuStatus, string> = {
    [SkuStatus.DRAFT]: '草稿',
    [SkuStatus.ENABLED]: '启用',
    [SkuStatus.DISABLED]: '停用',
  };
  return statusMap[status] || '未知';
};

/**
 * 获取SKU状态颜色
 */
export const getSkuStatusColor = (status: SkuStatus): string => {
  const colorMap: Record<SkuStatus, string> = {
    [SkuStatus.DRAFT]: 'default',
    [SkuStatus.ENABLED]: 'success',
    [SkuStatus.DISABLED]: 'error',
  };
  return colorMap[status] || 'default';
};

/**
 * 格式化SKU编码显示
 */
export const formatSkuCode = (code: string): string => {
  return code || '-';
};

/**
 * 格式化条码显示
 */
export const formatBarcode = (barcode: string): string => {
  return barcode || '-';
};

/**
 * 格式化单位显示
 */
export const formatUnit = (unit: string): string => {
  return unit || '-';
};

/**
 * 检查SKU是否可以编辑
 */
export const canEditSku = (sku: SKU): boolean => {
  // 所有状态的SKU都可以编辑
  return true;
};

/**
 * 检查SKU是否可以启用
 */
export const canEnableSku = (sku: SKU): boolean => {
  return sku.status === SkuStatus.DRAFT || sku.status === SkuStatus.DISABLED;
};

/**
 * 检查SKU是否可以停用
 */
export const canDisableSku = (sku: SKU): boolean => {
  return sku.status === SkuStatus.ENABLED;
};

/**
 * 获取SKU的显示名称（包含编码）
 */
export const getSkuDisplayName = (sku: SKU): string => {
  return `${sku.code} - ${sku.name}`;
};

/**
 * 验证条码格式
 */
export const validateBarcodeFormat = (barcode: string): { valid: boolean; message?: string } => {
  if (!barcode) {
    return { valid: false, message: '条码不能为空' };
  }
  
  if (barcode.length < 8 || barcode.length > 20) {
    return { valid: false, message: '条码长度必须在8-20位之间' };
  }
  
  if (!/^[0-9A-Za-z]+$/.test(barcode)) {
    return { valid: false, message: '条码只能包含数字和字母' };
  }
  
  return { valid: true };
};

/**
 * 验证换算关系
 */
export const validateConversionRate = (rate: number): { valid: boolean; message?: string } => {
  if (!rate || rate <= 0) {
    return { valid: false, message: '换算关系必须大于0' };
  }
  
  if (!Number.isInteger(rate)) {
    return { valid: false, message: '换算关系必须是整数' };
  }
  
  return { valid: true };
};

/**
 * 格式化SKU创建时间
 */
export const formatSkuCreatedTime = (sku: SKU): string => {
  if (!sku.createdAt) return '-';
  return new Date(sku.createdAt).toLocaleString('zh-CN');
};

/**
 * 格式化SKU更新时间
 */
export const formatSkuUpdatedTime = (sku: SKU): string => {
  if (!sku.updatedAt) return '-';
  return new Date(sku.updatedAt).toLocaleString('zh-CN');
};

