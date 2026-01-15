import { apiClient } from './api';
import type {
  PriceConfig,
  PriceFormData,
  PriceQueryParams,
  PriceRule,
  PriceHistory,
  PriceChangeRequest,
  PriceFilters,
  PriceCalculationParams,
  PriceCalculationResult,
} from '@/types/price';

// 价格API服务
export const priceService = {
  // 价格配置相关API
  async getPrices(params?: PriceQueryParams): Promise<{
    data: PriceConfig[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  }> {
    const response = await apiClient.get('/prices', { params });
    return response.data;
  },

  async getPriceById(id: string): Promise<PriceConfig> {
    const response = await apiClient.get(`/prices/${id}`);
    return response.data;
  },

  async createPrice(data: PriceFormData): Promise<PriceConfig> {
    const response = await apiClient.post('/prices', data);
    return response.data;
  },

  async updatePrice(id: string, data: Partial<PriceFormData>): Promise<PriceConfig> {
    const response = await apiClient.put(`/prices/${id}`, data);
    return response.data;
  },

  async deletePrice(id: string): Promise<void> {
    await apiClient.delete(`/prices/${id}`);
  },

  async batchUpdatePrices(ids: string[], data: Partial<PriceFormData>): Promise<PriceConfig[]> {
    const response = await apiClient.put('/prices/batch', { ids, data });
    return response.data;
  },

  async batchDeletePrices(ids: string[]): Promise<void> {
    await apiClient.delete('/prices/batch', { data: { ids } });
  },

  // 价格规则相关API
  async getPriceRules(): Promise<PriceRule[]> {
    const response = await apiClient.get('/price-rules');
    return response.data;
  },

  async getPriceRuleById(id: string): Promise<PriceRule> {
    const response = await apiClient.get(`/price-rules/${id}`);
    return response.data;
  },

  async createPriceRule(data: Partial<PriceRule>): Promise<PriceRule> {
    const response = await apiClient.post('/price-rules', data);
    return response.data;
  },

  async updatePriceRule(id: string, data: Partial<PriceRule>): Promise<PriceRule> {
    const response = await apiClient.put(`/price-rules/${id}`, data);
    return response.data;
  },

  async deletePriceRule(id: string): Promise<void> {
    await apiClient.delete(`/price-rules/${id}`);
  },

  async applyPriceRule(
    ruleId: string,
    productIds: string[]
  ): Promise<{
    applied: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post(`/price-rules/${ruleId}/apply`, { productIds });
    return response.data;
  },

  // 价格历史相关API
  async getPriceHistory(priceConfigId: string): Promise<PriceHistory[]> {
    const response = await apiClient.get(`/prices/${priceConfigId}/history`);
    return response.data;
  },

  async getPriceHistoryByProductId(productId: string): Promise<PriceHistory[]> {
    const response = await apiClient.get(`/products/${productId}/price-history`);
    return response.data;
  },

  // 价格变更请求相关API
  async getPriceChangeRequests(): Promise<PriceChangeRequest[]> {
    const response = await apiClient.get('/price-change-requests');
    return response.data;
  },

  async createPriceChangeRequest(data: Partial<PriceChangeRequest>): Promise<PriceChangeRequest> {
    const response = await apiClient.post('/price-change-requests', data);
    return response.data;
  },

  async approvePriceChange(id: string, comments?: string): Promise<PriceChangeRequest> {
    const response = await apiClient.post(`/price-change-requests/${id}/approve`, { comments });
    return response.data;
  },

  async rejectPriceChange(id: string, comments?: string): Promise<PriceChangeRequest> {
    const response = await apiClient.post(`/price-change-requests/${id}/reject`, { comments });
    return response.data;
  },

  // 价格计算相关API
  async calculatePrice(
    productId: string,
    params?: PriceCalculationParams
  ): Promise<PriceCalculationResult> {
    const response = await apiClient.post(`/products/${productId}/calculate-price`, params);
    return response.data;
  },

  async bulkCalculatePrices(
    requests: Array<{
      productId: string;
      quantity?: number;
      memberLevel?: string;
      channel?: string;
    }>
  ): Promise<
    Array<{
      productId: string;
      result: PriceCalculationResult;
      error?: string;
    }>
  > {
    const response = await apiClient.post('/prices/bulk-calculate', { requests });
    return response.data;
  },

  // 价格导入导出相关API
  async exportPrices(filters?: PriceFilters): Promise<{
    downloadUrl: string;
    fileName: string;
  }> {
    const response = await apiClient.post('/prices/export', { filters });
    return response.data;
  },

  async importPrices(file: File): Promise<{
    total: number;
    success: number;
    failed: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/prices/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 价格统计分析API
  async getPriceStatistics(filters?: PriceFilters): Promise<{
    totalPrices: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    priceDistribution: Record<string, number>;
    activePrices: number;
    expiredPrices: number;
    upcomingChanges: number;
  }> {
    const response = await apiClient.get('/prices/statistics', { params: filters });
    return response.data;
  },

  async getPriceTrends(
    productId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<
    Array<{
      date: string;
      price: number;
      changeType: string;
    }>
  > {
    const response = await apiClient.get(`/products/${productId}/price-trends`, {
      params: { period },
    });
    return response.data;
  },

  // 价格模拟和预测API
  async simulatePriceChange(
    productId: string,
    newPrice: number,
    options?: {
      startDate?: string;
      endDate?: string;
      channels?: string[];
      memberLevels?: string[];
    }
  ): Promise<{
    estimatedRevenue: number;
    estimatedSales: number;
    priceImpact: {
      revenue: number;
      sales: number;
      percentage: number;
    };
    recommendations: string[];
  }> {
    const response = await apiClient.post(`/products/${productId}/simulate-price-change`, {
      newPrice,
      ...options,
    });
    return response.data;
  },

  // 价格审核相关API
  async submitPriceForReview(
    priceId: string,
    reviewData: {
      reviewType: 'create' | 'update' | 'delete';
      reason: string;
      effectiveDate?: string;
      attachments?: string[];
    }
  ): Promise<PriceChangeRequest> {
    const response = await apiClient.post(`/prices/${priceId}/submit-review`, reviewData);
    return response.data;
  },

  async getPriceReviewQueue(): Promise<PriceChangeRequest[]> {
    const response = await apiClient.get('/prices/review-queue');
    return response.data;
  },

  // 价格模板相关API
  async getPriceTemplates(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      template: Partial<PriceFormData>;
      usage: number;
    }>
  > {
    const response = await apiClient.get('/price-templates');
    return response.data;
  },

  async createPriceTemplate(data: {
    name: string;
    description?: string;
    template: Partial<PriceFormData>;
  }): Promise<{
    id: string;
    name: string;
  }> {
    const response = await apiClient.post('/price-templates', data);
    return response.data;
  },

  async applyPriceTemplate(
    templateId: string,
    productIds: string[]
  ): Promise<{
    applied: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post(`/price-templates/${templateId}/apply`, { productIds });
    return response.data;
  },
};
