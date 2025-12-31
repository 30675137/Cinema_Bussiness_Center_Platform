/**
 * @spec P006-fix-sku-edit-data
 * SKU编辑页面数据加载Hook
 */
import { useQuery } from '@tanstack/react-query'
import type { SKUDetailResponse } from '@/types/product'

/**
 * API基础URL（从环境变量读取）
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * 获取SKU详情API调用
 */
async function fetchSKUDetails(skuId: string): Promise<SKUDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/skus/${skuId}/details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // TODO: 添加认证token
      // 'Authorization': `Bearer ${getToken()}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: 'UNKNOWN_ERROR',
      message: '请求失败',
    }))

    throw new Error(errorData.message || `HTTP ${response.status}`)
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || '数据加载失败')
  }

  return result.data
}

/**
 * SKU编辑数据加载Hook
 *
 * 使用TanStack Query管理服务器状态
 *
 * @param skuId - SKU的UUID
 * @returns TanStack Query返回对象
 *
 * @example
 * ```tsx
 * function SKUEditPage() {
 *   const { skuId } = useParams()
 *   const { data, isLoading, error } = useSKUEditData(skuId!)
 *
 *   if (isLoading) return <Spin />
 *   if (error) return <Alert type="error" message={error.message} />
 *
 *   return (
 *     <div>
 *       <SKUBasicInfo sku={data.sku} />
 *       {data.spu && <SPUInfo spu={data.spu} />}
 *       {data.bom && <BOMInfo bom={data.bom} />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSKUEditData(skuId: string) {
  return useQuery({
    queryKey: ['sku-details', skuId],
    queryFn: () => fetchSKUDetails(skuId),
    enabled: !!skuId, // 仅当skuId存在时执行查询
    staleTime: 2 * 60 * 1000, // 2分钟内数据视为新鲜
    gcTime: 5 * 60 * 1000, // 5分钟后清理缓存（原cacheTime）
    retry: 1, // 失败时重试1次
  })
}
