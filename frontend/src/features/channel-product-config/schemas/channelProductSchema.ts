/**
 * @spec O005-channel-product-config
 * @spec O008-channel-product-category-migration
 * Zod validation schemas for Channel Product Configuration forms
 */

import { z } from 'zod';
import { ChannelType, ChannelProductStatus, SpecType } from '../types';

// ============================================================================
// Spec Option Schema
// ============================================================================

export const specOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '选项名称不能为空').max(50, '选项名称不能超过50字符'),
  priceAdjust: z.number().int('价格调整必须为整数（分）'),
  isDefault: z.boolean(),
  sortOrder: z.number().int().min(0, '排序序号必须大于等于0'),
});

export type SpecOptionFormData = z.infer<typeof specOptionSchema>;

// ============================================================================
// Spec Group Schema
// ============================================================================

export const channelProductSpecSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(SpecType),
  name: z.string().min(1, '规格名称不能为空').max(50, '规格名称不能超过50字符'),
  required: z.boolean(),
  multiSelect: z.boolean(),
  options: z
    .array(specOptionSchema)
    .min(1, '至少需要一个规格选项')
    .refine(
      (options) => {
        const names = options.map((opt) => opt.name);
        return new Set(names).size === names.length;
      },
      {
        message: '规格选项名称不能重复',
      }
    ),
});

export type ChannelProductSpecFormData = z.infer<typeof channelProductSpecSchema>;

// ============================================================================
// Category ID Schema
// ============================================================================

/**
 * 分类 ID 验证 Schema
 */
export const categoryIdSchema = z
  .string({ required_error: '请选择商品分类' })
  .uuid('无效的分类 ID 格式');

// ============================================================================
// Create Channel Product Schema
// ============================================================================

export const createChannelProductSchema = z.object({
  skuId: z.string().uuid('请选择有效的 SKU'),
  channelType: z.nativeEnum(ChannelType).optional().default(ChannelType.MINI_PROGRAM),
  displayName: z.string().max(100, '展示名称不能超过100字符').optional().nullable(),
  categoryId: categoryIdSchema,
  channelPrice: z
    .number()
    .int('价格必须为整数（分）')
    .positive('价格必须大于0')
    .optional()
    .nullable(),
  mainImage: z.string().url('主图必须是有效的 URL').optional().nullable(),
  detailImages: z.array(z.string().url('详情图必须是有效的 URL')).optional().default([]),
  description: z.string().max(500, '描述不能超过500字符').optional().nullable(),
  specs: z.array(channelProductSpecSchema).optional().default([]),
  isRecommended: z.boolean().optional().default(false),
  status: z.nativeEnum(ChannelProductStatus).optional().default(ChannelProductStatus.ACTIVE),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export type CreateChannelProductFormData = z.infer<typeof createChannelProductSchema>;

// ============================================================================
// Update Channel Product Schema
// ============================================================================

export const updateChannelProductSchema = z.object({
  displayName: z.string().max(100, '展示名称不能超过100字符').optional().nullable(),
  categoryId: categoryIdSchema.optional(),
  channelPrice: z
    .number()
    .int('价格必须为整数（分）')
    .positive('价格必须大于0')
    .optional()
    .nullable(),
  mainImage: z.string().url('主图必须是有效的 URL').optional().nullable(),
  detailImages: z.array(z.string().url('详情图必须是有效的 URL')).optional(),
  description: z.string().max(500, '描述不能超过500字符').optional().nullable(),
  specs: z.array(channelProductSpecSchema).optional(),
  isRecommended: z.boolean().optional(),
  status: z.nativeEnum(ChannelProductStatus).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateChannelProductFormData = z.infer<typeof updateChannelProductSchema>;

// ============================================================================
// Query Params Schema
// ============================================================================

export const channelProductQuerySchema = z.object({
  channelType: z.nativeEnum(ChannelType).optional(),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(ChannelProductStatus).optional(),
  keyword: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  size: z.number().int().positive().max(100).optional().default(20),
});

export type ChannelProductQueryFormData = z.infer<typeof channelProductQuerySchema>;

// ============================================================================
// Status Update Schema
// ============================================================================

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ChannelProductStatus),
});

export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;
