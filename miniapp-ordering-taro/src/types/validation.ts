/**
 * @spec O007-miniapp-menu-api
 * Zod 验证 Schema
 */

import { z } from 'zod'
import { ChannelCategory, ChannelProductDTO } from './product'

/**
 * 渠道商品 DTO Schema
 */
export const ChannelProductDTOSchema = z.object({
  id: z.string().min(1, '商品ID不能为空'),
  productId: z.string().min(1, '产品ID不能为空'),
  productName: z.string().min(1, '商品名称不能为空'),
  mainImageUrl: z.string().url('主图URL格式错误').nullable(),
  category: z.nativeEnum(ChannelCategory, {
    errorMap: () => ({ message: '分类值无效' }),
  }),
  salesChannel: z.string().min(1, '销售渠道不能为空'),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    errorMap: () => ({ message: '状态值必须为 ACTIVE 或 INACTIVE' }),
  }),
  priceInCents: z.number().int('价格必须为整数').min(0, '价格不能为负数'),
  sortOrder: z.number().int('排序必须为整数').min(0, '排序不能为负数'),
  tags: z.array(z.string()).default([]),
  stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK'], {
    errorMap: () => ({ message: '库存状态值无效' }),
  }),
})

/**
 * 验证商品 DTO 数据
 * @param data 待验证的数据
 * @returns 验证通过的 ChannelProductDTO 对象
 * @throws {z.ZodError} 验证失败时抛出 Zod 错误
 */
export function validateProductDTO(data: unknown): ChannelProductDTO {
  return ChannelProductDTOSchema.parse(data)
}

/**
 * 安全验证商品 DTO 数据（不抛出异常）
 * @param data 待验证的数据
 * @returns 验证结果对象
 */
export function safeValidateProductDTO(data: unknown) {
  return ChannelProductDTOSchema.safeParse(data)
}
