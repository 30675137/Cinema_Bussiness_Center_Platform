/**
 * @spec T004-lark-project-management
 * Backlog 数据模型
 */

import { z } from 'zod'

/**
 * Backlog 优先级
 */
export enum BacklogPriority {
  High = '🔴 高',
  Medium = '🟡 中',
  Low = '🟢 低',
}

/**
 * Backlog 状态
 */
export enum BacklogStatus {
  Pending = '📝 待评估',
  Approved = '✅ 已批准',
  InProgress = '🚀 进行中',
  Done = '✅ 已完成',
  Rejected = '❌ 已拒绝',
}

/**
 * Backlog 类型
 */
export enum BacklogType {
  Feature = '功能需求',
  Enhancement = '功能增强',
  TechDebt = '技术债',
  Bug = '缺陷修复',
  Research = '技术调研',
  Documentation = '文档',
}

/**
 * Backlog 实体
 */
export interface Backlog {
  id: string // 记录 ID (record_id)
  title: string // Backlog 标题
  description?: string // 详细描述
  type: BacklogType // Backlog 类型
  priority: BacklogPriority // 优先级
  status: BacklogStatus // 状态
  reporter?: string // 提出人 ID
  assignee?: string // 负责人 ID
  specId?: string // 关联规格 (如 "T004")
  estimatedEffort?: number // 预估工时 (小时)
  tags?: string[] // 标签
  createdDate?: number // 创建日期 (时间戳,毫秒)
  approvedDate?: number // 批准日期 (时间戳,毫秒)
  notes?: string // 备注
}

/**
 * Backlog 输入验证 Schema
 */
export const BacklogSchema = z.object({
  title: z
    .string()
    .min(1, 'Backlog 标题不能为空')
    .max(200, 'Backlog 标题不超过200字符'),

  description: z.string().max(2000, '描述不超过2000字符').optional(),

  type: z.nativeEnum(BacklogType).default(BacklogType.Feature),

  priority: z.nativeEnum(BacklogPriority).default(BacklogPriority.Medium),

  status: z.nativeEnum(BacklogStatus).default(BacklogStatus.Pending),

  reporter: z.string().optional(),

  assignee: z.string().optional(),

  specId: z
    .string()
    .regex(/^[A-Z]\d{3}$/, '规格 ID 格式错误 (如 T004)')
    .optional(),

  estimatedEffort: z.number().positive().optional(),

  tags: z.array(z.string()).optional(),

  createdDate: z.number().int().positive().optional(),

  approvedDate: z.number().int().positive().optional(),

  notes: z.string().max(2000, '备注不超过2000字符').optional(),
})

export type BacklogInput = z.infer<typeof BacklogSchema>

/**
 * 将 Backlog 对象转换为飞书 API 字段格式
 */
export function backlogToLarkFields(backlog: BacklogInput): Record<string, any> {
  const fields: Record<string, any> = {
    标题: backlog.title,
    类型: backlog.type,
    优先级: backlog.priority,
    状态: backlog.status,
  }

  if (backlog.description) {
    fields['描述'] = backlog.description
  }

  if (backlog.reporter) {
    fields['提出人'] = [{ id: backlog.reporter }]
  }

  if (backlog.assignee) {
    fields['负责人'] = [{ id: backlog.assignee }]
  }

  if (backlog.specId) {
    fields['关联规格'] = backlog.specId
  }

  if (backlog.estimatedEffort !== undefined) {
    fields['预估工时'] = backlog.estimatedEffort
  }

  if (backlog.tags && backlog.tags.length > 0) {
    fields['标签'] = backlog.tags
  }

  if (backlog.createdDate) {
    fields['创建日期'] = backlog.createdDate
  }

  if (backlog.approvedDate) {
    fields['批准日期'] = backlog.approvedDate
  }

  if (backlog.notes) {
    fields['备注'] = backlog.notes
  }

  return fields
}

/**
 * 将飞书 API 响应转换为 Backlog 对象
 */
export function larkFieldsToBacklog(recordId: string, fields: Record<string, any>): Backlog {
  return {
    id: recordId,
    title: fields['标题'],
    description: fields['描述'] || undefined,
    type: fields['类型'] as BacklogType,
    priority: fields['优先级'] as BacklogPriority,
    status: fields['状态'] as BacklogStatus,
    reporter: fields['提出人']?.[0]?.id,
    assignee: fields['负责人']?.[0]?.id,
    specId: fields['关联规格'] || undefined,
    estimatedEffort: fields['预估工时'] || undefined,
    tags: fields['标签'] || undefined,
    createdDate: fields['创建日期'] || undefined,
    approvedDate: fields['批准日期'] || undefined,
    notes: fields['备注'] || undefined,
  }
}
