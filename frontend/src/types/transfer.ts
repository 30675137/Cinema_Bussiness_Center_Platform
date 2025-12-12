/**
 * 调拨管理相关类型定义
 */

/**
 * 调拨状态枚举
 */
export enum TransferStatus {
  DRAFT = 'draft',                    // 草稿
  PENDING_APPROVAL = 'pending_approval', // 待审批
  APPROVED = 'approved',              // 已审批
  REJECTED = 'rejected',              // 已拒绝
  IN_TRANSIT = 'in_transit',          // 调拨中
  PARTIAL_RECEIVED = 'partial_received', // 部分收货
  COMPLETED = 'completed',            // 已完成
  CANCELLED = 'cancelled',            // 已取消
  EXCEPTION = 'exception'             // 异常
}

/**
 * 调拨类型枚举
 */
export enum TransferType {
  WAREHOUSE_TO_WAREHOUSE = 'warehouse_to_warehouse',   // 仓库间调拨
  STORE_TO_STORE = 'store_to_store',                   // 门店间调拨
  WAREHOUSE_TO_STORE = 'warehouse_to_store',           // 仓库到门店
  STORE_TO_WAREHOUSE = 'store_to_warehouse',           // 门店到仓库
  EMERGENCY = 'emergency'                              // 紧急调拨
}

/**
 * 调拨优先级枚举
 */
export enum TransferPriority {
  LOW = 'low',           // 低
  NORMAL = 'normal',     // 普通
  HIGH = 'high',         // 高
  URGENT = 'urgent'      // 紧急
}

/**
 * 运输方式枚举
 */
export enum ShippingMethod {
  SELF_PICKUP = 'self_pickup',         // 自提
  COMPANY_LOGISTICS = 'company_logistics', // 公司物流
  THIRD_PARTY_LOGISTICS = 'third_party_logistics', // 第三方物流
  EXPRESS = 'express'                  // 快递
}

/**
 * 调拨项接口
 */
export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  productName: string;
  productCode: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  unit: string;
  plannedQuantity: number;        // 计划数量
  actualQuantity?: number;        // 实际数量
  receivedQuantity?: number;      // 已收货数量
  unitPrice: number;              // 单价
  totalPrice: number;             // 总价
  batchNumber?: string;          // 批次号
  productionDate?: string;       // 生产日期
  expiryDate?: string;           // 过期日期
  remarks?: string;              // 备注
}

/**
 * 调拨记录接口
 */
export interface Transfer {
  id: string;
  transferNumber: string;        // 调拨单号
  type: TransferType;
  status: TransferStatus;
  priority: TransferPriority;

  // 基本信息
  title: string;                 // 调拨标题
  description?: string;          // 调拨描述

  // 位置信息
  fromLocation: {
    type: 'warehouse' | 'store';
    id: string;
    name: string;
    code: string;
    address?: string;
    contactName?: string;
    contactPhone?: string;
  };
  toLocation: {
    type: 'warehouse' | 'store';
    id: string;
    name: string;
    code: string;
    address?: string;
    contactName?: string;
    contactPhone?: string;
  };

  // 时间信息
  plannedDate: string;           // 计划调拨日期
  actualShipDate?: string;       // 实际发货日期
  actualReceiveDate?: string;    // 实际收货日期

  // 运输信息
  shippingMethod: ShippingMethod;
  trackingNumber?: string;       // 运输单号
  carrier?: string;              // 承运商
  estimatedArrivalDate?: string; // 预计到达日期

  // 金额信息
  totalAmount: number;           // 总金额
  shippingCost?: number;         // 运费
  insuranceCost?: number;        // 保险费

  // 申请人信息
  applicant: {
    id: string;
    name: string;
    department: string;
  };

  // 审批信息
  approver?: {
    id: string;
    name: string;
    position: string;
    approveTime?: string;
    remarks?: string;
  };

  // 操作信息
  operator?: {
    id: string;
    name: string;
    position: string;
  };

