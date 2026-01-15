/**
 * @spec P005-bom-inventory-deduction
 * 库存相关其他类型定义
 */

import type { TransactionType, SourceType, InventoryStatus } from './enums';
import type { InventoryTransaction } from './transactions';
import type { CurrentInventory } from './current';

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

// 库存项简化类型(用于列表显示)
export interface InventoryItem {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  storeId: string;
  storeName: string;
  availableQty: number;
  onHandQty: number;
  reservedQty: number;
  unitCost?: number;
  totalValue?: number;
  lastUpdated: string;
}

// 库存调整记录
export interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  storeId: string;
  store: Store;
  adjustmentType: 'physical_count' | 'system_correction' | 'damaged_goods' | 'expired_goods';
  status: 'draft' | 'pending_approval' | 'approved' | 'completed' | 'rejected';
  items: Array<{
    skuId: string;
    sku: Product;
    systemQuantity: number;
    physicalQuantity: number;
    variance: number;
    reason?: string;
  }>;
  totalVariance: number;
  adjustmentReason: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  completedBy?: string;
  completedAt?: string;
  remarks?: string;
}
