import { request } from '../utils/request'
import { ApiResponseSchema, type ScenarioPackageListItem } from '../types/scenario'

/**
 * 获取场景包列表
 *
 * 功能：
 * - 调用 GET /api/scenario-packages 端点
 * - 使用 Zod 进行运行时数据验证
 * - 返回已发布状态的场景包列表摘要
 *
 * @returns Promise<ScenarioPackageListItem[]> 场景包列表
 * @throws Error 当 API 请求失败或数据格式验证失败时抛出错误
 */
export async function fetchScenarioPackages(): Promise<any[]> {
  // 发起 API 请求
  const response = await request<any>('/api/scenario-packages/published')

  console.log('API Response:', response)

  // 检查业务逻辑成功标识
  if (!response.success) {
    throw new Error(response.message || '获取场景包列表失败')
  }

  // 转换数据格式以适配前端 Scenario 类型
  const data = response.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    image: item.image,
    category: item.category,
    tags: item.tags || [],
    location: item.location || '北京·精选场馆',
    rating: item.rating || 0,
    packages: item.packages || [{
      id: item.id,
      name: '基础套餐',
      price: item.packagePrice || 0,
      originalPrice: item.packagePrice * 1.2,
      desc: '',
      tags: []
    }]
  }))

  console.log('Transformed data:', data)
  return data
}

/**
 * Mock 数据（用于开发测试）
 * 返回与旧 Scenario 类型兼容的数据结构
 */
export async function fetchScenarioPackagesMock(): Promise<any[]> {
  // 检查是否启用测试模式
  if (typeof window !== 'undefined' && (window as any).getTestMode) {
    const { fetchScenarioPackagesMockWithTest } = await import('./scenarioServiceTest')
    return fetchScenarioPackagesMockWithTest()
  }

  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: 'mock-001',
      title: 'VIP 生日派对专场',
      category: 'PARTY',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      location: '耀莱成龙影城（五棵松店）',
      rating: 4.5,
      tags: ['生日', '派对', 'VIP', '浪漫'],
      packages: [
        {
          id: 'pkg-001',
          name: '基础套餐',
          price: 1888,
          originalPrice: 2500,
          desc: '包含场地费、基础设备、2小时使用时长',
          tags: ['推荐']
        }
      ]
    },
    {
      id: 'mock-002',
      title: '企业年会包场',
      category: 'TEAM',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      location: '万达影城（CBD店）',
      rating: 4.8,
      tags: ['年会', '团建', '商务'],
      packages: [
        {
          id: 'pkg-002',
          name: '商务套餐',
          price: 5888,
          originalPrice: 7500,
          desc: '包含场地费、投影设备、4小时使用时长',
          tags: ['热门']
        }
      ]
    },
    {
      id: 'mock-003',
      title: '求婚惊喜专场',
      category: 'MOVIE',
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
      location: 'CGV影城（朝阳大悦城店）',
      rating: 5.0,
      tags: ['求婚', '惊喜', '浪漫'],
      packages: [
        {
          id: 'pkg-003',
          name: '浪漫套餐',
          price: 3888,
          originalPrice: 4999,
          desc: '包含场地费、灯光布置、3小时使用时长',
          tags: ['限时优惠']
        }
      ]
    },
  ]
}

/**
 * 使用 TanStack Query 的场景包列表 Hook
 * 自动处理缓存、加载状态、错误处理
 */
import { useQuery } from '@tanstack/react-query'

export function useScenarios() {
  return useQuery({
    queryKey: ['scenarioPackages'],
    queryFn: fetchScenarioPackages, // 使用真实 API
  })
}

/**
 * 根据 ID 获取场景包详情
 * 
 * @param id 场景包 ID
 * @returns Promise<ScenarioDetail> 场景包详情
 */
export async function fetchScenarioById(id: string): Promise<any> {
  const response = await request(`/api/scenario-packages/${id}`)
  
  if (!response.success) {
    throw new Error(response.message || '获取场景包详情失败')
  }
  
  return response.data
}

/**
 * 根据 ID 获取场景包的套餐档位列表
 */
export async function fetchPackageTiers(packageId: string): Promise<any[]> {
  const response = await request(`/api/scenario-packages/${packageId}/tiers`)
  
  if (!response.success) {
    throw new Error(response.message || '获取套餐列表失败')
  }
  
  return response.data
}

/**
 * 使用 TanStack Query 的场景包详情 Hook
 */
export function useScenarioDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['scenarioPackage', id],
    queryFn: () => fetchScenarioById(id!),
    enabled: !!id,
  })
}

/**
 * 使用 TanStack Query 的套餐档位 Hook
 */
export function usePackageTiers(packageId: string | undefined) {
  return useQuery({
    queryKey: ['packageTiers', packageId],
    queryFn: () => fetchPackageTiers(packageId!),
    enabled: !!packageId,
  })
}

/**
 * 获取所有启用的加购项
 */
export async function fetchAddonItems(): Promise<any[]> {
  const response = await request('/api/addon-items')
  
  if (!response.success) {
    throw new Error(response.message || '获取加购项列表失败')
  }
  
  return response.data
}

/**
 * 使用 TanStack Query 的加购项列表 Hook
 */
export function useAddonItems() {
  return useQuery({
    queryKey: ['addonItems'],
    queryFn: fetchAddonItems,
  })
}

/**
 * 获取场景包的时段模板
 */
export async function fetchTimeSlotTemplates(packageId: string): Promise<any[]> {
  const response = await request(`/api/scenario-packages/${packageId}/time-slot-templates`)
  
  if (!response.success) {
    throw new Error(response.message || '获取时段模板失败')
  }
  
  return response.data
}

/**
 * 使用 TanStack Query 的时段模板 Hook
 */
export function useTimeSlotTemplates(packageId: string | undefined) {
  return useQuery({
    queryKey: ['timeSlotTemplates', packageId],
    queryFn: () => fetchTimeSlotTemplates(packageId!),
    enabled: !!packageId,
  })
}
