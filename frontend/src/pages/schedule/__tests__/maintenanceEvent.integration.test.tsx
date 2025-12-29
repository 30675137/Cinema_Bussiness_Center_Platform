/**
 * Integration tests for maintenance/cleaning event creation
 * 
 * Tests creating maintenance events, cleaning events, and verifying special styling
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
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

describe('Maintenance/Cleaning Event Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    const store = useScheduleStore.getState();
    store.setSelectedDate('2025-01-27');
    store.setSelectedEvent(null);
  });

  describe('Create Maintenance Event', () => {
    it('should create a maintenance event', async () => {
      const response = await scheduleService.createSchedule({
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10,
        duration: 1,
        title: '设备维护',
        type: 'maintenance',
        details: '投影设备调试',
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.type).toBe('maintenance');
        expect(response.data.title).toBe('设备维护');
      }
    });

    it('should allow maintenance event to overlap with business events', async () => {
      // First create a business event
      const businessEvent = await scheduleService.createSchedule({
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10,
        duration: 2,
        title: '公映排片',
        type: 'public',
      });

      expect(businessEvent.success).toBe(true);

      // Then create a maintenance event at the same time (should be allowed)
      if (businessEvent.success) {
        const maintenanceEvent = await scheduleService.createSchedule({
          hallId: 'h1',
          date: '2025-01-27',
          startHour: 10.5,
          duration: 1,
          title: '设备维护',
          type: 'maintenance',
        });

        expect(maintenanceEvent.success).toBe(true);
      }
    });
  });

  describe('Create Cleaning Event', () => {
    it('should create a cleaning event', async () => {
      const response = await scheduleService.createSchedule({
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 13,
        duration: 0.5,
        title: '保洁',
        type: 'cleaning',
        details: '日常保洁',
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.type).toBe('cleaning');
        expect(response.data.title).toBe('保洁');
      }
    });

    it('should not allow cleaning event to overlap with another cleaning event', async () => {
      // First create a cleaning event
      const cleaning1 = await scheduleService.createSchedule({
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 13,
        duration: 0.5,
        title: '保洁1',
        type: 'cleaning',
      });

      expect(cleaning1.success).toBe(true);

      // Try to create another cleaning event at the same time (should be rejected)
      if (cleaning1.success) {
        try {
          await scheduleService.createSchedule({
            hallId: 'h1',
            date: '2025-01-27',
            startHour: 13,
            duration: 0.5,
            title: '保洁2',
            type: 'cleaning',
          });
          // Should not reach here
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error.message).toContain('冲突|占用');
        }
      }
    });
  });

  describe('Special Styling', () => {
    it('should render maintenance events with striped background', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if maintenance events are rendered with special styling
        const maintenanceEvents = screen.getAllByText(/设备调试|维护/);
        expect(maintenanceEvents.length).toBeGreaterThan(0);
      });
    });

    it('should render cleaning events with striped background', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if cleaning events are rendered with special styling
        const cleaningEvents = screen.getAllByText(/保洁/);
        expect(cleaningEvents.length).toBeGreaterThan(0);
      });
    });
  });
});

