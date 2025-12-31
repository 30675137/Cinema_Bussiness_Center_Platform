/**
 * @spec O004-beverage-sku-reuse
 * SKU Form Validation Schema (Zod)
 *
 * 定义 SKU 创建/编辑表单的验证规则,使用 Zod 进行运行时类型检查和数据验证
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import { z } from 'zod';
import { SkuType, SkuStatus } from '@/types/sku';

/**
 * SKU 类型枚举验证
 */
const skuTypeSchema = z.nativeEnum(SkuType, {
  errorMap: () => ({ message: 'SKU 类型无效' }),
});

/**
 * SKU 状态枚举验证
 */
const skuStatusSchema = z.nativeEnum(SkuStatus, {
  errorMap: () => ({ message: 'SKU 状态无效' }),
});

/**
 * BOM 组件验证 schema (成品类型 SKU 使用)
 */
const bomComponentSchema = z.object({
  /** 组件 SKU ID */
  componentId: z.string({
    required_error: '请选择配方组件',
    invalid_type_error: '组件 ID 格式错误',
  }).uuid('组件 ID 必须为 UUID 格式'),

  /** 用量 */
  quantity: z.number({
    required_error: '请输入用量',
    invalid_type_error: '用量必须为数字',
  }).positive('用量必须大于 0'),

  /** 单位 */
  unit: z.string({
    required_error: '请选择单位',
    invalid_type_error: '单位格式错误',
  }).min(1, '单位不能为空'),

  /** 是否可选 */
  isOptional: z.boolean().optional().default(false),

  /** 排序顺序 */
  sortOrder: z.number().int().nonnegative().optional().default(0),
});

/**
 * 套餐子项验证 schema (套餐类型 SKU 使用)
 */
const comboItemSchema = z.object({
  /** 子项 SKU ID */
  subItemId: z.string({
    required_error: '请选择套餐子项',
    invalid_type_error: '子项 ID 格式错误',
  }).uuid('子项 ID 必须为 UUID 格式'),

  /** 数量 */
  quantity: z.number({
    required_error: '请输入数量',
    invalid_type_error: '数量必须为数字',
  }).positive('数量必须大于 0'),

  /** 单位 */
  unit: z.string({
    required_error: '请选择单位',
    invalid_type_error: '单位格式错误',
  }).min(1, '单位不能为空'),

  /** 排序顺序 */
  sortOrder: z.number().int().nonnegative().optional().default(0),
});

/**
 * SKU 创建表单验证 schema
 *
 * 根据 SKU 类型的不同,验证规则会有所差异:
 * - raw_material: 需要 standardCost(标准成本)
 * - packaging: 需要 standardCost(标准成本)
 * - finished_product: 需要 bomComponents(BOM 配方),可选 price(零售价)
 * - combo: 需要 comboItems(套餐子项),可选 price(零售价)
 */
