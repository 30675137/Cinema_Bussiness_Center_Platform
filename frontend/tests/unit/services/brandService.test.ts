import { describe, it, expect, beforeEach, vi } from 'vitest';
import { brandService } from '../../../src/pages/mdm-pim/brand/services/brandService';
import {
  Brand,
  BrandStatus,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '../../../src/pages/mdm-pim/brand/types/brand.types';

// Mock MSW handlers
vi.mock('../../../src/mocks/handlers/brandHandlers', () => ({
  brandHandlers: [],
}));

describe('brandService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBrands', () => {
    it('应该能够获取品牌列表', async () => {
      // 模拟API响应
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            brandCode: 'BRAND001',
            name: '测试品牌',
            englishName: 'Test Brand',
            brandType: 'own',
            primaryCategories: ['饮料'],
            company: '测试公司',
            brandLevel: 'A',
            tags: ['测试'],
            description: '测试描述',
            logoUrl: null,
            status: 'enabled' as BrandStatus,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            createdBy: 'admin',
            updatedBy: 'admin',
          },
        ],
        pagination: {
          current: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        message: 'Success',
        timestamp: new Date().toISOString(),
      };

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.getBrands({
        page: 1,
        pageSize: 20,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('测试品牌');
      expect(result.pagination.total).toBe(1);
    });

    it('应该正确传递查询参数', async () => {
      const mockResponse = {
        success: true,
        data: [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        message: 'Success',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await brandService.getBrands({
        page: 2,
        pageSize: 10,
        keyword: '测试',
        brandType: 'own',
        status: 'enabled',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/brands'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('应该处理API错误', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(brandService.getBrands()).rejects.toThrow();
    });
  });

  describe('getBrand', () => {
    it('应该能够获取单个品牌详情', async () => {
      const mockBrand = {
        id: '1',
        brandCode: 'BRAND001',
        name: '测试品牌',
        englishName: 'Test Brand',
        brandType: 'own',
        primaryCategories: ['饮料'],
        company: '测试公司',
        brandLevel: 'A',
        tags: ['测试'],
        description: '测试描述',
        logoUrl: null,
        status: 'enabled' as BrandStatus,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        createdBy: 'admin',
        updatedBy: 'admin',
        usageStats: {
          spuCount: 10,
          skuCount: 50,
          lastUsedAt: '2024-01-01T00:00:00Z',
        },
      };

      const mockResponse = {
        success: true,
        data: mockBrand,
        message: 'Success',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.getBrandById('1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.name).toBe('测试品牌');
      expect(result.data.usageStats.spuCount).toBe(10);
    });

    it('应该处理品牌不存在的情况', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在',
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.getBrandById('999')).rejects.toThrow('品牌不存在');
    });
  });

  describe('createBrand', () => {
    it('应该能够创建新品牌', async () => {
      const createData: CreateBrandRequest = {
        name: '新品牌',
        englishName: 'New Brand',
        brandType: 'own',
        primaryCategories: ['饮料'],
        company: '新公司',
        brandLevel: 'A',
        tags: ['新品牌'],
        description: '新品牌描述',
        status: 'draft',
      };

      const mockResponse = {
        success: true,
        data: {
          id: '2',
          brandCode: 'BRAND002',
          ...createData,
          logoUrl: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          createdBy: 'admin',
          updatedBy: 'admin',
        },
        message: 'Brand created successfully',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.createBrand(createData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('新品牌');
      expect(result.data.brandType).toBe('own');
      expect(result.data.id).toBe('2');
    });

    it('应该处理品牌名称重复的情况', async () => {
      const createData: CreateBrandRequest = {
        name: '重复品牌',
        brandType: 'own',
        primaryCategories: [],
      };

      const mockResponse = {
        success: false,
        error: {
          code: 'DUPLICATE_BRAND',
          message: '品牌名称重复',
          details: [
            {
              field: 'name',
              message: '系统中已存在同名品牌，请检查是否重复创建',
            },
          ],
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.createBrand(createData)).rejects.toThrow('品牌名称重复');
    });

    it('应该验证必填字段', async () => {
      const createData = {} as CreateBrandRequest;

      // 这里的验证应该在组件层面进行，service只负责发送请求
      // 但我们可以测试一下请求格式
      const mockResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '验证失败',
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.createBrand(createData)).rejects.toThrow('验证失败');
    });
  });

  describe('updateBrand', () => {
    const existingBrand: Brand = {
      id: '1',
      brandCode: 'BRAND001',
      name: '现有品牌',
      englishName: 'Existing Brand',
      brandType: 'own',
      primaryCategories: ['饮料'],
      company: '现有公司',
      brandLevel: 'A',
      tags: ['现有'],
      description: '现有品牌描述',
      logoUrl: null,
      status: 'enabled' as BrandStatus,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    };

    it('应该能够更新品牌信息', async () => {
      const updateData: UpdateBrandRequest = {
        name: '更新后的品牌',
        englishName: 'Updated Brand',
        description: '更新后的描述',
      };

      const mockResponse = {
        success: true,
        data: {
          ...existingBrand,
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
        message: 'Brand updated successfully',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.updateBrand('1', updateData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('更新后的品牌');
      expect(result.data.englishName).toBe('Updated Brand');
    });

    it('应该处理品牌不存在的情况', async () => {
      const updateData: UpdateBrandRequest = {
        name: '更新的品牌',
      };

      const mockResponse = {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在',
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.updateBrand('999', updateData)).rejects.toThrow('品牌不存在');
    });
  });

  describe('updateBrandStatus', () => {
    it('应该能够启用品牌', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          status: 'enabled' as BrandStatus,
          oldStatus: 'disabled' as BrandStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin',
        },
        message: 'Brand status updated successfully',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.updateBrandStatus('1', 'enabled', '重新启用品牌');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('enabled');
      expect(result.data.oldStatus).toBe('disabled');
    });

    it('应该能够停用品牌', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          status: 'disabled' as BrandStatus,
          oldStatus: 'enabled' as BrandStatus,
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin',
        },
        message: 'Brand status updated successfully',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.updateBrandStatus('1', 'disabled', '业务调整');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('disabled');
      expect(result.data.oldStatus).toBe('enabled');
    });

    it('应该处理无效状态转换', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: '无效的状态转换',
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.updateBrandStatus('1', 'invalid' as BrandStatus)).rejects.toThrow(
        '无效的状态转换'
      );
    });

    it('应该在停用时提供原因', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          status: 'disabled' as BrandStatus,
          oldStatus: 'enabled' as BrandStatus,
          reason: '违反品牌政策',
          updatedAt: new Date().toISOString(),
          updatedBy: 'admin',
        },
        message: 'Brand status updated successfully',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.updateBrandStatus('1', 'disabled', '违反品牌政策');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/brands/1/status'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            status: 'disabled',
            reason: '违反品牌政策',
          }),
        })
      );
    });
  });

  describe('uploadLogo', () => {
    it('应该能够上传品牌Logo', async () => {
      const file = new File(['test'], 'logo.png', { type: 'image/png' });
      const mockResponse = {
        success: true,
        data: {
          logoUrl: 'https://example.com/logo/brand-1-123456789.png',
          updatedAt: new Date().toISOString(),
        },
        message: 'Logo uploaded successfully',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.uploadLogo('1', file);

      expect(result.success).toBe(true);
      expect(result.data.logoUrl).toContain('brand-1');
    });

    it('应该验证文件类型', async () => {
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });

      const mockResponse = {
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: '请上传图片文件',
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.uploadLogo('1', file)).rejects.toThrow('请上传图片文件');
    });

    it('应该验证文件大小', async () => {
      // 创建超过5MB的文件
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });

      // 在实际实现中，这个验证可能在前端进行，但我们也测试后端验证
      const mockResponse = {
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: '文件大小超过限制',
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.uploadLogo('1', largeFile)).rejects.toThrow('文件大小超过限制');
    });
  });

  describe('checkNameDuplication', () => {
    it('应该检查品牌名称是否重复', async () => {
      const mockResponse = {
        success: true,
        data: {
          isDuplicate: false,
        },
        message: '检查完成',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.checkNameDuplication({
        name: '新品牌',
        brandType: 'own',
      });

      expect(result.success).toBe(true);
      expect(result.data.isDuplicate).toBe(false);
    });

    it('应该在排除特定ID后检查重复', async () => {
      const mockResponse = {
        success: true,
        data: {
          isDuplicate: false,
        },
        message: '检查完成',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.checkNameDuplication({
        name: '测试品牌',
        brandType: 'own',
        excludeId: '1',
      });

      expect(result.success).toBe(true);
      expect(result.data.isDuplicate).toBe(false);
    });
  });

  describe('getBrandUsageStats', () => {
    it('应该获取品牌使用统计', async () => {
      const mockResponse = {
        success: true,
        data: {
          brandId: '1',
          spuCount: 25,
          skuCount: 120,
          lastUsedAt: '2024-01-01T00:00:00Z',
          calculatedAt: new Date().toISOString(),
        },
        message: 'Usage statistics retrieved successfully',
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await brandService.getBrandUsageStats('1');

      expect(result.success).toBe(true);
      expect(result.data.spuCount).toBe(25);
      expect(result.data.skuCount).toBe(120);
    });

    it('应该处理品牌不存在的情况', async () => {
      const mockResponse = {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在',
        },
        timestamp: new Date().toISOString(),
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(brandService.getBrandUsageStats('999')).rejects.toThrow('品牌不存在');
    });
  });
});
