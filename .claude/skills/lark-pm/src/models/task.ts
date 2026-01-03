/**
 * @spec T004-lark-project-management
 * Task entity model with Zod validation
 */

import { z } from 'zod'

export enum TaskPriority {
  High = '🔴 高',
  Medium = '🟡 中',
  Low = '🟢 低',
}

export enum TaskStatus {
  Todo = '📝 待办',
  InProgress = '🚀 进行中',
  Done = '✅ 已完成',
  Cancelled = '❌ 已取消',
}

export enum TaskTag {
  Frontend = 'Frontend',
  Backend = 'Backend',
  Test = 'Test',
  Docs = 'Docs',
  Design = 'Design',
  Infra = 'Infra',
}

export const TaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '任务标题不超过200字符'),

  priority: z.nativeEnum(TaskPriority).default(TaskPriority.Medium),

  status: z.nativeEnum(TaskStatus).default(TaskStatus.Todo),

  assignees: z.array(z.string()).optional(),

  specId: z
    .string()
    .regex(/^[A-Z]\d{3}$/, '规格 ID 格式错误 (如 I003)')
    .optional(),

  // 新增字段：任务标识（如 T001, T005）
  taskId: z
    .string()
    .regex(/^T\d{3}$/, '任务标识格式错误 (如 T001)')
    .optional(),

  // 新增字段：所属阶段（如 Phase 1: Setup & Infrastructure）
  phase: z.string().max(100, '阶段名称不超过100字符').optional(),

  // 新增字段：用户故事标签（如 US1, US2）
  storyLabel: z.string().max(10, '用户故事标签不超过10字符').optional(),

  // 新增字段：是否可并行执行
  isParallel: z.boolean().optional(),

  dueDate: z.number().int().positive().optional(),

  tags: z.array(z.nativeEnum(TaskTag)).optional(),

  progress: z.number().int().min(0, '进度不能小于0').max(100, '进度不能大于100').optional(),

  estimatedHours: z.number().positive().optional(),

  actualHours: z.number().positive().optional(),

  notes: z.string().max(2000, '备注不超过2000字符').optional(),
})

export type TaskInput = z.infer<typeof TaskSchema>

export interface Task {
  id: string
  title: string
  priority: TaskPriority
  status: TaskStatus
  assignees?: string[]
  specId?: string
  taskId?: string // 任务标识（如 T001）
  phase?: string // 阶段（如 Phase 1: Setup & Infrastructure）
  storyLabel?: string // 用户故事标签（如 US1）
  isParallel?: boolean // 是否可并行执行
  dueDate?: number
  tags?: TaskTag[]
  progress?: number
  estimatedHours?: number
  actualHours?: number
  notes?: string
  createdTime?: number
}
