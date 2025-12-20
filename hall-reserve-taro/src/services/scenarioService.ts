import { useQuery } from '@tanstack/react-query'
import type { Scenario } from '@/types'
import { SCENARIOS } from '@/constants'

// 模拟 API 请求延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 获取场景列表
const fetchScenarios = async (): Promise<Scenario[]> => {
  // 开发阶段使用 Mock 数据
  // TODO: 生产环境替换为真实 API
  await delay(300)
  return SCENARIOS
}

// 获取单个场景详情
const fetchScenarioById = async (id: string): Promise<Scenario | undefined> => {
  await delay(200)
  return SCENARIOS.find((s) => s.id === id)
}

/**
 * 获取场景列表 Hook
 */
export const useScenarios = () => {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: fetchScenarios,
    staleTime: 5 * 60 * 1000 // 5分钟内不重新请求
  })
}

/**
 * 获取场景详情 Hook
 */
export const useScenarioDetail = (id: string) => {
  return useQuery({
    queryKey: ['scenario', id],
    queryFn: () => fetchScenarioById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}
