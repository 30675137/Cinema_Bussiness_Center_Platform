/**
 * Store Reservation Settings Types
 *
 * Type definitions for Store Reservation Settings entities matching backend DTOs exactly.
 * Based on specs/016-store-reservation-settings/data-model.md
 * 
 * @updated 016-store-reservation-settings 添加时间段、提前量、时长单位、押金字段
 */

/** 星期几 (1=周一, 7=周日) */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** 预约时长单位（小时） */
export type DurationUnit = 1 | 2 | 4;

/**
 * 时间段配置
 */
export interface TimeSlot {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm 格式
  endTime: string;   // HH:mm 格式
}

/**
 * Store reservation settings entity interface
 * Matches backend StoreReservationSettingsDTO fields exactly
 */
export interface StoreReservationSettings {
  id: string;                    // UUID as string
  storeId: string;               // UUID as string
  isReservationEnabled: boolean; // 是否开放预约
  maxReservationDays: number;    // 可预约天数 (0-365)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  updatedBy?: string;            // 最后更新人（可选）
  
  // 016-store-reservation-settings 新增字段
  timeSlots?: TimeSlot[];         // 可预约时间段列表
  minAdvanceHours?: number;       // 最小提前小时数
  durationUnit?: DurationUnit;    // 预约时长单位 (1/2/4 小时)
  depositRequired?: boolean;      // 是否需要押金
  depositAmount?: number;         // 押金金额
  depositPercentage?: number;     // 押金比例 (0-100)
  isActive?: boolean;             // 配置是否生效
}

/**
 * Update reservation settings request
 * Matches backend UpdateStoreReservationSettingsRequest
 */
export interface UpdateStoreReservationSettingsRequest {
  isReservationEnabled: boolean;
  maxReservationDays: number; // 1-365 when enabled, 0 when disabled
  
  // 016-store-reservation-settings 新增字段
  timeSlots?: TimeSlot[];
  minAdvanceHours?: number;
  durationUnit?: DurationUnit;
  depositRequired?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  isActive?: boolean;
}

/**
 * Batch update reservation settings request
 * Matches backend BatchUpdateStoreReservationSettingsRequest
 */
export interface BatchUpdateStoreReservationSettingsRequest {
  storeIds: string[]; // Array of store UUIDs
  settings: UpdateStoreReservationSettingsRequest;
}

/**
 * Batch update result
 * Matches backend BatchUpdateResult
 */
export interface BatchUpdateResult {
  successCount: number;
  failureCount: number;
  failures: Array<{
    storeId: string;
    error: string;
    message: string;
  }>;
}

/**
 * API Response for single reservation settings (standard format per Constitution 1.3.0)
 */
export interface StoreReservationSettingsResponse {
  data: StoreReservationSettings;
  timestamp: string;
}

/**
 * Query parameters for reservation settings list API (if needed)
 */
export interface ReservationSettingsQueryParams {
  storeId?: string;
  isReservationEnabled?: boolean;
}

/**
 * 获取星期几的中文名称
 */
export const getDayOfWeekName = (day: DayOfWeek): string => {
  const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return names[day - 1];
};

/**
 * 获取时长单位的显示文本
 */
export const getDurationUnitLabel = (unit: DurationUnit): string => {
  const labels: Record<DurationUnit, string> = {
    1: '1小时',
    2: '2小时',
    4: '4小时',
  };
  return labels[unit];
};

/**
 * 生成默认时间段配置
 * 默认时段：8:00 - 22:00
 */
export const generateDefaultTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let day = 1; day <= 7; day++) {
    slots.push({
      dayOfWeek: day as DayOfWeek,
      startTime: '08:00',
      endTime: '22:00',
    });
  }
  return slots;
};
