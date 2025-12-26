/**
 * P004-inventory-adjustment: Zod 验证模式
 * 
 * 用于前端表单验证和 API 请求/响应验证
 */

import { z } from 'zod';

// ==================== 枚举 Schema ====================

export const AdjustmentTypeSchema = z.enum(['surplus', 'shortage', 'damage'], {
  message: '请选择有效的调整类型',
});

export const AdjustmentStatusSchema = z.enum([
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'withdrawn',
]);

export const ApprovalActionSchema = z.enum(['approve', 'reject'], {
  message: '请选择有效的审批操作',
});

// ==================== 请求 Schema ====================

/**
 * 创建调整请求验证
 */
export const CreateAdjustmentSchema = z.object({
  skuId: z.string().uuid('无效的SKU ID'),
  storeId: z.string().uuid('无效的门店ID'),
  adjustmentType: AdjustmentTypeSchema,
  quantity: z
    .number({ message: '调整数量必须为数字' })
    .int('调整数量必须为整数')
    .positive('调整数量必须大于0'),
  reasonCode: z
    .string({ message: '请选择调整原因' })
    .min(1, '请选择调整原因'),
  reasonText: z
    .string()
    .max(500, '原因说明不能超过500字符')
    .optional()
    .nullable(),
  remarks: z
    .string()
    .max(500, '备注不能超过500字符')
    .optional()
    .nullable(),
});

export type CreateAdjustmentInput = z.infer<typeof CreateAdjustmentSchema>;

/**
 * 审批请求验证
 */
export const ApprovalRequestSchema = z.object({
  action: ApprovalActionSchema,
  comments: z
    .string()
    .max(1000, '审批意见不能超过1000字符')
    .optional()
    .nullable(),
});

export type ApprovalRequestInput = z.infer<typeof ApprovalRequestSchema>;

/**
 * 安全库存更新验证
 */
export const UpdateSafetyStockSchema = z.object({
  safetyStock: z
    .number({ message: '安全库存必须为数字' })
    .int('安全库存必须为整数')
    .nonnegative('安全库存不能为负数'),
  version: z
    .number()
    .int()
    .positive('版本号无效'),
});

export type UpdateSafetyStockInput = z.infer<typeof UpdateSafetyStockSchema>;

// ==================== 查询参数 Schema ====================

/**
 * 调整列表查询参数验证
 */
export const AdjustmentQueryParamsSchema = z.object({
  skuId: z.string().uuid().optional(),
  storeId: z.string().uuid().optional(),
  status: z.array(AdjustmentStatusSchema).optional(),
  adjustmentType: AdjustmentTypeSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type AdjustmentQueryParamsInput = z.infer<typeof AdjustmentQueryParamsSchema>;

/**
 * 流水查询参数验证
 */
export const TransactionQueryParamsSchema = z.object({
  skuId: z.string().uuid().optional(),
  storeId: z.string().uuid().optional(),
  transactionTypes: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type TransactionQueryParamsInput = z.infer<typeof TransactionQueryParamsSchema>;

// ==================== 实体 Schema ====================

/**
 * 调整原因 Schema
 */
export const AdjustmentReasonSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  category: AdjustmentTypeSchema,
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

/**
 * SKU 信息 Schema
 */
export const SkuInfoSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  unit: z.string().optional(),
  unitPrice: z.number().optional(),
});

/**
 * 门店信息 Schema
 */
export const StoreInfoSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
});

/**
 * 审批记录 Schema
 */
export const ApprovalRecordSchema = z.object({
  id: z.string().uuid(),
  adjustmentId: z.string().uuid(),
  approverId: z.string().uuid(),
  approverName: z.string(),
  action: z.enum(['approve', 'reject', 'withdraw']),
  statusBefore: AdjustmentStatusSchema,
  statusAfter: AdjustmentStatusSchema,
  comments: z.string().optional().nullable(),
  actionTime: z.string(),
  createdAt: z.string(),
});

/**
 * 库存调整记录 Schema
 */
export const InventoryAdjustmentSchema = z.object({
  id: z.string().uuid(),
  adjustmentNumber: z.string(),
  skuId: z.string().uuid(),
  sku: SkuInfoSchema.optional(),
  storeId: z.string().uuid(),
  store: StoreInfoSchema.optional(),
  adjustmentType: AdjustmentTypeSchema,
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  adjustmentAmount: z.number(),
  reasonCode: z.string(),
  reasonText: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  status: AdjustmentStatusSchema,
  stockBefore: z.number().int(),
  stockAfter: z.number().int(),
  availableBefore: z.number().int(),
  availableAfter: z.number().int(),
  requiresApproval: z.boolean(),
  operatorId: z.string().uuid(),
  operatorName: z.string(),
  approvedAt: z.string().optional().nullable(),
  approvedBy: z.string().uuid().optional().nullable(),
  transactionId: z.string().uuid().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().int(),
  approvalHistory: z.array(ApprovalRecordSchema).optional(),
});

// ==================== 响应 Schema ====================

/**
 * API 响应 Schema
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    timestamp: z.string().optional(),
  });

/**
 * 分页响应 Schema
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(itemSchema).optional(),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

/**
 * 调整记录响应 Schema
 */
export const AdjustmentResponseSchema = ApiResponseSchema(InventoryAdjustmentSchema);

/**
 * 调整列表响应 Schema
 */
export const AdjustmentListResponseSchema = PaginatedResponseSchema(InventoryAdjustmentSchema);

/**
 * 原因列表响应 Schema
 */
export const ReasonListResponseSchema = ApiResponseSchema(z.array(AdjustmentReasonSchema));

// ==================== 表单验证辅助函数 ====================

/**
 * 验证创建调整表单
 */
export function validateCreateAdjustment(data: unknown) {
  return CreateAdjustmentSchema.safeParse(data);
}

/**
 * 验证审批请求
 */
export function validateApprovalRequest(data: unknown) {
  return ApprovalRequestSchema.safeParse(data);
}

/**
 * 验证安全库存更新
 */
export function validateUpdateSafetyStock(data: unknown) {
  return UpdateSafetyStockSchema.safeParse(data);
}

/**
 * 获取 Zod 错误消息
 */
export function getZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  return errors;
}
