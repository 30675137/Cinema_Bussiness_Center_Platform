/**
 * Phone Utility Tests
 *
 * @since 020-store-address
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidPhone, formatPhone } from '../phone';

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
    makePhoneCall: vi.fn(),
  },
}));

describe('phone utility', () => {
  describe('isValidPhone', () => {
    describe('有效电话号码', () => {
      it('应该接受有效手机号', () => {
        expect(isValidPhone('13800138000')).toBe(true);
        expect(isValidPhone('13912345678')).toBe(true);
        expect(isValidPhone('18888888888')).toBe(true);
      });

      it('应该接受有效座机号', () => {
        expect(isValidPhone('010-12345678')).toBe(true);
        expect(isValidPhone('021-87654321')).toBe(true);
        expect(isValidPhone('0755-12345678')).toBe(true);
      });

      it('应该接受400热线', () => {
        expect(isValidPhone('400-123-4567')).toBe(true);
        expect(isValidPhone('4001234567')).toBe(true);
      });
    });

    describe('无效电话号码', () => {
      it('应该拒绝null和undefined', () => {
        expect(isValidPhone(null)).toBe(false);
        expect(isValidPhone(undefined)).toBe(false);
      });

      it('应该拒绝空字符串', () => {
        expect(isValidPhone('')).toBe(false);
        expect(isValidPhone('   ')).toBe(false);
      });

      it('应该拒绝无效格式', () => {
        expect(isValidPhone('12345678901')).toBe(false);
        expect(isValidPhone('abc12345678')).toBe(false);
        expect(isValidPhone('phone')).toBe(false);
        expect(isValidPhone('123')).toBe(false);
      });
    });
  });

  describe('formatPhone', () => {
    it('应该原样返回电话号码（不脱敏）', () => {
      expect(formatPhone('13800138000')).toBe('13800138000');
      expect(formatPhone('010-12345678')).toBe('010-12345678');
    });

    it('应该对手机号进行脱敏', () => {
      expect(formatPhone('13800138000', true)).toBe('138 **** 8000');
      expect(formatPhone('13912345678', true)).toBe('139 **** 5678');
    });

    it('非11位手机号不脱敏', () => {
      expect(formatPhone('010-12345678', true)).toBe('010-12345678');
      expect(formatPhone('400-123-4567', true)).toBe('400-123-4567');
    });

    it('空值返回空字符串', () => {
      expect(formatPhone('')).toBe('');
      expect(formatPhone(null as unknown as string)).toBe('');
    });
  });
});
