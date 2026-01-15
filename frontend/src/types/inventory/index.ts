/**
 * @spec P005-bom-inventory-deduction
 * 库存相关类型统一导出
 *
 * 这个文件是 src/types/inventory.ts 的重构版本
 * 将大文件拆分为更小的模块，提高可维护性和模块加载性能
 */

// 导出枚举类型
export { TransactionType, SourceType, InventoryStatus } from './enums';

// 导出实时库存类型
export type { CurrentInventory } from './current';

// 导出交易类型
export type { InventoryTransaction } from './transactions';

// 导出其他类型
export type {
  InventoryQueryParams,
  InventoryStatistics,
  TransactionDetail,
  InventoryReportParams,
  InventoryReportData,
  InventoryAlert,
  InventoryBatch,
  InventoryTransfer,
  InventoryTraceState,
  InventoryItem,
  InventoryAdjustment,
} from './types';

// 导出 Zod 验证模式和配置
export {
  StoreSchema,
  ProductSchema,
  InventoryTransactionSchema,
  InventoryQueryParamsSchema,
  CurrentInventorySchema,
  TRANSACTION_TYPE_OPTIONS,
  SOURCE_TYPE_OPTIONS,
  INVENTORY_STATUS_OPTIONS,
} from './schemas';
