/**
 * Reservation Settings Schema Validation Tests
 *
 * Tests for Zod validation schema for reservation settings forms.
 */

import { describe, it, expect } from 'vitest';
import {
  reservationSettingsSchema,
  batchUpdateReservationSettingsSchema,
} from '../../../../src/pages/store-reservation-settings/types/reservation-settings.schema';

describe('reservationSettingsSchema', () => {
  describe('valid inputs', () => {
    it('should validate when reservation is enabled with valid days (1-365)', () => {
      const validData = {
        isReservationEnabled: true,
        maxReservationDays: 7,
      };

      const result = reservationSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate when reservation is disabled with 0 days', () => {
      const validData = {
        isReservationEnabled: false,
        maxReservationDays: 0,
      };

      const result = reservationSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate when reservation is disabled with any days', () => {
      const validData = {
        isReservationEnabled: false,
        maxReservationDays: 10, // Can be any value when disabled
      };

      const result = reservationSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate max days at boundary (365)', () => {
      const validData = {
        isReservationEnabled: true,
        maxReservationDays: 365,
      };

      const result = reservationSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate max days at minimum (1)', () => {
      const validData = {
        isReservationEnabled: true,
        maxReservationDays: 1,
      };

      const result = reservationSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject when reservation is enabled but days is 0', () => {
      const invalidData = {
        isReservationEnabled: true,
        maxReservationDays: 0,
      };

      const result = reservationSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.message.includes('开启预约时必须设置可预约天数')
          )
        ).toBe(true);
      }
    });

    it('should reject when reservation is enabled but days is negative', () => {
      const invalidData = {
        isReservationEnabled: true,
        maxReservationDays: -1,
      };

      const result = reservationSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when max days exceeds 365', () => {
      const invalidData = {
        isReservationEnabled: true,
        maxReservationDays: 366,
      };

      const result = reservationSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when max days is not an integer', () => {
      const invalidData = {
        isReservationEnabled: true,
        maxReservationDays: 7.5,
      };

      const result = reservationSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('batchUpdateReservationSettingsSchema', () => {
  describe('valid inputs', () => {
    it('should validate batch update with valid store IDs and settings', () => {
      const validData = {
        storeIds: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
        settings: {
          isReservationEnabled: true,
          maxReservationDays: 7,
        },
      };

      const result = batchUpdateReservationSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with single store ID', () => {
      const validData = {
        storeIds: ['550e8400-e29b-41d4-a716-446655440000'],
        settings: {
          isReservationEnabled: false,
          maxReservationDays: 0,
        },
      };

      const result = batchUpdateReservationSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty store IDs array', () => {
      const invalidData = {
        storeIds: [],
        settings: {
          isReservationEnabled: true,
          maxReservationDays: 7,
        },
      };

      const result = batchUpdateReservationSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.message.includes('至少选择一个门店'))
        ).toBe(true);
      }
    });

    it('should reject invalid UUID format', () => {
      const invalidData = {
        storeIds: ['invalid-uuid'],
        settings: {
          isReservationEnabled: true,
          maxReservationDays: 7,
        },
      };

      const result = batchUpdateReservationSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid settings (enabled but days is 0)', () => {
      const invalidData = {
        storeIds: ['550e8400-e29b-41d4-a716-446655440000'],
        settings: {
          isReservationEnabled: true,
          maxReservationDays: 0,
        },
      };

      const result = batchUpdateReservationSettingsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
