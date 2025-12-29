import { z } from 'zod';
import type { BaseEntity } from './base';
import { MaterialType, ProductStatus } from './base';

// 重新导出常用的枚举类型，方便其他文件直接从 product.ts 导入
export { MaterialType, ProductStatus };

// 商品接口定义
export interface Product extends BaseEntity {
  id: string;
  skuId: string;
  spuId?: string;
  name: string;
  shortName?: string;
  description?: string;
  categoryId: string;
  category: ProductCategory;
  materialType: MaterialType;
  status: ProductStatus;
  basePrice: number;
  specifications?: ProductSpec[];
  content?: ProductContent;
  bom?: BOMRecipe;
  channels?: ChannelOverride[];
  images: ProductImage[];
  barcode?: string;
  unit?: string;
  brand?: string;
}

// 商品内容
export interface ProductContent {
  productId: string;
  title: string;
  subtitle?: string;
  description?: string;
  images: ProductImage[];
  videos?: ProductVideo[];
  attributes?: Record<string, any>;
}

// 商品图片
export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  type: 'main' | 'gallery' | 'detail';
}

// 商品视频
export interface ProductVideo {
  id: string;
  url: string;
  title?: string;
  duration?: number;
  sortOrder: number;
}

// 商品规格
export interface ProductSpec {
  id: string;
  productId: string;
  name: string;
  type: SpecType;
  values: SpecValue[];
  required: boolean;
  sortOrder: number;
}

export enum SpecType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  BOOLEAN = 'boolean',
  DATE = 'date'
}

export interface SpecValue {
  id: string;
  value: string;
  label?: string;
  price?: number;
}

// BOM配方
export interface BOMRecipe {
  id: string;
  productId: string;
  version: number;
  components: BOMComponent[];
  totalCost?: number;
  yieldRate?: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface BOMComponent {
  id: string;
  materialId: string;
  material: Product;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  isOptional: boolean;
  sortOrder: number;
}

// 渠道覆写
export interface ChannelOverride {
  id: string;
  productId: string;
  channelId: string;
  channel: Channel;
  shortTitle?: string;
  shortDescription?: string;
  customImages?: ProductImage[];
  customAttributes?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 商品类目
export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  level: number;
  parentId?: string;
  path: string;
  children?: ProductCategory[];
  sortOrder: number;
  status: 'active' | 'inactive';
}

// 渠道
export interface Channel {
  id: string;
  code: string;
  name: string;
  type: ChannelType;
  platform?: string;
  status: 'active' | 'inactive' | 'testing';
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum ChannelType {
  MINI_PROGRAM = 'mini_program',
  APP = 'app',
  WEBSITE = 'website',
  OFFLINE = 'offline'
}

// 商品筛选条件
export interface ProductFilters {
  categoryId?: string;
  materialType?: MaterialType;
  status?: ProductStatus[];
  priceRange?: [number, number];
  stockRange?: [number, number];
  brandIds?: string[];
  keyword?: string;
}

// 商品查询参数
export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  skuId?: string;
  categoryId?: string;
  materialType?: MaterialType;
  status?: ProductStatus[];
  priceRange?: [number, number];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'basePrice';
  sortOrder?: 'asc' | 'desc';
}

// 商品表单数据类型
export interface ProductFormData {
  // 基础信息
  name: string;
  shortTitle?: string;
  description?: string;
  categoryId: string;
  materialType: MaterialType;
  basePrice: number;
  barcode?: string;
  unit?: string;
  brand?: string;
  weight?: number;
  volume?: number;
  shelfLife?: number;
  storageCondition?: string;

  // 内容管理
  content: ProductContent;

  // 规格属性
  specifications: ProductSpec[];

  // BOM配方（仅成品）
  bom?: BOMRecipe;

  // 渠道覆写
  channelOverrides?: ChannelOverride[];

  // 状态
  status: ProductStatus;
}

// 表单验证步骤
export enum FormStep {
  BASIC_INFO = 'basic_info',
  CONTENT = 'content',
  SPECS = 'specs',
  BOM = 'bom',
  CHANNEL_OVERRIDE = 'channel_override'
}

// 表单步骤配置
export interface FormStepConfig {
  key: FormStep;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  valid: boolean;
}

// 表单状态
export interface ProductFormState {
  currentStep: FormStep;
  formData: Partial<ProductFormData>;
  steps: FormStepConfig[];
  isDirty: boolean;
  isValid: boolean;
  saving: boolean;
}

// 商品列表状态
export interface ProductListState {
  products: Product[];
  loading: boolean;
  error?: string;
  totalCount: number;
  filters: ProductFilters;
  searchQuery: string;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  selectedProductIds: string[];
  selectionMode: 'single' | 'multiple';
  viewMode: 'table' | 'grid';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}


// Zod验证Schema
export const ProductBasicInfoSchema = z.object({
  name: z.string()
    .min(1, '商品名称不能为空')
    .max(100, '商品名称不能超过100个字符')
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_()（）]+$/, '商品名称包含非法字符'),

  shortTitle: z.string()
    .max(50, '短标题不能超过50个字符')
    .optional(),

  description: z.string()
    .max(1000, '描述不能超过1000个字符')
    .optional(),

  categoryId: z.string()
    .min(1, '请选择商品类目'),

  materialType: MaterialType && typeof MaterialType === 'object' 
    ? z.nativeEnum(MaterialType, {
        message: '请选择物料类型'
      })
    : z.enum(['raw_material', 'semi_finished', 'finished_good'], {
        message: '请选择物料类型'
      }),

