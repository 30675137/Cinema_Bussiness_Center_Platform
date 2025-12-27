/**
 * 场景包服务测试工具
 * 用于在开发环境中模拟各种错误场景
 */

import type { ScenarioPackageListItem } from '../types/scenario'

export interface TestMode {
  mode: 'normal' | 'error' | 'empty' | 'slow'
  errorMessage?: string
  delay?: number
}

// 测试模式配置 (通过 localStorage 或全局变量控制)
let currentTestMode: TestMode = { mode: 'normal' }

/**
 * 设置测试模式
 * 在浏览器 Console 中使用: setTestMode({ mode: 'error' })
 */
export function setTestMode(mode: TestMode) {
  currentTestMode = mode
  console.log('[ScenarioService] Test mode set to:', mode)
}

/**
 * 获取当前测试模式
 */
export function getTestMode(): TestMode {
  // 检查 localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('scenario-test-mode')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        // ignore
      }
    }
  }
  return currentTestMode
}

/**
 * Mock 数据 - 正常场景
 */
export const mockNormalData: any[] = [
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

/**
 * 测试用 Mock 函数 - 支持不同场景
 */
export async function fetchScenarioPackagesMockWithTest(): Promise<any[]> {
  const testMode = getTestMode()

  // 模拟网络延迟
  const delay = testMode.delay || (testMode.mode === 'slow' ? 3000 : 500)
  await new Promise((resolve) => setTimeout(resolve, delay))

  switch (testMode.mode) {
    case 'error':
      throw new Error(testMode.errorMessage || '网络连接失败，请检查网络设置')

    case 'empty':
      return []

    case 'slow':
      return mockNormalData

    case 'normal':
    default:
      return mockNormalData
  }
}

// 挂载到 window 方便调试
if (typeof window !== 'undefined') {
  (window as any).setTestMode = setTestMode
  (window as any).getTestMode = getTestMode
}
