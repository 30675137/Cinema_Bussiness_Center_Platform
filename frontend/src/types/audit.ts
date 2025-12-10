import { z } from 'zod';

// 审核状态枚举
export enum AuditStatus {
  PENDING = 'pending',     // 待审核
  APPROVED = 'approved',   // 已批准
  REJECTED = 'rejected',   // 已驳回
  CANCELLED = 'cancelled'  // 已取消
}

// 审核类型枚举
export enum AuditType {
  PRODUCT_CREATE = 'product_create',    // 商品创建
  PRODUCT_UPDATE = 'product_update',    // 商品更新
  PRODUCT_DELETE = 'product_delete',    // 商品删除
  PRICE_CHANGE = 'price_change',        // 价格变更
  SPEC_CHANGE = 'spec_change',          // 规格变更
  CONTENT_UPDATE = 'content_update',    // 内容更新
  BATCH_OPERATION = 'batch_operation'   // 批量操作
}

// 变更类型枚举
export enum ChangeType {
  CREATE = 'create',       // 新增
  UPDATE = 'update',       // 更新
  DELETE = 'delete'        // 删除
}

// 实体类型枚举（保持向后兼容）
export enum AuditEntityType {
  PRODUCT = 'product',
  PRICE_CONFIG = 'price_config',
  STORE = 'store',
  USER = 'user'
}

// 审核操作枚举（保持向后兼容）
export enum AuditOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate'
}

// 字段变更记录
export interface FieldChange {
  fieldName: string;           // 字段名称
  fieldLabel: string;          // 字段显示名称
  changeType: ChangeType;      // 变更类型
  oldValue?: any;              // 旧值
  newValue?: any;              // 新值
  isKeyField: boolean;         // 是否关键字段
  category: string;            // 字段分类 (basic, spec, content, price等)
}

// 审核项目
export interface AuditItem {
  id: string;
  auditId: string;
  entityType: 'product' | 'price' | 'spec' | 'content';
  entityId: string;
  entityName: string;
  entityCode?: string;
  changes: FieldChange[];
  changeCount: number;
  keyFieldChanges: number;
}

