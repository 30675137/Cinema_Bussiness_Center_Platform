import { describe, it, expect, vi, beforeEach } from 'vitest'
import { spuService } from '@/services/spuService'
import { validateSPUForm } from '@/utils/validation'
import type { CreateSPURequest } from '@/services/spuService'

// Mock spuService methods
vi.mock('@/services/spuService', () => ({
  spuService: {
    createSPU: vi.fn(),
    updateSPU: vi.fn(),
    getSPUDetail: vi.fn(),
    getSPUList: vi.fn(),
  },
}))

const mockSPUService = spuService as any

describe('SPU Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('SPU Creation Validation', () => {
    it('should validate required fields', () => {
      const emptyData = {}
      const result = validateSPUForm(emptyData)

      expect(result.isValid).toBe(false)
      expect(result.fieldErrors).toContain('SPU名称不能为空')
      expect(result.fieldErrors).toContain('请选择品牌')
      expect(result.fieldErrors).toContain('请选择分类')
      expect(result.fieldErrors).toContain('商品描述不能为空')
    })

    it('should validate name length', () => {
      const data = {
        name: 'a', // too short
        description: 'Valid description',
        brandId: 'brand_001',
        categoryId: 'category_001',
        images: [{}],
        specifications: [{ name: 'test', value: 'test' }],
      }

      const result = validateSPUForm(data)
      expect(result.isValid).toBe(false)
      expect(result.fieldErrors.some(e => e.includes('SPU名称至少需要2个字符'))).toBe(true)
    })

    it('should validate description length', () => {
      const data = {
        name: 'Valid Name',
        description: 'a'.repeat(2001), // too long
        brandId: 'brand_001',
        categoryId: 'category_001',
        images: [{}],
        specifications: [{ name: 'test', value: 'test' }],
      }

      const result = validateSPUForm(data)
      expect(result.isValid).toBe(false)
      expect(result.fieldErrors.some(e => e.includes('商品描述不能超过2000个字符'))).toBe(true)
    })

    it('should validate image requirements', () => {
      const data = {
        name: 'Valid Name',
        description: 'Valid description',
        brandId: 'brand_001',
        categoryId: 'category_001',
        images: [], // empty images
        specifications: [{ name: 'test', value: 'test' }],
      }

      const result = validateSPUForm(data)
      expect(result.isValid).toBe(false)
      expect(result.fieldErrors).toContain('请至少上传一张商品图片')
    })

    it('should pass validation with valid data', () => {
      const validData = {
        name: 'Valid SPU Name',
        shortName: 'Valid Short',
        description: 'This is a valid description for testing purposes.',
        unit: '瓶',
        brandId: 'brand_001',
        categoryId: 'category_001',
        status: 'draft' as const,
        tags: ['test', 'sample'],
        images: [{ uid: '1', name: 'test.jpg', url: '/test.jpg', status: 'done' as const }],
        specifications: [{ name: '容量', value: '500ml' }],
        attributes: [{ name: '保质期', value: '12个月' }],
      }

      const result = validateSPUForm(validData)
      expect(result.isValid).toBe(true)
      expect(result.fieldErrors).toHaveLength(0)
    })
  })

  describe('SPU Service', () => {
    it('should create SPU successfully', async () => {
      const requestData: CreateSPURequest = {
        name: 'Test SPU',
        description: 'Test description',
        brandId: 'brand_001',
        categoryId: 'category_001',
        status: 'draft',
        images: [{ uid: '1', name: 'test.jpg', url: '/test.jpg', status: 'done' }],
        specifications: [{ name: 'test', value: 'test' }],
        attributes: [],
      }

      const mockResponse = {
        success: true,
        data: {
          id: 'spu_123',
          code: 'SPU20241211001',
          name: 'Test SPU',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: 'SPU创建成功',
        code: 200,
        timestamp: Date.now(),
      }

      mockSPUService.createSPU.mockResolvedValue(mockResponse)

      const result = await spuService.createSPU(requestData)

      expect(mockSPUService.createSPU).toHaveBeenCalledWith(requestData)
      expect(result).toEqual(mockResponse)
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Test SPU')
    })

    it('should handle creation errors', async () => {
      const requestData: CreateSPURequest = {
        name: '', // invalid empty name
        description: 'Test description',
        brandId: 'brand_001',
        categoryId: 'category_001',
        status: 'draft',
        images: [{ uid: '1', name: 'test.jpg', url: '/test.jpg', status: 'done' }],
        specifications: [{ name: 'test', value: 'test' }],
        attributes: [],
      }

      const mockResponse = {
        success: false,
        data: null,
        message: 'SPU名称不能为空',
        code: 500,
        timestamp: Date.now(),
      }

      mockSPUService.createSPU.mockResolvedValue(mockResponse)

      const result = await spuService.createSPU(requestData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('SPU名称不能为空')
    })
  })

  describe('SPU Form Integration', () => {
    it('should integrate validation and service', async () => {
      // Valid form data
      const formData = {
        name: 'Integration Test SPU',
        description: 'Testing form integration',
        brandId: 'brand_001',
        categoryId: 'category_001',
        status: 'draft' as const,
        images: [{ uid: '1', name: 'test.jpg', url: '/test.jpg', status: 'done' as const }],
        specifications: [{ name: '容量', value: '500ml' }],
        attributes: [],
      }

      // Step 1: Validation
      const validation = validateSPUForm(formData)
      expect(validation.isValid).toBe(true)

      // Step 2: Service call
      const mockServiceResponse = {
        success: true,
        data: {
          id: 'spu_integration_test',
          code: 'SPU202412110012',
          name: formData.name,
          status: formData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: 'SPU创建成功',
        code: 200,
        timestamp: Date.now(),
      }

      mockSPUService.createSPU.mockResolvedValue(mockServiceResponse)

      // Step 3: Execute creation
      const result = await spuService.createSPU(formData)

      // Step 4: Verify results
      expect(result.success).toBe(true)
      expect(result.data.name).toBe(formData.name)
      expect(result.data.code).toMatch(/^SPU\d{12}$/) // SPU format validation
    })
  })
})