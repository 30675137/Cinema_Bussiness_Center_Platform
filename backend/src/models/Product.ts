export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  brandId?: string;
  unitId: string;
  materialType: MaterialType;
  status: ProductStatus;
  basePrice: number;
  costPrice?: number;
  currentStock: number;
  safetyStock?: number;
  barcode?: string;
  description?: string;
  specifications?: ProductSpecification[];
  content?: ProductContent;
  auditStatus: AuditStatus;
  parentProductId?: string;
  version: number;
  metadata?: ProductMetadata;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: string;
  updatedBy: string;
}

export enum MaterialType {
  FINISHED_GOOD = 'finished_good',
  RAW_MATERIAL = 'raw_material',
  CONSUMABLE = 'consumable',
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ABNORMAL = 'abnormal',
  OFFLINE = 'offline',
}

export enum AuditStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ProductContent {
  images: ProductImage[];
  videos?: ProductVideo[];
  richText?: string;
  shortDescription?: string;
  specifications?: Spec[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVideo {
  id: string;
  url: string;
  title?: string;
  duration?: number;
  sortOrder: number;
}

export interface ProductSpecification {
  id: string;
  name: string;
  type: SpecificationType;
  values: any;
  sortOrder: number;
}

export enum SpecificationType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  BOOLEAN = 'boolean',
}

export interface Spec {
  name: string;
  type: SpecificationType;
  options?: string[];
  required?: boolean;
  sortOrder: number;
}

export interface ProductMetadata {
  tags?: string[];
  attributes?: Record<string, any>;
  source?: string;
}

export interface CreateProductData {
  sku: string;
  name: string;
  categoryId: string;
  brandId?: string;
  unitId: string;
  materialType: MaterialType;
  basePrice: number;
  costPrice?: number;
  currentStock: number;
  safetyStock?: number;
  barcode?: string;
  description?: string;
  content?: ProductContent;
  metadata?: ProductMetadata;
}

export interface UpdateProductData {
  name?: string;
  brandId?: string;
  basePrice?: number;
  costPrice?: number;
  currentStock?: number;
  safetyStock?: number;
  barcode?: string;
  description?: string;
  content?: ProductContent;
  metadata?: ProductMetadata;
  updatedBy: string;
}

export interface ProductListFilters {
  keyword?: string;
  sku?: string;
  categoryIds?: string[];
  brandIds?: string[];
  status?: ProductStatus;
  materialType?: MaterialType;
  createdBy?: string;
  updateTimeStart?: Date;
  updateTimeEnd?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}