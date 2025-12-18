/**
 * MSW Handlers for Store Reservation Settings API
 *
 * Mock handlers for reservation settings endpoints during development and testing.
 */

import { http, HttpResponse } from 'msw';
import type { StoreReservationSettings } from '../../pages/store-reservation-settings/types/reservation-settings.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Mock data storage
const mockSettings: Map<string, StoreReservationSettings> = new Map();

// Initialize with some mock data
const initializeMockData = () => {
  const storeId1 = '550e8400-e29b-41d4-a716-446655440000';
  const storeId2 = '550e8400-e29b-41d4-a716-446655440001';
  const storeId3 = '550e8400-e29b-41d4-a716-446655440002';

  mockSettings.set(storeId1, {
    id: '660e8400-e29b-41d4-a716-446655440000',
    storeId: storeId1,
    isReservationEnabled: true,
    maxReservationDays: 7,
    createdAt: '2025-12-17T10:00:00Z',
    updatedAt: '2025-12-17T10:00:00Z',
  });

  mockSettings.set(storeId2, {
    id: '660e8400-e29b-41d4-a716-446655440001',
    storeId: storeId2,
    isReservationEnabled: false,
    maxReservationDays: 0,
    createdAt: '2025-12-17T10:00:00Z',
    updatedAt: '2025-12-17T10:00:00Z',
  });

  mockSettings.set(storeId3, {
    id: '660e8400-e29b-41d4-a716-446655440002',
    storeId: storeId3,
    isReservationEnabled: true,
    maxReservationDays: 14,
    createdAt: '2025-12-17T10:00:00Z',
    updatedAt: '2025-12-17T10:00:00Z',
  });
};

// Initialize on module load
initializeMockData();

export const reservationSettingsHandlers = [
  // GET /api/stores/{storeId}/reservation-settings
  http.get(`${API_BASE_URL}/api/stores/:storeId/reservation-settings`, ({ params }) => {
    const { storeId } = params;
    const settings = mockSettings.get(storeId as string);

    if (!settings) {
      return HttpResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: `门店预约设置不存在: ${storeId}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: settings,
      timestamp: new Date().toISOString(),
    });
  }),

  // PUT /api/stores/{storeId}/reservation-settings
  http.put(
    `${API_BASE_URL}/api/stores/:storeId/reservation-settings`,
    async ({ params, request }) => {
      const { storeId } = params;
      const body = await request.json() as { isReservationEnabled: boolean; maxReservationDays: number };

      // Validation
      if (body.isReservationEnabled && (!body.maxReservationDays || body.maxReservationDays <= 0)) {
        return HttpResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: '开启预约时必须设置可预约天数（1-365天）',
            details: { maxReservationDays: '必须大于0' },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const existingSettings = mockSettings.get(storeId as string);
      const updatedSettings: StoreReservationSettings = {
        ...(existingSettings || {
          id: `660e8400-e29b-41d4-a716-${storeId}`,
          storeId: storeId as string,
          createdAt: new Date().toISOString(),
        }),
        isReservationEnabled: body.isReservationEnabled,
        maxReservationDays: body.maxReservationDays,
        updatedAt: new Date().toISOString(),
      };

      mockSettings.set(storeId as string, updatedSettings);

      return HttpResponse.json({
        data: updatedSettings,
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // PUT /api/stores/reservation-settings/batch
  http.put(`${API_BASE_URL}/api/stores/reservation-settings/batch`, async ({ request }) => {
    const body = await request.json() as {
      storeIds: string[];
      settings: { isReservationEnabled: boolean; maxReservationDays: number };
    };

    const result = {
      successCount: 0,
      failureCount: 0,
      failures: [] as Array<{ storeId: string; error: string; message: string }>,
    };

    for (const storeId of body.storeIds) {
      try {
        const existingSettings = mockSettings.get(storeId);
        const updatedSettings: StoreReservationSettings = {
          ...(existingSettings || {
            id: `660e8400-e29b-41d4-a716-${storeId}`,
            storeId,
            createdAt: new Date().toISOString(),
          }),
          isReservationEnabled: body.settings.isReservationEnabled,
          maxReservationDays: body.settings.maxReservationDays,
          updatedAt: new Date().toISOString(),
        };

        mockSettings.set(storeId, updatedSettings);
        result.successCount++;
      } catch (error) {
        result.failureCount++;
        result.failures.push({
          storeId,
          error: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return HttpResponse.json({
      data: result,
      timestamp: new Date().toISOString(),
    });
  }),
];

