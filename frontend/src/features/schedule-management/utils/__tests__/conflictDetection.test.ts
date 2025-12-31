/**
 * Unit tests for conflict detection utilities
 */

import { describe, it, expect } from 'vitest';
import { checkTimeConflict, validateEventTimeRange } from '../conflictDetection';
import type { ScheduleEvent } from '@/pages/schedule/types/schedule.types';

const baseEvent = (override: Partial<ScheduleEvent> = {}): ScheduleEvent => ({
  id: 'e1',
  hallId: 'h1',
  date: '2025-01-27',
  startHour: 10,
  duration: 2,
  title: 'Test',
  type: 'private',
  status: 'confirmed',
  createdAt: '2025-01-20T10:00:00Z',
  updatedAt: '2025-01-20T10:00:00Z',
  ...override,
});

describe('conflictDetection', () => {
  describe('checkTimeConflict', () => {
    it('should detect overlap in same hall and date', () => {
      const existing: ScheduleEvent[] = [baseEvent({ id: 'e2', startHour: 10, duration: 2 })];

      const conflicts = checkTimeConflict(
        { hallId: 'h1', date: '2025-01-27', startHour: 11, duration: 2 },
        existing
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].id).toBe('e2');
    });

    it('should ignore different halls or dates', () => {
      const existing: ScheduleEvent[] = [
        baseEvent({ id: 'e2', hallId: 'h2' }),
        baseEvent({ id: 'e3', date: '2025-01-28' }),
      ];

      const conflicts = checkTimeConflict(
        { hallId: 'h1', date: '2025-01-27', startHour: 11, duration: 1 },
        existing
      );

      expect(conflicts).toHaveLength(0);
    });

    it('should allow maintenance overlapping with business events but not with maintenance', () => {
      const existing: ScheduleEvent[] = [
        baseEvent({ id: 'e2', type: 'public', startHour: 10, duration: 3 }),
        baseEvent({ id: 'e3', type: 'maintenance', startHour: 11, duration: 1 }),
      ];

      // maintenance overlapping with business -> no conflict
      const noConflict = checkTimeConflict(
        { hallId: 'h1', date: '2025-01-27', startHour: 10.5, duration: 1, type: 'maintenance' },
        existing
      );
      expect(noConflict.some((e) => e.id === 'e2')).toBe(false);

      // maintenance overlapping with maintenance -> conflict
      const conflict = checkTimeConflict(
        { hallId: 'h1', date: '2025-01-27', startHour: 10.5, duration: 1, type: 'maintenance' },
        existing
      );
      expect(conflict.some((e) => e.id === 'e3')).toBe(true);
    });

    it('should exclude current event when updating', () => {
      const existing: ScheduleEvent[] = [baseEvent({ id: 'e2', startHour: 10, duration: 2 })];

      const conflicts = checkTimeConflict(
        { hallId: 'h1', date: '2025-01-27', startHour: 10, duration: 2 },
        existing,
        'e2'
      );

      expect(conflicts).toHaveLength(0);
    });
  });

  describe('validateEventTimeRange', () => {
    it('should validate within timeline range', () => {
      const result = validateEventTimeRange(10, 2, 10, 24);
      expect(result.valid).toBe(true);
    });

    it('should reject start before timeline start', () => {
      const result = validateEventTimeRange(8, 2, 10, 24);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('开始时间不能早于');
    });

    it('should reject end after timeline end', () => {
      const result = validateEventTimeRange(23, 2, 10, 24);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('结束时间不能晚于');
    });

    it('should reject non-positive duration', () => {
      const result = validateEventTimeRange(10, 0, 10, 24);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('持续时间必须大于0');
    });
  });
});
