/**
 * Integration tests for schedule queries via MSW
 * 
 * Tests the full flow from TanStack Query hooks through MSW handlers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useScheduleListQuery, useScheduleDetailQuery, useHallsListQuery, useHallDetailQuery } from '../hooks/useScheduleQueries';
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

// Wrapper component for React Query
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Schedule Queries Integration Tests', () => {
  beforeEach(() => {
    // Clear any cached data
  });

  describe('useScheduleListQuery', () => {
    it('should fetch schedule list for a date', async () => {
      const { result } = renderHook(
        () => useScheduleListQuery({ date: '2025-01-27' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
      if (result.current.data && result.current.data.length > 0) {
        expect(result.current.data[0]).toHaveProperty('id');
        expect(result.current.data[0]).toHaveProperty('hallId');
        expect(result.current.data[0]).toHaveProperty('date', '2025-01-27');
      }
    });

    it('should filter by hallId', async () => {
      const { result } = renderHook(
        () => useScheduleListQuery({ date: '2025-01-27', hallId: 'h1' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      if (result.current.data) {
        result.current.data.forEach(event => {
          expect(event.hallId).toBe('h1');
        });
      }
    });

    it('should filter by event type', async () => {
      const { result } = renderHook(
        () => useScheduleListQuery({ date: '2025-01-27', type: 'public' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      if (result.current.data) {
        result.current.data.forEach(event => {
          expect(event.type).toBe('public');
        });
      }
    });
  });

  describe('useScheduleDetailQuery', () => {
    it('should fetch schedule detail by ID', async () => {
      // First, get a list to find an ID
      const listResponse = await scheduleService.getScheduleList({ date: '2025-01-27' });
      if (listResponse.success && listResponse.data.length > 0) {
        const eventId = listResponse.data[0].id;

        const { result } = renderHook(
          () => useScheduleDetailQuery(eventId),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toBeDefined();
        if (result.current.data) {
          expect(result.current.data.id).toBe(eventId);
        }
      }
    });

    it('should not fetch when ID is undefined', () => {
      const { result } = renderHook(
        () => useScheduleDetailQuery(undefined),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useHallsListQuery', () => {
    it('should fetch halls list', async () => {
      const { result } = renderHook(
        () => useHallsListQuery(),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
      if (result.current.data && result.current.data.length > 0) {
        expect(result.current.data[0]).toHaveProperty('id');
        expect(result.current.data[0]).toHaveProperty('name');
        expect(result.current.data[0]).toHaveProperty('capacity');
        expect(result.current.data[0]).toHaveProperty('type');
      }
    });

    it('should filter halls by status', async () => {
      const { result } = renderHook(
        () => useHallsListQuery({ status: 'active' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      if (result.current.data) {
        result.current.data.forEach(hall => {
          expect(hall.status).toBe('active');
        });
      }
    });

    it('should filter halls by type', async () => {
      const { result } = renderHook(
        () => useHallsListQuery({ type: 'VIP' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      if (result.current.data) {
        result.current.data.forEach(hall => {
          expect(hall.type).toBe('VIP');
        });
      }
    });
  });

  describe('useHallDetailQuery', () => {
    it('should fetch hall detail by ID', async () => {
      // First, get the list to find an ID
      const listResponse = await scheduleService.getHallList();
      if (listResponse.success && listResponse.data.length > 0) {
        const hallId = listResponse.data[0].id;

        const { result } = renderHook(
          () => useHallDetailQuery(hallId),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toBeDefined();
        if (result.current.data) {
          expect(result.current.data.id).toBe(hallId);
        }
      }
    });

    it('should not fetch when ID is undefined', () => {
      const { result } = renderHook(
        () => useHallDetailQuery(undefined),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });
});

