/**
 * @spec P006-fix-sku-edit-data
 * Zod validation schemas for product data
 */

import { z } from 'zod';

// ============================================
// Status Enums
// ============================================

export const SKUStatusSchema = z.enum(['active', 'inactive', 'deleted']);
export const SPUStatusSchema = z.enum(['valid', 'invalid']);
export const BOMStatusSchema = z.enum(['active', 'inactive']);
export const BOMComponentStatusSchema = z.enum(['valid', 'invalid']);
export const BOMComponentUnitSchema = z.enum(['ml', 'g', 'kg', '个', '瓶', '升']);

// ============================================
// Core Entity Schemas
// ============================================

/**
 * SKU validation schema
 */
export const SKUSchema = z.object({
  id: z.string().min(1, 'SKU ID不能为空'),
  
  code: z
    .string()
    .min(3, 'SKU编码至少3个字符')
    .max(50, 'SKU编码不超过50字符')
    .regex(/^[A-Z0-9-]+$/, 'SKU编码格式无效，仅支持大写字母、数字和连字符'),
  
  name: z
    .string()
    .min(1, 'SKU名称不能为空')
    .max(100, 'SKU名称不超过100字符'),
  
  price: z
    .number()
    .int('价格必须为整数')
    .nonnegative('价格不能为负数'),
  
  stockQuantity: z
    .number()
    .int('库存数量必须为整数')
    .nonnegative('库存数量不能为负数'),
  
  status: SKUStatusSchema,
  
  spuId: z.string().nullable(),
  
  version: z.number().int('版本号必须为整数'),
  
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

/**
 * SPU validation schema
 */
export const SPUSchema = z.object({
  id: z.string().min(1, 'SPU ID不能为空'),
  
  name: z
    .string()
    .min(1, 'SPU名称不能为空')
    .max(200, 'SPU名称不超过200字符'),
  
  categoryId: z.string().min(1, '产品分类不存在'),
  
  brandId: z.string().nullable(),
  
  description: z
    .string()
    .max(2000, '描述不超过2000字符'),
  
  status: SPUStatusSchema,
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * BOMComponent validation schema
 */
export const BOMComponentSchema = z.object({
  id: z.string().min(1, 'BOM组成项ID不能为空'),
  
  bomId: z.string().min(1, '关联的BOM不存在'),
  
  ingredientSkuId: z.string().min(1, '原料SKU不存在'),
  
  ingredientSkuCode: z.string().min(1, '原料SKU编码不能为空'),
  
  ingredientSkuName: z.string().min(1, '原料SKU名称不能为空'),
  
  quantity: z
    .number()
    .positive('用量必须大于0'),
  
  unit: BOMComponentUnitSchema,
  
  standardCost: z
    .number()
    .nonnegative('标准成本不能为负数')
    .nullable(),
  
  status: BOMComponentStatusSchema,
  
  sortOrder: z
    .number()
    .int('排序顺序必须为整数')
    .nonnegative('排序顺序不能为负数'),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * BOM validation schema
 */
export const BOMSchema = z.object({
  id: z.string().min(1, 'BOM ID不能为空'),
  
  skuId: z.string().min(1, '关联的SKU不存在'),
  
  name: z
    .string()
    .max(100, '配方名称不超过100字符')
    .nullable(),
  
  wasteRate: z
    .number()
    .min(0, '损耗率必须在 0-100 之间')
    .max(100, '损耗率必须在 0-100 之间'),
  
  status: BOMStatusSchema,
  
  components: z
    .array(BOMComponentSchema)
    .min(1, 'BOM必须至少包含一个原料'),
  
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// Response DTO Schemas
// ============================================

/**
 * LoadMetadata validation schema
 */
export const LoadMetadataSchema = z.object({
  spuLoadSuccess: z.boolean(),
  bomLoadSuccess: z.boolean(),
  spuStatus: z.enum(['valid', 'invalid', 'not_linked']),
  bomStatus: z.enum(['active', 'inactive', 'not_configured']),
});

/**
 * SKUDetailResponse validation schema
 */
export const SKUDetailResponseSchema = z.object({
  sku: SKUSchema,
  spu: SPUSchema.nullable(),
  bom: BOMSchema.nullable(),
  metadata: LoadMetadataSchema,
});

// ============================================
// Request DTO Schemas
// ============================================

/**
 * SKUUpdateRequest validation schema
 */
export const SKUUpdateRequestSchema = z.object({
  code: z
    .string()
    .min(3, 'SKU编码至少3个字符')
    .max(50, 'SKU编码不超过50字符')
    .regex(/^[A-Z0-9-]+$/, 'SKU编码格式无效')
    .optional(),
  
  name: z
    .string()
    .min(1, 'SKU名称不能为空')
    .max(100, 'SKU名称不超过100字符')
    .optional(),
  
  price: z
    .number()
    .int('价格必须为整数')
    .nonnegative('价格不能为负数')
    .optional(),
  
  stockQuantity: z
    .number()
    .int('库存数量必须为整数')
    .nonnegative('库存数量不能为负数')
    .optional(),
  
  status: SKUStatusSchema.optional(),
  
  spuId: z.string().nullable().optional(),
  
  version: z
    .number()
    .int('版本号必须为整数'),
}).refine((data) => data.version !== undefined, {
  message: '版本号缺失，无法检测并发冲突',
  path: ['version'],
});

// ============================================
// Error Response Schema
// ============================================

/**
 * ApiErrorResponse validation schema
 */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.string(),
});

// ============================================
// Type Inference Helpers
// ============================================

export type SKUSchemaType = z.infer<typeof SKUSchema>;
export type SPUSchemaType = z.infer<typeof SPUSchema>;
export type BOMSchemaType = z.infer<typeof BOMSchema>;
export type BOMComponentSchemaType = z.infer<typeof BOMComponentSchema>;
export type SKUDetailResponseSchemaType = z.infer<typeof SKUDetailResponseSchema>;
export type SKUUpdateRequestSchemaType = z.infer<typeof SKUUpdateRequestSchema>;
export type ApiErrorResponseSchemaType = z.infer<typeof ApiErrorResponseSchema>;
