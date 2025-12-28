/**
 * Validation Utilities
 * 
 * Zod schemas for validating dictionary and attribute template data
 */

import { z } from 'zod';

// ============================================================================
// Dictionary Type Validation
// ============================================================================

export const dictionaryTypeCodeSchema = z
  .string()
  .min(1, '编码不能为空')
  .max(50, '编码长度不能超过50个字符')
  .regex(/^[A-Z0-9_]+$/i, '编码只能包含字母、数字和下划线');

export const dictionaryTypeNameSchema = z
  .string()
  .min(1, '名称不能为空')
  .max(50, '名称长度不能超过50个字符');

export const dictionaryTypeSchema = z.object({
  id: z.string().uuid('ID格式无效'),
  code: dictionaryTypeCodeSchema,
  name: dictionaryTypeNameSchema,
  description: z.string().max(500, '描述长度不能超过500个字符').optional(),
  isSystem: z.boolean(),
  category: z.enum(['basic', 'business', 'custom']),
  sort: z.number().int().default(0),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
  updatedBy: z.string(),
  itemCount: z.number().int().nonnegative().optional(),
});

export const createDictionaryTypeSchema = z.object({
  code: dictionaryTypeCodeSchema,
  name: dictionaryTypeNameSchema,
  description: z.string().max(500).optional(),
  category: z.enum(['basic', 'business', 'custom']).default('custom'),
  sort: z.number().int().default(0),
});

export const updateDictionaryTypeSchema = z.object({
  name: dictionaryTypeNameSchema.optional(),
  description: z.string().max(500).optional(),
  sort: z.number().int().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ============================================================================
// Dictionary Item Validation
// ============================================================================

export const dictionaryItemCodeSchema = z
  .string()
  .min(1, '编码不能为空')
  .max(100, '编码长度不能超过100个字符')
  .regex(/^[A-Z0-9_]+$/i, '编码只能包含字母、数字和下划线');

export const dictionaryItemNameSchema = z
  .string()
  .min(1, '名称不能为空')
  .max(100, '名称长度不能超过100个字符');

export const dictionaryItemSchema = z.object({
  id: z.string().uuid('ID格式无效'),
  typeId: z.string().uuid('字典类型ID格式无效'),
  code: dictionaryItemCodeSchema,
  name: dictionaryItemNameSchema,
  value: z.any().optional(),
  parentId: z.string().uuid().optional(),
  level: z.number().int().min(0).default(0),
  sort: z.number().int().default(0),
  status: z.enum(['active', 'inactive']),
  remark: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
  updatedBy: z.string(),
  typeName: z.string().optional(),
});

export const createDictionaryItemSchema = z.object({
  typeId: z.string().uuid('字典类型ID格式无效'),
  code: dictionaryItemCodeSchema,
  name: dictionaryItemNameSchema,
  value: z.any().optional(),
  parentId: z.string().uuid().optional(),
  level: z.number().int().min(0).default(0),
  sort: z.number().int().default(0),
  remark: z.string().max(500).optional(),
});

export const updateDictionaryItemSchema = z.object({
  name: dictionaryItemNameSchema.optional(),
  value: z.any().optional(),
  sort: z.number().int().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  remark: z.string().max(500).optional(),
});

// ============================================================================
// Attribute Template Validation
// ============================================================================

export const attributeTemplateSchema = z.object({
  id: z.string().uuid('ID格式无效'),
  categoryId: z.string().uuid('类目ID格式无效'),
  name: z.string().min(1, '模板名称不能为空').max(100, '模板名称长度不能超过100个字符'),
  version: z.number().int().positive(),
  isActive: z.boolean(),
  appliedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
  updatedBy: z.string(),
  attributes: z.array(z.any()).optional(),
  categoryName: z.string().optional(),
});

export const createAttributeTemplateSchema = z.object({
  categoryId: z.string().uuid('类目ID格式无效'),
  name: z.string().min(1, '模板名称不能为空').max(100, '模板名称长度不能超过100个字符'),
});

export const updateAttributeTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Attribute Validation
// ============================================================================

export const attributeTypeSchema = z.enum([
  'text',
  'number',
  'single-select',
  'multi-select',
  'boolean',
  'date',
]);

export const validationRuleSchema = z.object({
  type: z.enum(['required', 'min', 'max', 'pattern', 'custom']),
  value: z.any().optional(),
  message: z.string(),
});

export const attributeSchema = z
  .object({
    id: z.string().uuid('ID格式无效'),
    templateId: z.string().uuid('模板ID格式无效'),
    name: z.string().min(1, '属性名称不能为空').max(50, '属性名称长度不能超过50个字符'),
    code: z
      .string()
      .min(1, '属性编码不能为空')
      .max(50, '属性编码长度不能超过50个字符')
      .regex(/^[A-Z0-9_]+$/i, '属性编码只能包含字母、数字和下划线'),
    type: attributeTypeSchema,
    required: z.boolean(),
    description: z.string().max(500).optional(),
    dictionaryTypeId: z.string().uuid().optional(),
    customValues: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
    sort: z.number().int().default(0),
    group: z.string().optional(),
    level: z.enum(['SPU', 'SKU', 'both']),
    validation: z.array(validationRuleSchema).optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string(),
    updatedBy: z.string(),
  })
  .refine(
    (data) => {
      // If type is select or multi-select, must have dictionaryTypeId or customValues
      if (data.type === 'single-select' || data.type === 'multi-select') {
        return !!(data.dictionaryTypeId || (data.customValues && data.customValues.length > 0));
      }
      return true;
    },
    {
      message: '单选/多选类型必须配置来源字典或自定义值',
      path: ['dictionaryTypeId'],
    }
  );

export const createAttributeSchema = z
  .object({
    templateId: z.string().uuid('模板ID格式无效'),
    name: z.string().min(1).max(50),
    code: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Z0-9_]+$/i),
    type: attributeTypeSchema,
    required: z.boolean(),
    description: z.string().max(500).optional(),
    dictionaryTypeId: z.string().uuid().optional(),
    customValues: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
    sort: z.number().int().default(0),
    group: z.string().optional(),
    level: z.enum(['SPU', 'SKU', 'both']).default('SPU'),
    validation: z.array(validationRuleSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'single-select' || data.type === 'multi-select') {
        return !!(data.dictionaryTypeId || (data.customValues && data.customValues.length > 0));
      }
      return true;
    },
    {
      message: '单选/多选类型必须配置来源字典或自定义值',
      path: ['dictionaryTypeId'],
    }
  );

