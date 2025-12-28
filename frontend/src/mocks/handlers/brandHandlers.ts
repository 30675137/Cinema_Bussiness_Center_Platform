import { http, HttpResponse } from 'msw';

// Mock品牌数据
const mockBrands = [
  {
    id: '1',
    brandCode: 'BRAND001',
    name: '可口可乐',
    englishName: 'Coca-Cola',
    brandType: 'agency',
    primaryCategories: ['饮料', '碳酸饮料'],
    company: '可口可乐公司',
    brandLevel: 'A',
    tags: ['国际品牌', '高端'],
    description: '全球知名饮料品牌',
    logoUrl: null,
    status: 'enabled',
    createdAt: '2025-12-14T10:00:00Z',
    updatedAt: '2025-12-14T10:00:00Z',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '2',
    brandCode: 'BRAND002',
    name: '百事可乐',
    englishName: 'Pepsi-Cola',
    brandType: 'agency',
    primaryCategories: ['饮料', '碳酸饮料'],
    company: '百事公司',
    brandLevel: 'A',
    tags: ['国际品牌'],
    description: '全球知名饮料品牌',
    logoUrl: null,
    status: 'enabled',
    createdAt: '2025-12-14T10:30:00Z',
    updatedAt: '2025-12-14T10:30:00Z',
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '3',
    brandCode: 'BRAND003',
    name: '农夫山泉',
    englishName: 'Nongfu Spring',
    brandType: 'own',
    primaryCategories: ['饮料', '矿泉水'],
    company: '农夫山泉股份有限公司',
    brandLevel: 'A',
    tags: ['国产品牌', '健康'],
    description: '国内知名饮品品牌',
    logoUrl: null,
    status: 'enabled',
    createdAt: '2025-12-14T11:00:00Z',
    updatedAt: '2025-12-14T11:00:00Z',
    createdBy: 'admin',
    updatedBy: 'admin'
  }
];

// 品牌列表API
export const getBrandsHandler = http.get('/api/v1/brands', async ({ request }) => {
  // 简化版本，直接返回mock数据，避免复杂的参数处理
  let filteredBrands = [...mockBrands];

  // 暂时跳过参数处理，只返回基本数据
  const page = 1;
  const pageSize = 20;
  const total = filteredBrands.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

  return HttpResponse.json({
    success: true,
    data: paginatedBrands,
    pagination: {
      current: page,
      pageSize: pageSize,
      total: total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: endIndex < total,
      hasPrev: page > 1
    },
    message: 'Success',
    timestamp: new Date().toISOString()
  });
});

// 品牌详情API
export const getBrandHandler = http.get('/api/v1/brands/:id', async ({ params }) => {
  const { id } = params;
  const brand = mockBrands.find(b => b.id === id);

  if (!brand) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在'
        },
        timestamp: new Date().toISOString()
      },
      { status: 404 }
    );
  }

  // 模拟使用统计
  const usageStats = {
    spuCount: Math.floor(Math.random() * 50) + 1,
    skuCount: Math.floor(Math.random() * 200) + 1,
    lastUsedAt: '2025-12-13T15:30:00Z'
  };

  return HttpResponse.json({
    success: true,
    data: {
      ...brand,
      usageStats
    },
    message: 'Success',
    timestamp: new Date().toISOString()
  });
});

// 创建品牌API
export const createBrandHandler = http.post('/api/v1/brands', async ({ request }) => {
  const brandData = await request.json() as any;

  // 检查品牌名称重复
  const existingBrand = mockBrands.find(b =>
    b.name === brandData.name && b.brandType === brandData.brandType
  );

  if (existingBrand) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'DUPLICATE_BRAND',
          message: '品牌名称重复',
          details: [
            {
              field: 'name',
              message: '系统中已存在同名品牌，请检查是否重复创建'
            }
          ]
        },
        timestamp: new Date().toISOString()
      },
      { status: 409 }
    );
  }

  const newBrand = {
    id: (mockBrands.length + 1).toString(),
    brandCode: `BRAND${String(mockBrands.length + 1).padStart(3, '0')}`,
    ...brandData,
    logoUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin'
  };

  mockBrands.push(newBrand);

  return HttpResponse.json(
    {
      success: true,
      data: newBrand,
      message: 'Brand created successfully',
      timestamp: new Date().toISOString()
    },
    { status: 201 }
  );
});

