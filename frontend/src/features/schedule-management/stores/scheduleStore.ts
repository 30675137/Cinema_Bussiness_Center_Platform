/**
 * Zustand Store for Schedule Management UI State
 * 
 * Manages UI state (selected date, selected event, filters, viewport scroll)
 * Server state is managed by TanStack Query
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';
import type { ScheduleEvent, EventType, EventStatus } from '@/pages/schedule/types/schedule.types';

interface ScheduleStore {
  // UI State
  selectedDate: string; // YYYY-MM-DD
  selectedEvent: ScheduleEvent | null;
  viewportScroll: {
    scrollTop: number;
    scrollLeft: number;
  };
  filters: {
    hallIds?: string[];
    eventTypes?: EventType[];
    statuses?: EventStatus[];
  };
  
  // Actions
  setSelectedDate: (date: string) => void;
  setSelectedEvent: (event: ScheduleEvent | null) => void;
  setViewportScroll: (scroll: { scrollTop: number; scrollLeft: number }) => void;
  setFilters: (filters: Partial<ScheduleStore['filters']>) => void;
  resetFilters: () => void;
}

const STORAGE_KEY = 'schedule_ui_state';

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set) => ({
      // Initial state
      selectedDate: dayjs().format('YYYY-MM-DD'), // Today
      selectedEvent: null,
      viewportScroll: {
        scrollTop: 0,
        scrollLeft: 0,
      },
      filters: {},
      
      // Actions
      setSelectedDate: (date) =>
        set({ selectedDate: date }),
      
      setSelectedEvent: (event) =>
        set({ selectedEvent: event }),
      
      setViewportScroll: (scroll) =>
        set({ viewportScroll: scroll }),
      
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      
      resetFilters: () =>
        set({ filters: {} }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        viewportScroll: state.viewportScroll,
        filters: state.filters,
        // Don't persist selectedEvent
      }),
    }
  )
);

