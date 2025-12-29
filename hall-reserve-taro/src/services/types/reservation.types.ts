/**
 * 预约单管理 - 类型定义
 * 用于C端预约表单和预约单管理
 */

/**
 * 预约单状态
 */
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

/**
 * 操作类型
 */
export type OperationType = 'CREATE' | 'CONFIRM' | 'CANCEL' | 'UPDATE' | 'PAYMENT'

/**
 * 时段信息
 */
export interface TimeSlot {
  id: string
  name: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  available: boolean
}

/**
 * 套餐档次信息
 */
export interface PackageTier {
  id: string
  name: string
  price: number
  originalPrice?: number
  description?: string
  includes: string[]
  tags?: string[]
}

/**
 * 加购项信息
 */
export interface AddonItem {
  id: string
  name: string
  price: number
  category: 'Food' | 'Drink' | 'Service' | 'Other'
  image?: string
  description?: string
  maxQuantity?: number
}

/**
 * 联系人信息
 */
export interface ContactInfo {
  name: string
  phone: string
}

/**
 * 预约表单数据
 */
export interface ReservationFormData {
  scenarioPackageId: string
  selectedDate: string
  selectedSlotId: string
  selectedTierId: string
  selectedAddons: Map<string, number> // addonId -> quantity
  contactInfo: ContactInfo
  remark?: string
}

/**
 * 预约明细项
 */
export interface ReservationItem {
  id: string
  itemType: 'PACKAGE' | 'ADDON'
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  subtotal: number
  snapshotData?: Record<string, unknown>
}

/**
 * 预约单信息（完整）
 */
export interface ReservationOrder {
  id: string
  orderNumber: string
  userId: string
  userName?: string
  scenarioPackageId: string
  scenarioPackageName: string
  tierId: string
  tierName: string
  timeSlotId: string
  timeSlotName: string
  reservationDate: string
  status: ReservationStatus
  requiresPayment: boolean
  totalAmount: number
  paidAmount?: number
  contactName: string
  contactPhone: string
  remark?: string
  cancelReason?: string
  cancelReasonType?: string
  cancelledAt?: string
  confirmedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  items: ReservationItem[]
}

/**
 * 创建预约请求
 */
export interface CreateReservationRequest {
  scenarioPackageId: string
  packageTierId: string
  timeSlotTemplateId: string
  reservationDate: string
  contactName: string
  contactPhone: string
  remark?: string
  addonItems?: Array<{
    addonId: string
    quantity: number
  }>
}

/**
 * 预约单列表项（简化版）
 */
export interface ReservationListItem {
  id: string
  orderNumber: string
  scenarioPackageName: string
  tierName: string
  timeSlotName: string
  reservationDate: string
  status: ReservationStatus
  totalAmount: number
  createdAt: string
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
  first: boolean
  last: boolean
}

/**
 * API响应格式
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  code?: string
  timestamp?: string
}

/**
 * 预约状态配置
 */
export const RESERVATION_STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; color: string }
> = {
  PENDING: { label: '待确认', color: '#faad14' },
  CONFIRMED: { label: '已确认', color: '#1890ff' },
  COMPLETED: { label: '已完成', color: '#52c41a' },
  CANCELLED: { label: '已取消', color: '#999999' },
}

/**
 * 判断状态是否可以取消
 */
export function canCancel(status: ReservationStatus): boolean {
  return status === 'PENDING' || status === 'CONFIRMED'
}

/**
 * 判断状态是否可以查看支付
 */
export function canPay(status: ReservationStatus, requiresPayment: boolean): boolean {
  return status === 'CONFIRMED' && requiresPayment
}
