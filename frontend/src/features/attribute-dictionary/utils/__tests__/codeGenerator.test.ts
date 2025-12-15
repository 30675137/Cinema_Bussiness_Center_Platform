/**
 * Unit tests for code generator utility
 * 
 * Tests pinyin conversion and conflict resolution
 */

import { describe, it, expect } from 'vitest';
import { generateUniqueCode } from '../codeGenerator';

describe('codeGenerator', () => {
  describe('generateUniqueCode', () => {
    it('should convert Chinese name to pinyin code', () => {
      const code = generateUniqueCode('容量单位', new Set());
      expect(code).toBe('RONG_LIANG_DAN_WEI');
    });

    it('should handle simple Chinese names', () => {
      const code = generateUniqueCode('口味', new Set());
      expect(code).toBe('KOU_WEI');
    });

    it('should resolve conflicts by appending counter', () => {
      const existingCodes = new Set(['RONG_LIANG_DAN_WEI']);
      const code = generateUniqueCode('容量单位', existingCodes);
      expect(code).toBe('RONG_LIANG_DAN_WEI_2');
    });

    it('should resolve multiple conflicts', () => {
      const existingCodes = new Set([
        'RONG_LIANG_DAN_WEI',
        'RONG_LIANG_DAN_WEI_2',
        'RONG_LIANG_DAN_WEI_3',
      ]);
      const code = generateUniqueCode('容量单位', existingCodes);
      expect(code).toBe('RONG_LIANG_DAN_WEI_4');
    });

    it('should handle empty existing codes set', () => {
      const code = generateUniqueCode('包装形式', new Set());
      expect(code).toBe('BAO_ZHUANG_XING_SHI');
    });

    it('should handle names with numbers', () => {
      const code = generateUniqueCode('500毫升', new Set());
      // Should convert Chinese characters, numbers preserved
      expect(code).toContain('500');
    });

    it('should generate uppercase codes', () => {
      const code = generateUniqueCode('测试', new Set());
      expect(code).toBe(code.toUpperCase());
    });

    it('should use underscore separator', () => {
      const code = generateUniqueCode('容量单位', new Set());
      expect(code).toContain('_');
      expect(code.split('_').length).toBeGreaterThan(1);
    });
  });
});

