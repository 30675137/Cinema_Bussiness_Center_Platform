/**
 * Unit tests for validators
 * 
 * Tests Zod validation schemas for schedule management
 */

import { describe, it, expect } from 'vitest';
import {
  hallSchema,
  createHallSchema,
  updateHallSchema,
  scheduleEventSchema,
  createScheduleEventSchema,
  updateScheduleEventSchema,
  timelineConfigSchema,
} from '../validators';

describe('validators', () => {
  describe('hallSchema', () => {
    it('should validate a valid hall', () => {
      const validHall = {
        id: 'h1',
        name: '1号厅 (VIP)',
        capacity: 12,
        type: 'VIP' as const,
        tags: ['真皮沙发', '管家服务'],
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = hallSchema.safeParse(validHall);
      expect(result.success).toBe(true);
    });

    it('should reject hall with invalid type', () => {
      const invalidHall = {
        id: 'h1',
        name: '1号厅',
        capacity: 12,
        type: 'InvalidType',
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = hallSchema.safeParse(invalidHall);
      expect(result.success).toBe(false);
    });

    it('should reject hall with capacity > 1000', () => {
      const invalidHall = {
        id: 'h1',
        name: '1号厅',
        capacity: 1001,
        type: 'Public' as const,
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = hallSchema.safeParse(invalidHall);
      expect(result.success).toBe(false);
    });

    it('should reject hall with name > 50 characters', () => {
      const invalidHall = {
        id: 'h1',
        name: 'a'.repeat(51),
        capacity: 12,
        type: 'VIP' as const,
        status: 'active' as const,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = hallSchema.safeParse(invalidHall);
      expect(result.success).toBe(false);
    });
  });

  describe('scheduleEventSchema', () => {
    it('should validate a valid public event', () => {
      const validEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10.5,
        duration: 3,
        title: '流浪地球2',
        type: 'public' as const,
        occupancy: '85/120',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      const result = scheduleEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should validate a valid private event with customer', () => {
      const validEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10.5,
        duration: 3,
        title: '刘总生日派对',
        type: 'private' as const,
        status: 'confirmed' as const,
        customer: '刘先生 138****0000',
        serviceManager: '王经理',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      const result = scheduleEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject private event without customer', () => {
      const invalidEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10.5,
        duration: 3,
        title: 'Test Event',
        type: 'private' as const,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      const result = scheduleEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('customer'))).toBe(true);
      }
    });

    it('should reject event with status for non-private type', () => {
      const invalidEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10.5,
        duration: 3,
        title: 'Test Event',
        type: 'public' as const,
        status: 'confirmed' as const,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      const result = scheduleEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('status'))).toBe(true);
      }
    });

    it('should reject event with invalid date format', () => {
      const invalidEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025/01/27',
        startHour: 10.5,
        duration: 3,
        title: 'Test Event',
        type: 'public' as const,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      const result = scheduleEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should reject event with invalid occupancy format', () => {
      const invalidEvent = {
        id: 'e1',
        hallId: 'h1',
        date: '2025-01-27',
        startHour: 10.5,
        duration: 3,
        title: 'Test Event',
        type: 'public' as const,
        occupancy: '85-120',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      const result = scheduleEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('timelineConfigSchema', () => {
    it('should validate a valid timeline config', () => {
      const validConfig = {
        startHour: 10,
        endHour: 24,
        interval: 1,
        timeFormat: '24h' as const,
      };

      const result = timelineConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject config with endHour <= startHour', () => {
      const invalidConfig = {
        startHour: 10,
        endHour: 10,
        interval: 1,
        timeFormat: '24h' as const,
      };

      const result = timelineConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject config with invalid interval', () => {
      const invalidConfig = {
        startHour: 10,
        endHour: 24,
        interval: 3,
        timeFormat: '24h' as const,
      };

      const result = timelineConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });
});

