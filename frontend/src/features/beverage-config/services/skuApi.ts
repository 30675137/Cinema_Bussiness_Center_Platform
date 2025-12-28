/**
 * @spec O003-beverage-order
 * SKU API 服务 - 用于配方配置中选择原料
 */

export interface SkuDTO {
  id: string
  name: string
  code: string                    // 后端返回 code 而不是 skuCode
  spu_id: string
  sku_type: string                // 后端返回 snake_case
  main_unit: string               // 后端返回 main_unit 而不是 unit
  status: string                  // 后端返回 "enabled"/"disabled"/"draft"
  price: number
  standard_cost: number
  waste_rate: number
  store_scope: string[]
  created_at: string              // 后端返回 snake_case
  updated_at: string              // 后端返回 snake_case
}

export interface SkuListResponse {
  success: boolean
  data: SkuDTO[]
  total: number
  page: number
  pageSize: number
  message: string
}

/**
 * 获取 SKU 列表（用于配方配置）
 * @param skuType SKU类型，默认为 RAW_MATERIAL（原料）
 * @param keyword 搜索关键词
 */
export async function getSkuList(
  skuType: 'RAW_MATERIAL' | 'PACKAGING' = 'RAW_MATERIAL',
  keyword?: string
): Promise<SkuDTO[]> {
  const params = new URLSearchParams()
  params.append('skuType', skuType)
  params.append('status', 'ENABLED') // 只查询已启用的 SKU
  params.append('pageSize', '1000') // 获取所有有效 SKU

  if (keyword) {
    params.append('keyword', keyword)
  }

  const response = await fetch(`/api/skus?${params.toString()}`)

  if (!response.ok) {
    throw new Error('获取 SKU 列表失败')
  }

  const json: SkuListResponse = await response.json()

  if (!json.success) {
    throw new Error(json.message || '获取 SKU 列表失败')
  }

  return json.data
}
