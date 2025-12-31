/**
 * 场景包编辑器 Zod 验证 Schemas
 * Feature: 001-scenario-package-tabs
 */

import { z } from 'zod';

// ========== 枚举 Schemas ==========

export const PublishStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const DayOfWeekSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const OverrideTypeSchema = z.enum(['ADD', 'MODIFY', 'CANCEL']);

export const AddOnCategorySchema = z.enum(['CATERING', 'BEVERAGE', 'SERVICE', 'DECORATION']);

// ========== 通用 Schemas ==========

/**
 * 价格调整规则
 */
export const PriceAdjustmentSchema = z
  .object({
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number(),
  })
  .nullable()
  .optional();

/**
 * 时间格式 HH:mm
 */
export const TimeFormatSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: '时间格式必须为 HH:mm',
});

/**
 * 日期格式 YYYY-MM-DD
 */
export const DateFormatSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: '日期格式必须为 YYYY-MM-DD',
});

// ========== 基础信息 Schemas ==========

/**
 * 基础信息表单 Schema
 */
export const BasicInfoFormSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100, '名称最多100个字符'),
  description: z.string().max(500, '描述最多500个字符').nullable().optional(),
  category: z.string().min(1, '请选择分类'),
  mainImage: z.string().min(1, '请上传主图').url('请输入有效的图片URL'),
});

export type BasicInfoFormData = z.infer<typeof BasicInfoFormSchema>;

// ========== 套餐 Schemas ==========

/**
 * 套餐表单 Schema
 */
export const PackageTierFormSchema = z
  .object({
    name: z.string().min(1, '套餐名称不能为空').max(50, '套餐名称最多50个字符'),
    price: z.number().positive('价格必须大于0'),
    originalPrice: z.number().positive('原价必须大于0').nullable().optional(),
    tags: z
      .array(z.string().max(20, '标签最多20个字符'))
      .max(5, '最多5个标签')
      .nullable()
      .optional(),
    serviceDescription: z.string().max(1000, '服务内容描述最多1000个字符').nullable().optional(),
    sortOrder: z.number().int().nonnegative().optional().default(0),
  })
  .refine(
    (data) => {
      if (data.originalPrice !== null && data.originalPrice !== undefined) {
        return data.originalPrice >= data.price;
      }
      return true;
    },
    {
      message: '原价必须大于等于售价',
      path: ['originalPrice'],
    }
  );

export type PackageTierFormData = z.infer<typeof PackageTierFormSchema>;

// ========== 加购项 Schemas ==========

/**
 * 加购项关联 Schema
 */
export const PackageAddOnItemSchema = z.object({
  addOnItemId: z.string().min(1),
  sortOrder: z.number().int().nonnegative().default(0),
  isRequired: z.boolean().default(false),
});

/**
 * 更新加购项关联 Schema
 */
export const UpdateAddOnsFormSchema = z.object({
  addons: z.array(PackageAddOnItemSchema),
});

export type UpdateAddOnsFormData = z.infer<typeof UpdateAddOnsFormSchema>;

// ========== 时段模板 Schemas ==========

/**
 * 时段模板表单 Schema
 */
export const TimeSlotTemplateFormSchema = z
  .object({
    dayOfWeek: DayOfWeekSchema,
    startTime: TimeFormatSchema,
    endTime: TimeFormatSchema,
    capacity: z.number().int().positive('容量必须大于0').nullable().optional(),
    priceAdjustment: PriceAdjustmentSchema,
    isEnabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: '结束时间必须晚于开始时间',
      path: ['endTime'],
    }
  );

export type TimeSlotTemplateFormData = z.infer<typeof TimeSlotTemplateFormSchema>;

// ========== 时段覆盖 Schemas ==========

/**
 * 时段覆盖表单 Schema - 新增类型
 */
const TimeSlotOverrideAddSchema = z.object({
  date: DateFormatSchema,
  overrideType: z.literal('ADD'),
  startTime: TimeFormatSchema,
  endTime: TimeFormatSchema,
  capacity: z.number().int().positive().nullable().optional(),
  reason: z.string().max(200).nullable().optional(),
});

/**
 * 时段覆盖表单 Schema - 修改类型
 */
const TimeSlotOverrideModifySchema = z.object({
  date: DateFormatSchema,
  overrideType: z.literal('MODIFY'),
  startTime: TimeFormatSchema,
  endTime: TimeFormatSchema,
  capacity: z.number().int().positive().nullable().optional(),
  reason: z.string().max(200).nullable().optional(),
});

/**
 * 时段覆盖表单 Schema - 取消类型
 */
const TimeSlotOverrideCancelSchema = z.object({
  date: DateFormatSchema,
  overrideType: z.literal('CANCEL'),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  capacity: z.number().nullable().optional(),
  reason: z.string().max(200).nullable().optional(),
});

/**
 * 时段覆盖表单 Schema (联合类型)
 */
export const TimeSlotOverrideFormSchema = z.discriminatedUnion('overrideType', [
  TimeSlotOverrideAddSchema,
  TimeSlotOverrideModifySchema,
  TimeSlotOverrideCancelSchema,
]);

export type TimeSlotOverrideFormData = z.infer<typeof TimeSlotOverrideFormSchema>;

// ========== 发布设置 Schemas ==========

/**
 * 发布设置表单 Schema
 */
export const PublishSettingsFormSchema = z
  .object({
    effectiveStartDate: DateFormatSchema.nullable().optional(),
    effectiveEndDate: DateFormatSchema.nullable().optional(),
    advanceBookingDays: z
      .number()
      .int()
      .nonnegative('提前预订天数不能为负')
      .max(365, '提前预订天数最多365天')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.effectiveStartDate && data.effectiveEndDate) {
        return new Date(data.effectiveEndDate) >= new Date(data.effectiveStartDate);
      }
      return true;
    },
    {
      message: '结束日期必须晚于或等于开始日期',
      path: ['effectiveEndDate'],
    }
  );

export type PublishSettingsFormData = z.infer<typeof PublishSettingsFormSchema>;

// ========== 导出 ==========

export const validationSchemas = {
  BasicInfoFormSchema,
  PackageTierFormSchema,
  UpdateAddOnsFormSchema,
  TimeSlotTemplateFormSchema,
  TimeSlotOverrideFormSchema,
  PublishSettingsFormSchema,
};
