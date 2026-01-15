import { z } from 'zod';
import type { BaseEntity } from './index';

// 价格类型枚举
export enum PriceType {
  BASE = 'base', // 基础价格
  MEMBER = 'member', // 会员价格
  PROMOTION = 'promotion', // 促销价格
  SPECIAL = 'special', // 特殊价格
  WHOLESALE = 'wholesale', // 批发价格
  CHANNEL = 'channel', // 渠道价格
}

// 价格状态枚举
export enum PriceStatus {
  ACTIVE = 'active', // 生效中
  INACTIVE = 'inactive', // 已失效
  PENDING = 'pending', // 待生效
  EXPIRED = 'expired', // 已过期
}

// 价格规则类型
export enum PriceRuleType {
  FIXED_DISCOUNT = 'fixed_discount', // 固定折扣
  PERCENTAGE_DISCOUNT = 'percentage_discount', // 百分比折扣
  FIXED_AMOUNT = 'fixed_amount', // 固定金额
  BULK_PURCHASE = 'bulk_purchase', // 批量采购
  TIME_BASED = 'time_based', // 时效价格
  MEMBER_LEVEL = 'member_level', // 会员等级
  CHANNEL_BASED = 'channel_based', // 渠道定价
}

// 价格配置接口
export interface PriceConfig extends BaseEntity {
  id: string;
  productId: string;
  skuId?: string;
  priceType: PriceType;
  status: PriceStatus;
  basePrice: number;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priority: number;
  channels?: string[];
  memberLevels?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  ruleType?: PriceRuleType;
  ruleConfig?: Record<string, any>;
  metadata?: Record<string, any>;
}

// 价格规则接口
export interface PriceRule {
  id: string;
  name: string;
  type: PriceRuleType;
  description?: string;
  config: PriceRuleConfig;
  isActive: boolean;
  conditions: PriceCondition[];
  actions: PriceAction[];
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// 价格规则配置
export interface PriceRuleConfig {
  discountType: 'fixed' | 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  applyConditions?: Record<string, any>;
  excludeConditions?: Record<string, any>;
}

// 价格条件
export interface PriceCondition {
  type: 'product_category' | 'member_level' | 'quantity_range' | 'date_range' | 'channel';
  operator: 'equals' | 'in' | 'greater_than' | 'less_than' | 'between';
  field: string;
  value: any;
  logic?: 'and' | 'or';
}

// 价格动作
export interface PriceAction {
  type: 'discount' | 'fixed_price' | 'free_shipping' | 'gift';
  config: Record<string, any>;
}

// 价格历史记录
export interface PriceHistory {
  id: string;
  priceConfigId: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  changeType: 'create' | 'update' | 'activate' | 'deactivate' | 'expire';
  changeReason?: string;
  changedBy: string;
  changedAt: string;
  metadata?: Record<string, any>;
}

// 价格变更请求
export interface PriceChangeRequest {
  id: string;
  productId: string;
  requestType: 'create' | 'update' | 'delete';
  proposedPrice?: number;
  proposedConfig?: Partial<PriceConfig>;
  reason: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  createdAt: string;
}

// 价格查询参数
export interface PriceQueryParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  skuId?: string;
  priceType?: PriceType;
  status?: PriceStatus;
  channel?: string;
  memberLevel?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'effectiveFrom' | 'priority';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}

// 价格筛选条件
export interface PriceFilters {
  productId?: string;
  priceType?: PriceType;
  status?: PriceStatus[];
  channel?: string[];
  memberLevel?: string[];
  priceRange?: [number, number];
  effectiveDateRange?: [string, string];
  ruleType?: PriceRuleType;
}

// 价格表单数据
export interface PriceFormData {
  priceType: PriceType;
  basePrice: number;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  priority: number;
  channels?: string[];
  memberLevels?: string[];
  minQuantity?: number;
  maxQuantity?: number;
  ruleType?: PriceRuleType;
  ruleConfig?: PriceRuleConfig;
  description?: string;
}

