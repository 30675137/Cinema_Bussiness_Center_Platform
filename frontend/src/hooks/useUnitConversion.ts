/** @spec M001-material-unit-system */
import { useState } from 'react'
import { message } from 'antd'
import { convertUnit, canConvert, type ConversionRequest, type ConversionResponse } from '@/utils/unitConversion'

export const useUnitConversion = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConversionResponse | null>(null)

  const convert = async (request: ConversionRequest): Promise<ConversionResponse | null> => {
    setLoading(true)
    try {
      const response = await convertUnit(request)
      setResult(response)
      return response
    } catch (error) {
      message.error('换算失败')
      return null
    } finally {
      setLoading(false)
    }
  }

  const checkCanConvert = async (
    fromUnitCode: string,
    toUnitCode: string,
    materialId?: string
  ): Promise<boolean> => {
    try {
      return await canConvert(fromUnitCode, toUnitCode, materialId)
    } catch (error) {
      return false
    }
  }

  return {
    convert,
    checkCanConvert,
    loading,
    result,
  }
}
