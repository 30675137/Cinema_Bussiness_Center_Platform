/**
 * @spec T004-lark-project-management
 * TechnicalDebt entity model with Zod validation
 */

import { z } from 'zod'

export enum DebtSeverity {
  Critical = '🔴 严重',
  Medium = '🟡 中',
  Minor = '🟢 轻微',
}

export enum DebtStatus {
  Open = '📝 未处理',
  InProgress = '🚀 处理中',
  Resolved = '✅ 已解决',
  Deferred = '❌ 已搁置',
}

export const TechnicalDebtSchema = z.object({
  title: z.string().min(1, '债务标题不能为空').max(200, '债务标题不超过200字符'),

  severity: z.nativeEnum(DebtSeverity).default(DebtSeverity.Medium),

  status: z.nativeEnum(DebtStatus).default(DebtStatus.Open),

  impact: z.string().max(500, '影响范围不超过500字符').optional(),

  specId: z
    .string()
    .regex(/^[A-Z]\d{3}$/, '规格 ID 格式错误')
    .optional(),

  estimatedEffort: z.number().positive().optional(),

  assignee: z.string().optional(),

  foundDate: z.number().int().positive().optional(),

  resolvedDate: z.number().int().positive().optional(),

  notes: z.string().max(2000, '备注不超过2000字符').optional(),
})

export type TechnicalDebtInput = z.infer<typeof TechnicalDebtSchema>

export interface TechnicalDebt {
  id: string
  title: string
  severity: DebtSeverity
  status: DebtStatus
  impact?: string
  specId?: string
  estimatedEffort?: number
  assignee?: string
  foundDate?: number
  resolvedDate?: number
  notes?: string
}
