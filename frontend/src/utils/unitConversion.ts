/** @spec M001-material-unit-system */
import { apiClient } from '@/services/api'

export interface ConversionRequest {
  fromUnitCode: string
  toUnitCode: string
  quantity: number
  materialId?: string
}

export interface ConversionResponse {
  convertedQuantity: number
  fromUnitCode: string
  toUnitCode: string
  originalQuantity: number
  source: 'MATERIAL' | 'GLOBAL'
  conversionPath: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

/**
 * 调用后端换算服务
 */
export const convertUnit = async (request: ConversionRequest): Promise<ConversionResponse> => {
  const response = await apiClient.post<ApiResponse<ConversionResponse>>('/conversions/convert', request)
  return response.data.data
}

/**
 * 检查是否可以换算
 */
export const canConvert = async (
  fromUnitCode: string,
  toUnitCode: string,
  materialId?: string
): Promise<boolean> => {
  const response = await apiClient.get<ApiResponse<boolean>>('/conversions/can-convert', {
    params: { fromUnitCode, toUnitCode, materialId },
  })
  return response.data.data
}

/**
 * 格式化数量显示（带单位）
 */
export const formatQuantity = (quantity: number, unitCode: string, decimalPlaces: number = 2): string => {
  return `${quantity.toFixed(decimalPlaces)} ${unitCode}`
}
