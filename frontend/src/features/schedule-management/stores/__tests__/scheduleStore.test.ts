/**
 * Unit tests for scheduleStore
 * 
 * Tests UI state management (selectedDate, selectedEvent, filters, viewportScroll)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useScheduleStore } from '../scheduleStore';
import type { ScheduleEvent } from '@/pages/schedule/types/schedule.types';

describe('scheduleStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorage.clear();
    const store = useScheduleStore.getState();
    store.setSelectedDate(new Date().toISOString().split('T')[0]);
    store.setSelectedEvent(null);
    store.setViewportScroll({ scrollTop: 0, scrollLeft: 0 });
    store.resetFilters();
  });

  describe('selectedDate', () => {
    it('should initialize with today\'s date', () => {
      const store = useScheduleStore.getState();
      const today = new Date().toISOString().split('T')[0];
      expect(store.selectedDate).toBe(today);
    });

    it('should update selectedDate', () => {
      const store = useScheduleStore.getState();
      const newDate = '2025-01-28';
      
      store.setSelectedDate(newDate);
      
      expect(useScheduleStore.getState().selectedDate).toBe(newDate);
    });

    it('should persist selectedDate to localStorage', () => {
      const store = useScheduleStore.getState();
      const newDate = '2025-01-28';
      
      store.setSelectedDate(newDate);
      
      const persisted = localStorage.getItem('schedule_ui_state');
      expect(persisted).toBeTruthy();
      if (persisted) {
        const parsed = JSON.parse(persisted);
        expect(parsed.state.selectedDate).toBe(newDate);
      }
    });
  });

  describe('selectedEvent', () => {
    it('should initialize with null', () => {
      const store = useScheduleStore.getState();
      expect(store.selectedEvent).toBeNull();
    });

    it('should set selectedEvent', () => {
      const store = useScheduleStore.getState();
      const event: ScheduleEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10.5,
        duration: 3,
        title: 'Test Event',
        type: 'private',
        status: 'confirmed',
        customer: 'Test Customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      store.setSelectedEvent(event);
      
      expect(useScheduleStore.getState().selectedEvent).toEqual(event);
    });

    it('should clear selectedEvent', () => {
      const store = useScheduleStore.getState();
      const event: ScheduleEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10.5,
        duration: 3,
        title: 'Test Event',
        type: 'private',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      store.setSelectedEvent(event);
      store.setSelectedEvent(null);
      
      expect(useScheduleStore.getState().selectedEvent).toBeNull();
    });
  });

  describe('filters', () => {
    it('should initialize with empty filters', () => {
      const store = useScheduleStore.getState();
      expect(store.filters).toEqual({});
    });

    it('should set filters', () => {
      const store = useScheduleStore.getState();
      const filters = {
        hallIds: ['h1', 'h2'],
        eventTypes: ['public', 'private'] as const,
      };
      
      store.setFilters(filters);
      
      expect(useScheduleStore.getState().filters).toEqual(filters);
    });

    it('should merge filters', () => {
      const store = useScheduleStore.getState();
      
      store.setFilters({ hallIds: ['h1'] });
      store.setFilters({ eventTypes: ['public'] as const });
      
      const state = useScheduleStore.getState();
      expect(state.filters.hallIds).toEqual(['h1']);
      expect(state.filters.eventTypes).toEqual(['public']);
    });

    it('should reset filters', () => {
      const store = useScheduleStore.getState();
      
      store.setFilters({ hallIds: ['h1'], eventTypes: ['public'] as const });
      store.resetFilters();
      
      expect(useScheduleStore.getState().filters).toEqual({});
    });

    it('should persist filters to localStorage', () => {
      const store = useScheduleStore.getState();
      const filters = {
        hallIds: ['h1'],
        eventTypes: ['public'] as const,
      };
      
      store.setFilters(filters);
      
      const persisted = localStorage.getItem('schedule_ui_state');
      expect(persisted).toBeTruthy();
      if (persisted) {
        const parsed = JSON.parse(persisted);
        expect(parsed.state.filters).toEqual(filters);
      }
    });
  });

  describe('viewportScroll', () => {
    it('should initialize with zero scroll', () => {
      const store = useScheduleStore.getState();
      expect(store.viewportScroll).toEqual({ scrollTop: 0, scrollLeft: 0 });
    });

    it('should update viewportScroll', () => {
      const store = useScheduleStore.getState();
      const scroll = { scrollTop: 100, scrollLeft: 50 };
      
      store.setViewportScroll(scroll);
      
      expect(useScheduleStore.getState().viewportScroll).toEqual(scroll);
    });

    it('should persist viewportScroll to localStorage', () => {
      const store = useScheduleStore.getState();
      const scroll = { scrollTop: 100, scrollLeft: 50 };
      
      store.setViewportScroll(scroll);
      
      const persisted = localStorage.getItem('schedule_ui_state');
      expect(persisted).toBeTruthy();
      if (persisted) {
        const parsed = JSON.parse(persisted);
        expect(parsed.state.viewportScroll).toEqual(scroll);
      }
    });
  });
});

