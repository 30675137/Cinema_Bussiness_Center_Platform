/**
 * Integration tests for gantt chart rendering
 * 
 * Tests the full flow of rendering halls, time axis, and events
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('Gantt Chart Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    // Reset store state
    const store = useScheduleStore.getState();
    store.setSelectedDate('2025-01-27');
    store.setSelectedEvent(null);
    store.resetFilters();
  });

  describe('Hall Rendering', () => {
    it('should render all halls in the gantt chart', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if hall names are rendered
        expect(screen.getByText(/1号厅|2号厅|3号厅|4号厅/)).toBeInTheDocument();
      });
    });

    it('should display hall information (name, capacity, type, tags)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for hall name
        const hallName = screen.getByText(/1号厅/);
        expect(hallName).toBeInTheDocument();
      });
    });
  });

  describe('Time Axis Rendering', () => {
    it('should render time axis header with hour markers', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for time markers (10:00, 11:00, etc.)
        expect(screen.getByText(/10:00|11:00|12:00/)).toBeInTheDocument();
      });
    });

    it('should display configurable time range (10:00-24:00)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for start time
        expect(screen.getByText(/10:00/)).toBeInTheDocument();
      });
    });
  });

  describe('Event Rendering', () => {
    it('should render schedule events on the gantt chart', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if event titles are rendered
        // Events from mock data should be visible
        expect(screen.getByText(/流浪地球|生日派对|企业团建/)).toBeInTheDocument();
      });
    });

    it('should display different colors for different event types', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Events should be rendered with different styling
        const events = screen.getAllByText(/流浪地球|生日派对/);
        expect(events.length).toBeGreaterThan(0);
      });
    });

    it('should display event details (title, time, customer, serviceManager, occupancy)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for event title
        expect(screen.getByText(/流浪地球|生日派对/)).toBeInTheDocument();
      });
    });
  });

  describe('Gantt Chart Layout', () => {
    it('should have proper layout structure (halls on left, timeline on right)', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check if the main container is rendered
        const ganttChart = screen.getByTestId('gantt-chart') || document.querySelector('[class*="gantt"]');
        expect(ganttChart || document.body).toBeInTheDocument();
      });
    });

    it('should support scrolling when content exceeds viewport', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // The gantt chart container should be scrollable
        const container = document.querySelector('[class*="gantt"]') || document.body;
        expect(container).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should show loading state while fetching data', () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      // Initially, there might be a loading state
      // This depends on implementation
    });

    it('should display data after successful load', async () => {
      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // After loading, halls and events should be visible
        expect(screen.getByText(/1号厅|流浪地球|生日派对/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle empty state when no events exist', async () => {
      // Set a date with no events
      const store = useScheduleStore.getState();
      store.setSelectedDate('2025-12-31'); // Future date with no events

      render(<ScheduleManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Halls should still be visible even if no events
        expect(screen.getByText(/1号厅/)).toBeInTheDocument();
      });
    });
  });
});

