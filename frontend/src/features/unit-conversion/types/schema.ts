/**
 * Zod 验证 Schema
 * P002-unit-conversion
 */

import { z } from 'zod';

/**
 * 创建/更新换算规则的表单验证 Schema
 */
export const createConversionSchema = z
  .object({
    fromUnit: z.string().min(1, '源单位不能为空').max(20, '源单位不能超过20字符'),
    toUnit: z.string().min(1, '目标单位不能为空').max(20, '目标单位不能超过20字符'),
    conversionRate: z
      .number({ invalid_type_error: '请输入有效的换算率' })
      .positive('换算率必须为正数')
      .max(999999.999999, '换算率超出范围'),
    category: z.enum(['volume', 'weight', 'quantity'], {
      errorMap: () => ({ message: '请选择单位类别' }),
    }),
    description: z.string().optional(),
  })
  .refine((data) => data.fromUnit !== data.toUnit, {
    message: '源单位和目标单位不能相同',
    path: ['toUnit'],
  });

/**
 * 创建换算规则的表单输入类型
 */
export type CreateConversionInput = z.infer<typeof createConversionSchema>;

/**
 * 循环验证请求 Schema
 */
export const validateCycleSchema = z.object({
  fromUnit: z.string().min(1, '源单位不能为空'),
  toUnit: z.string().min(1, '目标单位不能为空'),
  excludeId: z.string().uuid().optional(),
});

/**
 * 路径计算请求 Schema
 */
export const calculatePathSchema = z.object({
  fromUnit: z.string().min(1, '源单位不能为空'),
  toUnit: z.string().min(1, '目标单位不能为空'),
});
