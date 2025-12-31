/**
 * 门店预约设置类型定义
 * Feature: 016-store-reservation-settings
 */
import { z } from 'zod';

// ============================================================================
// 枚举定义
// ============================================================================

/** 星期几 (1=周一, 7=周日) */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** 预约时长单位（小时） */
export type DurationUnit = 1 | 2 | 4;

// ============================================================================
// 核心类型定义
// ============================================================================

/** 时间段 */
export interface TimeSlot {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm 格式
  endTime: string; // HH:mm 格式
}

/** 预约设置 */
export interface ReservationSettings {
  id: string;
  storeId: string;
  timeSlots: TimeSlot[];
  minAdvanceHours: number;
  maxAdvanceDays: number;
  durationUnit: DurationUnit;
  depositRequired: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** 预约设置更新请求 */
export interface ReservationSettingsUpdateRequest {
  timeSlots?: TimeSlot[];
  minAdvanceHours?: number;
  maxAdvanceDays?: number;
  durationUnit?: DurationUnit;
  depositRequired?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  isActive?: boolean;
}

/** 时间段配置表单 */
export interface TimeSlotFormData {
  timeSlots: TimeSlot[];
}

/** 提前量配置表单 */
export interface AdvanceTimeFormData {
  minAdvanceHours: number;
  maxAdvanceDays: number;
}

/** 时长单位配置表单 */
export interface DurationUnitFormData {
  durationUnit: DurationUnit;
}

/** 押金规则配置表单 */
export interface DepositFormData {
  depositRequired: boolean;
  depositAmount?: number;
  depositPercentage?: number;
}

// ============================================================================
// Zod 验证模式
// ============================================================================

/** 时间格式验证 HH:mm */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

/** 时间段验证 */
export const TimeSlotSchema = z
  .object({
    dayOfWeek: z.number().min(1).max(7) as z.ZodType<DayOfWeek>,
    startTime: z.string().regex(timeRegex, '时间格式必须为 HH:mm'),
    endTime: z.string().regex(timeRegex, '时间格式必须为 HH:mm'),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: '结束时间必须晚于开始时间',
    path: ['endTime'],
  });

/** 时间段数组验证 */
export const TimeSlotsSchema = z.array(TimeSlotSchema);

/** 预约设置更新验证 */
export const ReservationSettingsUpdateSchema = z
  .object({
    timeSlots: TimeSlotsSchema.optional(),
    minAdvanceHours: z.number().int().positive().optional(),
    maxAdvanceDays: z.number().int().positive().optional(),
    durationUnit: z.union([z.literal(1), z.literal(2), z.literal(4)]).optional(),
    depositRequired: z.boolean().optional(),
    depositAmount: z.number().nonnegative().optional(),
    depositPercentage: z.number().int().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // 验证提前量逻辑
      if (data.minAdvanceHours !== undefined && data.maxAdvanceDays !== undefined) {
        return data.maxAdvanceDays * 24 > data.minAdvanceHours;
      }
      return true;
    },
    { message: '最大提前天数*24必须大于最小提前小时数', path: ['maxAdvanceDays'] }
  )
  .refine(
    (data) => {
      // 押金验证：如果需要押金，必须设置金额或比例
      if (data.depositRequired) {
        return data.depositAmount !== undefined || data.depositPercentage !== undefined;
      }
      return true;
    },
    { message: '开启押金时必须设置押金金额或比例', path: ['depositAmount'] }
  );

/** 时间段配置表单验证 */
export const TimeSlotFormSchema = z.object({
  timeSlots: TimeSlotsSchema.min(1, '至少需要配置一个时间段'),
});

/** 提前量配置表单验证 */
export const AdvanceTimeFormSchema = z
  .object({
    minAdvanceHours: z.number().int().positive('最小提前小时数必须大于0'),
    maxAdvanceDays: z.number().int().positive('最大提前天数必须大于0'),
  })
  .refine((data) => data.maxAdvanceDays * 24 > data.minAdvanceHours, {
    message: '最大提前天数*24必须大于最小提前小时数',
    path: ['maxAdvanceDays'],
  });

/** 时长单位配置表单验证 */
export const DurationUnitFormSchema = z.object({
  durationUnit: z.union([z.literal(1), z.literal(2), z.literal(4)]),
});

/** 押金规则配置表单验证 */
export const DepositFormSchema = z
  .object({
    depositRequired: z.boolean(),
    depositAmount: z.number().nonnegative().optional(),
    depositPercentage: z.number().int().min(0).max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.depositRequired) {
        return data.depositAmount !== undefined || data.depositPercentage !== undefined;
      }
      return true;
    },
    { message: '开启押金时必须设置押金金额或比例', path: ['depositAmount'] }
  );

// ============================================================================
// 类型推断
// ============================================================================

export type TimeSlotInput = z.infer<typeof TimeSlotSchema>;
export type ReservationSettingsUpdateInput = z.infer<typeof ReservationSettingsUpdateSchema>;
export type TimeSlotFormInput = z.infer<typeof TimeSlotFormSchema>;
export type AdvanceTimeFormInput = z.infer<typeof AdvanceTimeFormSchema>;
export type DurationUnitFormInput = z.infer<typeof DurationUnitFormSchema>;
export type DepositFormInput = z.infer<typeof DepositFormSchema>;

// ============================================================================
// 辅助函数
// ============================================================================

/** 获取星期几的中文名称 */
export const getDayOfWeekName = (day: DayOfWeek): string => {
  const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return names[day - 1];
};

/** 获取时长单位的显示文本 */
export const getDurationUnitLabel = (unit: DurationUnit): string => {
  const labels: Record<DurationUnit, string> = {
    1: '1小时',
    2: '2小时',
    4: '4小时',
  };
  return labels[unit];
};

/** 生成默认时间段配置 */
export const generateDefaultTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let day = 1; day <= 7; day++) {
    slots.push({
      dayOfWeek: day as DayOfWeek,
      startTime: '09:00',
      endTime: '21:00',
    });
  }
  return slots;
};

/** 默认预约设置 */
export const DEFAULT_RESERVATION_SETTINGS: Omit<
  ReservationSettings,
  'id' | 'storeId' | 'createdAt' | 'updatedAt'
> = {
  timeSlots: generateDefaultTimeSlots(),
  minAdvanceHours: 1,
  maxAdvanceDays: 30,
  durationUnit: 1,
  depositRequired: false,
  isActive: true,
};
