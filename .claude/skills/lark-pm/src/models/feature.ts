/**
 * @spec T004-lark-project-management
 * FeatureModule entity model with Zod validation
 */

import { z } from 'zod'

export enum ModuleType {
  Inventory = '库存管理',
  Product = '商品管理',
  Order = '订单管理',
  Store = '门店管理',
  User = '用户管理',
  Report = '报表分析',
  System = '系统管理',
  Other = '其他',
}

export enum FeatureStatus {
  Planning = '📝 规划中',
  InDevelopment = '🚀 开发中',
  Released = '✅ 已上线',
  Deprecated = '❌ 已废弃',
}

export enum FeaturePriority {
  P0 = '🔴 P0',
  P1 = '🟠 P1',
  P2 = '🟡 P2',
  P3 = '🟢 P3',
}

export const FeatureModuleSchema = z.object({
  name: z.string().min(1, '功能名称不能为空').max(100, '功能名称不超过100字符'),

  module: z.nativeEnum(ModuleType),

  status: z.nativeEnum(FeatureStatus).default(FeatureStatus.Planning),

  priority: z.nativeEnum(FeaturePriority).default(FeaturePriority.P2),

  owner: z.string().optional(),

  specId: z
    .string()
    .regex(/^[A-Z]\d{3}$/, '规格 ID 格式错误')
    .optional(),

  plannedReleaseDate: z.number().int().positive().optional(),

  actualReleaseDate: z.number().int().positive().optional(),

  notes: z.string().max(2000, '备注不超过2000字符').optional(),
})

export type FeatureModuleInput = z.infer<typeof FeatureModuleSchema>

export interface FeatureModule {
  id: string
  name: string
  module: ModuleType
  status: FeatureStatus
  priority: FeaturePriority
  owner?: string
  specId?: string
  plannedReleaseDate?: number
  actualReleaseDate?: number
  notes?: string
}