// 价格列表状态
export interface PriceListState {
  prices: PriceConfig[];
  loading: boolean;
  error?: string;
  totalCount: number;
  filters: PriceFilters;
  searchQuery: string;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedPriceIds: string[];
  viewMode: 'table' | 'grid';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// 价格表单验证Schema
export const PriceConfigSchema = z
  .object({
    priceType: z.nativeEnum(PriceType, {
      message: '请选择价格类型',
    }),
    basePrice: z.number().min(0, '基础价格必须大于等于0').max(999999, '价格不能超过999999'),
    currentPrice: z.number().min(0, '当前价格必须大于等于0').max(999999, '价格不能超过999999'),
    originalPrice: z
      .number()
      .min(0, '原价必须大于等于0')
      .max(999999, '原价不能超过999999')
      .optional(),
    currency: z.string().min(1, '请选择货币类型').max(10, '货币代码不能超过10个字符'),
    effectiveFrom: z.string().min(1, '请选择生效时间'),
    effectiveTo: z.string().optional(),
    priority: z.number().int().min(1, '优先级必须大于0').max(100, '优先级不能超过100'),
    channels: z.array(z.string()).optional(),
    memberLevels: z.array(z.string()).optional(),
    minQuantity: z.number().int().min(1, '最小数量必须大于0').optional(),
    maxQuantity: z.number().int().min(1, '最大数量必须大于0').optional(),
    ruleType: z.nativeEnum(PriceRuleType).optional(),
    ruleConfig: z
      .object({
        discountType: z.enum(['fixed', 'percentage', 'fixed_amount']),
        discountValue: z.number().min(0),
        minOrderValue: z.number().min(0).optional(),
        maxDiscountAmount: z.number().min(0).optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // 验证时间范围
      if (data.effectiveTo && new Date(data.effectiveTo) <= new Date(data.effectiveFrom)) {
        return false;
      }
      // 验证数量范围
      if (data.minQuantity && data.maxQuantity && data.minQuantity > data.maxQuantity) {
        return false;
      }
      return true;
    },
    {
      message: '请检查时间范围和数量范围的逻辑关系',
    }
  );

// 价格规则验证Schema
export const PriceRuleSchema = z.object({
  name: z.string().min(1, '规则名称不能为空').max(100, '规则名称不能超过100个字符'),
  type: z.nativeEnum(PriceRuleType, {
    message: '请选择规则类型',
  }),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
  config: z.object({
    discountType: z.enum(['fixed', 'percentage', 'fixed_amount']),
    discountValue: z.number().min(0),
    minOrderValue: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
  }),
  priority: z.number().int().min(1, '优先级必须大于0').max(100, '优先级不能超过100'),
});

// 导出类型推导
export type PriceConfigInput = z.infer<typeof PriceConfigSchema>;
export type PriceRuleInput = z.infer<typeof PriceRuleSchema>;

// 工具函数
export const createEmptyPriceConfig = (): PriceConfig => ({
  id: '',
  productId: '',
  priceType: PriceType.BASE,
  status: PriceStatus.ACTIVE,
  basePrice: 0,
  currentPrice: 0,
  currency: 'CNY',
  effectiveFrom: new Date().toISOString().split('T')[0],
  priority: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: '',
  updatedBy: '',
});

export const createEmptyPriceFormData = (): PriceFormData => ({
  priceType: PriceType.BASE,
  basePrice: 0,
  currentPrice: 0,
  currency: 'CNY',
  effectiveFrom: new Date().toISOString().split('T')[0],
  priority: 1,
});

// 价格状态映射
export const PriceStatusConfig = {
  [PriceStatus.ACTIVE]: { color: 'green', text: '生效中' },
  [PriceStatus.INACTIVE]: { color: 'red', text: '已失效' },
  [PriceStatus.PENDING]: { color: 'blue', text: '待生效' },
  [PriceStatus.EXPIRED]: { color: 'gray', text: '已过期' },
};

// 价格类型映射
export const PriceTypeConfig = {
  [PriceType.BASE]: { color: 'blue', text: '基础价格' },
  [PriceType.MEMBER]: { color: 'green', text: '会员价格' },
  [PriceType.PROMOTION]: { color: 'orange', text: '促销价格' },
  [PriceType.SPECIAL]: { color: 'purple', text: '特殊价格' },
  [PriceType.WHOLESALE]: { color: 'cyan', text: '批发价格' },
  [PriceType.CHANNEL]: { color: 'magenta', text: '渠道价格' },
};

// 价格规则类型映射
export const PriceRuleTypeConfig = {
  [PriceRuleType.FIXED_DISCOUNT]: { text: '固定折扣' },
  [PriceRuleType.PERCENTAGE_DISCOUNT]: { text: '百分比折扣' },
  [PriceRuleType.FIXED_AMOUNT]: { text: '固定金额' },
  [PriceRuleType.BULK_PURCHASE]: { text: '批量采购' },
  [PriceRuleType.TIME_BASED]: { text: '时效价格' },
  [PriceRuleType.MEMBER_LEVEL]: { text: '会员等级' },
  [PriceRuleType.CHANNEL_BASED]: { text: '渠道定价' },
};

// 价格计算参数
export interface PriceCalculationParams {
  quantity?: number;
  memberLevel?: string;
  channel?: string;
  date?: string;
  customerId?: string;
  location?: string;
}

// 价格计算结果
export interface PriceCalculationResult {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    ruleType: string;
    discountAmount: number;
    discountType: string;
  }>;
  currency: string;
  effectiveUntil?: string;
  metadata?: Record<string, any>;
}
