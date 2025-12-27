/**
 * Integration tests for event detail view
 * 
 * Tests clicking event, viewing details, editing event, updating event
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ScheduleManagement from '../index';
import { useScheduleStore } from '@/features/schedule-management/stores/scheduleStore';

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

describe('Event Detail Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    // Reset store state
    const store = useScheduleStore.getState();
    store.setSelectedDate('2025-01-27');
    store.setSelectedEvent(null);
  });

  describe('View Event Details', () => {
    it('should open detail drawer when clicking an event block', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Wait for events to load
        expect(screen.getByText(/流浪地球|生日派对/)).toBeInTheDocument();
      });

      // Find and click an event
      const eventBlock = screen.getByText(/流浪地球|生日派对/).closest('[role="button"]');
      if (eventBlock) {
        fireEvent.click(eventBlock);

        await waitFor(() => {
          // Check if detail drawer is opened
          expect(screen.getByText(/详情|编辑|删除/)).toBeInTheDocument();
        });
      }
    });

    it('should display event details in drawer', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/流浪地球|生日派对/)).toBeInTheDocument();
      });

      const eventBlock = screen.getByText(/流浪地球|生日派对/).closest('[role="button"]');
      if (eventBlock) {
        fireEvent.click(eventBlock);

        await waitFor(() => {
          // Check for event details
          expect(screen.getByText(/标题|时间|客户|服务经理/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Edit Event', () => {
    it('should open edit form when clicking edit button', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/流浪地球|生日派对/)).toBeInTheDocument();
      });

      // Click event to open drawer
      const eventBlock = screen.getByText(/流浪地球|生日派对/).closest('[role="button"]');
      if (eventBlock) {
        fireEvent.click(eventBlock);

        await waitFor(() => {
          // Find and click edit button
          const editButton = screen.getByText(/编辑/);
          if (editButton) {
            fireEvent.click(editButton);

            // Check if edit form is opened
            expect(screen.getByText(/编辑排期|保存/)).toBeInTheDocument();
          }
        });
      }
    });

    it('should update event when submitting edit form', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/流浪地球|生日派对/)).toBeInTheDocument();
      });

      // Click event to open drawer
      const eventBlock = screen.getByText(/流浪地球|生日派对/).closest('[role="button"]');
      if (eventBlock) {
        fireEvent.click(eventBlock);

        await waitFor(() => {
          const editButton = screen.getByText(/编辑/);
          if (editButton) {
            fireEvent.click(editButton);

            // Wait for form to open
            await waitFor(() => {
              expect(screen.getByText(/编辑排期/)).toBeInTheDocument();
            });

            // Find title input and update it
            const titleInput = screen.getByDisplayValue(/流浪地球|生日派对/);
            if (titleInput) {
              fireEvent.change(titleInput, { target: { value: '更新后的标题' } });

              // Submit form
              const saveButton = screen.getByText(/保存/);
              if (saveButton) {
                fireEvent.click(saveButton);

                // Wait for success message
                await waitFor(() => {
                  expect(screen.getByText(/更新成功|创建成功/)).toBeInTheDocument();
                });
              }
            }
          }
        });
      }
    });
  });
});

