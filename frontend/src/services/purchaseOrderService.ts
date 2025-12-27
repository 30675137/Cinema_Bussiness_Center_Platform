/**
 * 采购订单服务
 */
import { BaseApiService } from './baseService';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderFormData, PurchaseOrderQueryParams, PurchaseStatistics } from '../types/purchase';

// 采购订单API响应接口
export interface PurchaseOrderResponse {
  order: PurchaseOrder;
}

// 采购订单列表响应接口
export interface PurchaseOrderListResponse {
  items: PurchaseOrder[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 批量操作请求接口
export interface BatchOperationRequest {
  orderIds: string[];
  operation: 'approve' | 'reject' | 'cancel' | 'delete';
  remarks?: string;
}

// 审批请求接口
export interface ApprovalRequest {
  remarks?: string;
  nextApprover?: string;
}

/**
 * 采购订单服务类
 */
export class PurchaseOrderService extends BaseApiService {
  constructor() {
    super('/purchase-orders');
  }

  /**
   * 获取采购订单列表
   */
  async getOrders(params?: PurchaseOrderQueryParams): Promise<PurchaseOrderListResponse> {
    const response = await this.get<PurchaseOrderListResponse>('', params);
    return response.data || { items: [], pagination: { current: 1, pageSize: 20, total: 0, totalPages: 0 } };
  }

  /**
   * 根据ID获取采购订单
   */
  async getOrderById(id: string): Promise<PurchaseOrder> {
    const response = await this.get<PurchaseOrder>(`/${id}`);
    return response.data!;
  }

  /**
   * 创建采购订单
   */
  async createOrder(data: PurchaseOrderFormData): Promise<{ id: string; orderNumber: string }> {
    const response = await this.post<{ id: string; orderNumber: string }>('', data);
    return response.data!;
  }

  /**
   * 更新采购订单
   */
  async updateOrder(id: string, data: Partial<PurchaseOrderFormData>): Promise<PurchaseOrder> {
    const response = await this.put<PurchaseOrder>(`/${id}`, data);
    return response.data!;
  }

  /**
   * 删除采购订单
   */
  async deleteOrder(id: string): Promise<void> {
    await this.delete(`/${id}`);
  }

  /**
   * 审批采购订单
   */
  async approveOrder(id: string, remarks?: string): Promise<PurchaseOrder> {
    const response = await this.post<PurchaseOrder>(`/${id}/approve`, { remarks });
    return response.data!;
  }

  /**
   * 拒绝采购订单
   */
  async rejectOrder(id: string, remarks: string): Promise<PurchaseOrder> {
    const response = await this.post<PurchaseOrder>(`/${id}/reject`, { remarks });
    return response.data!;
  }

  /**
   * 确认采购订单
   */
  async confirmOrder(id: string): Promise<PurchaseOrder> {
    const response = await this.post<PurchaseOrder>(`/${id}/confirm`);
    return response.data!;
  }

  /**
   * 取消采购订单
   */
  async cancelOrder(id: string, reason: string): Promise<PurchaseOrder> {
    const response = await this.post<PurchaseOrder>(`/${id}/cancel`, { reason });
    return response.data!;
  }

  /**
   * 提交审批
   */
  async submitForApproval(id: string, approverIds: string[], remarks?: string): Promise<PurchaseOrder> {
    const response = await this.post<PurchaseOrder>(`/${id}/submit`, {
      approverIds,
      remarks,
    });
    return response.data!;
  }

  /**
   * 批量审批
   */
  async batchApprove(orderIds: string[], remarks?: string): Promise<{ success: number; failed: number }> {
    const response = await this.post<{ success: number; failed: number }>('/batch-approve', {
      orderIds,
      remarks,
    });
    return response.data!;
  }

  /**
   * 批量拒绝
   */
  async batchReject(orderIds: string[], remarks: string): Promise<{ success: number; failed: number }> {
    const response = await this.post<{ success: number; failed: number }>('/batch-reject', {
      orderIds,
      remarks,
    });
    return response.data!;
  }

  /**
   * 批量取消
   */
  async batchCancel(orderIds: string[], reason: string): Promise<{ success: number; failed: number }> {
    const response = await this.post<{ success: number; failed: number }>('/batch-cancel', {
      orderIds,
      reason,
    });
    return response.data!;
  }

  /**
   * 批量删除
   */
  async batchDelete(orderIds: string[]): Promise<{ success: number; failed: number }> {
    const response = await this.post<{ success: number; failed: number }>('/batch-delete', {
      orderIds,
    });
    return response.data!;
  }

  /**
   * 复制采购订单
   */
  async duplicateOrder(id: string): Promise<{ id: string; orderNumber: string }> {
    const response = await this.post<{ id: string; orderNumber: string }>(`/${id}/duplicate`);
    return response.data!;
  }

  /**
   * 获取采购订单统计
   */
  async getStatistics(params?: {
    dateRange?: [string, string];
    status?: PurchaseOrderStatus[];
    supplierIds?: string[];
  }): Promise<PurchaseStatistics> {
    const response = await this.get<PurchaseStatistics>('/statistics', params);
    return response.data!;
  }

  /**
   * 获取订单审批历史
   */
  async getApprovalHistory(id: string): Promise<any[]> {
    const response = await this.get<any[]>(`/${id}/approval-history`);
    return response.data || [];
  }

  /**
   * 获取订单变更历史
   */
  async getChangeHistory(id: string): Promise<any[]> {
    const response = await this.get<any[]>(`/${id}/change-history`);
    return response.data || [];
  }

  /**
   * 导出采购订单
   */
  async exportOrders(params?: PurchaseOrderQueryParams, format: 'excel' | 'csv' | 'pdf' = 'excel'): Promise<Blob> {
    return this.export('', { ...params, format }, format);
  }

  /**
   * 导出采购订单详情
   */
  async exportOrderDetails(id: string, format: 'excel' | 'pdf' = 'excel'): Promise<Blob> {
    return this.export(`/${id}/export`, { format }, format);
  }

  /**
   * 打印采购订单
   */
  async printOrder(id: string, template?: string): Promise<Blob> {
    return this.export(`/${id}/print`, { template });
  }

  /**
   * 发送邮件通知
   */
  async sendEmailNotification(id: string, recipients: string[], subject?: string, message?: string): Promise<void> {
    await this.post(`/${id}/notify`, {
      recipients,
      subject,
      message,
    });
  }

  /**
   * 上传附件
   */
  async uploadAttachment(id: string, file: File, type: string): Promise<{ id: string; url: string }> {
    return this.uploadFile(`/${id}/attachments`, file, { type });
  }

  /**
   * 删除附件
   */
  async deleteAttachment(orderId: string, attachmentId: string): Promise<void> {
    await this.delete(`/${orderId}/attachments/${attachmentId}`);
  }

  /**
   * 获取附件列表
   */
  async getAttachments(id: string): Promise<any[]> {
    const response = await this.get<any[]>(`/${id}/attachments`);
    return response.data || [];
  }

  /**
   * 计算订单金额
   */
  async calculateOrderAmount(items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discountRate: number;
  }>): Promise<{
    subtotal: number;
    totalTax: number;
    totalDiscount: number;
    totalAmount: number;
  }> {
    const response = await this.post<any>('/calculate', { items });
    return response.data;
  }

  /**
   * 验证订单数据
   */
  async validateOrder(data: PurchaseOrderFormData): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await this.post<any>('/validate', data);
    return response.data;
  }

