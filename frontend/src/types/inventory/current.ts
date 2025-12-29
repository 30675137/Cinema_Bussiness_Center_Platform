/**
 * @spec P005-bom-inventory-deduction
 * 实时库存相关类型
 */

import type { TransactionType } from './enums';

// 前向声明 - 避免循环依赖
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

interface Store {
  id: string;
  name: string;
  code: string;
  address?: string;
  contactInfo?: string;
  managerInfo?: string;
  isActive: boolean;
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
