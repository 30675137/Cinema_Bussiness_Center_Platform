export interface PriceConfiguration {
  id: string;
  name: string;
  description?: string;
  skuIds: string[];
  storeIds?: string[];
  channelIds?: string[];
  priceRules: PriceRule[];
  status: PriceConfigStatus;
  effectiveDate: string;
  expiryDate?: string;
  version: number;
  createdAt: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export enum PriceConfigStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface PriceRule {
  id: string;
  type: PriceRuleType;
  condition: RuleCondition;
  calculation: Calculation;
  priority: number;
  isActive: boolean;
}

export enum PriceRuleType {
  BASE_PRICE = 'base_price',
  TIME_BASED = 'time_based',
  MEMBER_LEVEL = 'member_level',
  QUANTITY_BASED = 'quantity_based',
  PROMOTIONAL = 'promotional'
}

export interface RuleCondition {
  memberLevel?: string[];
  timeRange?: TimeRange[];
  quantity?: QuantityCondition;
  custom?: Record<string, any>;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
  applicableDays: number[];
}

export interface QuantityCondition {
  minQuantity?: number;
  maxQuantity?: number;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
}

export interface Calculation {
  method: CalculationMethod;
  value?: number;
  formula?: string;
  conditions?: any[];
}

export enum CalculationMethod {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FORMULA = 'formula'
}

export interface PricePreview {
  skuId: string;
  skuName: string;
  storeName: string;
  channelName?: string;
  currentPrice: number;
  newPrice: number;
  priceChange: number;
  priceChangePercent: number;
}