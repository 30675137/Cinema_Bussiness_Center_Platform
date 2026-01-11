/**
 * 采购管理相关类型定义
 * @spec N001-purchase-inbound
 * @spec N004-procurement-material-selector
 */
import { User, ContactInfo, Address, ApprovalRecord, Attachment } from './common';
import { MaterialDTO, MaterialCategory } from './material';

// 采购订单状态枚举
export enum PurchaseOrderStatus {
  DRAFT = 'draft', // 草稿
  PENDING = 'pending', // 待审核
  APPROVED = 'approved', // 已审核
  REJECTED = 'rejected', // 已拒绝
  CONFIRMED = 'confirmed', // 已确认
  PARTIAL_RECEIVED = 'partial_received', // 部分收货
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

// 采购订单优先级枚举
export enum PurchaseOrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 采购订单项状态枚举
export enum PurchaseOrderItemStatus {
  PENDING = 'pending', // 待收货
  PARTIAL_RECEIVED = 'partial_received', // 部分收货
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

/**
 * N004: 采购订单明细类型枚举
 * MATERIAL - 物料采购（原料/包材）
 * SKU - 成品采购
 */
export enum PurchaseOrderItemType {
  MATERIAL = 'MATERIAL',
  SKU = 'SKU',
}

// 收货单状态枚举
export enum GoodsReceiptStatus {
  DRAFT = 'draft', // 草稿
  PENDING_INSPECTION = 'pending_inspection', // 待检验
  INSPECTING = 'inspecting', // 检验中
  QUALIFIED = 'qualified', // 质检合格
  UNQUALIFIED = 'unqualified', // 质检不合格
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

// 供应商信息接口
export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: 'material' | 'service' | 'equipment' | 'other';
  category: string;
  contactInfo: ContactInfo;
  address: Address;
  bankAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  taxNumber?: string;
  creditCode?: string;
  businessLicense?: string;
  rating: number; // 评级 1-5
  cooperationYears: number;
  paymentTerms: string;
  deliveryTerms: string;
  status: 'active' | 'inactive' | 'blacklisted';
  remarks?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// 商品信息接口
export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  specifications?: Record<string, any>;
  unit: string;
  description?: string;
  barcode?: string;
  qrCode?: string;
  images?: string[];
  minStock: number;
  maxStock: number;
  currentStock: number;
  averageCost: number;
  lastPurchasePrice: number;
  lastSalePrice: number;
  status: 'active' | 'inactive' | 'discontinued';
  supplier?: Supplier;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// 采购订单项接口
export interface PurchaseOrderItem {
  id: string;
  /**
   * N004: 物品类型 (MATERIAL 或 SKU)
   */
  itemType?: PurchaseOrderItemType;
  /**
   * N004: 物料信息 (itemType=MATERIAL 时填充)
   */
  material?: MaterialDTO;
  /**
   * N004: 物料名称冗余 (soft-delete 场景)
   */
  materialName?: string;
  productId?: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  /**
   * N004: 单位 (Material.purchaseUnit 或 SKU.mainUnit)
   */
  unit?: string;
  taxRate?: number;
  taxAmount?: number;
  subtotal?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount?: number;
  lineAmount?: number;
  receivedQuantity?: number;
  receivedQty?: number;
  remainingQuantity?: number;
  pendingQty?: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status?: PurchaseOrderItemStatus;
  remarks?: string;
  warehouseLocation?: string;
  qualityRequirements?: string;
  attachments?: Attachment[];
}

// 采购订单接口
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  title: string;
  description?: string;
  status: PurchaseOrderStatus;
  priority: PurchaseOrderPriority;
  supplier: Supplier;
  items: PurchaseOrderItem[];

  // 金额信息
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  shippingCost: number;
  otherFees: number;
  totalAmount: number;
  currency: string;

  // 日期信息
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;

  // 审批信息
  approvalRecords?: ApprovalRecord[];
  approvedBy?: User;
  approvedAt?: string;

  // 人员信息
  createdBy: User;
  updatedBy?: User;
  assignedTo?: User;

  // 付款信息
  paymentTerms: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;

  // 收货信息
  receiptStatus: 'pending' | 'partial' | 'completed';
  totalReceived: number;

  // 附件和备注
  attachments?: Attachment[];
  remarks?: string;
  internalNotes?: string;

  // 系统字段
  createdAt: string;
  updatedAt: string;
  version: number;
}

// 收货单接口
export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  title: string;
  description?: string;
  status: GoodsReceiptStatus;

  // 关联采购订单
  purchaseOrderId: string;
  purchaseOrder: PurchaseOrder;

  // 收货明细
  items: GoodsReceiptItem[];

  // 收货信息
  receiptDate: string;
  receivedBy: User;
  inspectedBy?: User;
  inspectionDate?: string;
  warehouseId: string;
  warehouseLocation: string;

  // 质检信息
  qualityStatus?: 'qualified' | 'unqualified' | 'pending';
  qualityReport?: string;
  nonConformanceReport?: string;

  // 附件和备注
  attachments?: Attachment[];
  remarks?: string;

  // 系统字段
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// 收货单明细接口
export interface GoodsReceiptItem {
  id: string;
  purchaseOrderItemId: string;
  purchaseOrderItem: PurchaseOrderItem;

  // 收货数量
  orderedQuantity: number;
  receivedQuantity: number;
  defectiveQuantity: number;
  acceptedQuantity: number;

