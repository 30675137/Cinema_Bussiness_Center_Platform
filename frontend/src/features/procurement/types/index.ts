/**
 * @spec N001-purchase-inbound
 * 采购模块类型定义
 */

// 供应商
export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  contactPhone?: string;
  status: string;
}

// 门店简要信息
export interface StoreInfo {
  id: string;
  code: string;
  name: string;
}

// SKU简要信息
export interface SkuInfo {
  id: string;
  code: string;
  name: string;
  mainUnit?: string;
}

// 采购订单状态
export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PARTIAL_RECEIVED'
  | 'FULLY_RECEIVED'
  | 'CLOSED';

// N004: 物料信息
export interface MaterialInfo {
  id: string;
  code: string;
  name: string;
  specification?: string;
  purchaseUnit?: string;
  inventoryUnit?: string;
}

// 采购订单明细
// N004: 支持 MATERIAL 和 SKU 两种类型
export interface PurchaseOrderItem {
  id: string;
  itemType?: 'MATERIAL' | 'SKU';
  material?: MaterialInfo;
  materialName?: string;
  sku?: SkuInfo;
  unit?: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  receivedQty: number;
  pendingQty: number;
}

// 采购订单
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  store: StoreInfo;
  status: PurchaseOrderStatus;
  totalAmount: number;
  plannedArrivalDate?: string;
  remarks?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseOrderItem[];
}

/**
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 * 创建采购订单请求
 * N004: 支持 Material 和 SKU 两种类型
 */
export interface CreatePurchaseOrderRequest {
  supplierId: string;
  storeId: string;
  plannedArrivalDate?: string;
  remarks?: string;
  items: CreatePurchaseOrderItemRequest[];
}

/**
 * N004: 采购订单明细请求
 * - itemType: MATERIAL 或 SKU
 * - materialId: 物料采购时必填
 * - skuId: SKU 采购时必填
 */
export interface CreatePurchaseOrderItemRequest {
  itemType?: 'MATERIAL' | 'SKU';
  materialId?: string;
  skuId?: string;
  quantity: number;
  unitPrice: number;
}

// 采购订单查询参数
export interface PurchaseOrderQueryParams {
  storeId?: string;
  supplierId?: string;
  status?: PurchaseOrderStatus;
  page?: number;
  pageSize?: number;
}

// API 响应
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  timestamp: string;
}

// =====================
// 收货入库相关类型
// =====================

// 收货入库单状态
export type GoodsReceiptStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// 质检状态 (匹配后端枚举: QUALIFIED, UNQUALIFIED, PENDING_CHECK)
export type QualityStatus = 'QUALIFIED' | 'UNQUALIFIED' | 'PENDING_CHECK';

// 采购订单摘要（用于收货单）
export interface PurchaseOrderSummary {
  id: string;
  orderNumber: string;
  supplier: Supplier;
}

// 收货入库明细
export interface GoodsReceiptItem {
  id: string;
  sku: SkuInfo;
  orderedQty: number;
  receivedQty: number;
  qualityStatus: QualityStatus;
  rejectionReason?: string;
}

// 收货入库单
export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrder: PurchaseOrderSummary;
  store: StoreInfo;
  status: GoodsReceiptStatus;
  receivedBy?: string;
  receivedByName?: string;
  receivedAt?: string;
  remarks?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  items?: GoodsReceiptItem[];
}

// 创建收货入库单请求
export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string;
  remarks?: string;
  items: CreateGoodsReceiptItemRequest[];
}

// N004: 支持 MATERIAL 和 SKU 两种类型
export interface CreateGoodsReceiptItemRequest {
  itemType: 'MATERIAL' | 'SKU';
  materialId?: string;
  skuId?: string;
  receivedQty: number;
  qualityStatus?: string;
  rejectionReason?: string;
}

// 收货入库查询参数
export interface GoodsReceiptQueryParams {
  storeId?: string;
  status?: GoodsReceiptStatus;
  page?: number;
  pageSize?: number;
}

// =====================
// 采购订单跟踪相关类型
// =====================

// 状态变更历史
export interface PurchaseOrderStatusHistory {
  id: string;
  fromStatus: PurchaseOrderStatus | null;
  toStatus: PurchaseOrderStatus;
  changedBy?: string;
  changedByName?: string;
  remarks?: string;
  createdAt: string;
}

// 订单统计摘要
export interface PurchaseOrderSummary {
  draftCount: number;
  pendingApprovalCount: number;
  approvedCount: number;
  partialReceivedCount: number;
}
