/**
 * Unit tests for timeCalculations utility
 * 
 * Tests time positioning and formatting functions
 */

import { describe, it, expect } from 'vitest';
import {
  getLeftStyle,
  getWidthStyle,
  formatTime,
  formatTimeRange,
  generateTimeSlots,
} from '../timeCalculations';

describe('timeCalculations', () => {
  describe('getLeftStyle', () => {
    it('should calculate left position for start of timeline', () => {
      const result = getLeftStyle(10, 10, 14);
      expect(result).toBe('0%');
    });

    it('should calculate left position for middle of timeline', () => {
      const result = getLeftStyle(17, 10, 14);
      expect(result).toBe('50%');
    });

    it('should calculate left position for end of timeline', () => {
      const result = getLeftStyle(24, 10, 14);
      expect(result).toBe('100%');
    });

    it('should handle fractional hours', () => {
      const result = getLeftStyle(10.5, 10, 14);
      expect(result).toBe('3.571428571428571%');
    });

    it('should clamp to 0% for values before timeline start', () => {
      const result = getLeftStyle(5, 10, 14);
      expect(result).toBe('0%');
    });

    it('should clamp to 100% for values after timeline end', () => {
      const result = getLeftStyle(30, 10, 14);
      expect(result).toBe('100%');
    });
  });

  describe('getWidthStyle', () => {
    it('should calculate width for 1 hour duration', () => {
      const result = getWidthStyle(1, 14);
      expect(result).toBe('7.142857142857143%');
    });

    it('should calculate width for 2.5 hour duration', () => {
      const result = getWidthStyle(2.5, 14);
      expect(result).toBe('17.857142857142858%');
    });

    it('should calculate width for full timeline', () => {
      const result = getWidthStyle(14, 14);
      expect(result).toBe('100%');
    });

    it('should clamp to 0% for negative duration', () => {
      const result = getWidthStyle(-1, 14);
      expect(result).toBe('0%');
    });

    it('should clamp to 100% for duration exceeding timeline', () => {
      const result = getWidthStyle(20, 14);
      expect(result).toBe('100%');
    });
  });

  describe('formatTime', () => {
    it('should format whole hour in 24h format', () => {
      expect(formatTime(10)).toBe('10:00');
      expect(formatTime(14)).toBe('14:00');
    });

    it('should format half hour in 24h format', () => {
      expect(formatTime(10.5)).toBe('10:30');
      expect(formatTime(14.5)).toBe('14:30');
    });

    it('should format time in 12h format', () => {
      expect(formatTime(10, '12h')).toBe('10:00 AM');
      expect(formatTime(14, '12h')).toBe('2:00 PM');
      expect(formatTime(10.5, '12h')).toBe('10:30 AM');
      expect(formatTime(14.5, '12h')).toBe('2:30 PM');
    });

    it('should handle midnight in 12h format', () => {
      expect(formatTime(0, '12h')).toBe('12:00 AM');
    });

    it('should handle noon in 12h format', () => {
      expect(formatTime(12, '12h')).toBe('12:00 PM');
    });
  });

  describe('formatTimeRange', () => {
    it('should format time range in 24h format', () => {
      const result = formatTimeRange(10, 3);
      expect(result).toBe('10:00 - 13:00');
    });

    it('should format time range with fractional hours', () => {
      const result = formatTimeRange(10.5, 2.5);
      expect(result).toBe('10:30 - 13:00');
    });

    it('should format time range in 12h format', () => {
      const result = formatTimeRange(10, 3, '12h');
      expect(result).toBe('10:00 AM - 1:00 PM');
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate hourly time slots', () => {
      const result = generateTimeSlots(10, 14, 1);
      expect(result).toEqual([10, 11, 12, 13]);
    });

    it('should generate 30-minute time slots', () => {
      const result = generateTimeSlots(10, 12, 0.5);
      expect(result).toEqual([10, 10.5, 11, 11.5]);
    });

    it('should handle empty range', () => {
      const result = generateTimeSlots(10, 10, 1);
      expect(result).toEqual([]);
    });

    it('should handle single slot', () => {
      const result = generateTimeSlots(10, 11, 1);
      expect(result).toEqual([10]);
    });
  });
});

