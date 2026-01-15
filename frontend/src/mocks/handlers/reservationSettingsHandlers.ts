/**
 * MSW Handlers for Store Reservation Settings API
 * Feature: 016-store-reservation-settings
 *
 * Mock handlers for reservation settings endpoints during development and testing.
 */

import { http, HttpResponse } from 'msw';
import type {
  ReservationSettings,
  ReservationSettingsUpdateRequest,
  TimeSlot,
  DayOfWeek,
} from '../../types/reservationSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Mock data storage
const mockSettings: Map<string, ReservationSettings> = new Map();

// Generate default time slots
const generateDefaultTimeSlots = (): TimeSlot[] => {
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

// Initialize with some mock data
const initializeMockData = () => {
  const storeId1 = '550e8400-e29b-41d4-a716-446655440000';
  const storeId2 = '550e8400-e29b-41d4-a716-446655440001';
  const storeId3 = '550e8400-e29b-41d4-a716-446655440002';

  const baseDate = new Date().toISOString();

  mockSettings.set(storeId1, {
    id: '660e8400-e29b-41d4-a716-446655440000',
    storeId: storeId1,
    timeSlots: generateDefaultTimeSlots(),
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    durationUnit: 1,
    depositRequired: false,
    isActive: true,
    createdAt: baseDate,
    updatedAt: baseDate,
  });

  mockSettings.set(storeId2, {
    id: '660e8400-e29b-41d4-a716-446655440001',
    storeId: storeId2,
    timeSlots: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '22:00' },
      { dayOfWeek: 7, startTime: '09:00', endTime: '22:00' },
    ],
    minAdvanceHours: 4,
    maxAdvanceDays: 14,
    durationUnit: 2,
    depositRequired: true,
    depositAmount: 100,
    isActive: true,
    createdAt: baseDate,
    updatedAt: baseDate,
  });

  mockSettings.set(storeId3, {
    id: '660e8400-e29b-41d4-a716-446655440002',
    storeId: storeId3,
    timeSlots: generateDefaultTimeSlots(),
    minAdvanceHours: 1,
    maxAdvanceDays: 7,
    durationUnit: 4,
    depositRequired: true,
    depositPercentage: 30,
    isActive: false,
    createdAt: baseDate,
    updatedAt: baseDate,
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
      // 返回默认配置（新门店）
      const defaultSettings: ReservationSettings = {
        id: `default-${storeId}`,
        storeId: storeId as string,
        timeSlots: generateDefaultTimeSlots(),
        minAdvanceHours: 1,
        maxAdvanceDays: 30,
        durationUnit: 1,
        depositRequired: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockSettings.set(storeId as string, defaultSettings);
      return HttpResponse.json({
        data: defaultSettings,
        timestamp: new Date().toISOString(),
      });
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
      const body = (await request.json()) as ReservationSettingsUpdateRequest;

      // Validation
      if (body.timeSlots) {
        for (const slot of body.timeSlots) {
          if (slot.startTime >= slot.endTime) {
            return HttpResponse.json(
              {
                error: 'VALIDATION_ERROR',
                message: '结束时间必须晚于开始时间',
                details: { timeSlots: '无效的时间段配置' },
                timestamp: new Date().toISOString(),
              },
              { status: 400 }
            );
          }
        }
      }

      if (
        body.minAdvanceHours !== undefined &&
        body.maxAdvanceDays !== undefined &&
        body.maxAdvanceDays * 24 <= body.minAdvanceHours
      ) {
        return HttpResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: '最大提前天数*24必须大于最小提前小时数',
            details: { maxAdvanceDays: '无效的提前量配置' },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (body.depositRequired && !body.depositAmount && !body.depositPercentage) {
        return HttpResponse.json(
          {
            error: 'VALIDATION_ERROR',
            message: '开启押金时必须设置押金金额或比例',
            details: { depositAmount: '必须设置押金金额或比例' },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      const existingSettings = mockSettings.get(storeId as string);
      const updatedSettings: ReservationSettings = {
        ...(existingSettings || {
          id: `660e8400-e29b-41d4-a716-${storeId}`,
          storeId: storeId as string,
          timeSlots: generateDefaultTimeSlots(),
          minAdvanceHours: 1,
          maxAdvanceDays: 30,
          durationUnit: 1 as const,
          depositRequired: false,
          isActive: true,
          createdAt: new Date().toISOString(),
        }),
        ...body,
        updatedAt: new Date().toISOString(),
      } as ReservationSettings;

      mockSettings.set(storeId as string, updatedSettings);

      return HttpResponse.json({
        data: updatedSettings,
        timestamp: new Date().toISOString(),
      });
    }
  ),

  // DELETE /api/stores/{storeId}/reservation-settings - 重置为默认
  http.delete(`${API_BASE_URL}/api/stores/:storeId/reservation-settings`, ({ params }) => {
    const { storeId } = params;

    // Reset to default settings
    const defaultSettings: ReservationSettings = {
      id: `reset-${storeId}`,
      storeId: storeId as string,
      timeSlots: generateDefaultTimeSlots(),
      minAdvanceHours: 1,
      maxAdvanceDays: 30,
      durationUnit: 1,
      depositRequired: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSettings.set(storeId as string, defaultSettings);

    return HttpResponse.json({
      message: '预约设置已重置为默认值',
      timestamp: new Date().toISOString(),
    });
  }),

  // PUT /api/stores/reservation-settings/batch - 批量更新
  http.put(`${API_BASE_URL}/api/stores/reservation-settings/batch`, async ({ request }) => {
    const body = (await request.json()) as {
      storeIds: string[];
      settings: ReservationSettingsUpdateRequest;
    };

    const result = {
      successCount: 0,
      failureCount: 0,
      failures: [] as Array<{ storeId: string; error: string; message: string }>,
    };

    for (const storeId of body.storeIds) {
      try {
        const existingSettings = mockSettings.get(storeId);
        const updatedSettings: ReservationSettings = {
          ...(existingSettings || {
            id: `batch-${storeId}`,
            storeId,
            timeSlots: generateDefaultTimeSlots(),
            minAdvanceHours: 1,
            maxAdvanceDays: 30,
            durationUnit: 1 as const,
            depositRequired: false,
            isActive: true,
            createdAt: new Date().toISOString(),
          }),
          ...body.settings,
          updatedAt: new Date().toISOString(),
        } as ReservationSettings;

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
