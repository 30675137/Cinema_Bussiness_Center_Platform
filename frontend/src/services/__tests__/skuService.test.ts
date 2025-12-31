/**
 * @spec O004-beverage-sku-reuse
 * SKU Service Unit Tests
 *
 * 测试 SKU 服务层所有功能,包括数据转换、API 调用、缓存机制
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * 覆盖率目标: ≥80%
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { skuService } from '../skuService';
import { apiService } from '../api';
import type { SkuQueryParams, SkuFormData, SkuStatus } from '@/types/sku';

// Mock apiService
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('SKU Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getSkus', () => {
    it('应该成功获取 SKU 列表并转换数据格式 (snake_case → camelCase)', async () => {
      // 模拟 SPU 缓存响应
      const mockSpuResponse = {
        success: true,
        data: [
          {
            id: 'spu-001',
            code: 'SPU001',
            name: '可口可乐',
            brand_name: '可口可乐',
            category_name: '软饮',
            specifications: [
              { name: '规格', value: '330ml' },
              { name: '包装', value: '易拉罐' },
            ],
          },
        ],
        total: 1,
      };

      // 模拟 SKU 列表响应 (snake_case from list API)
      const mockSkuListResponse = {
        success: true,
        data: [
          {
            id: 'sku-001',
            code: 'SKU001',
            name: '可口可乐 330ml 听装',
            spu_id: 'spu-001',
            sku_type: 'raw_material',
            main_unit: 'ml',
            store_scope: ['store-1', 'store-2'],
            standard_cost: 500,
            waste_rate: 0.05,
            price: 800,
            status: 'enabled',
            created_at: '2025-12-30T10:00:00Z',
            updated_at: '2025-12-30T12:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      vi.mocked(apiService.get)
        .mockResolvedValueOnce(mockSpuResponse) // 第一次调用: 获取 SPU 缓存
        .mockResolvedValueOnce(mockSkuListResponse); // 第二次调用: 获取 SKU 列表

      const params: SkuQueryParams = {
        keyword: '可口可乐',
        status: 'enabled',
        page: 1,
        pageSize: 20,
      };

      const result = await skuService.getSkus(params);

      // 验证 API 调用
      expect(apiService.get).toHaveBeenCalledTimes(2);
      expect(apiService.get).toHaveBeenNthCalledWith(1, '/spus?pageSize=1000'); // SPU 缓存
      expect(apiService.get).toHaveBeenNthCalledWith(
        2,
        '/skus?keyword=%E5%8F%AF%E5%8F%A3%E5%8F%AF%E4%B9%90&status=ENABLED&page=1&pageSize=20'
      );

      // 验证数据转换 (snake_case → camelCase)
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 'sku-001',
        code: 'SKU001',
        name: '可口可乐 330ml 听装',
        skuType: 'raw_material',
        spuId: 'spu-001',
        spuName: '可口可乐', // 从 SPU 缓存填充
        brand: '可口可乐', // 从 SPU 缓存填充
        category: '软饮', // 从 SPU 缓存填充
        spec: '规格:330ml, 包装:易拉罐', // 从 SPU 规格列表拼接
        mainUnit: 'ml',
        storeScope: ['store-1', 'store-2'],
        standardCost: 500,
        wasteRate: 0.05,
        price: 800,
        status: 'enabled',
        createdAt: '2025-12-30T10:00:00Z',
        updatedAt: '2025-12-30T12:00:00Z',
      });

      // 验证分页信息
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('应该正确处理 BOM 配方数据 (成品类型)', async () => {
      const mockSpuResponse = { success: true, data: [], total: 0 };
      const mockSkuListResponse = {
        success: true,
        data: [
          {
            id: 'sku-finished-001',
            code: 'SKU-F001',
            name: '威士忌可乐',
            spu_id: 'spu-002',
            sku_type: 'finished_product',
            main_unit: '杯',
            status: 'enabled',
            bom: [
              {
                id: 'bom-001',
                component_id: 'sku-001',
                quantity: 50,
                unit: 'ml',
                unit_cost: 10,
                is_optional: false,
                sort_order: 1,
                component: {
                  id: 'sku-001',
                  name: '威士忌',
                  code: 'SKU001',
                },
              },
              {
                id: 'bom-002',
                component_id: 'sku-002',
                quantity: 200,
                unit: 'ml',
                unit_cost: 5,
                is_optional: false,
                sort_order: 2,
                component: {
                  id: 'sku-002',
                  name: '可乐',
                  code: 'SKU002',
                },
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      vi.mocked(apiService.get)
        .mockResolvedValueOnce(mockSpuResponse)
        .mockResolvedValueOnce(mockSkuListResponse);

      const result = await skuService.getSkus({ page: 1, pageSize: 20 });

      // 验证 BOM 数据转换
      expect(result.items[0].bomComponents).toHaveLength(2);
      expect(result.items[0].bomComponents![0]).toMatchObject({
        id: 'bom-001',
        componentId: 'sku-001',
        componentName: '威士忌',
        quantity: 50,
        unit: 'ml',
        unitCost: 10,
        totalCost: 500, // 50 * 10
        isOptional: false,
        sortOrder: 1,
      });
      expect(result.items[0].bomComponents![1]).toMatchObject({
        id: 'bom-002',
        componentId: 'sku-002',
        componentName: '可乐',
        quantity: 200,
        unit: 'ml',
        unitCost: 5,
        totalCost: 1000, // 200 * 5
        isOptional: false,
        sortOrder: 2,
      });
    });

    it('应该正确处理套餐子项数据 (套餐类型)', async () => {
      const mockSpuResponse = { success: true, data: [], total: 0 };
      const mockSkuListResponse = {
        success: true,
        data: [
          {
            id: 'sku-combo-001',
            code: 'SKU-COMBO-001',
            name: '电影套餐',
            spu_id: 'spu-003',
            sku_type: 'combo',
            main_unit: '份',
            status: 'enabled',
            combo_items: [
              {
                id: 'combo-item-001',
                sub_item_id: 'sku-popcorn',
                quantity: 1,
                unit: '份',
                unit_cost: 1500,
                sort_order: 1,
                sub_item: {
                  name: '爆米花',
                },
              },
              {
                id: 'combo-item-002',
                sub_item_id: 'sku-coke',
                quantity: 1,
                unit: '杯',
                unit_cost: 800,
                sort_order: 2,
                sub_item: {
                  name: '可乐',
                },
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      vi.mocked(apiService.get)
        .mockResolvedValueOnce(mockSpuResponse)
        .mockResolvedValueOnce(mockSkuListResponse);

      const result = await skuService.getSkus({ page: 1, pageSize: 20 });

      // 验证套餐子项数据转换
      expect(result.items[0].comboItems).toHaveLength(2);
      expect(result.items[0].comboItems![0]).toMatchObject({
        id: 'combo-item-001',
        subItemId: 'sku-popcorn',
        subItemName: '爆米花',
        quantity: 1,
        unit: '份',
        unitCost: 1500,
        sortOrder: 1,
      });
      expect(result.items[0].comboItems![1]).toMatchObject({
        id: 'combo-item-002',
        subItemId: 'sku-coke',
        subItemName: '可乐',
        quantity: 1,
        unit: '杯',
        unitCost: 800,
        sortOrder: 2,
      });
    });

    it('应该正确处理空查询参数', async () => {
      const mockSpuResponse = { success: true, data: [], total: 0 };
      const mockSkuListResponse = {
        success: true,
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      vi.mocked(apiService.get)
        .mockResolvedValueOnce(mockSpuResponse)
        .mockResolvedValueOnce(mockSkuListResponse);

      const result = await skuService.getSkus({});

      // 默认分页参数
      expect(apiService.get).toHaveBeenNthCalledWith(2, '/skus?page=1&pageSize=20');
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('应该正确使用 SPU 缓存 (5 分钟 TTL)', async () => {
      const mockSpuResponse = { success: true, data: [], total: 0 };
      const mockSkuListResponse = {
        success: true,
        data: [],
        total: 0,
        page: 1,
        pageSize: 20,
      };

      vi.mocked(apiService.get)
        .mockResolvedValue(mockSpuResponse)
        .mockResolvedValue(mockSkuListResponse);

      // 第一次调用 - 应该获取 SPU 缓存
      await skuService.getSkus({ page: 1 });
      expect(apiService.get).toHaveBeenCalledWith('/spus?pageSize=1000');

      vi.clearAllMocks();

      // 第二次调用 (缓存未过期) - 不应重新获取 SPU
      await skuService.getSkus({ page: 1 });
      expect(apiService.get).toHaveBeenCalledTimes(1); // 仅调用 SKU API
      expect(apiService.get).not.toHaveBeenCalledWith('/spus?pageSize=1000');
    });
  });

  describe('getSkuById', () => {
    it('应该成功获取 SKU 详情 (camelCase from detail API)', async () => {
      const mockSpuResponse = {
        success: true,
        data: [
          {
            id: 'spu-001',
            name: '威士忌',
            brand_name: 'Jack Daniels',
            category_name: '烈酒',
            specifications: [{ name: '规格', value: '750ml' }],
          },
        ],
      };

      const mockSkuDetailResponse = {
        success: true,
        data: {
          id: 'sku-001',
          code: 'SKU001',
          name: '杰克丹尼威士忌',
          spuId: 'spu-001', // camelCase from detail API
          skuType: 'raw_material',
          mainUnit: 'ml',
          storeScope: ['store-1'],
          standardCost: 15000,
          wasteRate: 0.02,
          status: 'enabled',
          createdAt: '2025-12-30T10:00:00Z',
          updatedAt: '2025-12-30T12:00:00Z',
        },
      };

      vi.mocked(apiService.get)
        .mockResolvedValueOnce(mockSpuResponse)
        .mockResolvedValueOnce(mockSkuDetailResponse);

      const result = await skuService.getSkuById('sku-001');

      expect(apiService.get).toHaveBeenCalledWith('/skus/sku-001');
      expect(result).toMatchObject({
        id: 'sku-001',
        code: 'SKU001',
        name: '杰克丹尼威士忌',
        spuId: 'spu-001',
        spuName: '威士忌',
        brand: 'Jack Daniels',
        category: '烈酒',
        spec: '规格:750ml',
        skuType: 'raw_material',
        mainUnit: 'ml',
        standardCost: 15000,
        wasteRate: 0.02,
        status: 'enabled',
      });
    });
  });

  describe('createSku', () => {
    it('应该成功创建原料类型 SKU', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-new-001',
          code: 'SKU-NEW-001',
          name: '新原料',
          spu_id: 'spu-001',
          sku_type: 'raw_material',
          main_unit: 'ml',
          status: 'draft',
          standard_cost: 1000,
        },
      };

      vi.mocked(apiService.post).mockResolvedValue(mockSkuResponse);

      const formData: SkuFormData = {
        name: '新原料',
        spuId: 'spu-001',
        skuType: 'raw_material',
        mainUnitId: 'ml',
        status: 'draft',
        standardCost: 1000,
      };

      const result = await skuService.createSku(formData);

      expect(apiService.post).toHaveBeenCalledWith('/skus', {
        code: expect.stringContaining('SKU'),
        name: '新原料',
        spuId: 'spu-001',
        skuType: 'raw_material',
        mainUnit: 'ml',
        status: 'draft',
        standardCost: 1000,
      });
      expect(result.id).toBe('sku-new-001');
    });

    it('应该成功创建成品类型 SKU (包含 BOM 配方)', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-finished-001',
          code: 'SKU-F001',
          name: '威士忌可乐',
          spu_id: 'spu-002',
          sku_type: 'finished_product',
          main_unit: '杯',
          status: 'draft',
        },
      };

      vi.mocked(apiService.post).mockResolvedValue(mockSkuResponse);

      const formData: SkuFormData = {
        name: '威士忌可乐',
        spuId: 'spu-002',
        skuType: 'finished_product',
        mainUnitId: '杯',
        status: 'draft',
        bomComponents: [
          { componentId: 'sku-001', quantity: 50, unit: 'ml', sortOrder: 1 },
          { componentId: 'sku-002', quantity: 200, unit: 'ml', sortOrder: 2 },
        ],
      };

      await skuService.createSku(formData);

      expect(apiService.post).toHaveBeenCalledWith(
        '/skus',
        expect.objectContaining({
          bomComponents: formData.bomComponents,
        })
      );
    });

    it('应该成功创建套餐类型 SKU (包含套餐子项)', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-combo-001',
          code: 'SKU-COMBO-001',
          name: '电影套餐',
          spu_id: 'spu-003',
          sku_type: 'combo',
          main_unit: '份',
          status: 'draft',
        },
      };

      vi.mocked(apiService.post).mockResolvedValue(mockSkuResponse);

      const formData: SkuFormData = {
        name: '电影套餐',
        spuId: 'spu-003',
        skuType: 'combo',
        mainUnitId: '份',
        status: 'draft',
        comboItems: [
          { subItemId: 'sku-popcorn', quantity: 1, unit: '份', sortOrder: 1 },
          { subItemId: 'sku-coke', quantity: 1, unit: '杯', sortOrder: 2 },
        ],
      };

      await skuService.createSku(formData);

      expect(apiService.post).toHaveBeenCalledWith(
        '/skus',
        expect.objectContaining({
          comboItems: formData.comboItems,
        })
      );
    });

    it('应该使用自动生成的条码 (如果未提供 mainBarcode)', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-001',
          code: expect.stringContaining('SKU'),
          name: '测试商品',
          spu_id: 'spu-001',
          sku_type: 'raw_material',
          main_unit: 'ml',
          status: 'draft',
          standard_cost: 0,
        },
      };

      vi.mocked(apiService.post).mockResolvedValue(mockSkuResponse);

      const formData: SkuFormData = {
        name: '测试商品',
        spuId: 'spu-001',
        skuType: 'raw_material',
        mainUnitId: 'ml',
        status: 'draft',
        // 没有 mainBarcode 字段
      };

      await skuService.createSku(formData);

      expect(apiService.post).toHaveBeenCalledWith(
        '/skus',
        expect.objectContaining({
          code: expect.stringMatching(/^SKU\d+$/), // SKU + timestamp
        })
      );
    });
  });

  describe('updateSku', () => {
    it('应该成功更新 SKU', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-001',
          code: 'SKU001',
          name: '更新后的名称',
          spu_id: 'spu-001',
          sku_type: 'raw_material',
          main_unit: 'g',
          status: 'enabled',
          standard_cost: 1200,
        },
      };

      vi.mocked(apiService.put).mockResolvedValue(mockSkuResponse);

      const formData: SkuFormData = {
        name: '更新后的名称',
        mainUnitId: 'g',
        status: 'enabled',
        standardCost: 1200,
        storeScope: ['store-1', 'store-2'],
      };

      const result = await skuService.updateSku('sku-001', formData);

      expect(apiService.put).toHaveBeenCalledWith('/skus/sku-001', {
        name: '更新后的名称',
        mainUnit: 'g',
        status: 'enabled',
        standardCost: 1200,
        price: undefined,
        storeScope: ['store-1', 'store-2'],
      });
      expect(result.name).toBe('更新后的名称');
    });

    it('应该正确更新成品/套餐的零售价', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-finished-001',
          code: 'SKU-F001',
          name: '威士忌可乐',
          spu_id: 'spu-002',
          sku_type: 'finished_product',
          main_unit: '杯',
          status: 'enabled',
          price: 3500,
        },
      };

      vi.mocked(apiService.put).mockResolvedValue(mockSkuResponse);

      const formData: SkuFormData = {
        name: '威士忌可乐',
        mainUnitId: '杯',
        status: 'enabled',
        price: 3500, // 零售价
      };

      await skuService.updateSku('sku-finished-001', formData);

      expect(apiService.put).toHaveBeenCalledWith(
        '/skus/sku-finished-001',
        expect.objectContaining({
          price: 3500,
        })
      );
    });
  });

  describe('toggleSkuStatus', () => {
    it('应该成功切换 SKU 状态 (启用 → 禁用)', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-001',
          code: 'SKU001',
          name: '测试商品',
          spu_id: 'spu-001',
          sku_type: 'raw_material',
          main_unit: 'ml',
          status: 'disabled',
        },
      };

      vi.mocked(apiService.put).mockResolvedValue(mockSkuResponse);

      const result = await skuService.toggleSkuStatus('sku-001', 'disabled' as SkuStatus);

      expect(apiService.put).toHaveBeenCalledWith('/skus/sku-001', {
        status: 'disabled',
      });
      expect(result.status).toBe('disabled');
    });

    it('应该成功切换 SKU 状态 (禁用 → 启用)', async () => {
      const mockSkuResponse = {
        success: true,
        data: {
          id: 'sku-001',
          code: 'SKU001',
          name: '测试商品',
          spu_id: 'spu-001',
          sku_type: 'raw_material',
          main_unit: 'ml',
          status: 'enabled',
        },
      };

      vi.mocked(apiService.put).mockResolvedValue(mockSkuResponse);

      const result = await skuService.toggleSkuStatus('sku-001', 'enabled' as SkuStatus);

      expect(apiService.put).toHaveBeenCalledWith('/skus/sku-001', {
        status: 'enabled',
      });
      expect(result.status).toBe('enabled');
    });
  });

  describe('updateBom', () => {
    it('应该成功更新 BOM 配方', async () => {
      const mockBomResponse = {
        success: true,
        data: {
          calculatedCost: 1500,
        },
      };

      vi.mocked(apiService.put).mockResolvedValue(mockBomResponse);

      const components = [
        { componentId: 'sku-001', quantity: 50, unit: 'ml', isOptional: false, sortOrder: 1 },
        { componentId: 'sku-002', quantity: 200, unit: 'ml', isOptional: false, sortOrder: 2 },
      ];

      const result = await skuService.updateBom('sku-finished-001', components, 0.05);

      expect(apiService.put).toHaveBeenCalledWith('/skus/sku-finished-001/bom', {
        components,
        wasteRate: 0.05,
      });
      expect(result.calculatedCost).toBe(1500);
    });

    it('应该使用默认损耗率 0 (如果未提供 wasteRate)', async () => {
      const mockBomResponse = {
        success: true,
        data: {
          calculatedCost: 1000,
        },
      };

      vi.mocked(apiService.put).mockResolvedValue(mockBomResponse);

      const components = [
        { componentId: 'sku-001', quantity: 50, unit: 'ml', sortOrder: 1 },
      ];

      await skuService.updateBom('sku-finished-001', components);

      expect(apiService.put).toHaveBeenCalledWith(
        '/skus/sku-finished-001/bom',
        expect.objectContaining({
          wasteRate: 0,
        })
      );
    });
  });

  describe('updateComboItems', () => {
    it('应该成功更新套餐子项', async () => {
      const mockComboResponse = {
        success: true,
        data: {
          calculatedCost: 2300,
        },
      };

      vi.mocked(apiService.put).mockResolvedValue(mockComboResponse);

      const items = [
        { subItemId: 'sku-popcorn', quantity: 1, unit: '份', sortOrder: 1 },
        { subItemId: 'sku-coke', quantity: 1, unit: '杯', sortOrder: 2 },
      ];

      const result = await skuService.updateComboItems('sku-combo-001', items);

      expect(apiService.put).toHaveBeenCalledWith('/skus/sku-combo-001/combo-items', {
        items,
      });
      expect(result.calculatedCost).toBe(2300);
    });
  });

  describe('checkBarcodeDuplicate', () => {
    it('应该返回条码可用 (暂无后端接口)', async () => {
      const result = await skuService.checkBarcodeDuplicate('123456789');

      expect(result.available).toBe(true);
      expect(result.message).toBe('条码可用');
    });

    it('应该支持排除当前 SKU (excludeSkuId)', async () => {
      const result = await skuService.checkBarcodeDuplicate('123456789', 'sku-001');

      expect(result.available).toBe(true);
    });
  });

  describe('checkSkuNameDuplicate', () => {
    it('应该返回名称可用 (暂无后端接口)', async () => {
      const result = await skuService.checkSkuNameDuplicate('新商品名称');

      expect(result.available).toBe(true);
      expect(result.message).toBe('名称可用');
    });

    it('应该支持排除当前 SKU (excludeSkuId)', async () => {
      const result = await skuService.checkSkuNameDuplicate('新商品名称', 'sku-001');

      expect(result.available).toBe(true);
    });
  });

  describe('getSpus', () => {
    it('应该成功获取 SPU 列表', async () => {
      const mockSpuResponse = {
        success: true,
        data: [
          {
            id: 'spu-001',
            code: 'SPU001',
            name: '可口可乐',
            brand_name: '可口可乐',
            category_name: '软饮',
            category_id: 'cat-001',
            product_type: 'raw_material',
          },
          {
            id: 'spu-002',
            code: 'SPU002',
            name: '百事可乐',
            brand_name: '百事',
            category_name: '软饮',
            category_id: 'cat-001',
            product_type: 'raw_material',
          },
        ],
      };

      vi.mocked(apiService.get).mockResolvedValue(mockSpuResponse);

      const result = await skuService.getSpus();

      expect(apiService.get).toHaveBeenCalledWith('/spus?pageSize=1000');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'spu-001',
        code: 'SPU001',
        name: '可口可乐',
        brand: '可口可乐',
        category: '软饮',
        categoryId: 'cat-001',
        productType: 'raw_material',
      });
    });

    it('应该正确处理 API 错误', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('Network error'));

      const result = await skuService.getSpus();

      expect(result).toEqual([]);
    });
  });

  describe('getUnits', () => {
    it('应该返回基础单位列表 (暂无后端接口)', async () => {
      const result = await skuService.getUnits();

      expect(result).toHaveLength(10);
      expect(result).toContainEqual({
        id: 'ml',
        code: 'ML',
        name: 'ml',
        type: 'inventory',
      });
      expect(result).toContainEqual({
        id: '杯',
        code: 'CUP',
        name: '杯',
        type: 'inventory',
      });
    });
  });
});