  // 质检结果
  qualityStatus: 'qualified' | 'unqualified' | 'pending' | 'exempted';
  inspectionResults?: {
    appearance: string;
    specification: string;
    function: string;
    packaging: string;
    other: string;
  };

  // 存储位置
  warehouseLocation: string;
  batchNumber?: string;
  expirationDate?: string;

  // 备注
  remarks?: string;
  attachments?: Attachment[];
}

// 采购统计接口
export interface PurchaseStatistics {
  // 订单统计
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;

  // 金额统计
  totalPurchaseAmount: number;
  monthlyPurchaseAmount: number;
  averageOrderValue: number;

  // 供应商统计
  totalSuppliers: number;
  activeSuppliers: number;
  topSuppliers: Array<{
    supplier: Supplier;
    totalAmount: number;
    orderCount: number;
  }>;

  // 商品统计
  topProducts: Array<{
    product: Product;
    totalQuantity: number;
    totalAmount: number;
  }>;

  // 效率统计
  averageApprovalTime: number; // 平均审核时间（小时）
  averageDeliveryTime: number; // 平均交付时间（天）
  onTimeDeliveryRate: number; // 按时交付率
}

// 采购查询参数接口
export interface PurchaseOrderQueryParams {
  keyword?: string;
  status?: PurchaseOrderStatus | PurchaseOrderStatus[];
  priority?: PurchaseOrderPriority;
  supplierId?: string;
  createdBy?: string;
  assignedTo?: string;
  orderDateRange?: [string, string];
  expectedDeliveryDateRange?: [string, string];
  amountRange?: [number, number];
  paymentStatus?: string;
  receiptStatus?: string;
}

// 供应商查询参数接口
export interface SupplierQueryParams {
  keyword?: string;
  type?: string;
  category?: string;
  status?: string;
  ratingRange?: [number, number];
  cooperationYearsRange?: [number, number];
}

// 商品查询参数接口
export interface ProductQueryParams {
  keyword?: string;
  category?: string;
  brand?: string;
  status?: string;
  stockRange?: [number, number];
  priceRange?: [number, number];
}

// 采购订单表单数据接口
export interface PurchaseOrderFormData {
  title: string;
  description?: string;
  priority: PurchaseOrderPriority;
  supplierId: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  items: PurchaseOrderItemFormData[];
  remarks?: string;
  attachments?: File[];
}

// 采购订单项表单数据接口
export interface PurchaseOrderItemFormData {
  /**
   * N004: 物品类型 (MATERIAL 或 SKU)
   */
  itemType: PurchaseOrderItemType;
  /**
   * N004: 物料ID (itemType=MATERIAL 时必填)
   */
  materialId?: string;
  /**
   * SKU ID (itemType=SKU 时必填)
   */
  skuId?: string;
  productId?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountRate?: number;
  expectedDeliveryDate?: string;
  warehouseLocation?: string;
  qualityRequirements?: string;
  remarks?: string;
}

/**
 * N004: 创建采购订单明细请求 DTO
 */
export interface CreatePurchaseOrderItemRequest {
  /** 物品类型 (MATERIAL 或 SKU) */
  itemType: PurchaseOrderItemType;
  /** 物料ID (itemType=MATERIAL 时必填) */
  materialId?: string;
  /** SKU ID (itemType=SKU 时必填) */
  skuId?: string;
  /** 采购数量 */
  quantity: number;
  /** 单价 */
  unitPrice: number;
}

// 供应商表单数据接口
export interface SupplierFormData {
  code: string;
  name: string;
  type: string;
  category: string;
  contactInfo: ContactInfo;
  address: Address;
  bankAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  taxNumber?: string;
  creditCode?: string;
  businessLicense?: File;
  rating: number;
  paymentTerms: string;
  deliveryTerms: string;
  remarks?: string;
}

// 收货单表单数据接口
export interface GoodsReceiptFormData {
  title: string;
  description?: string;
  purchaseOrderId: string;
  receiptDate: string;
  warehouseId: string;
  warehouseLocation: string;
  items: GoodsReceiptItemFormData[];
  remarks?: string;
  attachments?: File[];
}

// 收货单明细表单数据接口
export interface GoodsReceiptItemFormData {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  defectiveQuantity: number;
  warehouseLocation: string;
  batchNumber?: string;
  expirationDate?: string;
  qualityStatus: 'qualified' | 'unqualified' | 'pending' | 'exempted';
  inspectionResults?: {
    appearance: string;
    specification: string;
    function: string;
    packaging: string;
    other: string;
  };
  remarks?: string;
  attachments?: File[];
}

// 采购工作流步骤枚举
export enum PurchaseWorkflowStep {
  CREATE = 'create',
  REVIEW = 'review',
  APPROVE = 'approve',
  CONFIRM = 'confirm',
  RECEIVE = 'receive',
  INSPECT = 'inspect',
  COMPLETE = 'complete',
}

// 采购工作流配置接口
export interface PurchaseWorkflowConfig {
  enabled: boolean;
  steps: PurchaseWorkflowStep[];
  approvers: Record<PurchaseWorkflowStep, User[]>;
  conditions: Record<
    PurchaseWorkflowStep,
    {
      minAmount?: number;
      maxAmount?: number;
      requiredRoles?: string[];
    }
  >;
}

// 采购预算接口
export interface PurchaseBudget {
  id: string;
  department: string;
  category: string;
  year: number;
  quarter?: number;
  month?: number;
  budgetAmount: number;
  usedAmount: number;
  remainingAmount: number;
  status: 'active' | 'expired' | 'exceeded';
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}
