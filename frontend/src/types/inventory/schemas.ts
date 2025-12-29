/**
 * @spec P005-bom-inventory-deduction
 * 库存相关 Zod 验证模式
 */

import { z } from 'zod';
import { TransactionType, SourceType, InventoryStatus } from './enums';

// Store Schema
export const StoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  address: z.string().optional(),
  contactInfo: z.string().optional(),
  managerInfo: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Product (SKU) Schema
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  skuId: z.string().optional(),
  skuCode: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  unit: z.string().optional(),
  mainUnit: z.string().optional(),
  price: z.number().optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  isActive: z.boolean().optional(),
});

export const InventoryTransactionSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  skuId: z.string(),
  transactionType: z.nativeEnum(TransactionType),
  quantity: z.number(),
  unitCost: z.number().optional(),
  totalCost: z.number().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  stockBefore: z.number(),
  stockAfter: z.number(),
  availableBefore: z.number(),
  availableAfter: z.number(),
  sourceType: z.nativeEnum(SourceType),
  sourceId: z.string().optional(),
  sourceDocument: z.string().optional(),
  operatorId: z.string(),
  transactionTime: z.string(),
  remarks: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const InventoryQueryParamsSchema = z.object({
  skuId: z.string().optional(),
  skuCode: z.string().optional(),
  storeId: z.string().optional(),
  storeCode: z.string().optional(),
  transactionType: z.array(z.nativeEnum(TransactionType)).optional(),
  sourceType: z.array(z.nativeEnum(SourceType)).optional(),
  status: z.array(z.nativeEnum(InventoryStatus)).optional(),
  dateRange: z.tuple([z.string(), z.string()]).optional(),
  operatorId: z.string().optional(),
  batchNumber: z.string().optional(),
  remarks: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['transactionTime', 'quantity', 'unitCost', 'totalCost', 'createdAt']).default('transactionTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  keyword: z.string().optional()
});

export const CurrentInventorySchema = z.object({
  id: z.string(),
  skuId: z.string(),
  sku: ProductSchema.optional(),
  storeId: z.string(),
  store: StoreSchema.optional(),
  availableQty: z.number(),
  onHandQty: z.number(),
  reservedQty: z.number().optional().default(0),
  inTransitQty: z.number().optional().default(0),
  damagedQty: z.number().optional().default(0),
  expiredQty: z.number().optional().default(0),
  lastTransactionTime: z.string().optional(),
  lastTransactionType: z.nativeEnum(TransactionType).optional(),
  totalValue: z.number().optional(),
  averageCost: z.number().optional(),
  reorderPoint: z.number().optional().default(0),
  maxStock: z.number().optional().default(0),
  minStock: z.number().optional().default(0),
  safetyStock: z.number().optional().default(0),
  lastUpdated: z.string().optional(),
  updatedAt: z.string().optional(),  // 后端返回的字段名
  // 后端返回的额外字段
  skuCode: z.string().optional(),
  skuName: z.string().optional(),
  storeName: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  mainUnit: z.string().optional(),
  inventoryStatus: z.string().optional()
});

// 配置选项
export const TRANSACTION_TYPE_OPTIONS = [
  { value: TransactionType.PURCHASE_IN, label: '采购入库', color: 'green' },
  { value: TransactionType.SALE_OUT, label: '销售出库', color: 'red' },
  { value: TransactionType.TRANSFER_IN, label: '调拨入库', color: 'blue' },
  { value: TransactionType.TRANSFER_OUT, label: '调拨出库', color: 'orange' },
  { value: TransactionType.ADJUSTMENT_IN, label: '盘点入库', color: 'cyan' },
  { value: TransactionType.ADJUSTMENT_OUT, label: '盘点出库', color: 'purple' },
  { value: TransactionType.RETURN_IN, label: '退货入库', color: 'lime' },
  { value: TransactionType.RETURN_OUT, label: '退货出库', color: 'magenta' },
  { value: TransactionType.DAMAGE_OUT, label: '损耗出库', color: 'volcano' },
  { value: TransactionType.PRODUCTION_IN, label: '生产入库', color: 'geekblue' },
  { value: TransactionType.EXPIRED_OUT, label: '过期出库', color: 'default' }
];

export const SOURCE_TYPE_OPTIONS = [
  { value: SourceType.PURCHASE_ORDER, label: '采购订单', color: 'blue' },
  { value: SourceType.SALES_ORDER, label: '销售订单', color: 'green' },
  { value: SourceType.TRANSFER_ORDER, label: '调拨订单', color: 'purple' },
  { value: SourceType.ADJUSTMENT_ORDER, label: '盘点单', color: 'orange' },
  { value: SourceType.RETURN_ORDER, label: '退货单', color: 'cyan' },
  { value: SourceType.MANUAL, label: '手工录入', color: 'gray' },
  { value: SourceType.PRODUCTION_ORDER, label: '生产单', color: 'geekblue' },
  { value: SourceType.SYSTEM_ADJUST, label: '系统调整', color: 'default' }
];

export const INVENTORY_STATUS_OPTIONS = [
  { value: InventoryStatus.AVAILABLE, label: '可用库存', color: 'green' },
  { value: InventoryStatus.RESERVED, label: '预留库存', color: 'orange' },
  { value: InventoryStatus.IN_TRANSIT, label: '在途库存', color: 'blue' },
  { value: InventoryStatus.DAMAGED, label: '损坏库存', color: 'red' },
  { value: InventoryStatus.EXPIRED, label: '过期库存', color: 'default' },
  { value: InventoryStatus.ON_ORDER, label: '在途库存', color: 'cyan' }
];
