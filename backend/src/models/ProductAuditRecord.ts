export interface ProductAuditRecord {
  id: string;
  productId: string;
  action: AuditAction;
  beforeState?: Partial<ProductState>;
  afterState?: Partial<ProductState>;
  reason?: string;
  operatorId: string;
  createdAt: Date;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PUBLISH = 'PUBLISH',
}

export interface ProductState {
  id: string;
  sku: string;
  name: string;
  status: string;
  auditStatus: string;
  basePrice: number;
  costPrice?: number;
  currentStock: number;
  categoryId: string;
  brandId?: string;
  unitId: string;
  materialType: string;
  barcode?: string;
  description?: string;
  version: number;
  publishedAt?: Date;
}

export interface CreateAuditRecordData {
  productId: string;
  action: AuditAction;
  beforeState?: Partial<ProductState>;
  afterState?: Partial<ProductState>;
  reason?: string;
  operatorId: string;
}