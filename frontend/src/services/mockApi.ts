/**
 * Mock API服务层
 */

import { productData, fetchProductList } from '@/mock/business/products';
import { pricingData, fetchPricingList } from '@/mock/business/pricing';
import { reviewData, fetchReviewList } from '@/mock/business/reviews';
import { inventoryData, fetchInventoryList } from '@/mock/business/inventory';
import type { ApiResponse, PaginatedResponse } from '@/types/mock';

/**
 * 模拟API延迟
 */
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API响应包装器
 */
const createApiResponse = <T>(data: T): ApiResponse<T> => ({
  code: 200,
  message: 'success',
  data,
});

/**
 * 错误响应包装器
 */
const createErrorResponse = (message: string, code: number = 500): ApiResponse => ({
  code,
  message,
  data: null,
});

/**
 * Mock API接口
 */
export const mockApi = {
  // 菜单相关API
  getMenus: async () => {
    await delay();
    return createApiResponse({
      list: [
        { id: 'dashboard', title: '仪表盘', path: '/', icon: 'DashboardOutlined', order: 1 },
        { id: 'product', title: '商品管理', path: '/product', icon: 'ShopOutlined', order: 2 },
        { id: 'pricing', title: '定价中心', path: '/pricing', icon: 'DollarOutlined', order: 3 },
        { id: 'review', title: '审核管理', path: '/review', icon: 'AuditOutlined', order: 4 },
        { id: 'inventory', title: '库存追溯', path: '/inventory', icon: 'EyeOutlined', order: 5 },
      ],
    });
  },

  // 商品相关API
  getProducts: async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: string;
  }) => {
    await delay();
    return fetchProductList(params);
  },

  getProductById: async (id: string) => {
    await delay();
    const product = productData.find(item => item.id === id);
    if (!product) {
      return createErrorResponse('商品不存在', 404);
    }
    return createApiResponse(product);
  },

  createProduct: async (productData: Partial<typeof productData[0]>) => {
    await delay();
    const newProduct = {
      id: `PROD-${Date.now()}`,
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    productData.push(newProduct);
    return createApiResponse(newProduct);
  },

  updateProduct: async (id: string, updateData: Partial<typeof productData[0]>) => {
    await delay();
    const index = productData.findIndex(item => item.id === id);
    if (index === -1) {
      return createErrorResponse('商品不存在', 404);
    }
    productData[index] = { ...productData[index], ...updateData, updatedAt: new Date().toISOString() };
    return createApiResponse(productData[index]);
  },

  deleteProduct: async (id: string) => {
    await delay();
    const index = productData.findIndex(item => item.id === id);
    if (index === -1) {
      return createErrorResponse('商品不存在', 404);
    }
    productData.splice(index, 1);
    return createApiResponse({ message: '商品删除成功' });
  },

  // 定价相关API
  getPricing: async (params?: {
    page?: number;
    pageSize?: number;
    priceType?: string;
    status?: string;
  }) => {
    await delay();
    return fetchPricingList(params);
  },

  getPricingById: async (id: string) => {
    await delay();
    const pricing = pricingData.find(item => item.id === id);
    if (!pricing) {
      return createErrorResponse('定价规则不存在', 404);
    }
    return createApiResponse(pricing);
  },

  createPricing: async (pricingData: Partial<typeof pricingData[0]>) => {
    await delay();
    const newPricing = {
      id: `PRICE-${Date.now()}`,
      ...pricingData,
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: '2025-12-31',
    } as any;
    pricingData.push(newPricing);
    return createApiResponse(newPricing);
  },

  updatePricing: async (id: string, updateData: Partial<typeof pricingData[0]>) => {
    await delay();
    const index = pricingData.findIndex(item => item.id === id);
    if (index === -1) {
      return createErrorResponse('定价规则不存在', 404);
    }
    pricingData[index] = { ...pricingData[index], ...updateData };
    return createApiResponse(pricingData[index]);
  },

  // 审核相关API
  getReviews: async (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
  }) => {
    await delay();
    return fetchReviewList(params);
  },

  getReviewById: async (id: string) => {
    await delay();
    const review = reviewData.find(item => item.id === id);
    if (!review) {
      return createErrorResponse('审核记录不存在', 404);
    }
    return createApiResponse(review);
  },

  approveReview: async (id: string, comment?: string) => {
    await delay();
    const index = reviewData.findIndex(item => item.id === id);
    if (index === -1) {
      return createErrorResponse('审核记录不存在', 404);
    }
    reviewData[index] = {
      ...reviewData[index],
      status: 'approved',
      reviewer: '当前用户',
      reviewTime: new Date().toISOString(),
      comment: comment || '审核通过',
    };
    return createApiResponse(reviewData[index]);
  },

  rejectReview: async (id: string, comment?: string) => {
    await delay();
    const index = reviewData.findIndex(item => item.id === id);
    if (index === -1) {
      return createErrorResponse('审核记录不存在', 404);
    }
    reviewData[index] = {
      ...reviewData[index],
      status: 'rejected',
      reviewer: '当前用户',
      reviewTime: new Date().toISOString(),
      comment: comment || '审核驳回',
    };
    return createApiResponse(reviewData[index]);
  },

  // 库存相关API
  getInventory: async (params?: {
    page?: number;
    pageSize?: number;
    location?: string;
    operation?: string;
  }) => {
    await delay();
    return fetchInventoryList(params);
  },

  getInventoryById: async (id: string) => {
    await delay();
    const inventory = inventoryData.find(item => item.id === id);
    if (!inventory) {
      return createErrorResponse('库存记录不存在', 404);
    }
    return createApiResponse(inventory);
  },

  createInventory: async (inventoryData: Partial<typeof inventoryData[0]>) => {
    await delay();
    const newInventory = {
      id: `INV-${Date.now()}`,
      ...inventoryData,
      operationTime: new Date().toISOString(),
      operator: '当前用户',
    } as any;
    inventoryData.push(newInventory);
    return createApiResponse(newInventory);
  },

  // 统计数据API
  getDashboardStats: async () => {
    await delay();
    return createApiResponse({
      productCount: productData.length,
      activeProducts: productData.filter(item => item.status === 'active').length,
      pricingCount: pricingData.length,
      activePricing: pricingData.filter(item => item.status === 'active').length,
      pendingReviews: reviewData.filter(item => item.status === 'pending').length,
      approvedReviews: reviewData.filter(item => item.status === 'approved').length,
      totalInventory: inventoryData.reduce((sum, item) => sum + item.quantity, 0),
      todayInventory: inventoryData
        .filter(item => {
          const today = new Date().toISOString().split('T')[0];
          return item.operationTime.startsWith(today);
        })
        .length,
    });
  },
};

// 导出所有Mock数据供测试使用
export const mockData = {
  products: productData,
  pricing: pricingData,
  reviews: reviewData,
  inventory: inventoryData,
};