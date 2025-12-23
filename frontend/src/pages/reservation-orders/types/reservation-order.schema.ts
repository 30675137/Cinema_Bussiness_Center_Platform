/**
 * 预约单 Zod 验证 Schema
 *
 * 用于表单验证，与后端 Bean Validation 规则一致
 */

import { z } from 'zod'

// ============== 正则表达式 ==============

/** 手机号正则 */
const phoneRegex = /^1[3-9]\d{9}$/

/** 日期格式正则 yyyy-MM-dd */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

// ============== 确认预约 Schema ==============

/**
 * 确认预约表单 Schema
 */
export const confirmReservationSchema = z.object({
  /**
   * 是否要求支付
   * true - 要求客户支付，状态变更为 CONFIRMED
   * false - 直接完成，无需支付，状态变更为 COMPLETED
   */
  requiresPayment: z.boolean({ message: '请选择是否要求支付' }),

  /**
   * 操作备注 (可选)
   */
  remark: z.string().max(200, '备注不能超过200个字符').optional(),
})

/**
 * 确认预约表单类型
 */
export type ConfirmReservationFormData = z.infer<typeof confirmReservationSchema>

// ============== 取消预约 Schema ==============

/**
 * 取消原因类型枚举
 */
export const cancelReasonTypeEnum = z.enum([
  'RESOURCE_CONFLICT',
  'CUSTOMER_REQUEST',
  'TIME_ADJUSTMENT',
  'OTHER',
])

/**
 * 取消预约表单 Schema
 */
export const cancelReservationSchema = z.object({
  /**
   * 取消原因类型
   */
  cancelReasonType: cancelReasonTypeEnum.optional(),

  /**
   * 取消原因详情 (必填)
   */
  cancelReason: z
    .string({ message: '取消原因不能为空' })
    .min(1, '取消原因不能为空')
    .max(200, '取消原因不能超过200个字符'),
})

/**
 * 取消预约表单类型
 */
export type CancelReservationFormData = z.infer<typeof cancelReservationSchema>

// ============== 修改预约 Schema ==============

/**
 * 修改预约表单 Schema
 */
export const updateReservationSchema = z.object({
  /**
   * 联系人姓名
   */
  contactName: z
    .string()
    .min(1, '联系人姓名不能为空')
    .max(100, '联系人姓名不能超过100个字符')
    .optional(),

  /**
   * 联系人手机号
   */
  contactPhone: z
    .string()
    .regex(phoneRegex, '手机号格式不正确')
    .optional(),

  /**
   * 备注
   */
  remark: z.string().max(200, '备注不能超过200个字符').optional(),
})

/**
 * 修改预约表单类型
 */
export type UpdateReservationFormData = z.infer<typeof updateReservationSchema>

// ============== 创建预约 Schema (C端) ==============

/**
 * 加购项 Schema
 */
export const addonItemSchema = z.object({
  /**
   * 加购项ID
   */
  addonItemId: z.string().uuid('加购项ID格式不正确'),

  /**
   * 数量
   */
  quantity: z.number().int().min(1, '数量至少为1'),
})

/**
 * 创建预约表单 Schema
 */
export const createReservationSchema = z.object({
  /**
   * 场景包ID
   */
  scenarioPackageId: z.string({ message: '场景包ID不能为空' }).uuid('场景包ID格式不正确'),

  /**
   * 套餐ID
   */
  packageTierId: z.string({ message: '套餐ID不能为空' }).uuid('套餐ID格式不正确'),

  /**
   * 时段模板ID
   */
  timeSlotTemplateId: z.string({ message: '时段模板ID不能为空' }).uuid('时段模板ID格式不正确'),

  /**
   * 预订日期 (格式: yyyy-MM-dd)
   */
  reservationDate: z
    .string({ message: '预订日期不能为空' })
    .regex(dateRegex, '日期格式不正确，应为 yyyy-MM-dd'),

  /**
   * 联系人姓名
   */
  contactName: z
    .string({ message: '联系人姓名不能为空' })
    .min(1, '联系人姓名不能为空')
    .max(100, '联系人姓名不能超过100个字符'),

  /**
   * 联系人手机号
   */
  contactPhone: z
    .string({ message: '联系人手机号不能为空' })
    .regex(phoneRegex, '手机号格式不正确'),

  /**
   * 备注 (可选)
   */
  remark: z.string().max(200, '备注不能超过200个字符').optional(),

  /**
   * 加购项列表
   */
  addonItems: z.array(addonItemSchema).optional(),
})

/**
 * 创建预约表单类型
 */
export type CreateReservationFormData = z.infer<typeof createReservationSchema>

// ============== 列表查询 Schema ==============

/**
 * 预约单状态枚举
 */
export const reservationStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
])

/**
 * 列表查询筛选 Schema
 */
export const reservationListQuerySchema = z.object({
  /**
   * 预约单号 (模糊搜索)
   */
  orderNumber: z.string().optional(),

  /**
   * 联系人手机号
   */
  contactPhone: z.string().optional(),

  /**
   * 状态列表 (多选筛选)
   */
  statuses: z.array(reservationStatusEnum).optional(),

  /**
   * 场景包ID
   */
  scenarioPackageId: z.string().uuid().optional(),

  /**
   * 预订日期 - 开始
   */
  reservationDateStart: z.string().regex(dateRegex).optional(),

  /**
   * 预订日期 - 结束
   */
  reservationDateEnd: z.string().regex(dateRegex).optional(),

  /**
   * 创建日期 - 开始
   */
  createdAtStart: z.string().regex(dateRegex).optional(),

  /**
   * 创建日期 - 结束
   */
  createdAtEnd: z.string().regex(dateRegex).optional(),

  /**
   * 页码 (从0开始)
   */
  page: z.number().int().min(0).optional().default(0),

  /**
   * 每页条数
   */
  size: z.number().int().min(1).max(100).optional().default(20),

  /**
   * 排序字段
   */
  sortBy: z.string().optional().default('createdAt'),

  /**
   * 排序方向
   */
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
})

/**
 * 列表查询筛选类型
 */
export type ReservationListQueryFormData = z.infer<typeof reservationListQuerySchema>
