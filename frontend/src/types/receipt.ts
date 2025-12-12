/**
 * 收货管理相关类型定义
 */

import { OrderStatus, OrderPriority } from './purchase';

/**
 * 收货单状态
 */
export enum ReceiptStatus {
  DRAFT = 'draft',                    // 草稿
  PENDING = 'pending',                // 待收货
  PARTIAL_RECEIVED = 'partial_received', // 部分收货
  COMPLETED = 'completed',            // 已完成
  CANCELLED = 'cancelled',            // 已取消
  RETURNED = 'returned'               // 已退货
}

/**
 * 收货单优先级
 */
export enum ReceiptPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * 质检状态
 */
export enum QualityStatus {
  PENDING = 'pending',     // 待质检
  PASSED = 'passed',       // 质检合格
  FAILED = 'failed',       // 质检不合格
  EXCEPTION = 'exception'  // 质检异常
}

/**
 * 收货单明细
 */
export interface ReceiptItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  specification?: string;
  unit: string;
  orderedQuantity: number;      // 订单数量
  receivedQuantity: number;     // 实收数量
  qualifiedQuantity: number;    // 合格数量
  defectiveQuantity: number;    // 次品数量
  unitPrice: number;
  totalPrice: number;
  batchNumber?: string;         // 批次号
  productionDate?: string;      // 生产日期
  expiryDate?: string;          // 过期日期
  warehouseLocation?: string;   // 仓库位置
  qualityStatus: QualityStatus;
  qualityResult?: string;       // 质检结果
  images?: string[];            // 质检图片
  operator?: string;            // 操作员
  checkTime?: string;           // 检验时间
  remarks?: string;
}

/**
 * 供应商信息
 */
export interface ReceiptSupplier {
  id: string;
  code: string;
  name: string;
  contact?: string;
  phone?: string;
}

/**
 * 仓库信息
 */
export interface ReceiptWarehouse {
  id: string;
  code: string;
  name: string;
  location?: string;
  manager?: string;
}

/**
 * 收货单主表
 */
export interface Receipt {
  id: string;
  receiptNumber: string;          // 收货单号
  relatedOrderNumber?: string;    // 关联订单号
  status: ReceiptStatus;
  priority: ReceiptPriority;
  supplier: ReceiptSupplier;
  warehouse: ReceiptWarehouse;
  receiptDate: string;            // 收货日期
  expectedDate?: string;          // 预期到货日期
  operator: string;               // 收货员
  reviewer?: string;              // 复核人
  approvalUser?: string;          // 审批人

  // 数量统计
  totalItems: number;             // 总行数
  totalOrderedQuantity: number;   // 总订单数量
  totalReceivedQuantity: number;  // 总实收数量
  totalQualifiedQuantity: number; // 总合格数量
  totalDefectiveQuantity: number; // 总次品数量

  // 金额统计
  totalAmount: number;            // 总金额
  taxAmount: number;              // 税额
  totalAmountWithTax: number;     // 含税总金额

  items: ReceiptItem[];

  // 附件信息
  attachments?: {
    deliveryNote?: string[];     // 送货单
    qualityReport?: string[];    // 质检报告
    images?: string[];           // 现场照片
    other?: string[];            // 其他附件
  };

  remarks?: string;
  createdById: string;
  createdAt: string;
  updatedById: string;
  updatedAt: string;
}

/**
 * 创建收货单参数
 */
export interface CreateReceiptParams {
  relatedOrderNumber?: string;
  supplierId: string;
  warehouseId: string;
  expectedDate?: string;
  priority?: ReceiptPriority;
  items: Omit<ReceiptItem, 'id' | 'qualityStatus' | 'receivedQuantity' | 'qualifiedQuantity' | 'defectiveQuantity'>[];
  remarks?: string;
}

/**
 * 更新收货单参数
 */
export interface UpdateReceiptParams {
  status?: ReceiptStatus;
  priority?: ReceiptPriority;
  expectedDate?: string;
  reviewer?: string;
  items?: Partial<ReceiptItem>[];
  attachments?: {
    deliveryNote?: string[];
    qualityReport?: string[];
    images?: string[];
    other?: string[];
  };
  remarks?: string;
}

/**
 * 收货确认参数
 */
export interface ReceiptConfirmationParams {
  receiptId: string;
  items: {
    id: string;
    receivedQuantity: number;
    qualifiedQuantity: number;
    defectiveQuantity: number;
    batchNumber?: string;
    productionDate?: string;
    expiryDate?: string;
    warehouseLocation?: string;
    qualityStatus: QualityStatus;
    qualityResult?: string;
    images?: string[];
    remarks?: string;
  }[];
  images?: string[];
  remarks?: string;
}

/**
 * 质检参数
 */
export interface QualityCheckParams {
  receiptId: string;
  itemId: string;
  qualityStatus: QualityStatus;
  qualifiedQuantity?: number;
  defectiveQuantity?: number;
  qualityResult?: string;
  images?: string[];
  checkItems?: {
    name: string;
    result: 'pass' | 'fail' | 'exception';
    value?: string;
    standard?: string;
  }[];
  remarks?: string;
}

/**
 * 收货单查询参数
 */
export interface ReceiptQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ReceiptStatus;
  priority?: ReceiptPriority;
  supplierId?: string;
  warehouseId?: string;
  dateRange?: [string, string];
  receiptDateRange?: [string, string];
  operator?: string;
  sortBy?: 'receiptDate' | 'createdAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 收货单统计信息
 */
export interface ReceiptStatistics {
  totalReceipts: number;
  pendingReceipts: number;
  completedReceipts: number;
  partialReceipts: number;
  totalAmount: number;
  monthlyStats: {
    month: string;
    count: number;
    amount: number;
  }[];
  supplierStats: {
    supplierId: string;
    supplierName: string;
    receiptCount: number;
    totalAmount: number;
    qualifiedRate: number;
  }[];
  warehouseStats: {
    warehouseId: string;
    warehouseName: string;
    receiptCount: number;
    totalAmount: number;
  }[];
}

/**
 * 收货单过滤器
 */
export interface ReceiptFilter {
  status?: ReceiptStatus[];
  priority?: ReceiptPriority[];
  supplierIds?: string[];
  warehouseIds?: string[];
  dateRange?: [string, string];
  operators?: string[];
}

/**
 * 收货单操作日志
 */
export interface ReceiptLog {
  id: string;
  receiptId: string;
  action: 'create' | 'update' | 'confirm' | 'quality_check' | 'approve' | 'cancel' | 'return';
  actionText: string;
  operator: string;
  operatorName: string;
  timestamp: string;
  details?: string;
  beforeStatus?: ReceiptStatus;
  afterStatus?: ReceiptStatus;
}

/**
 * 退货记录
 */
export interface ReturnRecord {
  id: string;
  receiptId: string;
  receiptItemId: string;
  returnQuantity: number;
  returnReason: string;
  returnDate: string;
  processor: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  images?: string[];
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 质检标准
 */
export interface QualityStandard {
  id: string;
  productId: string;
  productName: string;
  checkItems: {
    name: string;
    type: 'visual' | 'dimensional' | 'functional' | 'chemical';
    standard: string;
    tolerance?: string;
    method: string;
    required: boolean;
  }[];
  version: string;
  effectiveDate: string;
  status: 'active' | 'inactive';
  createdById: string;
  createdAt: string;
}