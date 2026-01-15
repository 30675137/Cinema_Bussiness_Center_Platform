/**
 * Integration tests for event creation flow
 */

import { describe, it, expect } from 'vitest';
import { scheduleService } from '../services/scheduleService';

describe('Event Creation Integration Tests', () => {
  const baseRequest = {
    hallId: 'h1',
    date: '2025-01-27',
    startHour: 10,
    duration: 2,
    title: '测试排期',
    type: 'public' as const,
  };

  it('should create a public event successfully', async () => {
    const response = await scheduleService.createSchedule(baseRequest);
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.title).toBe(baseRequest.title);
      expect(response.data.hallId).toBe(baseRequest.hallId);
      expect(response.data.date).toBe(baseRequest.date);
    }
  });

  it('should create a private event with customer info', async () => {
    const response = await scheduleService.createSchedule({
      ...baseRequest,
      type: 'private',
      title: '包场测试',
      startHour: 14,
      duration: 3,
      customer: '测试客户',
      serviceManager: '测试经理',
    });
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.type).toBe('private');
      expect(response.data.customer).toBe('测试客户');
    }
  });

  it('should reject private event without customer', async () => {
    await expect(
      scheduleService.createSchedule({
        ...baseRequest,
        type: 'private',
        customer: undefined,
      } as any)
    ).rejects.toThrow();
  });

  it('should detect time conflict and return 409', async () => {
    // First create an event
    const first = await scheduleService.createSchedule({
      ...baseRequest,
      title: '冲突测试事件1',
      startHour: 18,
      duration: 2,
    });
    expect(first.success).toBe(true);

    // Attempt overlapping event
    await expect(
      scheduleService.createSchedule({
        ...baseRequest,
        title: '冲突测试事件2',
        startHour: 19, // overlap 18-20
        duration: 1.5,
      })
    ).rejects.toThrow();
  });
});
