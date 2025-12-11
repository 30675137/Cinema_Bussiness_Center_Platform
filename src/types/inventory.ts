/**
 * 库存管理系统类型定义
 */

// 基础实体类型
export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'store';
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdTime: string;
  updatedTime: string;
}

export interface ProductSKU {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  shortName?: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  brandId?: string;
  brandName?: string;
  specification?: string;
  model?: string;
  color?: string;
  size?: string;
  unitId: string;
  unit: string;
  costPrice?: number;
  sellingPrice?: number;
  retailPrice?: number;
  safetyStock: number;
  maxStock: number;
  minStock: number;
  status: 'active' | 'inactive' | 'discontinued';
  isSellable: boolean;
  createdTime: string;
  updatedTime: string;
}

// 库存台账相关类型
export interface InventoryLedger {
  id: string;
  sku: string;
  productCode: string;
  productName: string;
  locationId: string;
  locationName: string;
  locationType: 'warehouse' | 'store';
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  inTransitQuantity: number;
  safetyStock: number;
  category: string;
  subcategory?: string;
  brand?: string;
  specification?: string;
  unit: string;
  stockStatus: 'low' | 'normal' | 'high' | 'out_of_stock';
  isSellable: boolean;
  lastUpdated: string;
  createdTime: string;
  costPrice?: number;
  sellingPrice?: number;
  supplier?: string;
}

// 库存流水相关类型
export interface InventoryMovement {
  id: string;
  transactionId: string;
  batchId?: string;
  sku: string;
  productName: string;
  categoryId?: string;
  categoryName?: string;
  locationId: string;
  locationName: string;
  movementType: 'in' | 'out' | 'transfer_in' | 'transfer_out' | 'adjust_positive' | 'adjust_negative';
  movementSubtype: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  costPrice?: number;
  totalValue?: number;
  referenceType: string;
  referenceId: string;
  referenceNo?: string;
  operatorId: string;
  operatorName: string;
  operationTime: string;
  reason?: string;
  remark?: string;
  fromLocation?: string;
  fromLocationName?: string;
  toLocation?: string;
  toLocationName?: string;
  sourceSystem: string;
  createdAt: string;
  updatedAt: string;
  // 业务扩展字段
  relatedOrderId?: string;
  relatedOrderNo?: string;
  supplierId?: string;
  supplierName?: string;
  customerId?: string;
  customerName?: string;
  warehouseId?: string;
  warehouseName?: string;
  // 状态字段
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  isReversed: boolean;
  originalMovementId?: string;
}

// 库存流水筛选条件
export interface InventoryMovementFilters {
  keyword?: string;
  sku?: string;
  movementType?: string;
  movementSubtype?: string;
  locationId?: string;
  operatorName?: string;
  dateRange?: [string, string];
  referenceType?: string;
  referenceNo?: string;
  status?: string;
  minQuantity?: number;
  maxQuantity?: number;
  onlyNegativeQuantity?: boolean;
  onlyPositiveQuantity?: boolean;
  supplierId?: string;
  customerId?: string;
  warehouseId?: string;
  batchNo?: string;
}

// 库存调整相关类型
export interface InventoryAdjustment {
  id: string;
  adjustmentNo: string;
  sku: string;
  productName: string;
  locationId: string;
  locationName: string;
  adjustmentType: 'stocktaking_profit' | 'stocktaking_loss' | 'damage' | 'expired' | 'other';
  originalQuantity: number;
  adjustedQuantity: number;
  adjustmentQuantity: number;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  remark?: string;
  attachments?: string[];
  approvedBy?: string;
  approvedAt?: string;
  approvalRemark?: string;
  completedAt?: string;
  executedBy?: string;
}

// 分页响应类型
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  current?: number;
  pageSize?: number;
}

// 筛选参数类型
export interface InventoryLedgerFilters {
  keyword?: string;
  categoryId?: string;
  brandId?: string;
  locationId?: string;
  stockStatus?: 'low' | 'normal' | 'high' | 'out_of_stock';
  isSellable?: boolean;
  hasInTransit?: boolean;
}

export interface InventoryMovementFilters {
  sku?: string;
  locationId?: string;
  movementType?: string;
  referenceType?: string;
  startTime?: string;
  endTime?: string;
  operatorName?: string;
}

export interface InventoryAdjustmentFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  adjustmentType?: 'stocktaking_profit' | 'stocktaking_loss' | 'damage' | 'expired' | 'other';
  sku?: string;
  productName?: string;
  locationId?: string;
  requestedBy?: string;
  dateRange?: [string, string];
  startTime?: string;
  endTime?: string;
  quantityRange?: [number, number];
}

