/**
 * 活动类型管理 - Zod 验证 Schema
 */

import { z } from 'zod';

export const createActivityTypeSchema = z.object({
  name: z.string()
    .min(1, '活动类型名称不能为空')
    .max(100, '活动类型名称长度不能超过100个字符'),
  description: z.string()
    .max(500, '描述长度不能超过500个字符')
    .nullable()
    .optional(),
  businessCategory: z.string()
    .max(100, '业务分类长度不能超过100个字符')
    .nullable()
    .optional(),
  backgroundImageUrl: z.string()
    .url('背景图必须是有效的 URL')
    .max(1000, '背景图 URL 长度不能超过1000个字符')
    .nullable()
    .optional(),
  sort: z.number()
    .int('排序号必须是整数')
    .min(0, '排序号不能小于0')
});

export const updateActivityTypeSchema = createActivityTypeSchema;

export type CreateActivityTypeInput = z.infer<typeof createActivityTypeSchema>;
export type UpdateActivityTypeInput = z.infer<typeof updateActivityTypeSchema>;

