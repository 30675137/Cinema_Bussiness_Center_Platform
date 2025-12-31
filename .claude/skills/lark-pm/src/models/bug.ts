/**
 * @spec T004-lark-project-management
 * Bug entity model with Zod validation
 */

import { z } from 'zod'

export enum BugSeverity {
  Critical = '🔴 严重',
  Medium = '🟡 中',
  Minor = '🟢 轻微',
}

export enum BugStatus {
  Open = '📝 待修复',
  InProgress = '🚀 修复中',
  Fixed = '✅ 已修复',
  WontFix = '❌ 不修复',
}

export const BugSchema = z.object({
  title: z.string().min(1, 'Bug 标题不能为空').max(200, 'Bug 标题不超过200字符'),

  severity: z.nativeEnum(BugSeverity).default(BugSeverity.Medium),

  status: z.nativeEnum(BugStatus).default(BugStatus.Open),

  reporter: z.string().optional(),
  assignee: z.string().optional(),

  specId: z
    .string()
    .regex(/^[A-Z]\d{3}$/, '规格 ID 格式错误')
    .optional(),

  foundDate: z.number().int().positive().optional(),

  fixedDate: z.number().int().positive().optional(),

  reproSteps: z.string().max(2000, '复现步骤不超过2000字符').optional(),

  environment: z.string().max(500, '环境信息不超过500字符').optional(),

  notes: z.string().max(2000, '备注不超过2000字符').optional(),
})

export type BugInput = z.infer<typeof BugSchema>

export interface Bug {
  id: string
  title: string
  severity: BugSeverity
  status: BugStatus
  reporter?: string
  assignee?: string
  specId?: string
  foundDate?: number
  fixedDate?: number
  reproSteps?: string
  environment?: string
  notes?: string
}
