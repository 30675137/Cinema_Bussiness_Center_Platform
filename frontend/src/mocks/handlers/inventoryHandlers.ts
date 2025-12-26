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
      { id: '11111111-1111-1111-1111-111111111112', code: 'CAT001-01', name: '威士忌', parentId: '11111111-1111-1111-1111-111111111111', level: 2, sortOrder: 1, status: 'ACTIVE' },
      { id: '11111111-1111-1111-1111-111111111113', code: 'CAT001-02', name: '啤酒', parentId: '11111111-1111-1111-1111-111111111111', level: 2, sortOrder: 2, status: 'ACTIVE' },
      { id: '11111111-1111-1111-1111-111111111114', code: 'CAT001-03', name: '软饮料', parentId: '11111111-1111-1111-1111-111111111111', level: 2, sortOrder: 3, status: 'ACTIVE' },
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
      { id: '22222222-2222-2222-2222-222222222223', code: 'CAT002-01', name: '薯片', parentId: '22222222-2222-2222-2222-222222222222', level: 2, sortOrder: 1, status: 'ACTIVE' },
      { id: '22222222-2222-2222-2222-222222222224', code: 'CAT002-02', name: '坚果', parentId: '22222222-2222-2222-2222-222222222222', level: 2, sortOrder: 2, status: 'ACTIVE' },
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
];

// 根据可用数量和安全库存计算状态
function calculateStatus(availableQty: number, safetyStock: number): InventoryStatus {
  if (availableQty === 0) return 'OUT_OF_STOCK';
  if (availableQty < safetyStock * 0.5) return 'LOW';
  if (availableQty < safetyStock) return 'BELOW_THRESHOLD';
  if (availableQty < safetyStock * 2) return 'NORMAL';
  return 'SUFFICIENT';
}

// 生成 Mock 库存数据
function generateMockInventory(count: number): StoreInventoryItem[] {
  const skuNames = [
    '威士忌-单杯', '青岛啤酒', '可口可乐', '矿泉水', '红牛',
    '薯片-原味', '坚果拼盘', '爆米花-大', '爆米花-小', '热狗',
    '鸡米花', '薯条', '汉堡套餐', '三明治', '沙拉',
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

const mockInventoryData = generateMockInventory(156);

// ========== Handlers ==========

export const inventoryHandlers = [
  // GET /api/inventory - 查询库存列表
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
      filtered = filtered.filter(item => item.storeId === storeId);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(item =>
        item.skuName.toLowerCase().includes(kw) ||
        item.skuCode.toLowerCase().includes(kw)
      );
    }
    if (categoryId) {
      filtered = filtered.filter(item => item.categoryId === categoryId);
    }
    if (statuses) {
      const statusList = statuses.split(',') as InventoryStatus[];
      filtered = filtered.filter(item => statusList.includes(item.inventoryStatus));
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
    const item = mockInventoryData.find(inv => inv.id === id);

    if (!item) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '库存记录不存在' },
        { status: 404 }
      );
    }

    const detail: StoreInventoryDetail = {
      ...item,
      storeCode: mockStores.find(s => s.id === item.storeId)?.code,
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
];

export default inventoryHandlers;
