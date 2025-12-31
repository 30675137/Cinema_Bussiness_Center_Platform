/**
 * Reservation Settings Service Unit Tests
 *
 * Tests for reservation settings API service functions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoreReservationSettings,
  updateStoreReservationSettings,
  batchUpdateStoreReservationSettings,
} from '../../../src/pages/store-reservation-settings/services/reservationSettingsService';
import type {
  StoreReservationSettings,
  UpdateStoreReservationSettingsRequest,
  BatchUpdateStoreReservationSettingsRequest,
} from '../../../src/pages/store-reservation-settings/types/reservation-settings.types';

// Mock fetch
global.fetch = vi.fn();

describe('ReservationSettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStoreReservationSettings', () => {
    it('should successfully fetch reservation settings for a store', async () => {
      // Given
      const storeId = '550e8400-e29b-41d4-a716-446655440000';
      const mockSettings: StoreReservationSettings = {
        id: '660e8400-e29b-41d4-a716-446655440000',
        storeId,
        isReservationEnabled: true,
        maxReservationDays: 7,
        createdAt: '2025-12-17T10:00:00Z',
        updatedAt: '2025-12-17T10:00:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockSettings,
          timestamp: '2025-12-17T10:00:00Z',
        }),
      });

      // When
      const result = await getStoreReservationSettings(storeId);

      // Then
      expect(result).toEqual(mockSettings);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/stores/${storeId}/reservation-settings`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should throw error when settings not found (404)', async () => {
      // Given
      const storeId = 'non-existent-store-id';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // When & Then
      await expect(getStoreReservationSettings(storeId)).rejects.toThrow(
        'Reservation settings not found for store'
      );
    });

    it('should throw error when server error occurs', async () => {
      // Given
      const storeId = '550e8400-e29b-41d4-a716-446655440000';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // When & Then
      await expect(getStoreReservationSettings(storeId)).rejects.toThrow(
        'Failed to fetch reservation settings'
      );
    });
  });

  describe('updateStoreReservationSettings', () => {
    it('should successfully update reservation settings', async () => {
      // Given
      const storeId = '550e8400-e29b-41d4-a716-446655440000';
      const request: UpdateStoreReservationSettingsRequest = {
        isReservationEnabled: true,
        maxReservationDays: 14,
      };
      const mockUpdatedSettings: StoreReservationSettings = {
        id: '660e8400-e29b-41d4-a716-446655440000',
        storeId,
        isReservationEnabled: true,
        maxReservationDays: 14,
        createdAt: '2025-12-17T10:00:00Z',
        updatedAt: '2025-12-17T11:00:00Z',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockUpdatedSettings,
          timestamp: '2025-12-17T11:00:00Z',
        }),
      });

      // When
      const result = await updateStoreReservationSettings(storeId, request);

      // Then
      expect(result).toEqual(mockUpdatedSettings);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/stores/${storeId}/reservation-settings`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })
      );
    });

    it('should throw error when validation fails (400)', async () => {
      // Given
      const storeId = '550e8400-e29b-41d4-a716-446655440000';
      const request: UpdateStoreReservationSettingsRequest = {
        isReservationEnabled: true,
        maxReservationDays: 0, // Invalid: should be > 0 when enabled
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'VALIDATION_ERROR',
          message: '开启预约时必须设置可预约天数（1-365天）',
        }),
      });

      // When & Then
      await expect(updateStoreReservationSettings(storeId, request)).rejects.toThrow(
        '开启预约时必须设置可预约天数（1-365天）'
      );
    });
  });

  describe('batchUpdateStoreReservationSettings', () => {
    it('should successfully batch update reservation settings', async () => {
      // Given
      const request: BatchUpdateStoreReservationSettingsRequest = {
        storeIds: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
        settings: {
          isReservationEnabled: true,
          maxReservationDays: 7,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            successCount: 2,
            failureCount: 0,
            failures: [],
          },
          timestamp: '2025-12-17T11:00:00Z',
        }),
      });

      // When
      const result = await batchUpdateStoreReservationSettings(request);

      // Then
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.failures).toEqual([]);
    });
  });
});
