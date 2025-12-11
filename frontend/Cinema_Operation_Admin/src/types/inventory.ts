/**
 * 库存管理相关类型定义
 */

/**
 * 库存状态枚举
 */
export enum InventoryStatus {
  IN_STOCK = 'in_stock',        // 有库存
  LOW_STOCK = 'low_stock',      // 库存不足
  OUT_OF_STOCK = 'out_of_stock', // 无库存
  DISCONTINUED = 'discontinued', // 停产
}

/**
 * 库存操作类型枚举
 */
export enum InventoryOperationType {
  STOCK_IN = 'stock_in',           // 入库
  STOCK_OUT = 'stock_out',         // 出库
  TRANSFER_IN = 'transfer_in',     // 调拨入库
  TRANSFER_OUT = 'transfer_out',   // 调拨出库
  ADJUSTMENT = 'adjustment',       // 盘点调整
  DAMAGED = 'damaged',             // 损坏
  RETURNED = 'returned',           // 退货
}

/**
 * 库存位置信息
 */
export interface Location {
  id: string;
  name: string;              // 位置名称（如：仓库A-货架1-层2）
  code: string;              // 位置编码
  type: 'warehouse' | 'shelf' | 'cabinet' | 'other';
  capacity: number;          // 容量
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 商品库存信息
 */
export interface InventoryItem {
  id: string;
  productId: string;         // 商品ID
  productCode: string;       // 商品编码
  productName: string;       // 商品名称
  productCategory: string;   // 商品分类
  productSpec: string;       // 商品规格
  unit: string;              // 单位（个、箱、件等）
  locationId: string;        // 位置ID
  locationName: string;      // 位置名称
  currentStock: number;      // 当前库存数量
  minStock: number;          // 最小库存（警戒线）
  maxStock: number;          // 最大库存
  safeStock: number;         // 安全库存
  averageCost: number;       // 平均成本
  totalValue: number;        // 总价值
  status: InventoryStatus;    // 库存状态
  lastInboundDate?: string;   // 最后入库时间
  lastOutboundDate?: string;  // 最后出库时间
  lastUpdated: string;       // 最后更新时间
  remark?: string;           // 备注
}

/**
 * 库存操作记录
 */
export interface InventoryOperation {
  id: string;
  inventoryItemId: string;   // 库存项ID
  operationType: InventoryOperationType;
  quantity: number;           // 数量（正数为入库，负数为出库）
  unit: string;              // 单位
  unitPrice: number;          // 单价
  totalPrice: number;        // 总价
  beforeStock: number;        // 操作前库存
  afterStock: number;         // 操作后库存
  reason: string;             // 操作原因
  referenceId?: string;       // 关联单据ID（采购单、收货单、调拨单等）
  referenceType?: string;     // 关联单据类型
  operatorId: string;         // 操作人ID
  operatorName: string;       // 操作人姓名
  operationDate: string;      // 操作时间
  remark?: string;            // 备注
  attachments?: string[];     // 附件
}

/**
 * 库存查询参数
 */
export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;           // 商品关键词搜索
  categoryId?: string;        // 分类筛选
  locationId?: string;        // 位置筛选
  status?: InventoryStatus;   // 状态筛选
  lowStock?: boolean;         // 仅显示库存不足
  dateRange?: [string, string]; // 更新时间范围
  sortBy?: 'productCode' | 'productName' | 'currentStock' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 库存筛选条件
 */
export interface InventoryFilter {
  keyword?: string;
  categoryId?: string;
  locationId?: string;
  status?: InventoryStatus;
  lowStock?: boolean;
  dateRange?: [string, string];
}

/**
 * 库存统计信息
 */
export interface InventoryStatistics {
  totalItems: number;           // 总商品数
  totalValue: number;           // 总库存价值
  totalCategories: number;      // 总分类数
  totalLocations: number;       // 总位置数
  inStockCount: number;          // 有库存商品数
  lowStockCount: number;         // 库存不足商品数
  outOfStockCount: number;       // 无库存商品数
  lowStockRate: number;          // 库存不足率
  stockTurnoverRate: number;     // 库存周转率
  averageInventoryDays: number;  // 平均库存天数
  // 分类统计
  categoryStats: {
    categoryId: string;
    categoryName: string;
    itemCount: number;
    totalValue: number;
    lowStockCount: number;
  }[];
  // 位置统计
  locationStats: {
    locationId: string;
    locationName: string;
    itemCount: number;
    totalValue: number;
    utilizationRate: number; // 位置利用率
  }[];
  // 近期趋势
  recentTrends: {
    date: string;
    inboundCount: number;
    outboundCount: number;
    netChange: number;
  }[];
}

/**
 * 库存预警信息
 */
export interface InventoryAlert {
  id: string;
  inventoryItemId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  thresholdValue: number;
  createdAt: string;
  isRead: boolean;
  resolvedAt?: string;
}

/**
 * 盘点记录
 */
export interface InventoryCheck {
  id: string;
  checkNumber: string;          // 盘点单号
  title: string;                // 盘点标题
  description?: string;          // 盘点描述
  locationIds: string[];         // 盘点位置
  checkType: 'full' | 'partial' | 'random'; // 盘点类型
  status: 'draft' | 'checking' | 'completed' | 'cancelled';
  planDate: string;             // 计划盘点日期
  actualDate?: string;           // 实际盘点日期
  checkerId: string;             // 盘点人ID
  checkerName: string;           // 盘点人姓名
  supervisorId?: string;         // 监督人ID
  supervisorName?: string;       // 监督人姓名
  checkItems: InventoryCheckItem[]; // 盘点项
  totalItems: number;            // 总盘点项数
  checkedItems: number;          // 已盘点项数
  discrepancyCount: number;      // 差异数量
  totalDiscrepancyValue: number; // 总差异价值
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  remark?: string;
}

/**
 * 盘点项
 */
export interface InventoryCheckItem {
  id: string;
  inventoryItemId: string;
  checkId: string;
  productCode: string;
  productName: string;
  locationName: string;
  systemStock: number;       // 系统库存
  actualStock: number;       // 实际库存
  discrepancy: number;       // 差异数量
  unitPrice: number;         // 单价
  discrepancyValue: number;  // 差异价值
  reason?: string;           // 差异原因
  status: 'pending' | 'checked' | 'confirmed';
  checkedAt?: string;
  confirmedBy?: string;
  notes?: string;
}

/**
 * 创建库存项参数
 */
export interface CreateInventoryItemParams {
  productId: string;
  locationId: string;
  initialStock: number;
  minStock: number;
  maxStock: number;
  safeStock: number;
  averageCost: number;
  remark?: string;
}

/**
 * 更新库存项参数
 */
export interface UpdateInventoryItemParams {
  minStock?: number;
  maxStock?: number;
  safeStock?: number;
  averageCost?: number;
  locationId?: string;
  remark?: string;
}

/**
 * 库存操作参数
 */
export interface InventoryOperationParams {
  inventoryItemId: string;
  operationType: InventoryOperationType;
  quantity: number;
  unitPrice: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  remark?: string;
  attachments?: string[];
}

/**
 * 批量库存操作参数
 */
export interface BatchInventoryOperationParams {
  inventoryItemId: string;
  operations: InventoryOperationParams[];
}

/**
 * 库存调拨参数
 */
export interface InventoryTransferParams {
  fromLocationId: string;
  toLocationId: string;
  transferItems: {
    inventoryItemId: string;
    quantity: number;
    remark?: string;
  }[];
  reason: string;
  expectedDate?: string;
  remark?: string;
}

/**
 * 库存调整参数
 */
export interface InventoryAdjustmentParams {
  adjustmentItems: {
    inventoryItemId: string;
    systemStock: number;
    actualStock: number;
    adjustmentReason: string;
    unitPrice?: number;
    remark?: string;
  }[];
  adjustmentType: 'profit' | 'loss';
  reason: string;
  approverId?: string;
  remark?: string;
}