  /**
   * 获取可用的供应商
   */
  async getAvailableSuppliers(params?: {
    keyword?: string;
    category?: string;
    status?: string;
  }): Promise<any[]> {
    const response = await this.get<any[]>('/available-suppliers', params);
    return response.data || [];
  }

  /**
   * 获取可用的商品
   */
  async getAvailableProducts(params?: {
    keyword?: string;
    category?: string;
    supplierId?: string;
  }): Promise<any[]> {
    const response = await this.get<any[]>('/available-products', params);
    return response.data || [];
  }

  /**
   * 获取商品库存信息
   */
  async getProductStock(productId: string): Promise<{
    currentStock: number;
    minStock: number;
    maxStock: number;
    availableStock: number;
  }> {
    const response = await this.get<any>(`/products/${productId}/stock`);
    return response.data;
  }

  /**
   * 获取采购建议
   */
  async getPurchaseSuggestions(params?: {
    category?: string;
    supplierId?: string;
    dateRange?: [string, string];
  }): Promise<any[]> {
    const response = await this.get<any[]>('/suggestions', params);
    return response.data || [];
  }

  /**
   * 获取价格历史
   */
  async getPriceHistory(productId: string, supplierId?: string): Promise<any[]> {
    const response = await this.get<any[]>(`/products/${productId}/price-history`, { supplierId });
    return response.data || [];
  }

  /**
   * 预览订单
   */
  async previewOrder(data: PurchaseOrderFormData): Promise<{
    order: PurchaseOrder;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await this.post<any>('/preview', data);
    return response.data;
  }
}

// 创建服务实例
export const purchaseOrderService = new PurchaseOrderService();

// Mock服务实现（用于开发和测试）
export class MockPurchaseOrderService extends PurchaseOrderService {
  constructor() {
    super('/mock/purchase-orders');
  }

  // Mock实现继承自BaseApiService的方法
  protected async request<T>(endpoint: string, config: any = {}): Promise<any> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 根据endpoint返回不同的mock数据
    if (endpoint.includes('/statistics')) {
      return {
        success: true,
        data: {
          totalOrders: 150,
          pendingOrders: 25,
          processingOrders: 45,
          completedOrders: 70,
          cancelledOrders: 10,
          totalPurchaseAmount: 2500000,
          monthlyPurchaseAmount: 208333,
          averageOrderValue: 16666,
          totalSuppliers: 35,
          activeSuppliers: 28,
          topSuppliers: [],
          topProducts: [],
          averageApprovalTime: 24,
          averageDeliveryTime: 7,
          onTimeDeliveryRate: 0.92,
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (endpoint.includes('/calculate')) {
      const mockResult = {
        subtotal: 10000,
        totalTax: 1300,
        totalDiscount: 500,
        totalAmount: 10800,
      };
      return {
        success: true,
        data: mockResult,
        timestamp: new Date().toISOString(),
      };
    }

    // 默认成功响应
    return {
      success: true,
      data: {},
      timestamp: new Date().toISOString(),
    };
  }
}

export default purchaseOrderService;