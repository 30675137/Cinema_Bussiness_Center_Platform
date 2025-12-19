/**
 * 活动类型管理 - Zod Schema 验证测试
 */

import { describe, it, expect } from 'vitest';
import {
  createActivityTypeSchema,
  updateActivityTypeSchema,
} from '../../../src/pages/activity-types/types/activity-type.schema';

describe('ActivityType Schema Validation', () => {
  describe('createActivityTypeSchema', () => {
    it('should validate valid activity type data', () => {
      const validData = {
        name: '企业团建',
        description: '企业团队建设活动',
        sort: 1,
      };

      const result = createActivityTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('企业团建');
        expect(result.data.description).toBe('企业团队建设活动');
        expect(result.data.sort).toBe(1);
      }
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        description: '描述',
        sort: 1,
      };

      const result = createActivityTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('不能为空');
      }
    });

    it('should reject name longer than 100 characters', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        description: '描述',
        sort: 1,
      };

      const result = createActivityTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100个字符');
      }
    });

    it('should reject description longer than 500 characters', () => {
      const invalidData = {
        name: '企业团建',
        description: 'a'.repeat(501),
        sort: 1,
      };

      const result = createActivityTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('500个字符');
      }
    });

    it('should reject negative sort value', () => {
      const invalidData = {
        name: '企业团建',
        description: '描述',
        sort: -1,
      };

      const result = createActivityTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('不能小于0');
      }
    });

    it('should reject non-integer sort value', () => {
      const invalidData = {
        name: '企业团建',
        description: '描述',
        sort: 1.5,
      };

      const result = createActivityTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('整数');
      }
    });

    it('should accept null description', () => {
      const validData = {
        name: '企业团建',
        description: null,
        sort: 1,
      };

      const result = createActivityTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept undefined description', () => {
      const validData = {
        name: '企业团建',
        sort: 1,
      };

      const result = createActivityTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateActivityTypeSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        name: '企业团建（更新）',
        description: '更新后的描述',
        sort: 5,
      };

      const result = updateActivityTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should apply same validation rules as create schema', () => {
      const invalidData = {
        name: '',
        sort: 1,
      };

      const result = updateActivityTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});




