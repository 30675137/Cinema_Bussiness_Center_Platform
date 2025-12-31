import { apiClient } from './api';
import {
  AuditRecord,
  AuditQueryParams,
  AuditStatistics,
  AuditActionRequest,
  BatchAuditRequest,
  AuditHistory,
  AuditConfig,
  CreateAuditRequest,
  UpdateAuditRequest,
  AuditFormData,
} from '@/types/audit';

/**
 * 审核API服务
 * 提供审核记录的CRUD操作、审核流程管理、统计分析等功能
 */
export const auditService = {
  /**
   * 获取审核记录列表
   */
  async getAudits(params?: AuditQueryParams): Promise<{
    data: AuditRecord[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  }> {
    const response = await apiClient.get('/audits', { params });
    return response.data;
  },

  /**
   * 获取单个审核记录详情
   */
  async getAudit(id: string): Promise<AuditRecord> {
    const response = await apiClient.get(`/audits/${id}`);
    return response.data;
  },

  /**
   * 创建审核记录
   */
  async createAudit(data: CreateAuditRequest): Promise<AuditRecord> {
    const response = await apiClient.post('/audits', data);
    return response.data;
  },

  /**
   * 更新审核记录
   */
  async updateAudit(id: string, data: UpdateAuditRequest): Promise<AuditRecord> {
    const response = await apiClient.put(`/audits/${id}`, data);
    return response.data;
  },

  /**
   * 删除审核记录
   */
  async deleteAudit(id: string): Promise<void> {
    await apiClient.delete(`/audits/${id}`);
  },

  /**
   * 执行审核操作（批准、驳回、取消、转派）
   */
  async performAuditAction(data: AuditActionRequest): Promise<{
    success: boolean;
    message: string;
    audit: AuditRecord;
  }> {
    const response = await apiClient.post(`/audits/${data.auditId}/action`, data);
    return response.data;
  },

  /**
   * 批量审核操作
   */
  async batchAuditAction(data: BatchAuditRequest): Promise<{
    success: boolean;
    message: string;
    results: {
      auditId: string;
      success: boolean;
      error?: string;
    }[];
  }> {
    const response = await apiClient.post('/audits/batch-action', data);
    return response.data;
  },

  /**
   * 获取审核统计信息
   */
  async getAuditStatistics(params?: {
    dateRange?: [string, string];
    reviewerId?: string;
  }): Promise<AuditStatistics> {
    const response = await apiClient.get('/audits/statistics', { params });
    return response.data;
  },

  /**
   * 获取审核历史记录
   */
  async getAuditHistory(auditId: string): Promise<AuditHistory[]> {
    const response = await apiClient.get(`/audits/${auditId}/history`);
    return response.data;
  },

  /**
   * 获取审核配置
   */
  async getAuditConfigs(params?: {
    entityType?: string;
    auditType?: string;
  }): Promise<AuditConfig[]> {
    const response = await apiClient.get('/audit-configs', { params });
    return response.data;
  },

  /**
   * 创建审核配置
   */
  async createAuditConfig(
    data: Omit<AuditConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AuditConfig> {
    const response = await apiClient.post('/audit-configs', data);
    return response.data;
  },

  /**
   * 更新审核配置
   */
  async updateAuditConfig(id: string, data: Partial<AuditConfig>): Promise<AuditConfig> {
    const response = await apiClient.put(`/audit-configs/${id}`, data);
    return response.data;
  },

  /**
   * 删除审核配置
   */
  async deleteAuditConfig(id: string): Promise<void> {
    await apiClient.delete(`/audit-configs/${id}`);
  },

  /**
   * 获取我的待审核列表
   */
  async getMyPendingAudits(params?: {
    page?: number;
    pageSize?: number;
    priority?: string[];
  }): Promise<{
    data: AuditRecord[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  }> {
    const response = await apiClient.get('/audits/my-pending', { params });
    return response.data;
  },

  /**
   * 获取我提交的审核列表
   */
  async getMySubmittedAudits(params?: {
    page?: number;
    pageSize?: number;
    status?: string[];
  }): Promise<{
    data: AuditRecord[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  }> {
    const response = await apiClient.get('/audits/my-submitted', { params });
    return response.data;
  },

  /**
   * 自动检测变更并创建审核记录
   */
  async detectChangesAndCreateAudit(data: {
    entityType: string;
    entityId: string;
    changes: Array<{
      fieldName: string;
      fieldLabel: string;
      oldValue: any;
      newValue: any;
      isKeyField: boolean;
      category: string;
    }>;
    auditType: string;
    title: string;
    description?: string;
    priority?: string;
  }): Promise<{
    audit: AuditRecord;
    changesDetected: number;
    keyFieldChanges: number;
  }> {
    const response = await apiClient.post('/audits/auto-detect', data);
    return response.data;
  },

  /**
   * 预览审核变更
   */
  async previewAuditChanges(data: {
    entityType: string;
    entityId: string;
    changes: Array<{
      fieldName: string;
      newValue: any;
    }>;
  }): Promise<{
    oldData: Record<string, any>;
    newData: Record<string, any>;
    fieldChanges: Array<{
      fieldName: string;
      fieldLabel: string;
      oldValue: any;
      newValue: any;
      isKeyField: boolean;
      category: string;
    }>;
    keyFieldChanges: number;
  }> {
    const response = await apiClient.post('/audits/preview-changes', data);
    return response.data;
  },

  /**
   * 导出审核数据
   */
  async exportAuditData(params: {
    format: 'excel' | 'csv';
    auditIds?: string[];
    filters?: AuditQueryParams;
    includeHistory?: boolean;
  }): Promise<Blob> {
    const response = await apiClient.post('/audits/export', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * 导入审核数据
   */
  async importAuditData(
    file: File,
    options?: {
      updateMode?: 'create' | 'update';
      validateOnly?: boolean;
    }
  ): Promise<{
    imported: number;
    failed: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    const response = await apiClient.post('/audits/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * 获取审核趋势数据
   */
  async getAuditTrends(params?: {
    dateRange: [string, string];
    groupBy?: 'day' | 'week' | 'month';
    auditType?: string;
  }): Promise<{
    trends: Array<{
      date: string;
      submitted: number;
      approved: number;
      rejected: number;
      pending: number;
    }>;
    summary: {
      totalSubmitted: number;
      totalApproved: number;
      totalRejected: number;
      approvalRate: number;
      averageProcessTime: number;
    };
  }> {
    const response = await apiClient.get('/audits/trends', { params });
    return response.data;
  },

  /**
   * 获取审核员绩效数据
   */
  async getReviewerPerformance(params?: {
    dateRange?: [string, string];
    reviewerId?: string;
  }): Promise<{
    reviewers: Array<{
      reviewerId: string;
      reviewerName: string;
      totalAudits: number;
      approvedAudits: number;
      rejectedAudits: number;
      averageProcessTime: number;
      approvalRate: number;
      overdueAudits: number;
    }>;
    summary: {
      totalReviewers: number;
      averageProcessTime: number;
      overallApprovalRate: number;
    };
  }> {
    const response = await apiClient.get('/audits/performance', { params });
    return response.data;
  },

  /**
   * 重新分配审核任务
   */
  async reassignAuditTasks(data: {
    fromReviewerId: string;
    toReviewerId: string;
    auditIds?: string[];
    reallocateAll?: boolean;
  }): Promise<{
    reassigned: number;
    failed: number;
    errors: string[];
  }> {
    const response = await apiClient.post('/audits/reassign', data);
    return response.data;
  },

  /**
   * 获取审核提醒配置
   */
  async getAuditReminders(): Promise<{
    enabled: boolean;
    emailReminders: boolean;
    reminderHours: number[];
    escalationEnabled: boolean;
    escalationHours: number;
  }> {
    const response = await apiClient.get('/audits/reminders');
    return response.data;
  },

  /**
   * 更新审核提醒配置
   */
  async updateAuditReminders(config: {
    enabled: boolean;
    emailReminders: boolean;
    reminderHours: number[];
    escalationEnabled: boolean;
    escalationHours: number;
  }): Promise<void> {
    await apiClient.put('/audits/reminders', config);
  },

  /**
   * 发送审核提醒
   */
  async sendAuditReminders(params?: {
    auditId?: string;
    reviewerId?: string;
    type?: 'pending' | 'overdue';
  }): Promise<{
    sent: number;
    failed: number;
  }> {
    const response = await apiClient.post('/audits/send-reminders', params);
    return response.data;
  },
};
