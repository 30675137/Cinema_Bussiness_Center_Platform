/**
 * Unit tests for validators - Attribute validation
 *
 * Tests Zod schemas for Attribute, especially select type validation
 */

import { describe, it, expect } from 'vitest';
import { attributeSchema, createAttributeSchema, updateAttributeSchema } from '../validators';

describe('validators - Attribute', () => {
  describe('createAttributeSchema', () => {
    it('should validate a valid text attribute', () => {
      const validAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '容量',
        code: 'capacity',
        type: 'text' as const,
        required: true,
        sort: 1,
        level: 'SPU' as const,
      };

      const result = createAttributeSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });

    it('should validate a valid single-select attribute with dictionaryTypeId', () => {
      const validAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '容量单位',
        code: 'capacity_unit',
        type: 'single-select' as const,
        required: true,
        sort: 1,
        level: 'SPU' as const,
        dictionaryTypeId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = createAttributeSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });

    it('should validate a valid single-select attribute with customValues', () => {
      const validAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '颜色',
        code: 'color',
        type: 'single-select' as const,
        required: true,
        sort: 1,
        level: 'SKU' as const,
        customValues: ['红色', '蓝色', '绿色'],
      };

      const result = createAttributeSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });

    it('should reject single-select without dictionaryTypeId or customValues', () => {
      const invalidAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '容量单位',
        code: 'capacity_unit',
        type: 'single-select' as const,
        required: true,
        sort: 1,
        level: 'SPU' as const,
        // Missing dictionaryTypeId and customValues
      };

      const result = createAttributeSchema.safeParse(invalidAttribute);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some(
            (e) => e.message.includes('字典类型') || e.message.includes('自定义值')
          )
        ).toBe(true);
      }
    });

    it('should reject multi-select without dictionaryTypeId or customValues', () => {
      const invalidAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '标签',
        code: 'tags',
        type: 'multi-select' as const,
        required: false,
        sort: 2,
        level: 'SPU' as const,
        // Missing dictionaryTypeId and customValues
      };

      const result = createAttributeSchema.safeParse(invalidAttribute);
      expect(result.success).toBe(false);
    });

    it('should validate a valid number attribute', () => {
      const validAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '重量',
        code: 'weight',
        type: 'number' as const,
        required: true,
        sort: 1,
        level: 'SPU' as const,
      };

      const result = createAttributeSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });

    it('should validate a valid boolean attribute', () => {
      const validAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '是否上架',
        code: 'is_listed',
        type: 'boolean' as const,
        required: false,
        sort: 1,
        level: 'SPU' as const,
      };

      const result = createAttributeSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });

    it('should validate a valid date attribute', () => {
      const validAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '生产日期',
        code: 'production_date',
        type: 'date' as const,
        required: false,
        sort: 1,
        level: 'SPU' as const,
      };

      const result = createAttributeSchema.safeParse(validAttribute);
      expect(result.success).toBe(true);
    });

    it('should reject invalid attribute type', () => {
      const invalidAttribute = {
        templateId: '550e8400-e29b-41d4-a716-446655440000',
        name: '测试',
        code: 'test',
        type: 'invalid-type' as any,
        required: true,
        sort: 1,
        level: 'SPU' as const,
      };

      const result = createAttributeSchema.safeParse(invalidAttribute);
      expect(result.success).toBe(false);
    });
  });
});
