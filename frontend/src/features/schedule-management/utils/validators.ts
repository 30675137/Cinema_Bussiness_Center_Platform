/**
 * Validation Utilities
 *
 * Zod schemas for validating schedule management data
 */

import { z } from 'zod';

// ============================================================================
// Hall Validation
// ============================================================================

export const hallTypeSchema = z.enum(['VIP', 'Public', 'CP', 'Party']);

export const hallStatusSchema = z.enum(['active', 'inactive', 'maintenance']);

export const hallSchema = z.object({
  id: z.string().min(1, 'ID不能为空').max(50, 'ID长度不能超过50个字符'),
  name: z.string().min(1, '名称不能为空').max(50, '名称长度不能超过50个字符'),
  capacity: z.number().int().positive('容量必须为正整数').max(1000, '容量不能超过1000'),
  type: hallTypeSchema,
  tags: z.array(z.string().min(1).max(20)).optional(),
  operatingHours: z
    .object({
      startHour: z.number().min(0).max(23),
      endHour: z.number().min(1).max(24),
    })
    .optional(),
  status: hallStatusSchema.default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createHallSchema = hallSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const updateHallSchema = hallSchema.partial().extend({
  id: z.string().min(1),
});

// ============================================================================
// Schedule Event Validation
// ============================================================================

export const eventTypeSchema = z.enum(['public', 'private', 'maintenance', 'cleaning']);

export const eventStatusSchema = z.enum(['confirmed', 'pending', 'locked']);

export const scheduleEventSchema = z
  .object({
    id: z.string().min(1, 'ID不能为空'),
    hallId: z.string().min(1, '影厅ID不能为空'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为YYYY-MM-DD'),
    startHour: z.number().min(0, '开始时间不能小于0').max(24, '开始时间不能大于24'),
    duration: z.number().positive('持续时间必须为正数').max(24, '持续时间不能超过24小时'),
    title: z.string().min(1, '标题不能为空').max(100, '标题长度不能超过100个字符'),
    type: eventTypeSchema,
    status: eventStatusSchema.optional(),
    customer: z.string().max(100).optional(),
    serviceManager: z.string().max(50).optional(),
    occupancy: z
      .string()
      .regex(/^\d+\/\d+$/, '上座率格式必须为"当前人数/总容量"')
      .optional(),
    details: z.string().max(500).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
  })
  .refine(
    (data) => {
      // 包场类型必须包含客户信息
      if (data.type === 'private' && !data.customer) {
        return false;
      }
      return true;
    },
    {
      message: '包场类型必须填写客户信息',
      path: ['customer'],
    }
  )
  .refine(
    (data) => {
      // status 仅当 type === 'private' 时有效
      if (data.status && data.type !== 'private') {
        return false;
      }
      return true;
    },
    {
      message: '事件状态仅适用于包场类型',
      path: ['status'],
    }
  );

export const createScheduleEventSchema = scheduleEventSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});

export const updateScheduleEventSchema = scheduleEventSchema.partial().extend({
  id: z.string().min(1),
});

// ============================================================================
// Timeline Config Validation
// ============================================================================

export const timelineConfigSchema = z
  .object({
    startHour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(1).max(24),
    interval: z.number().min(0.25).max(2),
    timeFormat: z.enum(['12h', '24h']),
  })
  .refine(
    (data) => {
      return data.endHour > data.startHour;
    },
    {
      message: '结束时间必须大于开始时间',
      path: ['endHour'],
    }
  );