  basePrice: z.number()
    .min(0, '价格必须大于等于0')
    .max(999999, '价格不能超过999999'),

  barcode: z.string()
    .max(50, '条形码不能超过50个字符')
    .regex(/^[0-9]+$/, '条形码只能包含数字')
    .optional(),

  unit: z.string()
    .max(20, '单位不能超过20个字符')
    .optional(),

  brand: z.string()
    .max(50, '品牌不能超过50个字符')
    .optional(),

  weight: z.number()
    .min(0, '重量必须大于等于0')
    .max(1000000, '重量不能超过1000000')
    .optional(),

  volume: z.number()
    .min(0, '体积必须大于等于0')
    .max(1000000, '体积不能超过1000000')
    .optional(),

  shelfLife: z.number()
    .min(0, '保质期必须大于等于0')
    .max(36500, '保质期不能超过100年')
    .optional(),

  storageCondition: z.string()
    .max(200, '储存条件不能超过200个字符')
    .optional(),

  status: ProductStatus && typeof ProductStatus === 'object'
    ? z.nativeEnum(ProductStatus, {
        message: '请选择商品状态'
      })
    : z.enum(['draft', 'pending_review', 'approved', 'published', 'disabled', 'archived'], {
        message: '请选择商品状态'
      })
});

export const ProductContentSchema = z.object({
  title: z.string()
    .min(1, '内容标题不能为空')
    .max(200, '内容标题不能超过200个字符'),

  subtitle: z.string()
    .max(300, '副标题不能超过300个字符')
    .optional(),

  description: z.string()
    .max(2000, '内容描述不能超过2000个字符')
    .optional(),

  images: z.array(z.object({
    id: z.string(),
    url: z.string().url('请输入有效的图片URL'),
    alt: z.string().optional(),
    sortOrder: z.number().min(0),
    type: z.enum(['main', 'gallery', 'detail'])
  })).min(1, '至少需要一张主图'),

  videos: z.array(z.object({
    id: z.string(),
    url: z.string().url('请输入有效的视频URL'),
    title: z.string().optional(),
    duration: z.number().optional()
  })).optional()
});

export const ProductSpecSchema = z.object({
  name: z.string().min(1, '规格名称不能为空'),
  value: z.string().min(1, '规格值不能为空'),
  type: z.enum(['text', 'number', 'boolean', 'select']),
  required: z.boolean().default(false),
  sortOrder: z.number().default(0)
});

export const ProductSpecsSchema = z.array(ProductSpecSchema).optional();

export const BOMComponentSchema = z.object({
  materialId: z.string().min(1, '物料ID不能为空'),
  materialName: z.string().min(1, '物料名称不能为空'),
  quantity: z.number().min(0, '物料数量必须大于等于0'),
  unit: z.string().min(1, '物料单位不能为空'),
  cost: z.number().min(0, '物料成本必须大于等于0')
});

export const BOMRecipeSchema = z.object({
  components: z.array(BOMComponentSchema).min(1, 'BOM配方至少需要一个物料'),
  totalCost: z.number().min(0, '总成本必须大于等于0').optional(),
  instructions: z.string().max(1000, '制作说明不能超过1000个字符').optional()
});

export const ChannelOverrideSchema = z.object({
  channelType: z.enum(['mini_program', 'app', 'website', 'offline']),
  title: z.string().max(200, '标题不能超过200个字符').optional(),
  shortTitle: z.string().max(50, '短标题不能超过50个字符').optional(),
  description: z.string().max(2000, '描述不能超过2000个字符').optional(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string().url('请输入有效的图片URL'),
    alt: z.string().optional()
  })).optional()
});

export const ChannelOverridesSchema = z.array(ChannelOverrideSchema).optional();

// 完整的商品表单验证Schema
export const ProductFormSchema = z.object({
  ...ProductBasicInfoSchema.shape,
  content: ProductContentSchema,
  specifications: ProductSpecsSchema,
  bom: BOMRecipeSchema.optional(),
  channelOverrides: ChannelOverridesSchema
}).superRefine((data, ctx) => {
  // 如果是成品且没有BOM配方，添加错误
  if (data.materialType === 'finished_good' && !data.bom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '成品必须配置BOM配方',
      path: ['bom']
    });
  }
});

// 导出类型推导
export type ProductFormInput = z.infer<typeof ProductFormSchema>;
export type ProductBasicInfoInput = z.infer<typeof ProductBasicInfoSchema>;
export type ProductContentInput = z.infer<typeof ProductContentSchema>;
export type ProductSpecsInput = z.infer<typeof ProductSpecsSchema>;
export type BOMRecipeInput = z.infer<typeof BOMRecipeSchema>;
export type ChannelOverridesInput = z.infer<typeof ChannelOverridesSchema>;
export type ProductBaseFormData = z.infer<typeof ProductBasicInfoSchema>;
export type ProductFullFormData = z.infer<typeof ProductFormSchema>;

// 工具函数
export const createEmptyProduct = (): Product => ({
  id: '',
  skuId: '',
  name: '',
  categoryId: '',
  category: {} as any, // 临时类型，实际使用时需要正确的category对象
  materialType: MaterialType.FINISHED_GOOD,
  status: ProductStatus.DRAFT,
  basePrice: 0,
  images: [],
  specifications: [],
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: '',
  updatedBy: ''
});

export const createEmptyProductForm = (): ProductFormData => ({
  name: '',
  categoryId: '',
  materialType: MaterialType.FINISHED_GOOD,
  basePrice: 0,
  unit: '个',
  specifications: [],
  content: {
    productId: '',
    title: '',
    images: []
  },
  status: ProductStatus.DRAFT
});