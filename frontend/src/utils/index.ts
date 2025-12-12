/**
 * 工具函数统一导出
 */

// 数据验证相关
export * from './validation';

// 数据格式化相关
export * from './formatHelpers';

// SPU业务相关
export * from './spuHelpers';

// 库存管理相关
export * from './inventoryHelpers';

// 错误处理相关
export * from './errorHandler';

// 重新导出常用函数以便快速访问
export {
  // 验证函数
  validateField,
  validateObject,
  validateFieldAsync,
  FormValidator,
  createFormValidator,
  commonRules,
  asyncValidators,
} from './validation';

export {
  // 格式化函数
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatFileSize,
  formatPhone,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatArray,
  formatText,
  formatStatus,
  formatRange,
  formatEnum,
  formatBoolean,
  formatEmpty,
} from './formatHelpers';

export {
  // SPU相关
  formatSPUStatus,
  formatSPUCode,
  generateSPUCode,
  formatCategoryPath,
  formatBrandInfo,
  calculateSPUCompleteness,
  generateSPUSearchKeywords,
  filterSPUByKeyword,
  buildQueryParams,
  formatQueryParams,
  parseQueryParams,
  validateSPUData,
  compareSPUChanges,
  exportSPUToCSV,
} from './spuHelpers';

export {
  // 库存相关
  formatQuantity,
  calculateInventoryStatus,
  getTransactionTypeLabel,
  getSourceTypeLabel,
  formatTransactionQuantity,
  calculateTurnoverRate,
  calculateDaysOfInventory,
  generateSKUSearchKeywords,
  filterInventoriesByKeyword,
  sortInventories,
  exportToCSV,
  toggleSelection,
  toggleSelectAll,
} from './inventoryHelpers';