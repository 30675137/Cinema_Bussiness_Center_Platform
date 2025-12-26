/**
 * P004-inventory-adjustment: 库存调整类型定义
 * 
 * 包含库存调整管理所需的全部类型定义
 */

// ==================== 枚举类型 ====================

/**
 * 调整类型
 * - surplus: 盘盈（增加库存）
 * - shortage: 盘亏（减少库存）
 * - damage: 报损（减少库存并标记损耗）
 */
export type AdjustmentType = 'surplus' | 'shortage' | 'damage';

/**
 * 调整状态
 */
export type AdjustmentStatus =
  | 'draft'              // 草稿
  | 'pending_approval'   // 待审批
  | 'approved'           // 已审批通过
  | 'rejected'           // 已拒绝
  | 'withdrawn';         // 已撤回

/**
 * 审批操作类型
 */
export type ApprovalAction = 'approve' | 'reject' | 'withdraw';

// ==================== 核心实体类型 ====================

/**
 * 调整原因
 */
export interface AdjustmentReason {
  id: string;
  code: string;
  name: string;
  category: AdjustmentType;
  isActive: boolean;
  sortOrder: number;
}

/**
 * SKU 简要信息
 */
export interface SkuInfo {
  id: string;
  code: string;
  name: string;
  unit?: string;
  unitPrice?: number;
}

/**
 * 门店简要信息
 */
export interface StoreInfo {
  id: string;
  code: string;
  name: string;
}

/**
 * 库存调整记录
 */
export interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  skuId: string;
  sku?: SkuInfo;
  storeId: string;
  store?: StoreInfo;
  adjustmentType: AdjustmentType;
  quantity: number;
  unitPrice: number;
  adjustmentAmount: number;
  reasonCode: string;
  reasonText?: string;
  remarks?: string;
  status: AdjustmentStatus;
  stockBefore: number;
  stockAfter: number;
  availableBefore: number;
  availableAfter: number;
  requiresApproval: boolean;
  operatorId: string;
  operatorName: string;
  approvedAt?: string;
  approvedBy?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  // 关联审批历史（详情时返回）
  approvalHistory?: ApprovalRecord[];
}

/**
 * 审批记录
 */
export interface ApprovalRecord {
  id: string;
  adjustmentId: string;
  approverId: string;
  approverName: string;
  action: ApprovalAction;
  statusBefore: AdjustmentStatus;
  statusAfter: AdjustmentStatus;
  comments?: string;
  actionTime: string;
  createdAt: string;
}

// ==================== 请求类型 ====================

/**
 * 创建调整请求
 */
export interface CreateAdjustmentRequest {
  skuId: string;
  storeId: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reasonCode: string;
  reasonText?: string;
  remarks?: string;
}

/**
 * 审批请求
 */
export interface ApprovalRequest {
  action: 'approve' | 'reject';
  comments?: string;
}

/**
 * 安全库存更新请求
 */
export interface UpdateSafetyStockRequest {
  safetyStock: number;
  version: number;
}

/**
 * 调整列表查询参数
 */
export interface AdjustmentQueryParams {
  skuId?: string;
  storeId?: string;
  status?: AdjustmentStatus[];
  adjustmentType?: AdjustmentType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 流水查询参数
 */
export interface TransactionQueryParams {
  skuId?: string;
  storeId?: string;
  transactionTypes?: string[];
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// ==================== 响应类型 ====================

/**
 * 通用 API 响应
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 调整记录响应
 */
export type AdjustmentResponse = ApiResponse<InventoryAdjustment>;

/**
 * 调整列表响应
 */
export type AdjustmentListResponse = PaginatedResponse<InventoryAdjustment>;

/**
 * 调整详情响应（包含审批历史）
 */
export type AdjustmentDetailResponse = ApiResponse<InventoryAdjustment>;

/**
 * 审批响应
 */
export interface ApprovalResponse extends ApiResponse<InventoryAdjustment> {
  message?: string;
}

/**
 * 原因列表响应
 */
export type ReasonListResponse = ApiResponse<AdjustmentReason[]>;

// ==================== 配置常量 ====================

/**
 * 审批阈值（元）
 */
export const APPROVAL_THRESHOLD = 1000;

/**
 * 调整类型选项
 */
export const ADJUSTMENT_TYPE_OPTIONS: Array<{
  value: AdjustmentType;
  label: string;
  color: string;
  effect: 'increase' | 'decrease';
}> = [
    { value: 'surplus', label: '盘盈', color: 'green', effect: 'increase' },
    { value: 'shortage', label: '盘亏', color: 'orange', effect: 'decrease' },
    { value: 'damage', label: '报损', color: 'red', effect: 'decrease' },
  ];

/**
 * 调整状态选项
 */
export const ADJUSTMENT_STATUS_OPTIONS: Array<{
  value: AdjustmentStatus;
  label: string;
  color: string;
}> = [
    { value: 'draft', label: '草稿', color: 'default' },
    { value: 'pending_approval', label: '待审批', color: 'processing' },
    { value: 'approved', label: '已审批', color: 'success' },
    { value: 'rejected', label: '已拒绝', color: 'error' },
    { value: 'withdrawn', label: '已撤回', color: 'warning' },
  ];

/**
 * 审批操作选项
 */
export const APPROVAL_ACTION_OPTIONS: Array<{
  value: ApprovalAction;
  label: string;
  color: string;
}> = [
    { value: 'approve', label: '通过', color: 'green' },
    { value: 'reject', label: '拒绝', color: 'red' },
    { value: 'withdraw', label: '撤回', color: 'orange' },
  ];

// ==================== 工具函数 ====================

/**
 * 判断是否需要审批
 */
export function requiresApproval(quantity: number, unitPrice: number): boolean {
  const adjustmentAmount = Math.abs(quantity * unitPrice);
  return adjustmentAmount >= APPROVAL_THRESHOLD;
}

/**
 * 计算调整金额
 */
export function calculateAdjustmentAmount(quantity: number, unitPrice: number): number {
  return Math.abs(quantity * unitPrice);
}

/**
 * 根据调整类型判断库存变化方向
 */
export function getStockChangeDirection(type: AdjustmentType): 'increase' | 'decrease' {
  return type === 'surplus' ? 'increase' : 'decrease';
}

/**
 * 计算调整后库存
 */
export function calculateStockAfter(
  currentStock: number,
  adjustmentType: AdjustmentType,
  quantity: number
): number {
  const direction = getStockChangeDirection(adjustmentType);
  return direction === 'increase'
    ? currentStock + quantity
    : currentStock - quantity;
}

/**
 * 获取调整类型标签
 */
export function getAdjustmentTypeLabel(type: AdjustmentType): string {
  return ADJUSTMENT_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type;
}

/**
 * 获取调整状态标签
 */
export function getAdjustmentStatusLabel(status: AdjustmentStatus): string {
  return ADJUSTMENT_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status;
}

/**
 * 判断是否可以撤回
 */
export function canWithdraw(status: AdjustmentStatus): boolean {
  return status === 'pending_approval';
}

/**
 * 判断是否可以审批
 */
export function canApprove(status: AdjustmentStatus): boolean {
  return status === 'pending_approval';
}