// 审核记录
export interface AuditRecord {
  id: string;
  auditType: AuditType;
  status: AuditStatus;
  title: string;
  description?: string;
  submitterId: string;
  submitterName: string;
  submitterRole: string;
  submittedAt: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewerRole?: string;
  reviewedAt?: string;
  reviewComment?: string;
  rejectionReason?: string;
  items: AuditItem[];
  totalItems: number;
  keyFieldChanges: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 审核查询参数
export interface AuditQueryParams {
  page?: number;
  pageSize?: number;
  status?: AuditStatus[];
  auditType?: AuditType[];
  submitterId?: string;
  reviewerId?: string;
  dateRange?: [string, string];
  priority?: string[];
  keyword?: string;
  entityType?: string[];
  sortBy?: 'createdAt' | 'submittedAt' | 'priority' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

// 审核统计
export interface AuditStatistics {
  totalAudits: number;
  pendingAudits: number;
  approvedAudits: number;
  rejectedAudits: number;
  averageReviewTime: number; // 平均审核时间（小时）
  overdueAudits: number;
  myPendingAudits: number;
  auditsByType: Record<AuditType, number>;
  auditsByStatus: Record<AuditStatus, number>;
  recentTrends: {
    date: string;
    submitted: number;
    reviewed: number;
  }[];
}

// 审核操作请求
export interface AuditActionRequest {
  auditId: string;
  action: 'approve' | 'reject' | 'cancel' | 'reassign';
  comment?: string;
  rejectionReason?: string;
  newReviewerId?: string;
  itemIds?: string[]; // 部分审核时指定
}

// 批量审核请求
export interface BatchAuditRequest {
  auditIds: string[];
  action: 'approve' | 'reject';
  comment?: string;
  rejectionReason?: string;
}

// 审核历史
export interface AuditHistory {
  id: string;
  auditId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'reassigned' | 'commented';
  actorId: string;
  actorName: string;
  actorRole: string;
  comment?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// 审核配置
export interface AuditConfig {
  id: string;
  entityType: string;
  auditType: AuditType;
  keyFields: string[];
  requiredReviewers: string[];
  autoApproveRules: {
    condition: string;
    enabled: boolean;
  }[];
  escalationRules: {
    condition: string;
    escalateTo: string[];
    delayHours: number;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 审核表单数据
export interface AuditFormData {
  title: string;
  description?: string;
  auditType: AuditType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  reviewerId?: string;
  tags: string[];
  itemIds: string[];
}

// 用户信息
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  department?: string;
  position?: string;
}

// 审核状态（向后兼容）
export interface ReviewState {
  entity: any;
  entityType: string;
  changes: FieldChange[];
  confirmedChanges: string[];
  auditResult?: AuditStatus;
  auditComment: string;
  loading: boolean;
  submitting: boolean;
}

// Zod验证模式
export const AuditRecordSchema = z.object({
  id: z.string(),
  auditType: z.nativeEnum(AuditType),
  status: z.nativeEnum(AuditStatus),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200字符'),
  description: z.string().max(1000, '描述不能超过1000字符').optional(),
  submitterId: z.string(),
  submitterName: z.string(),
  submitterRole: z.string(),
  submittedAt: z.string(),
  reviewerId: z.string().optional(),
  reviewerName: z.string().optional(),
  reviewerRole: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewComment: z.string().max(1000, '审核意见不能超过1000字符').optional(),
  rejectionReason: z.string().max(1000, '驳回原因不能超过1000字符').optional(),
  items: z.array(z.object({
    id: z.string(),
    auditId: z.string(),
    entityType: z.enum(['product', 'price', 'spec', 'content']),
    entityId: z.string(),
    entityName: z.string(),
    entityCode: z.string().optional(),
    changes: z.array(z.object({
      fieldName: z.string(),
      fieldLabel: z.string(),
      changeType: z.nativeEnum(ChangeType),
      oldValue: z.any().optional(),
      newValue: z.any().optional(),
      isKeyField: z.boolean(),
      category: z.string()
    })),
    changeCount: z.number().min(0),
    keyFieldChanges: z.number().min(0)
  })),
  totalItems: z.number().min(0),
  keyFieldChanges: z.number().min(0),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const AuditFormDataSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200字符'),
  description: z.string().max(1000, '描述不能超过1000字符').optional(),
  auditType: z.nativeEnum(AuditType),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  reviewerId: z.string().optional(),
  tags: z.array(z.string()),
  itemIds: z.array(z.string()).min(1, '至少选择一个审核项目')
});

export const AuditActionRequestSchema = z.object({
  auditId: z.string(),
  action: z.enum(['approve', 'reject', 'cancel', 'reassign']),
  comment: z.string().max(1000, '备注不能超过1000字符').optional(),
  rejectionReason: z.string().max(1000, '驳回原因不能超过1000字符').optional(),
  newReviewerId: z.string().optional(),
  itemIds: z.array(z.string()).optional()
});

export const BatchAuditRequestSchema = z.object({
  auditIds: z.array(z.string()).min(1, '至少选择一个审核记录'),
  action: z.enum(['approve', 'reject']),
  comment: z.string().max(1000, '备注不能超过1000字符').optional(),
  rejectionReason: z.string().max(1000, '驳回原因不能超过1000字符').optional()
});

// 类型导出
export type CreateAuditRequest = Omit<AuditRecord,
  'id' | 'status' | 'reviewerId' | 'reviewerName' | 'reviewerRole' |
  'reviewedAt' | 'reviewComment' | 'rejectionReason' | 'createdAt' | 'updatedAt'
>;

export type UpdateAuditRequest = Partial<CreateAuditRequest>;

// 配置选项
export const AUDIT_TYPE_OPTIONS = [
  { value: AuditType.PRODUCT_CREATE, label: '商品创建', color: 'green' },
  { value: AuditType.PRODUCT_UPDATE, label: '商品更新', color: 'blue' },
  { value: AuditType.PRODUCT_DELETE, label: '商品删除', color: 'red' },
  { value: AuditType.PRICE_CHANGE, label: '价格变更', color: 'orange' },
  { value: AuditType.SPEC_CHANGE, label: '规格变更', color: 'purple' },
  { value: AuditType.CONTENT_UPDATE, label: '内容更新', color: 'cyan' },
  { value: AuditType.BATCH_OPERATION, label: '批量操作', color: 'magenta' }
];

export const AUDIT_STATUS_OPTIONS = [
  { value: AuditStatus.PENDING, label: '待审核', color: 'orange' },
  { value: AuditStatus.APPROVED, label: '已批准', color: 'green' },
  { value: AuditStatus.REJECTED, label: '已驳回', color: 'red' },
  { value: AuditStatus.CANCELLED, label: '已取消', color: 'gray' }
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: '低', color: 'gray' },
  { value: 'medium', label: '中', color: 'blue' },
  { value: 'high', label: '高', color: 'orange' },
  { value: 'urgent', label: '紧急', color: 'red' }
];

export const CHANGE_TYPE_OPTIONS = [
  { value: ChangeType.CREATE, label: '新增', color: 'green' },
  { value: ChangeType.UPDATE, label: '更新', color: 'blue' },
  { value: ChangeType.DELETE, label: '删除', color: 'red' }
];