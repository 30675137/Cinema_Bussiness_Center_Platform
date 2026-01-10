import { http, HttpResponse } from 'msw';
import { categoryHandlers } from './categoryHandlers';
import { brandHandlers } from './brandHandlers';
import { attributeHandlers_ } from './attributeHandlers';
import { scheduleHandlers } from './scheduleHandlers';
import { reservationSettingsHandlers } from './reservationSettingsHandlers';
import { scenarioPackageEditorHandlers } from './scenarioPackageEditorHandlers';
import { skuHandlers } from './sku'; // P001-sku-master-data
import { conversionHandlers } from './conversion'; // P002-unit-conversion
import { orderHandlers } from './orderHandlers'; // O001-product-order-list
import { channelProductHandlers } from './channelProductHandlers'; // O005-channel-product-config
// 库存相关使用真实后端 API，已禁用 mock
// import { inventoryHandlers } from './inventoryHandlers' // P003-inventory-query
// import { adjustmentHandlers } from './adjustmentHandlers' // P004-inventory-adjustment
// 场景包使用真实后端 API，不再使用 mock
// import { scenarioPackageHandlers } from './scenarioPackageHandlers'

// 动态导入 generators（延迟加载），避免在 MSW 启动时立即加载所有依赖
const getGenerators = async () => {
  const { generateMockSPUList, generateMockCategories, generateMockBrands } =
    await import('../data/generators');
  return { generateMockSPUList, generateMockCategories, generateMockBrands };
};

// 基础API延迟模拟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// SPU相关API处理器
export const spuHandlers = [
  // 获取SPU列表
  // @spec P007-fix-spu-batch-delete
  http.get('/api/spu/list', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const keyword = url.searchParams.get('keyword') || '';
    const brandId = url.searchParams.get('brandId') || '';
    const categoryId = url.searchParams.get('categoryId') || '';
    const status = url.searchParams.get('status') || '';

    await delay(500); // 模拟网络延迟

    // 使用持久化的 Mock 数据而非每次重新生成
    const { mockSPUStore } = await import('../data/mockSPUStore');
    const allSPU = mockSPUStore.getAll();

    // 应用筛选条件
    const filteredSPU = allSPU.filter((spu) => {
      if (keyword && !spu.name.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
      if (brandId && spu.brandId !== brandId) return false;
      if (categoryId && spu.categoryId !== categoryId) return false;
      if (status && spu.status !== status) return false;
      return true;
    });

    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredSPU.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        list: paginatedData,
        pagination: {
          current: page,
          pageSize,
          total: filteredSPU.length,
          totalPages: Math.ceil(filteredSPU.length / pageSize),
        },
      },
    });
  }),

  // 获取SPU详情
  http.get('/api/spu/:id', async ({ params }) => {
    await delay(300);

    const spuId = params.id as string;
    const { generateMockSPUList } = await getGenerators();
    const allSPU = generateMockSPUList(100);
    const spu = allSPU.find((item) => item.id === spuId);

    if (!spu) {
      return HttpResponse.json({ success: false, message: 'SPU不存在' }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: spu,
    });
  }),

  // 创建SPU
  // @spec B001-fix-brand-creation
  http.post('/api/spu/create', async ({ request }) => {
    await delay(800);

    try {
      const newSPU = (await request.json()) as any;
      const createdSPU = {
        ...newSPU,
        id: `SPU${Date.now()}`,
        code: `SPU${String(Date.now()).slice(-8)}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: '当前用户',
        modifier: '当前用户',
      };

      // 将新创建的 SPU 添加到 mockSPUStore
      const { mockSPUStore } = await import('../data/mockSPUStore');
      mockSPUStore.add(createdSPU);

      return HttpResponse.json({
        success: true,
        data: createdSPU,
        message: 'SPU创建成功',
      });
    } catch (error) {
      return HttpResponse.json(
        { success: false, message: '创建失败：无效的请求数据' },
        { status: 400 }
      );
    }
  }),

  // 更新SPU
  http.put('/api/spu/:id', async ({ params, request }) => {
    await delay(600);

    const spuId = params.id as string;
    const updateData = (await request.json()) as any;

    return HttpResponse.json({
      success: true,
      data: {
        id: spuId,
        ...updateData,
        updatedAt: new Date().toISOString(),
        modifier: '当前用户',
      },
      message: 'SPU更新成功',
    });
  }),

  // 删除SPU
  http.delete('/api/spu/:id', async () => {
    await delay(400);

    return HttpResponse.json({
      success: true,
      message: 'SPU删除成功',
    });
  }),

  // 批量操作
  // @spec P007-fix-spu-batch-delete
  http.post('/api/spu/batch', async ({ request }) => {
    await delay(1000);

    const { operation, ids } = (await request.json()) as {
      operation: string;
      ids: string[];
    };

    // 处理批量删除操作
    if (operation === 'delete') {
      const { mockSPUStore } = await import('../data/mockSPUStore');
      const result = mockSPUStore.deleteMany(ids);

      return HttpResponse.json({
        success: true,
        data: {
          processedCount: result.success,
          failedCount: result.failed,
        },
        message:
          result.failed > 0
            ? `成功删除 ${result.success} 个 SPU,失败 ${result.failed} 个`
            : `成功删除 ${result.success} 个 SPU`,
        code: 200,
        timestamp: Date.now(),
      });
    }

    // 其他操作(updateStatus, copy 等)暂不处理
    return HttpResponse.json({
      success: true,
      data: {
        processedCount: ids.length,
        failedCount: 0,
      },
      message: `批量${operation}操作成功`,
      code: 200,
      timestamp: Date.now(),
    });
  }),
];

// 分类相关API处理器（旧版，保留兼容性）
export const legacyCategoryHandlers = [
  http.get('/api/category/list', async () => {
    await delay(300);
    const { generateMockCategories } = await getGenerators();
    const categories = generateMockCategories();

    return HttpResponse.json({
      success: true,
      data: categories,
    });
  }),
];

// 导出所有处理器
export const handlers = [
  // SPU相关使用真实后端 API，已禁用 mock
  // @spec B001-fix-brand-creation
  // ...spuHandlers,
  ...categoryHandlers, // 新的类目API处理器（基于OpenAPI规范）
  ...legacyCategoryHandlers, // 旧版兼容处理器
  ...brandHandlers, // 使用新的brandHandlers
  ...attributeHandlers_, // 属性字典管理处理器
  ...scheduleHandlers, // 排期管理处理器
  ...reservationSettingsHandlers, // 门店预约设置处理器
  ...scenarioPackageEditorHandlers, // 场景包编辑器处理器
  ...skuHandlers, // SKU主数据管理处理器 (P001-sku-master-data)
  ...conversionHandlers, // 单位换算管理处理器 (P002-unit-conversion)
  ...orderHandlers, // 订单管理处理器 (O001-product-order-list)
  ...channelProductHandlers, // 渠道商品配置处理器 (O005-channel-product-config)
  // 库存相关使用真实后端 API，已禁用 mock
  // ...inventoryHandlers, // 库存查询处理器 (P003-inventory-query)
  // ...adjustmentHandlers, // 库存调整处理器 (P004-inventory-adjustment)
  // 场景包使用真实后端 API，已禁用 mock
  // ...scenarioPackageHandlers,
];

// 默认导出所有处理器
export default handlers;
