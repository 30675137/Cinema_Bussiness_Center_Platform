/**
 * @spec P006-fix-sku-edit-data
 * SKU 编辑页面测试数据
 *
 * 用于 E2E-PRODUCT-001 测试场景:
 * - B端运营人员登录管理后台
 * - 搜索并编辑SKU
 * - 验证SKU编辑页面显示关联的SPU完整信息
 */

export const adminCredentials = {
  username: 'admin',
  password: 'password',
  role: 'admin'
};

export const skuListPageUrl = 'http://localhost:3000/product/sku-management';

export const targetSkuCode = 'FIN-COCKTAIL';

export const editButtonSelector = 'button:has-text("编辑")';

/**
 * Scenario 001: 威士忌可乐鸡尾酒 SKU 编辑
 */
export const scenario_001 = {
  // B端基础URL
  adminBaseUrl: 'http://localhost:3000',

  // 管理员登录凭证
  adminCredentials: {
    username: 'admin',
    password: 'password',
    role: 'admin'
  },

  // SKU列表页面URL
  skuListPageUrl: '/products/sku',

  // 目标SKU信息（使用实际数据库中的SKU）
  targetSku: {
    id: '550e8400-e29b-41d4-a716-446655440021',
    code: '6901234567021', // 实际数据库中的SKU编码
    name: '威士忌可乐', // 实际数据库中的SKU名称
    price: 3500, // 单位：分
    status: 'ENABLED',
    spuId: '00000000-0000-0000-0000-000000000003' // 实际数据库中的SPU ID
  },

  // 关联的SPU信息（预期显示在编辑页面）
  expectedSpu: {
    id: '550e8400-e29b-41d4-a716-446655440030',
    name: '威士忌可乐鸡尾酒',
    categoryId: '550e8400-e29b-41d4-a716-446655440100',
    categoryName: '饮品 > 鸡尾酒',
    brandId: '550e8400-e29b-41d4-a716-446655440200',
    brandName: '自制',
    description: '经典威士忌可乐鸡尾酒，清爽解腻',
    status: 'active'
  },

  // 关联的BOM配方（可选，用于扩展测试）
  expectedBom: {
    id: '550e8400-e29b-41d4-a716-446655440021', // BOM ID与SKU ID相同
    skuId: '550e8400-e29b-41d4-a716-446655440021',
    name: '威士忌可乐鸡尾酒 - BOM配方',
    wasteRate: 5.0, // 5% 损耗率
    status: 'ENABLED',
    components: [
      {
        id: '550e8400-e29b-41d4-a716-446655440051',
        ingredientSkuId: '550e8400-e29b-41d4-a716-446655440001',
        ingredientSkuCode: 'RAW-WHISKEY',
        ingredientSkuName: '威士忌',
        quantity: 45,
        unit: 'ml',
        standardCost: 800, // 单位：分
        status: 'REQUIRED',
        sortOrder: 1
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440052',
        ingredientSkuId: '550e8400-e29b-41d4-a716-446655440002',
        ingredientSkuCode: 'RAW-COLA',
        ingredientSkuName: '可乐糖浆',
        quantity: 150,
        unit: 'ml',
        standardCost: 200, // 单位：分
        status: 'REQUIRED',
        sortOrder: 2
      }
    ]
  },

  // 搜索相关选择器
  searchInput: 'input[placeholder*="SKU"], input[placeholder*="编码"]',
  searchButton: 'button:has-text("搜索"), button:has-text("查询")',

  // 编辑按钮选择器
  editButtonSelector: 'button:has-text("编辑")',

  // 页面加载超时设置
  loadTimeout: 2000, // 2秒

  // API端点（用于API测试验证）
  apiEndpoint: '/api/skus/{id}/details'
};

/**
 * Scenario: SKU未关联SPU的场景（边界测试）
 */
export const scenario_no_spu = {
  adminBaseUrl: 'http://localhost:3000',
  adminCredentials: {
    username: 'admin',
    password: 'password'
  },

  targetSku: {
    id: '550e8400-e29b-41d4-a716-446655440099',
    code: 'RAW-SUGAR',
    name: '白砂糖',
    price: 500,
    status: 'ENABLED',
    spuId: null // 未关联SPU
  },

  expectedMessage: '未关联SPU',
  expectedSpuStatus: 'not_linked'
};

/**
 * Scenario: SPU已失效的场景（脏数据测试）
 */
export const scenario_invalid_spu = {
  adminBaseUrl: 'http://localhost:3000',
  adminCredentials: {
    username: 'admin',
    password: 'password'
  },

  targetSku: {
    id: '550e8400-e29b-41d4-a716-446655440098',
    code: 'FIN-LEGACY',
    name: '已下架产品',
    price: 1000,
    status: 'DISABLED',
    spuId: '550e8400-e29b-41d4-a716-446655440999' // SPU已被删除
  },

  expectedMessage: 'SPU已失效',
  expectedSpuStatus: 'invalid'
};

// 默认导出所有场景
export const skuTestData = {
  adminCredentials,
  skuListPageUrl,
  targetSkuCode,
  editButtonSelector,
  scenario_001,
  scenario_no_spu,
  scenario_invalid_spu
};
