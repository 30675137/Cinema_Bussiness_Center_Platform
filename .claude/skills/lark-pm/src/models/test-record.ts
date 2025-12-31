/**
 * @spec T004-lark-project-management
 * TestRecord entity model with Zod validation
 */

import { z } from 'zod'

export enum TestType {
  Unit = '单元测试',
  Integration = '集成测试',
  E2E = 'E2E测试',
  Manual = '手动测试',
}

export enum TestStatus {
  NotExecuted = '⏸️ 未执行',
  Passed = '✅ 通过',
  Failed = '❌ 失败',
  Blocked = '⚠️ 阻塞',
}

export const TestRecordSchema = z.object({
  testName: z.string().min(1, '测试名称不能为空').max(200, '测试名称不超过200字符'),

  testType: z.nativeEnum(TestType),

  status: z.nativeEnum(TestStatus).default(TestStatus.NotExecuted),

  specId: z
    .string()
    .regex(/^[A-Z]\d{3}$/, '规格 ID 格式错误')
    .optional(),

  executor: z.string().optional(),

  executionDate: z.number().int().positive().optional(),

  result: z.string().max(2000, '测试结果不超过2000字符').optional(),

  failureReason: z.string().max(1000, '失败原因不超过1000字符').optional(),

  coverage: z.number().int().min(0, '覆盖率不能小于0').max(100, '覆盖率不能大于100').optional(),

  notes: z.string().max(2000, '备注不超过2000字符').optional(),
})

export type TestRecordInput = z.infer<typeof TestRecordSchema>

export interface TestRecord {
  id: string
  testName: string
  testType: TestType
  status: TestStatus
  specId?: string
  executor?: string
  executionDate?: number
  result?: string
  failureReason?: string
  coverage?: number
  notes?: string
}