// 排序参数类型
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 响应类型
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

// 查询参数类型
export interface QueryParams {
  filters?: any;
  sort?: SortParams;
  pagination?: PaginationParams;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  success: boolean;
  message?: string;
  timestamp: string;
}

// 库存统计类型
export interface InventoryStatistics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  inTransitQuantity: number;
}

// 权限相关类型
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

// 预定义权限常量
export const INVENTORY_PERMISSIONS = {
  READ: 'inventory.read',
  WRITE: 'inventory.write',
  DELETE: 'inventory.delete',
  ADJUST: 'inventory.adjust',
  TRANSFER: 'inventory.transfer',
  ADMIN: 'inventory.admin',
  EXPORT: 'inventory.export',
} as const;

export const INVENTORY_ROLES = {
  VIEWER: 'inventory.viewer',
  OPERATOR: 'inventory.operator',
  ADMIN: 'inventory.admin',
} as const;

// 响应式断点类型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface Responsive {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
  width: number;
  height: number;
}

// 状态管理相关类型
export interface InventoryState {
  inventoryItems: InventoryLedger[];
  movements: InventoryMovement[];
  adjustments: InventoryAdjustment[];
  statistics: InventoryStatistics;
  locations: Location[];
  products: ProductSKU[];
  categories: Category[];
  brands: Brand[];

  // 筛选状态
  ledgerFilters: InventoryLedgerFilters;
  movementFilters: InventoryMovementFilters;
  adjustmentFilters: InventoryAdjustmentFilters;

  // 分页状态
  ledgerPagination: Pagination;
  movementPagination: Pagination;
  adjustmentPagination: Pagination;

  // 排序状态
  ledgerSort: SortParams;
  movementSort: SortParams;

  // 加载状态
  loading: {
    ledger: boolean;
    movements: boolean;
    adjustments: boolean;
    statistics: boolean;
    locations: boolean;
    products: boolean;
  };

  // 错误状态
  errors: {
    ledger?: string;
    movements?: string;
    adjustments?: string;
    statistics?: string;
    locations?: string;
    products?: string;
  };
}

// 操作类型
export type InventoryActions = {
  // 数据操作
  setInventoryItems: (items: InventoryLedger[]) => void;
  setMovements: (movements: InventoryMovement[]) => void;
  setAdjustments: (adjustments: InventoryAdjustment[]) => void;
  setStatistics: (stats: Partial<InventoryStatistics>) => void;
  setLocations: (locations: Location[]) => void;
  setProducts: (products: ProductSKU[]) => void;
  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;

  // 筛选操作
  updateLedgerFilters: (filters: Partial<InventoryLedgerFilters>) => void;
  clearLedgerFilters: () => void;
  updateMovementFilters: (filters: Partial<InventoryMovementFilters>) => void;
  clearMovementFilters: () => void;
  updateAdjustmentFilters: (filters: Partial<InventoryAdjustmentFilters>) => void;
  clearAdjustmentFilters: () => void;

  // 分页操作
  updateLedgerPagination: (pagination: Partial<Pagination>) => void;
  updateMovementPagination: (pagination: Partial<Pagination>) => void;
  updateAdjustmentPagination: (pagination: Partial<Pagination>) => void;

  // 排序操作
  updateLedgerSort: (sort: SortParams) => void;
  updateMovementSort: (sort: SortParams) => void;

  // 加载状态
  setLoading: (key: keyof InventoryState['loading'], value: boolean) => void;

  // 错误处理
  setError: (key: keyof InventoryState['errors'], error?: string) => void;
  clearErrors: () => void;

  // 库存操作
  adjustStock: (itemId: string, quantity: number, reason: string) => Promise<void>;
  transferStock: (itemId: string, fromLocation: string, toLocation: string, quantity: number) => Promise<void>;
  createAdjustment: (adjustment: Omit<InventoryAdjustment, 'id' | 'adjustmentNo' | 'createdTime'>) => Promise<void>;
  approveAdjustment: (id: string, approved: boolean, remark?: string) => Promise<void>;

  // 重置状态
  resetState: () => void;
};

// 辅助类型
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  path: string;
}

export interface Brand {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

// 表格列类型
export interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  sortable?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  responsive?: string[];
}

// 操作按钮类型
export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  type?: 'primary' | 'default' | 'danger' | 'link';
  onClick?: (record: any) => void;
  disabled?: boolean;
  visible?: (record: any) => boolean;
  permission?: string;
  danger?: boolean;
}