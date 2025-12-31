/**
 * Integration tests for event update
 *
 * Tests updating event fields, conflict validation on update
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ScheduleManagement from '../index';
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';
import { scheduleService } from '../services/scheduleService';

// Create a test query client
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
};

// Wrapper component for tests
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

describe('Event Update Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    const store = useScheduleStore.getState();
    store.setSelectedDate('2025-01-27');
    store.setSelectedEvent(null);
  });

  describe('Update Event Fields', () => {
    it('should update event title', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/流浪地球|生日派对/)).toBeInTheDocument();
      });

      // Get first event and update it
      const listResponse = await scheduleService.getScheduleList({ date: '2025-01-27' });
      if (listResponse.success && listResponse.data.length > 0) {
        const event = listResponse.data[0];
        const updateResponse = await scheduleService.updateSchedule({
          id: event.id,
          title: '更新后的标题',
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
          expect(updateResponse.data.title).toBe('更新后的标题');
        }
      }
    });

    it('should update event time', async () => {
      const listResponse = await scheduleService.getScheduleList({ date: '2025-01-27' });
      if (listResponse.success && listResponse.data.length > 0) {
        const event = listResponse.data[0];
        const updateResponse = await scheduleService.updateSchedule({
          id: event.id,
          startHour: 11,
          duration: 2,
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
          expect(updateResponse.data.startHour).toBe(11);
          expect(updateResponse.data.duration).toBe(2);
        }
      }
    });

    it('should update event customer information', async () => {
      const listResponse = await scheduleService.getScheduleList({
        date: '2025-01-27',
        type: 'private',
      });
      if (listResponse.success && listResponse.data.length > 0) {
        const event = listResponse.data[0];
        const updateResponse = await scheduleService.updateSchedule({
          id: event.id,
          customer: '新客户',
          serviceManager: '新经理',
        });

        expect(updateResponse.success).toBe(true);
        if (updateResponse.success) {
          expect(updateResponse.data.customer).toBe('新客户');
          expect(updateResponse.data.serviceManager).toBe('新经理');
        }
      }
    });
  });

  describe('Conflict Validation on Update', () => {
    it('should reject update if new time conflicts with existing event', async () => {
      const listResponse = await scheduleService.getScheduleList({ date: '2025-01-27' });
      if (listResponse.success && listResponse.data.length >= 2) {
        const event1 = listResponse.data[0];
        const event2 = listResponse.data[1];

        // Try to update event1 to overlap with event2
        try {
          await scheduleService.updateSchedule({
            id: event1.id,
            hallId: event2.hallId,
            startHour: event2.startHour,
            duration: event2.duration,
          });
          // Should not reach here
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error.message).toContain('冲突|占用');
        }
      }
    });

    it('should allow update if new time does not conflict', async () => {
      const listResponse = await scheduleService.getScheduleList({ date: '2025-01-27' });
      if (listResponse.success && listResponse.data.length > 0) {
        const event = listResponse.data[0];
        // Update to a time that doesn't conflict (e.g., very early morning)
        const updateResponse = await scheduleService.updateSchedule({
          id: event.id,
          startHour: 10,
          duration: 0.5,
        });

        expect(updateResponse.success).toBe(true);
      }
    });

    it('should exclude current event when checking conflicts', async () => {
      const listResponse = await scheduleService.getScheduleList({ date: '2025-01-27' });
      if (listResponse.success && listResponse.data.length > 0) {
        const event = listResponse.data[0];
        // Update event to same time (should not conflict with itself)
        const updateResponse = await scheduleService.updateSchedule({
          id: event.id,
          startHour: event.startHour,
          duration: event.duration,
        });

        expect(updateResponse.success).toBe(true);
      }
    });
  });
});
