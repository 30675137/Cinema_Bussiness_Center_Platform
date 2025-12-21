/**
 * Store Reservation Settings Zod Validation Schema
 *
 * Validation schema for reservation settings forms, matching backend Bean Validation rules.
 */

import { z } from 'zod';

/**
 * Reservation settings form schema
 * Validates that when isReservationEnabled=true, maxReservationDays must be > 0
 */
export const reservationSettingsSchema = z.object({
  isReservationEnabled: z.boolean(),
  maxReservationDays: z.number().int().min(0).max(365),
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

