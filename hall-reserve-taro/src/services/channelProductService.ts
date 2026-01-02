/**
 * @spec O006-miniapp-channel-order
 * 渠道商品服务 - 小程序端商品数据获取
 */

import { get } from '../utils/request'
import {
  ChannelProductDTO,
  ChannelProductSpecDTO,
  ChannelCategory,
} from '../types/channelProduct'

/**
 * 获取小程序商品列表
 * @param category 商品分类筛选(可选)
 * @returns Promise<ChannelProductDTO[]>
 */
export async function fetchChannelProducts(
  category?: ChannelCategory
): Promise<ChannelProductDTO[]> {
  const params: any = {
    channelType: 'MINI_PROGRAM',
    status: 'ACTIVE', // 只获取已上架商品
  }

  if (category) {
    params.category = category
  }

  return get<ChannelProductDTO[]>('/client/channel-products/mini-program', {
    data: params,
  })
}

/**
 * 获取商品详情
 * @param id 渠道商品ID
 * @returns Promise<ChannelProductDTO>
 */
export async function fetchChannelProductDetail(
  id: string
): Promise<ChannelProductDTO> {
  return get<ChannelProductDTO>(`/client/channel-products/mini-program/${id}`)
}

/**
 * 获取商品规格列表
 * @param id 渠道商品ID
 * @returns Promise<ChannelProductSpecDTO[]>
 */
export async function fetchChannelProductSpecs(
  id: string
): Promise<ChannelProductSpecDTO[]> {
  return get<ChannelProductSpecDTO[]>(
    `/client/channel-products/mini-program/${id}/specs`
  )
}
