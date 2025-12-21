import { z } from 'zod'

/**
 * 场景包列表项 Zod Schema
 * 用于运行时验证 API 返回的数据格式
 */
/**
 * 套餐摘要 Schema（列表展示用）
 */
export const PackageSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  desc: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const ScenarioPackageListItemSchema = z.object({
  id: z.string().min(1, '场景包 ID 不能为空'),
  title: z.string().min(1, '标题不能为空'),
  category: z.enum(['MOVIE', 'TEAM', 'PARTY'], {
    errorMap: () => ({ message: '无效的分类值' }),
  }),
  image: z.string().url('背景图片 URL 格式不正确'),
  packagePrice: z.number().positive('价格必须为正数'),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()),
  location: z.string().optional(),
  packages: z.array(PackageSummarySchema).optional(),
})

/**
 * API 响应格式 Zod Schema
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(ScenarioPackageListItemSchema),
  message: z.string().optional(),
  timestamp: z.string().optional(),
})

/**
 * 场景包列表项类型（从 Zod Schema 推断）
 */
export type ScenarioPackageListItem = z.infer<typeof ScenarioPackageListItemSchema>

/**
 * API 响应类型（从 Zod Schema 推断）
 */
export type ApiResponse = z.infer<typeof ApiResponseSchema>
