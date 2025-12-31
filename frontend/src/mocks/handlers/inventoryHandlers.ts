/**
 * P003-inventory-query: 库存查询 MSW 处理器
 *
 * 提供库存列表、详情、分类、门店的 Mock 数据。
 */

import { http, HttpResponse, delay } from 'msw';
import type {
  InventoryListResponse,
  InventoryDetailResponse,
  CategoryListResponse,
  StoreListResponse,
  StoreInventoryItem,
  StoreInventoryDetail,
  Category,
  StoreOption,
  InventoryStatus,
} from '@/features/inventory/types';

// ========== Mock 数据 ==========

const mockCategories: Category[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'CAT001',
    name: '酒水饮料',
    level: 1,
    sortOrder: 1,
    status: 'ACTIVE',
    children: [
      {
        id: '11111111-1111-1111-1111-111111111112',
        code: 'CAT001-01',
        name: '威士忌',
        parentId: '11111111-1111-1111-1111-111111111111',
        level: 2,
        sortOrder: 1,
        status: 'ACTIVE',
      },
      {
        id: '11111111-1111-1111-1111-111111111113',
        code: 'CAT001-02',
        name: '啤酒',
        parentId: '11111111-1111-1111-1111-111111111111',
        level: 2,
        sortOrder: 2,
        status: 'ACTIVE',
      },
      {
        id: '11111111-1111-1111-1111-111111111114',
        code: 'CAT001-03',
        name: '软饮料',
        parentId: '11111111-1111-1111-1111-111111111111',
        level: 2,
        sortOrder: 3,
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    code: 'CAT002',
    name: '零食小吃',
    level: 1,
    sortOrder: 2,
    status: 'ACTIVE',
    children: [
      {
        id: '22222222-2222-2222-2222-222222222223',
        code: 'CAT002-01',
        name: '薯片',
        parentId: '22222222-2222-2222-2222-222222222222',
        level: 2,
        sortOrder: 1,
        status: 'ACTIVE',
      },
      {
        id: '22222222-2222-2222-2222-222222222224',
        code: 'CAT002-02',
        name: '坚果',
        parentId: '22222222-2222-2222-2222-222222222222',
        level: 2,
        sortOrder: 2,
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    code: 'CAT003',
    name: '餐饮正餐',
    level: 1,
    sortOrder: 3,
    status: 'ACTIVE',
  },
];

const mockStores: StoreOption[] = [
  { id: 'store-001', code: 'YL001', name: '耀莱成龙影城（慈云寺店）', region: '北京' },
  { id: 'store-002', code: 'YL002', name: '耀莱成龙影城（五棵松店）', region: '北京' },
  { id: 'store-003', code: 'YL003', name: '耀莱成龙影城（西直门店）', region: '北京' },
  { id: 'store-004', code: 'YL004', name: '耀莱成龙影城（房山天街店）', region: '北京' },
  { id: 'store-005', code: 'YL005', name: '耀莱成龙影城（广州增城店）', region: '广州' },
];

// 根据可用数量和安全库存计算状态
function calculateStatus(availableQty: number, safetyStock: number): InventoryStatus {
  if (availableQty === 0) return 'OUT_OF_STOCK';
  if (availableQty < safetyStock * 0.5) return 'LOW';
  if (availableQty < safetyStock) return 'BELOW_THRESHOLD';
  if (availableQty < safetyStock * 2) return 'NORMAL';
  return 'SUFFICIENT';
}

// 生成 Mock 库存数据（旧格式，用于 /api/inventory 兼容）
function generateMockInventory(count: number): StoreInventoryItem[] {
  const skuNames = [
    '威士忌-单杯',
    '青岛啤酒',
    '可口可乐',
    '矿泉水',
    '红牛',
    '薯片-原味',
    '坚果拼盘',
    '爆米花-大',
    '爆米花-小',
    '热狗',
    '鸡米花',
    '薯条',
    '汉堡套餐',
    '三明治',
    '沙拉',
  ];

  const units = ['杯', '瓶', '罐', '份', '包', '桶'];

  return Array.from({ length: count }, (_, i) => {
    const onHandQty = Math.floor(Math.random() * 200);
    const reservedQty = Math.floor(Math.random() * Math.min(50, onHandQty));
    const availableQty = onHandQty - reservedQty;
    const safetyStock = Math.floor(Math.random() * 30) + 10;
    const storeIndex = i % mockStores.length;
    const categoryIndex = i % mockCategories.length;

    return {
      id: `inv-${String(i + 1).padStart(6, '0')}`,
      storeId: mockStores[storeIndex].id,
      storeName: mockStores[storeIndex].name,
      skuId: `sku-${String(i + 1).padStart(6, '0')}`,
      skuCode: `SKU${String(i + 1).padStart(6, '0')}`,
      skuName: skuNames[i % skuNames.length] + (i > 14 ? `-${Math.floor(i / 15) + 1}` : ''),
      onHandQty,
      availableQty,
      reservedQty,
      safetyStock,
      mainUnit: units[i % units.length],
      categoryId: mockCategories[categoryIndex].id,
      categoryName: mockCategories[categoryIndex].name,
      inventoryStatus: calculateStatus(availableQty, safetyStock),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

// 生成符合 CurrentInventory 类型的测试数据（用于 /inventory/current）
function generateCurrentInventory(count: number) {
  const skuList = [
    { code: '6901234567001', name: '可口可乐 330ml', unit: '瓶', price: 5 },
    { code: '6901234567002', name: '雪碧 330ml', unit: '瓶', price: 5 },
    { code: '6901234567003', name: '芬达 330ml', unit: '瓶', price: 5 },
    { code: '6901234567021', name: '青岛啤酒 500ml', unit: '瓶', price: 8 },
    { code: '6901234567022', name: '百威啤酒 330ml', unit: '罐', price: 10 },
    { code: '6901234567023', name: '红牛 250ml', unit: '罐', price: 8 },
    { code: '6901234567024', name: '听装可乐 330ml', unit: '罐', price: 4 },
    { code: '6901234567025', name: '矿泉水 550ml', unit: '瓶', price: 3 },
    { code: '6901234567026', name: '薯片-原味 100g', unit: '袋', price: 12 },
    { code: '6901234567027', name: '爆米花-焦糖 150g', unit: '桶', price: 25 },
    { code: '6901234567028', name: '爆米花-奶油 100g', unit: '桶', price: 18 },
    { code: '6901234567011', name: '杯子 300ml', unit: '个', price: 0.5 },
    { code: '6901234567012', name: '吸管', unit: '根', price: 0.1 },
    { code: '6901234567029', name: '威士忌-芝华士', unit: '杯', price: 68 },
    { code: '6901234567030', name: '长岛冰茶', unit: '杯', price: 58 },
  ];

  const result: any[] = [];

  for (let i = 0; i < count; i++) {
    const storeIndex = i % mockStores.length;
    const skuIndex = i % skuList.length;
    const sku = skuList[skuIndex];
    const store = mockStores[storeIndex];

    // 随机生成库存数量，确保有不同状态
    let onHandQty, safetyStock;
    if (i % 10 === 0) {
      // 10% 缺货
      onHandQty = 0;
      safetyStock = 50;
    } else if (i % 7 === 0) {
      // 约14% 低库存
      onHandQty = Math.floor(Math.random() * 20) + 5;
      safetyStock = 50;
    } else if (i % 5 === 0) {
      // 20% 库存偏低
      onHandQty = Math.floor(Math.random() * 30) + 30;
      safetyStock = 50;
    } else {
      // 正常/充足库存
      onHandQty = Math.floor(Math.random() * 150) + 80;
      safetyStock = Math.floor(Math.random() * 30) + 20;
    }

    const reservedQty = Math.floor(Math.random() * Math.min(20, onHandQty));
    const availableQty = onHandQty - reservedQty;
    const inTransitQty = Math.floor(Math.random() * 30);

    result.push({
      id: `inv-${String(i + 1).padStart(6, '0')}`,
      skuId: `sku-${String(i + 1).padStart(6, '0')}`,
      sku: {
        id: `sku-${String(i + 1).padStart(6, '0')}`,
        skuCode: sku.code,
        name: sku.name,
        unit: sku.unit,
        price: sku.price,
        mainUnit: sku.unit,
        categoryId: mockCategories[skuIndex % mockCategories.length].id,
        categoryName: mockCategories[skuIndex % mockCategories.length].name,
      },
      storeId: store.id,
      store: {
        id: store.id,
        code: store.code,
        name: store.name,
      },
      availableQty,
      onHandQty,
      reservedQty,
      inTransitQty,
      damagedQty: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
      expiredQty: Math.random() > 0.95 ? Math.floor(Math.random() * 3) : 0,
      lastTransactionTime: new Date(
        Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
      totalValue: onHandQty * sku.price,
      averageCost: sku.price * 0.7,
      reorderPoint: Math.floor(safetyStock * 1.2),
      maxStock: safetyStock * 5,
      minStock: Math.floor(safetyStock * 0.5),
      safetyStock,
      lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return result;
}

const mockInventoryData = generateMockInventory(156);
const mockCurrentInventoryData = generateCurrentInventory(75);

// ========== Handlers ==========

export const inventoryHandlers = [
  // GET /inventory/current 或 /api/inventory/current - 查询当前库存（用于 InventoryLedger 页面）
  http.get('*/inventory/current', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    const keyword = url.searchParams.get('keyword');
    const categoryId = url.searchParams.get('categoryId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let filtered = [...mockCurrentInventoryData];

    // 筛选
    if (storeId) {
      filtered = filtered.filter((item) => item.storeId === storeId);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.sku.name.toLowerCase().includes(kw) || item.sku.skuCode.toLowerCase().includes(kw)
      );
    }
    if (categoryId) {
      filtered = filtered.filter((item) => item.sku.categoryId === categoryId);
    }

    // 分页
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      success: true,
      data,
      pagination: {
        current: page,
        pageSize,
        total,
      },
    });
  }),

  // GET /api/inventory - 查询库存列表（旧格式，保持兼容）
  http.get('/api/inventory', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const storeId = url.searchParams.get('storeId');
    const keyword = url.searchParams.get('keyword');
    const categoryId = url.searchParams.get('categoryId');
    const statuses = url.searchParams.get('statuses');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let filtered = [...mockInventoryData];

    // 筛选
    if (storeId) {
      filtered = filtered.filter((item) => item.storeId === storeId);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(
        (item) => item.skuName.toLowerCase().includes(kw) || item.skuCode.toLowerCase().includes(kw)
      );
    }
    if (categoryId) {
      filtered = filtered.filter((item) => item.categoryId === categoryId);
    }
    if (statuses) {
      const statusList = statuses.split(',') as InventoryStatus[];
      filtered = filtered.filter((item) => statusList.includes(item.inventoryStatus));
    }

    // 分页
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    const response: InventoryListResponse = {
      success: true,
      data,
      total,
      page,
      pageSize,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/inventory/:id - 获取库存详情
  http.get('/api/inventory/:id', async ({ params }) => {
    await delay(200);

    const { id } = params;
    const item = mockInventoryData.find((inv) => inv.id === id);

    if (!item) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '库存记录不存在' },
        { status: 404 }
      );
    }

    const detail: StoreInventoryDetail = {
      ...item,
      storeCode: mockStores.find((s) => s.id === item.storeId)?.code,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const response: InventoryDetailResponse = {
      success: true,
      data: detail,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/categories - 获取分类列表
  http.get('/api/categories', async () => {
    await delay(200);

    const response: CategoryListResponse = {
      success: true,
      data: mockCategories,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/stores/accessible - 获取可访问门店列表
  http.get('/api/stores/accessible', async () => {
    await delay(200);

    const response: StoreListResponse = {
      success: true,
      data: mockStores,
    };

    return HttpResponse.json(response);
  }),

  // POST /api/inventory/transactions - 创建库存流水（库存调整）
  http.post('*/inventory/transactions', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as {
      skuId: string;
      storeId: string;
      transactionType: string;
      quantity: number;
      sourceType?: string;
      sourceDocument?: string;
      remarks?: string;
      operatorId?: string;
    };

    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    const isIn = body.transactionType?.includes('_in');

    // 查找对应的库存记录（根据 skuId 和 storeId 精确匹配）
    const inventoryIndex = mockCurrentInventoryData.findIndex(
      (item) => item.skuId === body.skuId && item.storeId === body.storeId
    );

    let stockBefore = 0;
    let stockAfter = 0;
    let matchingInventory: (typeof mockCurrentInventoryData)[0] | undefined;

    if (inventoryIndex !== -1) {
      matchingInventory = mockCurrentInventoryData[inventoryIndex];
      stockBefore = matchingInventory.onHandQty;

      // 根据调整类型更新库存
      if (isIn) {
        // 盘盈：增加库存
        stockAfter = stockBefore + body.quantity;
      } else {
        // 盘亏/报损：减少库存
        stockAfter = Math.max(0, stockBefore - body.quantity);
      }

      // 【关键】实际更新 mock 数据中的库存数量
      mockCurrentInventoryData[inventoryIndex] = {
        ...matchingInventory,
        onHandQty: stockAfter,
        availableQty: stockAfter - matchingInventory.reservedQty,
        lastUpdated: new Date().toISOString(),
        lastTransactionTime: new Date().toISOString(),
      };

      console.log('[MSW] 库存更新:', {
        skuCode: matchingInventory.sku.skuCode,
        before: stockBefore,
        after: stockAfter,
        adjustmentType: body.transactionType,
        quantity: body.quantity,
      });
    } else {
      // 如果找不到精确匹配，尝试只匹配 skuId
      const skuOnlyMatch = mockCurrentInventoryData.find((item) => item.skuId === body.skuId);
      if (skuOnlyMatch) {
        matchingInventory = skuOnlyMatch;
        stockBefore = skuOnlyMatch.onHandQty;
        stockAfter = isIn ? stockBefore + body.quantity : Math.max(0, stockBefore - body.quantity);
      }
    }

    const response = {
      id: transactionId,
      skuId: body.skuId,
      storeId: body.storeId,
      transactionType: body.transactionType,
      quantity: body.quantity,
      stockBefore,
      stockAfter,
      availableBefore: stockBefore - (matchingInventory?.reservedQty || 0),
      availableAfter: stockAfter - (matchingInventory?.reservedQty || 0),
      sourceType: body.sourceType || 'adjustment_order',
      sourceDocument: body.sourceDocument || '',
      operatorId: body.operatorId || 'user-001',
      remarks: body.remarks || '',
      transactionTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      store: matchingInventory?.store || { id: body.storeId, code: '', name: '' },
      sku: matchingInventory?.sku || { id: body.skuId, skuCode: '', name: '', unit: '' },
      operator: { id: 'user-001', name: '库存管理员' },
    };

    console.log('[MSW] 创建库存流水成功:', response);

    return HttpResponse.json(response, { status: 201 });
  }),

  // GET /api/inventory/transactions - 查询库存流水
  http.get('*/inventory/transactions', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    // Mock 流水数据
    const transactionTypes = [
      'purchase_in',
      'sale_out',
      'adjustment_in',
      'adjustment_out',
      'damage_out',
    ];

    const mockTransactions = Array.from({ length: 50 }, (_, i) => {
      const type = transactionTypes[i % transactionTypes.length];
      const isIn = type.includes('_in');
      const quantity = Math.floor(Math.random() * 20) + 1;

      return {
        id: `txn-${i + 1}`,
        skuId: `sku-${(i % 5) + 1}`,
        storeId: `store-${(i % 3) + 1}`,
        transactionType: type,
        quantity: isIn ? quantity : -quantity,
        stockBefore: 100 - i,
        stockAfter: 100 - i + (isIn ? quantity : -quantity),
        operatorId: 'user-001',
        transactionTime: new Date(Date.now() - i * 3600000).toISOString(),
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        store: mockStores[i % mockStores.length],
        sku: {
          id: `sku-${(i % 5) + 1}`,
          skuCode: `SKU00${(i % 5) + 1}`,
          name: '测试商品',
          unit: '个',
        },
        operator: { id: 'user-001', name: '操作员' },
      };
    });

    const total = mockTransactions.length;
    const startIndex = (page - 1) * pageSize;
    const data = mockTransactions.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      success: true,
      data,
      total,
      page,
      pageSize,
    });
  }),
];

export default inventoryHandlers;
