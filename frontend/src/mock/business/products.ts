/**
 * 商品管理Mock数据
 */

import type { ProductItem } from '@/types/mock';

/** 商品Mock数据 */
export const productData: ProductItem[] = [
  {
    id: '1',
    name: '电影票-成人票',
    sku: 'TICKET-ADULT-001',
    category: '电影票',
    status: 'active',
    createdAt: '2025-12-10T10:00:00Z',
    updatedAt: '2025-12-10T10:00:00Z',
  },
  {
    id: '2',
    name: '电影票-学生票',
    sku: 'TICKET-STUDENT-001',
    category: '电影票',
    status: 'active',
    createdAt: '2025-12-10T10:30:00Z',
    updatedAt: '2025-12-10T10:30:00Z',
  },
  {
    id: '3',
    name: '电影票-儿童票',
    sku: 'TICKET-CHILD-001',
    category: '电影票',
    status: 'pending',
    createdAt: '2025-12-10T11:00:00Z',
    updatedAt: '2025-12-10T11:00:00Z',
  },
  {
    id: '4',
    name: '电影票-老人票',
    sku: 'TICKET-SENIOR-001',
    category: '电影票',
    status: 'active',
    createdAt: '2025-12-10T11:30:00Z',
    updatedAt: '2025-12-10T11:30:00Z',
  },
  {
    id: '5',
    name: '电影票-团体票',
    sku: 'TICKET-GROUP-001',
    category: '电影票',
    status: 'inactive',
    createdAt: '2025-12-10T12:00:00Z',
    updatedAt: '2025-12-10T12:00:00Z',
  },
  {
    id: '6',
    name: '爆米花-小份',
    sku: 'SNACK-POP-SMALL-001',
    category: '爆米花',
    status: 'active',
    createdAt: '2025-12-10T12:30:00Z',
    updatedAt: '2025-12-10T12:30:00Z',
  },
  {
    id: '7',
    name: '爆米花-大份',
    sku: 'SNACK-POP-LARGE-001',
    category: '爆米花',
    status: 'active',
    createdAt: '2025-12-10T13:00:00Z',
    updatedAt: '2025-12-10T13:00:00Z',
  },
  {
    id: '8',
    name: '可乐-中杯',
    sku: 'DRINK-COKE-MEDIUM-001',
    category: '饮料',
    status: 'active',
    createdAt: '2025-12-10T13:30:00Z',
    updatedAt: '2025-12-10T13:30:00Z',
  },
  {
    id: '9',
    name: '可乐-大杯',
    sku: 'DRINK-COKE-LARGE-001',
    category: '饮料',
    status: 'active',
    createdAt: '2025-12-10T14:00:00Z',
    updatedAt: '2025-12-10T14:00:00Z',
  },
  {
    id: '10',
    name: '果汁-橙汁',
    sku: 'DRINK-JUICE-ORANGE-001',
    category: '饮料',
    status: 'pending',
    createdAt: '2025-12-10T14:30:00Z',
    updatedAt: '2025-12-10T14:30:00Z',
  },
];

/**
 * 模拟获取商品列表API
 */
export const fetchProductList = async (params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: string;
}) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredData = productData;

  // 按分类筛选
  if (params?.category) {
    filteredData = filteredData.filter(item => item.category === params.category);
  }

  // 按状态筛选
  if (params?.status) {
    filteredData = filteredData.filter(item => item.status === params.status);
  }

  // 分页处理
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    code: 200,
    message: 'success',
    data: {
      list: paginatedData,
      total: filteredData.length,
      page,
      pageSize,
    },
  };
};