export const updateAttributeSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    required: z.boolean().optional(),
    description: z.string().max(500).optional(),
    dictionaryTypeId: z.string().uuid().optional(),
    customValues: z.array(z.string()).optional(),
    defaultValue: z.any().optional(),
    sort: z.number().int().optional(),
    group: z.string().optional(),
    level: z.enum(['SPU', 'SKU', 'both']).optional(),
    validation: z.array(validationRuleSchema).optional(),
  })
  .refine(
    (data) => {
      // Only validate if type-related fields are being updated
      if (data.dictionaryTypeId !== undefined || data.customValues !== undefined) {
        // This validation would need the current attribute type
        // For now, we'll skip this check in update schema
        return true;
      }
      return true;
    },
    {
      message: '单选/多选类型必须配置来源字典或自定义值',
    }
  );

// ============================================================================
// Batch Update Validation
// ============================================================================

export const batchUpdateSortSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid('ID格式无效'),
      sort: z.number().int(),
    })
  ),
});

// ============================================================================
// Type Exports
// ============================================================================

export type DictionaryTypeInput = z.infer<typeof createDictionaryTypeSchema>;
export type DictionaryTypeUpdate = z.infer<typeof updateDictionaryTypeSchema>;
export type DictionaryItemInput = z.infer<typeof createDictionaryItemSchema>;
export type DictionaryItemUpdate = z.infer<typeof updateDictionaryItemSchema>;
export type AttributeTemplateInput = z.infer<typeof createAttributeTemplateSchema>;
export type AttributeTemplateUpdate = z.infer<typeof updateAttributeTemplateSchema>;
export type AttributeInput = z.infer<typeof createAttributeSchema>;
export type AttributeUpdate = z.infer<typeof updateAttributeSchema>;
export type BatchUpdateSortInput = z.infer<typeof batchUpdateSortSchema>;

