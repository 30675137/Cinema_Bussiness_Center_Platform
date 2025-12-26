/**
 * P003-inventory-query: 库存查询模块类型定义
 * 
 * 包含库存状态枚举、库存记录类型、查询参数等。
 */

/** 库存状态枚举 */
export type InventoryStatus =
  | 'SUFFICIENT'      // 充足
  | 'NORMAL'          // 正常
  | 'BELOW_THRESHOLD' // 偏低
  | 'LOW'             // 不足
  | 'OUT_OF_STOCK';   // 缺货

/** 库存状态配置 - 包含标签和颜色 */
export const INVENTORY_STATUS_CONFIG: Record<InventoryStatus, {
  label: string;
  color: 'green' | 'blue' | 'gold' | 'orange' | 'red';
}> = {
  SUFFICIENT: { label: '充足', color: 'green' },
  NORMAL: { label: '正常', color: 'blue' },
  BELOW_THRESHOLD: { label: '偏低', color: 'gold' },
  LOW: { label: '不足', color: 'orange' },
  OUT_OF_STOCK: { label: '缺货', color: 'red' },
};

/** 库存状态选项列表 - 用于筛选器 */
export const INVENTORY_STATUS_OPTIONS = Object.entries(INVENTORY_STATUS_CONFIG).map(
  ([value, { label }]) => ({
    value: value as InventoryStatus,
    label,
  })
);

/** 库存列表项 */
export interface StoreInventoryItem {
  id: string;
  storeId: string;
  storeName?: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  onHandQty: number;
  availableQty: number;
  reservedQty: number;
  safetyStock: number;
  mainUnit: string;
  categoryId?: string;
  categoryName?: string;
  inventoryStatus: InventoryStatus;
  updatedAt: string;
}

/** 库存详情（扩展列表项） */
export interface StoreInventoryDetail extends StoreInventoryItem {
  createdAt: string;
  storeCode?: string;
}

/** 库存查询参数 */
export interface InventoryQueryParams {
  storeId?: string;
  keyword?: string;
  categoryId?: string;
  statuses?: InventoryStatus[];
  page?: number;
  pageSize?: number;
}

/** 库存列表响应 */
export interface InventoryListResponse {
  success: boolean;
  data: StoreInventoryItem[];
  total: number;
  page: number;
  pageSize: number;
  message?: string;
}

/** 库存详情响应 */
export interface InventoryDetailResponse {
  success: boolean;
  data: StoreInventoryDetail;
}

/** 商品分类 */
export interface Category {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  children?: Category[];
}

/** 分类列表响应 */
export interface CategoryListResponse {
  success: boolean;
  data: Category[];
}

/** 门店选项（用于筛选） */
export interface StoreOption {
  id: string;
  code: string;
  name: string;
  region?: string;
}

/** 门店列表响应 */
export interface StoreListResponse {
  success: boolean;
  data: StoreOption[];
}
