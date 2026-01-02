/**
 * @spec O006-miniapp-channel-order
 * 渠道商品 API 服务
 */

import { get } from '@/utils/request'
import type {
  ChannelProductDTO,
  ChannelCategory,
} from '@/types/channelProduct'
import type { ChannelProductSpecDTO } from '@/types/productSpec'

/**
 * 商品详情响应(包含库存状态)
 */
export interface ChannelProductDetailDTO extends ChannelProductDTO {
  // 详情页额外字段已包含在 ChannelProductDTO 中(description, stockStatus)
}

/**
 * 商品列表响应
 */
export interface ChannelProductListResponse {
  data: ChannelProductDTO[]
  total: number
}

/**
 * 获取小程序渠道商品列表
 *
 * @param category 按分类筛选(可选)
 * @returns Promise<商品列表响应>
 *
 * @example
 * ```typescript
 * // 获取所有商品
 * const allProducts = await getChannelProducts()
 *
 * // 获取指定分类的商品
 * const coffeeProducts = await getChannelProducts(ChannelCategory.COFFEE)
 * ```
 */
export const getChannelProducts = async (
  category?: ChannelCategory
): Promise<ChannelProductListResponse> => {
  const url = category
    ? `/client/channel-products/mini-program?category=${category}`
    : '/client/channel-products/mini-program'

  return get<ChannelProductListResponse>(url)
}

/**
 * 获取渠道商品详情
 *
 * @param id 渠道商品 ID
 * @returns Promise<商品详情>
 *
 * @throws {RequestError} 商品不存在时抛出 404 错误
 *
 * @example
 * ```typescript
 * try {
 *   const product = await getChannelProductDetail('product-id-123')
 *   console.log('商品名称:', product.displayName)
 *   console.log('库存状态:', product.stockStatus)
 * } catch (error) {
 *   // 处理错误
 * }
 * ```
 */
export const getChannelProductDetail = async (
  id: string
): Promise<ChannelProductDetailDTO> => {
  return get<ChannelProductDetailDTO>(
    `/client/channel-products/mini-program/${id}`
  )
}

/**
 * 获取渠道商品规格列表
 *
 * @param id 渠道商品 ID
 * @returns Promise<商品规格列表>
 *
 * @throws {RequestError} 商品不存在时抛出 404 错误
 *
 * @example
 * ```typescript
 * const specs = await getChannelProductSpecs('product-id-123')
 * const sizeSpec = specs.find(s => s.specType === SpecType.SIZE)
 * ```
 */
export const getChannelProductSpecs = async (
  id: string
): Promise<ChannelProductSpecDTO[]> => {
  return get<ChannelProductSpecDTO[]>(
    `/client/channel-products/mini-program/${id}/specs`
  )
}
