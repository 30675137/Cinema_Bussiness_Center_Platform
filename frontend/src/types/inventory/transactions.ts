/**
 * @spec P005-bom-inventory-deduction
 * 库存交易相关类型
 */

import type { TransactionType, SourceType } from './enums';

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

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  department?: string;
  position?: string;
}

export interface InventoryTransaction {
  id: string;
  storeId: string;
  store: Store;
  skuId: string;
  sku: Product;
  transactionType: TransactionType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  stockBefore: number;
  stockAfter: number;
  availableBefore: number;
  availableAfter: number;
  sourceType: SourceType;
  sourceId?: string;
  sourceDocument?: string;
  operatorId: string;
  operator: User;
  transactionTime: string;
  remarks?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