  // 项列表
  items: TransferItem[];

  // 附件信息
  attachments: TransferAttachment[];

  // 备注信息
  remarks?: string;

  // 审计信息
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

/**
 * 调拨附件接口
 */
export interface TransferAttachment {
  id: string;
  transferId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * 调拨统计信息接口
 */
export interface TransferStatistics {
  totalTransfers: number;
  draftTransfers: number;
  pendingApprovalTransfers: number;
  inTransitTransfers: number;
  completedTransfers: number;
  cancelledTransfers: number;

  // 按类型统计
  transfersByType: {
    warehouseToWarehouse: number;
    storeToStore: number;
    warehouseToStore: number;
    storeToWarehouse: number;
    emergency: number;
  };

  // 按状态统计
  transfersByStatus: {
    draft: number;
    pendingApproval: number;
    approved: number;
    inTransit: number;
    completed: number;
    cancelled: number;
  };

  // 金额统计
  totalAmount: number;
  monthAmount: number;
  averageAmount: number;

  // 时间统计
  averageProcessingTime: number;  // 平均处理时间（小时）
  averageTransitTime: number;     // 平均运输时间（小时）
}

/**
 * 调拨过滤条件接口
 */
export interface TransferFilters {
  search?: string;
  status?: TransferStatus | TransferStatus[];
  type?: TransferType | TransferType[];
  priority?: TransferPriority | TransferPriority[];
  fromLocation?: string;
  toLocation?: string;
  dateRange?: [string, string];
  applicant?: string;
  amountRange?: [number, number];
}

/**
 * 调拨查询参数接口
 */
export interface TransferQueryParams extends TransferFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 调拨表单数据接口
 */
export interface TransferFormData {
  type: TransferType;
  priority: TransferPriority;
  title: string;
  description?: string;
  fromLocationId: string;
  toLocationId: string;
  plannedDate: string;
  shippingMethod: ShippingMethod;
  estimatedArrivalDate?: string;
  items: Omit<TransferItem, 'id' | 'transferId' | 'totalPrice'>[];
  remarks?: string;
  attachments?: File[];
}

/**
 * 位置信息接口
 */
export interface Location {
  id: string;
  type: 'warehouse' | 'store';
  code: string;
  name: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  isActive: boolean;
}

/**
 * 库存查询结果接口
 */
export interface InventoryQueryResult {
  productId: string;
  productName: string;
  productCode: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  unitPrice: number;
  unit: string;
  location: string;
  batchNumber?: string;
  expiryDate?: string;
}

/**
 * 调拨操作日志接口
 */
export interface TransferLog {
  id: string;
  transferId: string;
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'shipped' | 'received' | 'cancelled' | 'modified';
  actionBy: {
    id: string;
    name: string;
  };
  actionTime: string;
  description: string;
  details?: Record<string, any>;
}

/**
 * 审批意见接口
 */
export interface ApprovalComment {
  id: string;
  transferId: string;
  approverId: string;
  approverName: string;
  action: 'approve' | 'reject' | 'request_more_info';
  comment: string;
  createdAt: string;
}

/**
 * 调拨通知接口
 */
export interface TransferNotification {
  id: string;
  transferId: string;
  recipientId: string;
  recipientName: string;
  type: 'created' | 'approved' | 'rejected' | 'shipped' | 'received' | 'delayed' | 'cancelled';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * 位置变更历史接口
 */
export interface LocationTransferHistory {
  id: string;
  productId: string;
  fromLocation: string;
  toLocation: string;
  transferId: string;
  transferNumber: string;
  quantity: number;
  transferDate: string;
  operator: string;
}

/**
 * 调拨报表数据接口
 */
export interface TransferReportData {
  period: string;
  totalTransfers: number;
  totalAmount: number;
  transfersByType: Record<string, number>;
  transfersByStatus: Record<string, number>;
  topLocations: {
    location: string;
    transferCount: number;
    totalAmount: number;
  }[];
  averageProcessingTime: number;
  completionRate: number;
}