export const skuCreateSchema = z.object({
  /** SKU 名称 */
  name: z.string({
    required_error: 'SKU 名称不能为空',
    invalid_type_error: 'SKU 名称格式错误',
  })
    .min(2, 'SKU 名称至少 2 个字符')
    .max(100, 'SKU 名称最多 100 个字符')
    .trim(),

  /** SPU ID (关联的 SPU) */
  spuId: z.string({
    required_error: '请选择关联的 SPU',
    invalid_type_error: 'SPU ID 格式错误',
  }).uuid('SPU ID 必须为 UUID 格式'),

  /** SKU 类型 */
  skuType: skuTypeSchema,

  /** 主单位 ID */
  mainUnitId: z.string({
    required_error: '请选择主单位',
    invalid_type_error: '主单位 ID 格式错误',
  }).min(1, '主单位不能为空'),

  /** 主条码 */
  mainBarcode: z.string().optional(),

  /** 标准成本 (原料/包材类型) */
  standardCost: z.number({
    invalid_type_error: '标准成本必须为数字',
  }).nonnegative('标准成本不能为负数').optional(),

  /** 零售价 (成品/套餐类型) */
  price: z.number({
    invalid_type_error: '零售价必须为数字',
  }).nonnegative('零售价不能为负数').optional(),

  /** 门店范围 (可选) */
  storeScope: z.array(z.string()).optional(),

  /** SKU 状态 */
  status: skuStatusSchema.default(SkuStatus.DRAFT),

  /** BOM 配方 (成品类型) */
  bomComponents: z.array(bomComponentSchema).optional(),

  /** 损耗率 (成品类型) */
  wasteRate: z.number({
    invalid_type_error: '损耗率必须为数字',
  }).min(0, '损耗率不能为负数').max(1, '损耗率不能超过 100%').optional(),

  /** 套餐子项 (套餐类型) */
  comboItems: z.array(comboItemSchema).optional(),
}).superRefine((data, ctx) => {
  // 根据 SKU 类型进行额外验证
  switch (data.skuType) {
    case SkuType.RAW_MATERIAL:
    case SkuType.PACKAGING:
      // 原料/包材类型必须填写标准成本
      if (data.standardCost === undefined || data.standardCost === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['standardCost'],
          message: `${data.skuType === SkuType.RAW_MATERIAL ? '原料' : '包材'}类型必须填写标准成本`,
        });
      }
      break;

    case SkuType.FINISHED_PRODUCT:
      // 成品类型必须配置 BOM 配方
      if (!data.bomComponents || data.bomComponents.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bomComponents'],
          message: '成品类型必须配置 BOM 配方(至少 1 个组件)',
        });
      }
      break;

    case SkuType.COMBO:
      // 套餐类型必须配置子项
      if (!data.comboItems || data.comboItems.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['comboItems'],
          message: '套餐类型必须配置子项(至少 1 个)',
        });
      }
      break;
  }
});

/**
 * SKU 编辑表单验证 schema
 *
 * 编辑时允许部分字段为可选(如 SKU 类型、SPU ID 不可修改)
 */
export const skuEditSchema = z.object({
  /** SKU 名称 */
  name: z.string({
    required_error: 'SKU 名称不能为空',
    invalid_type_error: 'SKU 名称格式错误',
  })
    .min(2, 'SKU 名称至少 2 个字符')
    .max(100, 'SKU 名称最多 100 个字符')
    .trim()
    .optional(),

  /** 主单位 ID */
  mainUnitId: z.string({
    invalid_type_error: '主单位 ID 格式错误',
  }).min(1, '主单位不能为空').optional(),

  /** 标准成本 (原料/包材类型) */
  standardCost: z.number({
    invalid_type_error: '标准成本必须为数字',
  }).nonnegative('标准成本不能为负数').optional(),

  /** 零售价 (成品/套餐类型) */
  price: z.number({
    invalid_type_error: '零售价必须为数字',
  }).nonnegative('零售价不能为负数').optional(),

  /** 门店范围 */
  storeScope: z.array(z.string()).optional(),

  /** SKU 状态 */
  status: skuStatusSchema.optional(),
});

/**
 * SKU 查询参数验证 schema
 */
export const skuQuerySchema = z.object({
  /** 关键字搜索 */
  keyword: z.string().optional(),

  /** 状态筛选 */
  status: z.union([
    z.literal('all'),
    skuStatusSchema,
  ]).optional().default('all'),

  /** 页码 */
  page: z.number().int().positive().optional().default(1),

  /** 每页条数 */
  pageSize: z.number().int().positive().max(100).optional().default(20),
});

/**
 * 类型导出(从 schema 推断类型)
 */
export type SkuCreateFormData = z.infer<typeof skuCreateSchema>;
export type SkuEditFormData = z.infer<typeof skuEditSchema>;
export type SkuQueryFormData = z.infer<typeof skuQuerySchema>;