// 更新品牌API
export const updateBrandHandler = http.put('/api/v1/brands/:id', async ({ params, request }) => {
  const { id } = params;
  const updateData = await request.json() as any;

  const brandIndex = mockBrands.findIndex(b => b.id === id);

  if (brandIndex === -1) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在'
        },
        timestamp: new Date().toISOString()
      },
      { status: 404 }
    );
  }

  // 检查品牌名称重复（排除自己）
  const existingBrand = mockBrands.find(b =>
    b.id !== id && b.name === updateData.name && b.brandType === updateData.brandType
  );

  if (existingBrand) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'DUPLICATE_BRAND',
          message: '品牌名称重复',
          details: [
            {
              field: 'name',
              message: '系统中已存在同名品牌，请检查是否重复创建'
            }
          ]
        },
        timestamp: new Date().toISOString()
      },
      { status: 409 }
    );
  }

  const updatedBrand = {
    ...mockBrands[brandIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };

  mockBrands[brandIndex] = updatedBrand;

  return HttpResponse.json({
    success: true,
    data: updatedBrand,
    message: 'Brand updated successfully',
    timestamp: new Date().toISOString()
  });
});

// 更改品牌状态API
export const updateBrandStatusHandler = http.patch('/api/v1/brands/:id/status', async ({ params, request }) => {
  const { id } = params;
  const { status, reason } = await request.json() as any;

  const brandIndex = mockBrands.findIndex(b => b.id === id);

  if (brandIndex === -1) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在'
        },
        timestamp: new Date().toISOString()
      },
      { status: 404 }
    );
  }

  const currentBrand = mockBrands[brandIndex];
  const oldStatus = currentBrand.status;

  // 验证状态转换
  if (!['enabled', 'disabled', 'draft'].includes(status)) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '无效的状态值'
        },
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // 如果已经是目标状态，返回成功但不做变更
  if (oldStatus === status) {
    return HttpResponse.json({
      success: true,
      data: {
        id,
        status,
        oldStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      },
      message: '品牌状态已是目标状态，无需变更',
      timestamp: new Date().toISOString()
    });
  }

  // 停用操作需要提供原因
  if (status === 'disabled' && (!reason || reason.trim().length < 2)) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'REASON_REQUIRED',
          message: '停用操作必须提供原因，原因至少需要2个字符'
        },
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // 模拟业务规则检查：如果品牌下有活跃商品，不允许停用
  if (status === 'disabled') {
    // 模拟检查品牌是否有活跃商品
    const hasActiveProducts = Math.random() > 0.7; // 30%概率有活跃商品

    if (hasActiveProducts) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'BRAND_HAS_ACTIVE_PRODUCTS',
            message: '该品牌下还有活跃的商品，无法停用。请先处理相关商品后再进行停用操作。'
          },
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }
  }

  // 更新品牌状态
  mockBrands[brandIndex] = {
    ...mockBrands[brandIndex],
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };

  const statusText = status === 'enabled' ? '启用' : status === 'disabled' ? '停用' : '设为草稿';
  const successMessage = `品牌${statusText}成功`;

  return HttpResponse.json({
    success: true,
    data: {
      id,
      status,
      oldStatus,
      reason: status === 'disabled' ? reason : undefined,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin'
    },
    message: successMessage,
    timestamp: new Date().toISOString()
  });
});

// 上传品牌LOGO API
export const uploadBrandLogoHandler = http.post('/api/v1/brands/:id/logo', async ({ params, request }) => {
  const { id } = params;

  // 模拟文件上传验证
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('multipart/form-data')) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: '请上传图片文件'
        },
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  const brandIndex = mockBrands.findIndex(b => b.id === id);

  if (brandIndex === -1) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在'
        },
        timestamp: new Date().toISOString()
      },
      { status: 404 }
    );
  }

  // 模拟上传成功
  const logoUrl = `https://example.com/logo/brand-${id}-${Date.now()}.png`;

  mockBrands[brandIndex] = {
    ...mockBrands[brandIndex],
    logoUrl,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin'
  };

  return HttpResponse.json({
    success: true,
    data: {
      logoUrl,
      updatedAt: new Date().toISOString()
    },
    message: 'Logo uploaded successfully',
    timestamp: new Date().toISOString()
  });
});

// 获取品牌使用统计API
export const getBrandUsageStatsHandler = http.get('/api/v1/brands/:id/usage-stats', async ({ params }) => {
  const { id } = params;
  const brand = mockBrands.find(b => b.id === id);

  if (!brand) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'BRAND_NOT_FOUND',
          message: '品牌不存在'
        },
        timestamp: new Date().toISOString()
      },
      { status: 404 }
    );
  }

  // 模拟统计数据
  const usageStats = {
    brandId: id,
    spuCount: Math.floor(Math.random() * 50) + 1,
    skuCount: Math.floor(Math.random() * 200) + 1,
    lastUsedAt: '2025-12-13T15:30:00Z',
    calculatedAt: new Date().toISOString()
  };

  return HttpResponse.json({
    success: true,
    data: usageStats,
    message: 'Usage statistics retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// 导出所有品牌相关handlers
export const brandHandlers = [
  getBrandsHandler,
  getBrandHandler,
  createBrandHandler,
  updateBrandHandler,
  updateBrandStatusHandler,
  uploadBrandLogoHandler,
  getBrandUsageStatsHandler
];