import { z } from 'zod';

export interface InventoryTransaction {
  id: string;
  storeId: string;
  store: Store;
  skuId: string;
  sku: Product;
  transactionType: TransactionType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  stockBefore: number;
  stockAfter: number;
  availableBefore: number;
  availableAfter: number;
  sourceType: SourceType;
  sourceId?: string;
  sourceDocument?: string;
  operatorId: string;
  operator: User;
  transactionTime: string;
  remarks?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 库存类型枚举
export enum TransactionType {
  PURCHASE_IN = 'purchase_in',         // 采购入库
  SALE_OUT = 'sale_out',             // 销售出库
  TRANSFER_IN = 'transfer_in',         // 调拨入库
  TRANSFER_OUT = 'transfer_out',       // 调拨出库
  ADJUSTMENT_IN = 'adjustment_in',     // 盘点入库
  ADJUSTMENT_OUT = 'adjustment_out',   // 盘点出库
  RETURN_IN = 'return_in',           // 退货入库
  RETURN_OUT = 'return_out',         // 退货出库
  DAMAGE_OUT = 'damage_out',          // 损耗出库
  PRODUCTION_IN = 'production_in',     // 生产入库
  EXPIRED_OUT = 'expired_out'         // 过期出库
}

// 来源类型枚举
export enum SourceType {
  PURCHASE_ORDER = 'purchase_order',   // 采购订单
  SALES_ORDER = 'sales_order',       // 销售订单
  TRANSFER_ORDER = 'transfer_order',  // 调拨订单
  ADJUSTMENT_ORDER = 'adjustment_order', // 盘点单
  RETURN_ORDER = 'return_order',     // 退货单
  MANUAL = 'manual',                 // 手工录入
  PRODUCTION_ORDER = 'production_order', // 生产单
  SYSTEM_ADJUST = 'system_adjust'    // 系统调整
}

// 库存状态枚举
export enum InventoryStatus {
  AVAILABLE = 'available',     // 可用库存
  RESERVED = 'reserved',       // 预留库存
  IN_TRANSIT = 'in_transit',   // 在途库存
  DAMAGED = 'damaged',         // 损坏库存
  EXPIRED = 'expired',         // 过期库存
  ON_ORDER = 'on_order'       // 在途库存
}

// 库存查询参数
export interface InventoryQueryParams {
  skuId?: string;
  skuCode?: string;
  storeId?: string;
  storeCode?: string;
  transactionType?: TransactionType[];
  sourceType?: SourceType[];
  status?: InventoryStatus[];
  dateRange?: [string, string];
  operatorId?: string;
  batchNumber?: string;
  remarks?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'transactionTime' | 'quantity' | 'unitCost' | 'totalCost' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

// 实时库存信息
export interface CurrentInventory {
  id: string;
  skuId: string;
  sku: Product;
  storeId: string;
  store: Store;
  availableQty: number;
  onHandQty: number;
  reservedQty: number;
  inTransitQty: number;
  damagedQty: number;
  expiredQty: number;
  lastTransactionTime?: string;
  lastTransactionType?: TransactionType;
  totalValue?: number;
  averageCost?: number;
  reorderPoint: number;
  maxStock: number;
  minStock: number;
  safetyStock: number;
  lastUpdated: string;
}

// 库存统计
export interface InventoryStatistics {
  totalSKUs: number;
  totalStores: number;
  totalValue: number;
  totalTransactions: number;
  totalAvailable: number;
  totalReserved: number;
  totalInTransit: number;
  totalDamaged: number;
  totalExpired: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  expiredValue: number;
  damagedValue: number;
  transactionsByType: Record<TransactionType, number>;
  transactionsByStore: Record<string, number>;
  topMovingSKUs: Array<{
    skuId: string;
    skuCode: string;
    skuName: string;
    transactionCount: number;
    totalQuantity: number;
  }>;
  inventoryValueByStore: Array<{
    storeId: string;
    storeName: string;
    totalValue: number;
    totalSKUs: number;
  }>;
}

// 交易详情扩展
export interface TransactionDetail extends InventoryTransaction {
  relatedDocuments?: Array<{
    documentType: string;
    documentNumber: string;
    documentDate: string;
    documentUrl?: string;
  }>;
  approvalHistory?: Array<{
    approverId: string;
    approverName: string;
    approvalTime: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
  }>;
  location?: {
    warehouse: string;
    zone: string;
    rack: string;
    bin: string;
  };
  weatherConditions?: {
    temperature: number;
    humidity: number;
  };
}

// 库存报表查询参数
export interface InventoryReportParams {
  reportType: 'current_stock' | 'transaction_history' | 'movement_analysis' | 'valuation_report';
  dateRange?: [string, string];
  storeIds?: string[];
  skuIds?: string[];
  categoryIds?: string[];
  includeZeroStock?: boolean;
  format?: 'excel' | 'csv' | 'pdf';
  sortBy?: string;
  groupBy?: 'store' | 'category' | 'sku' | 'date';
}

// 库存报表数据
export interface InventoryReportData {
  reportType: string;
  generatedAt: string;
  generatedBy: string;
  dateRange: [string, string];
  summary: {
    totalRecords: number;
    totalValue: number;
    totalQuantity: number;
    averageCost: number;
  };
  data: Array<Record<string, any>>;
  charts?: Array<{
    type: 'line' | 'bar' | 'pie' | 'table';
    title: string;
    data: any[];
    config: Record<string, any>;
  }>;
}

// 库存警报设置
export interface InventoryAlert {
  id: string;
  skuId: string;
  storeId?: string;
  alertType: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'overstock' | 'movement_anomaly';
  thresholdValue: number;
  thresholdUnit: 'quantity' | 'percentage' | 'days';
  isEnabled: boolean;
  alertRecipients: string[];
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

// 库存批次信息
export interface InventoryBatch {
  id: string;
  skuId: string;
  storeId: string;
  batchNumber: string;
  manufactureDate?: string;
  expiryDate?: string;
  quantity: number;
  availableQuantity: number;
  unitCost: number;
  totalCost: number;
  location?: {
    warehouse: string;
    zone: string;
    rack: string;
    bin: string;
  };
  qualityStatus: 'good' | 'acceptable' | 'poor' | 'expired';
  supplierInfo?: {
    supplierId: string;
    supplierName: string;
    supplierCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 库存转移记录
export interface InventoryTransfer {
  id: string;
  transferNumber: string;
  fromStoreId: string;
  fromStore: Store;
  toStoreId: string;
  toStore: Store;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  items: Array<{
    skuId: string;
    sku: Product;
    quantity: number;
    unitCost?: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// 查询状态
export interface InventoryTraceState {
  query: InventoryQueryParams;
  currentStock: CurrentInventory | null;
  transactions: TransactionDetail[];
  loading: boolean;
  totalCount: number;
  statistics: InventoryStatistics | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedSKUs: string[];
  selectedStores: string[];
  alerts: InventoryAlert[];
  activeFilters: {
    dateRange?: [string, string];
    transactionTypes?: TransactionType[];
    sourceTypes?: SourceType[];
  };
}

// 前向声明
interface Store {
  id: string;
  name: string;
  code: string;
  address?: string;
  contactInfo?: string;
  managerInfo?: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  skuId: string;
  skuCode: string;
  description?: string;
  category?: string;
  unit?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  department?: string;
  position?: string;
}

// Zod 验证模式
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
  metadata: z.record(z.any()).optional(),
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
  storeId: z.string(),
  availableQty: z.number(),
  onHandQty: z.number(),
  reservedQty: z.number(),
  inTransitQty: z.number(),
  damagedQty: z.number(),
  expiredQty: number(),
  lastTransactionTime: z.string().optional(),
  lastTransactionType: z.nativeEnum(TransactionType).optional(),
  totalValue: z.number().optional(),
  averageCost: z.number().optional(),
  reorderPoint: z.number(),
  maxStock: z.number(),
  minStock: z.number(),
  safetyStock: z.number(),
  lastUpdated: z.string()
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