/**
 * Store Reservation Settings Zod Validation Schema
 *
 * Validation schema for reservation settings forms, matching backend Bean Validation rules.
 * 
 * @updated 016-store-reservation-settings 添加时间段、提前量、时长单位、押金验证
 */

import { z } from 'zod';

/** 时间格式验证 HH:mm */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * 时间段验证 schema
 */
export const timeSlotSchema = z.object({
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string().regex(timeRegex, '时间格式必须为 HH:mm'),
  endTime: z.string().regex(timeRegex, '时间格式必须为 HH:mm'),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: '结束时间必须晚于开始时间', path: ['endTime'] }
);

/**
 * Reservation settings form schema
 * Validates that when isReservationEnabled=true, maxReservationDays must be > 0
 */
export const reservationSettingsSchema = z.object({
  isReservationEnabled: z.boolean(),
  maxReservationDays: z.number().int().min(0).max(365),
  
  // 016-store-reservation-settings 新增字段
  timeSlots: z.array(timeSlotSchema).optional(),
  minAdvanceHours: z.number().int().positive().optional(),
  durationUnit: z.union([z.literal(1), z.literal(2), z.literal(4)]).optional(),
  depositRequired: z.boolean().optional(),
  depositAmount: z.number().nonnegative().nullable().optional(),
  depositPercentage: z.number().int().min(0).max(100).nullable().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    // If reservation is enabled, maxReservationDays must be > 0
    if (data.isReservationEnabled && (!data.maxReservationDays || data.maxReservationDays <= 0)) {
      return false;
    }
    return true;
  },
  {
    message: "开启预约时必须设置可预约天数（1-365天）",
    path: ["maxReservationDays"],
  }
).refine(
  (data) => {
    // 如果需要押金，必须设置金额或比例
    if (data.depositRequired && !data.depositAmount && !data.depositPercentage) {
      return false;
    }
    return true;
  },
  {
    message: "开启押金时必须设置押金金额或比例",
    path: ["depositAmount"],
  }
).refine(
  (data) => {
    // 最大提前天数 * 24 必须大于最小提前小时数
    if (data.minAdvanceHours && data.maxReservationDays) {
      return data.maxReservationDays * 24 > data.minAdvanceHours;
    }
    return true;
  },
  {
    message: "最大提前天数*24必须大于最小提前小时数",
    path: ["maxReservationDays"],
  }
);

/**
 * Type inferred from schema
 */
export type ReservationSettingsFormData = z.infer<typeof reservationSettingsSchema>;

/**
 * Batch update request schema
 */
export const batchUpdateReservationSettingsSchema = z.object({
  storeIds: z.array(z.string().uuid()).min(1, "至少选择一个门店"),
  settings: reservationSettingsSchema,
});

/**
 * Type inferred from batch update schema
 */
export type BatchUpdateReservationSettingsFormData = z.infer<typeof batchUpdateReservationSettingsSchema>;
