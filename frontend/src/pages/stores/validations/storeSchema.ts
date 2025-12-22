/**
 * Store Form Validation Schema
 *
 * Zod schemas for store create/update form validation
 * @since 022-store-crud
 */

import { z } from 'zod';

/**
 * Phone number regex pattern
 * Supports:
 * - Mobile: 11 digits starting with 1 (e.g., 13912345678)
 * - Landline: area code + number (e.g., 010-12345678, 0755-1234567)
 */
export const PHONE_REGEX = /^(1[3-9]\d{9}|0\d{2,3}-\d{7,8})$/;

/**
 * Create store form schema
 */
export const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, '门店名称不能为空')
    .max(100, '门店名称不能超过100字符')
    .transform((val) => val.trim()),
  region: z
    .string()
    .min(1, '区域不能为空')
    .max(50, '区域不能超过50字符'),
  city: z
    .string()
    .min(1, '城市不能为空')
    .max(50, '城市不能超过50字符'),
  province: z
    .string()
    .max(50, '省份不能超过50字符')
    .optional()
    .or(z.literal('')),
  district: z
    .string()
    .max(50, '区县不能超过50字符')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(1, '详细地址不能为空'),
  phone: z
    .string()
    .min(1, '电话号码不能为空')
    .regex(PHONE_REGEX, '请输入有效的电话号码(手机号11位或座机号如010-12345678)'),
});

/**
 * Update store form schema
 * All fields optional except version (required for optimistic locking)
 */
export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(1, '门店名称不能为空')
    .max(100, '门店名称不能超过100字符')
    .transform((val) => val.trim())
    .optional(),
  region: z
    .string()
    .min(1, '区域不能为空')
    .max(50, '区域不能超过50字符')
    .optional(),
  city: z
    .string()
    .min(1, '城市不能为空')
    .max(50, '城市不能超过50字符')
    .optional(),
  province: z
    .string()
    .max(50, '省份不能超过50字符')
    .optional()
    .or(z.literal('')),
  district: z
    .string()
    .max(50, '区县不能超过50字符')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(1, '详细地址不能为空')
    .optional(),
  phone: z
    .string()
    .min(1, '电话号码不能为空')
    .regex(PHONE_REGEX, '请输入有效的电话号码(手机号11位或座机号如010-12345678)')
    .optional(),
  version: z.number({ required_error: 'version字段必填' }),
});

/**
 * Toggle status schema
 */
export const toggleStatusSchema = z.object({
  status: z.enum(['active', 'inactive'], {
    required_error: '状态不能为空',
    invalid_type_error: '状态值无效',
  }),
});

// Type exports
export type CreateStoreFormData = z.infer<typeof createStoreSchema>;
export type UpdateStoreFormData = z.infer<typeof updateStoreSchema>;
export type ToggleStatusFormData = z.infer<typeof toggleStatusSchema>;
