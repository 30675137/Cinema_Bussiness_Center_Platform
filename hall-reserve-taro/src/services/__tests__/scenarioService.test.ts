/**
 * T024-C: 场景包服务单元测试
 *
 * 测试覆盖：
 * 1. fetchScenarioPackages 函数的 Zod 验证逻辑
 * 2. API 响应错误处理
 * 3. 数据格式转换
 * 4. 边界情况（空数组、null rating、无效数据）
 *
 * 注意：此测试文件需要配置测试框架（Jest/Vitest）后才能运行
 * 当前作为测试规格文档存在
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchScenarioPackages, fetchScenarioPackagesMock } from '../scenarioService'
import { ApiResponseSchema, ScenarioPackageListItemSchema } from '../../types/scenario'

// Mock Taro.request
vi.mock('@tarojs/taro', () => ({
  request: vi.fn(),
}))

import Taro from '@tarojs/taro'

describe('scenarioService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchScenarioPackages', () => {
    it('应该成功获取场景包列表并通过 Zod 验证', async () => {
      // Arrange: Mock API 响应
      const mockResponse = {
        success: true,
        data: [
          {
            id: '00000000-0001-0000-0000-000000000001',
            title: 'VIP 生日派对专场',
            category: 'PARTY',
            backgroundImageUrl: 'https://example.com/image1.jpg',
            packagePrice: 1888,
            rating: 4.5,
            tags: ['生日', '派对', 'VIP'],
          },
          {
            id: '00000000-0002-0000-0000-000000000002',
            title: '企业年会包场',
            category: 'TEAM',
            backgroundImageUrl: 'https://example.com/image2.jpg',
            packagePrice: 5888,
            rating: 4.8,
            tags: ['年会', '团建'],
          },
        ],
        timestamp: '2025-12-21T10:00:00Z',
      }

      vi.mocked(Taro.request).mockResolvedValueOnce({
        data: mockResponse,
        statusCode: 200,
        header: {},
        cookies: [],
      })

      // Act: 调用函数
      const result = await fetchScenarioPackages()

      // Assert: 验证返回数据
      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('VIP 生日派对专场')
      expect(result[0].category).toBe('PARTY')
      expect(result[0].packagePrice).toBe(1888)
      expect(result[0].rating).toBe(4.5)
      expect(result[0].tags).toEqual(['生日', '派对', 'VIP'])

      // 验证 API 调用参数
      expect(Taro.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('/api/scenario-packages/published'),
          method: 'GET',
        })
      )
    })

    it('应该处理 rating 为 null 的场景包', async () => {
      // Arrange: Mock 包含 null rating 的响应
      const mockResponse = {
        success: true,
        data: [
          {
            id: '00000000-0003-0000-0000-000000000003',
            title: '无评分场景包',
            category: 'MOVIE',
            backgroundImageUrl: 'https://example.com/image3.jpg',
            packagePrice: 2999,
            rating: null, // rating 为 null
            tags: ['测试'],
          },
        ],
        timestamp: '2025-12-21T10:00:00Z',
      }

      vi.mocked(Taro.request).mockResolvedValueOnce({
        data: mockResponse,
        statusCode: 200,
        header: {},
        cookies: [],
      })

      // Act
      const result = await fetchScenarioPackages()

      // Assert: rating 为 null 应该被正确处理
      expect(result).toHaveLength(1)
      expect(result[0].rating).toBeNull()
    })

    it('应该处理空数组响应', async () => {
      // Arrange: Mock 空数组响应
      const mockResponse = {
        success: true,
        data: [],
        timestamp: '2025-12-21T10:00:00Z',
      }

      vi.mocked(Taro.request).mockResolvedValueOnce({
        data: mockResponse,
        statusCode: 200,
        header: {},
        cookies: [],
      })

      // Act
      const result = await fetchScenarioPackages()

      // Assert: 应该返回空数组
      expect(result).toEqual([])
    })

    it('应该在 Zod 验证失败时抛出错误', async () => {
      // Arrange: Mock 无效格式的响应
      const invalidResponse = {
        success: true,
        data: [
          {
            id: 'invalid-uuid', // 无效的 UUID 格式
            title: '测试场景包',
            // 缺少必需字段 category
            backgroundImageUrl: 'not-a-url',
            packagePrice: -1000, // 负数价格
            rating: 10, // 超出范围 (0-5)
            tags: 'not-an-array', // 应该是数组
          },
        ],
        timestamp: '2025-12-21T10:00:00Z',
      }

      vi.mocked(Taro.request).mockResolvedValueOnce({
        data: invalidResponse,
        statusCode: 200,
        header: {},
        cookies: [],
      })

      // Act & Assert: 应该抛出 Zod 验证错误
      await expect(fetchScenarioPackages()).rejects.toThrow()
    })

    it('应该在 success=false 时抛出错误', async () => {
      // Arrange: Mock 业务逻辑失败响应
      const errorResponse = {
        success: false,
        data: [],
        message: '服务暂时不可用',
        timestamp: '2025-12-21T10:00:00Z',
      }

      vi.mocked(Taro.request).mockResolvedValueOnce({
        data: errorResponse,
        statusCode: 200,
        header: {},
        cookies: [],
      })

      // Act & Assert: 应该抛出错误并包含错误信息
      await expect(fetchScenarioPackages()).rejects.toThrow('服务暂时不可用')
    })

    it('应该处理网络请求失败', async () => {
      // Arrange: Mock 网络错误
      vi.mocked(Taro.request).mockRejectedValueOnce(new Error('Network Error'))

      // Act & Assert: 应该抛出网络错误
      await expect(fetchScenarioPackages()).rejects.toThrow('Network Error')
    })

    it('应该处理 HTTP 500 错误', async () => {
      // Arrange: Mock 服务器错误
      vi.mocked(Taro.request).mockRejectedValueOnce({
        statusCode: 500,
        errMsg: 'Internal Server Error',
      })

      // Act & Assert: 应该抛出错误
      await expect(fetchScenarioPackages()).rejects.toThrow()
    })
  })

  describe('fetchScenarioPackagesMock', () => {
    it('应该返回 Mock 数据', async () => {
      // Act: 调用 Mock 函数
      const result = await fetchScenarioPackagesMock()

      // Assert: 验证 Mock 数据结构
      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('image')
      expect(result[0]).toHaveProperty('title')
      expect(result[0]).toHaveProperty('rating')
      expect(result[0]).toHaveProperty('location')
      expect(result[0]).toHaveProperty('price')
    })

    it('Mock 数据应该模拟网络延迟', async () => {
      // Arrange: 记录开始时间
      const startTime = Date.now()

      // Act: 调用 Mock 函数
      await fetchScenarioPackagesMock()

      // Assert: 应该有延迟（至少 100ms）
      const duration = Date.now() - startTime
      expect(duration).toBeGreaterThanOrEqual(100)
    })
  })

  describe('Zod Schema 验证', () => {
    it('ApiResponseSchema 应该验证正确的响应格式', () => {
      // Arrange: 正确的响应格式
      const validResponse = {
        success: true,
        data: [
          {
            id: '00000000-0001-0000-0000-000000000001',
            title: '测试场景包',
            category: 'PARTY',
            backgroundImageUrl: 'https://example.com/image.jpg',
            packagePrice: 1888,
            rating: 4.5,
            tags: ['测试'],
          },
        ],
        timestamp: '2025-12-21T10:00:00Z',
      }

      // Act: 验证
      const result = ApiResponseSchema.safeParse(validResponse)

      // Assert: 应该验证通过
      expect(result.success).toBe(true)
    })

    it('ScenarioPackageListItemSchema 应该验证单个场景包数据', () => {
      // Arrange: 正确的场景包数据
      const validPackage = {
        id: '00000000-0001-0000-0000-000000000001',
        title: 'VIP 生日派对专场',
        category: 'PARTY',
        backgroundImageUrl: 'https://example.com/image.jpg',
        packagePrice: 1888,
        rating: 4.5,
        tags: ['生日', '派对'],
      }

      // Act: 验证
      const result = ScenarioPackageListItemSchema.safeParse(validPackage)

      // Assert: 应该验证通过
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的 category 值', () => {
      // Arrange: 无效的 category
      const invalidPackage = {
        id: '00000000-0001-0000-0000-000000000001',
        title: '测试场景包',
        category: 'INVALID_CATEGORY', // 无效值
        backgroundImageUrl: 'https://example.com/image.jpg',
        packagePrice: 1888,
        rating: 4.5,
        tags: ['测试'],
      }

      // Act: 验证
      const result = ScenarioPackageListItemSchema.safeParse(invalidPackage)

      // Assert: 应该验证失败
      expect(result.success).toBe(false)
    })

    it('应该拒绝超出范围的 rating 值', () => {
      // Arrange: rating 超出 0-5 范围
      const invalidPackage = {
        id: '00000000-0001-0000-0000-000000000001',
        title: '测试场景包',
        category: 'PARTY',
        backgroundImageUrl: 'https://example.com/image.jpg',
        packagePrice: 1888,
        rating: 10, // 超出范围
        tags: ['测试'],
      }

      // Act: 验证
      const result = ScenarioPackageListItemSchema.safeParse(invalidPackage)

      // Assert: 应该验证失败
      expect(result.success).toBe(false)
    })
  })
})
